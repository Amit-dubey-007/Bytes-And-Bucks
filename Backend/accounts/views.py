import uuid
from decimal import Decimal
from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.utils.text import slugify
from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .google_auth import verify_google_id_token
from .models import Address, UserProfile
from .permissions import IsAddressOwner
from .serializers import (
    AddressSerializer,
    GoogleAuthSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
)


class GoogleAuthView(APIView):
    """
    POST /api/auth/google/
    Verifies Google OAuth ID token, resolves or creates the local customer account,
    and returns an authentication token and user profile.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_string = serializer.validated_data['token']

        # Cryptographically verify the Google token
        payload = verify_google_id_token(token_string)
        google_sub = payload['sub']
        email = payload.get('email', '').strip().lower()
        name = payload.get('name', '').strip()
        picture = payload.get('picture', '')
        email_verified = payload.get('email_verified', False)

        with transaction.atomic():
            # 1. Check if profile exists with this stable Google sub ID
            profile = UserProfile.objects.select_related('user').filter(google_sub=google_sub).first()
            if profile:
                user = profile.user
            else:
                # 2. Check if user exists by verified email
                user = User.objects.filter(email__iexact=email).first() if email else None
                if user:
                    profile, created = UserProfile.objects.get_or_create(
                        user=user,
                        defaults={
                            'google_sub': google_sub,
                            'role': UserProfile.ROLE_CUSTOMER,
                            'display_name': name or user.username,
                            'profile_image_url': picture or None,
                            'is_email_verified': email_verified,
                        }
                    )
                    if not profile.google_sub:
                        profile.google_sub = google_sub
                        profile.save(update_fields=['google_sub'])
                else:
                    # 3. Create a fresh customer account
                    base_username = slugify(email.split('@')[0]) if email else "customer"
                    if not base_username:
                        base_username = "customer"
                    username = f"{base_username}_{uuid.uuid4().hex[:6]}"
                    while User.objects.filter(username=username).exists():
                        username = f"{base_username}_{uuid.uuid4().hex[:6]}"

                    user = User.objects.create(
                        username=username,
                        email=email,
                        first_name=name[:30] if name else '',
                    )
                    user.set_unusable_password()
                    user.save()

                    profile = UserProfile.objects.create(
                        user=user,
                        google_sub=google_sub,
                        role=UserProfile.ROLE_CUSTOMER,
                        display_name=name or username,
                        profile_image_url=picture or None,
                        is_email_verified=email_verified,
                    )

            # Issue or retrieve DRF auth token
            auth_token, _ = Token.objects.get_or_create(user=user)

            # Also establish standard Django session if session middleware is active
            try:
                login(request, user)
            except Exception:
                pass

        return Response({
            "token": auth_token.key,
            "user": UserProfileSerializer(profile).data
        }, status=status.HTTP_200_OK)


class CurrentUserProfileView(APIView):
    """
    GET /api/auth/me/  — Retrieve authenticated user profile and role
    PATCH /api/auth/me/ — Update permitted profile fields (display_name, phone_number, gender)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_or_create_profile(self, user):
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'role': UserProfile.ROLE_CUSTOMER,
                'display_name': user.get_full_name() or user.username,
            }
        )
        return profile

    def get(self, request):
        profile = self.get_or_create_profile(request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile = self.get_or_create_profile(request.user)
        serializer = UserProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Return full updated profile
        return Response(UserProfileSerializer(profile).data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Invalidates authentication token and session.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        logout(request)
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


class AddressViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Customer Saved Delivery Addresses.
    Restricted to authenticated customers accessing only their own addresses.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated, IsAddressOwner]

    def get_queryset(self):
        # Strict server-side ownership enforcement
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign authenticated user
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='set_default')
    def set_default(self, request, pk=None):
        """
        POST /api/addresses/<id>/set_default/
        Set this address as the default delivery address.
        """
        address = self.get_object()
        with transaction.atomic():
            Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
            address.is_default = True
            address.save(update_fields=['is_default', 'updated_at'])

        return Response(AddressSerializer(address).data, status=status.HTTP_200_OK)


class ShopInfoView(APIView):
    """
    GET /api/shop/info/
    Public endpoint providing centralized provisional shop coordinates and store metadata.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "name": getattr(settings, 'SHOP_NAME', 'MilletMarg — Healthy Cafe & Millet Store'),
            "address": getattr(settings, 'SHOP_ADDRESS', 'Indore, Madhya Pradesh, India'),
            "latitude": str(getattr(settings, 'SHOP_LATITUDE', Decimal('22.6955176'))),
            "longitude": str(getattr(settings, 'SHOP_LONGITUDE', Decimal('75.8333253'))),
        }, status=status.HTTP_200_OK)
