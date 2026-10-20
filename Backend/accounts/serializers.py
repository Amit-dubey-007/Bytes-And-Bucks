from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile, Address, validate_indian_phone_number


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing current user identity and profile details.
    """
    id = serializers.IntegerField(source='user.id', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'email',
            'username',
            'role',
            'display_name',
            'profile_image_url',
            'phone_number',
            'gender',
            'is_email_verified',
            'is_staff',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'email',
            'username',
            'role',
            'profile_image_url',
            'is_email_verified',
            'is_staff',
            'created_at',
            'updated_at',
        ]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating permitted profile fields.
    Crucial: 'role', 'google_sub', 'is_email_verified' CANNOT be altered.
    """
    class Meta:
        model = UserProfile
        fields = [
            'display_name',
            'phone_number',
            'gender',
        ]

    def validate_phone_number(self, value):
        if value:
            validate_indian_phone_number(value)
        return value


class GoogleAuthSerializer(serializers.Serializer):
    """
    Accepts Google OAuth credential/ID token from client.
    """
    credential = serializers.CharField(
        required=False,
        allow_blank=False,
        help_text="Google OAuth 2.0 credential / ID token"
    )
    id_token = serializers.CharField(
        required=False,
        allow_blank=False,
        help_text="Alternative alias for Google credential"
    )

    def validate(self, attrs):
        token = attrs.get('credential') or attrs.get('id_token')
        if not token:
            raise serializers.ValidationError({
                "credential": ["Google ID token or credential is required."]
            })
        attrs['token'] = token
        return attrs


class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for Customer delivery addresses with coordinate validation.
    """
    latitude = serializers.DecimalField(
        max_digits=9,
        decimal_places=6,
        coerce_to_string=True
    )
    longitude = serializers.DecimalField(
        max_digits=9,
        decimal_places=6,
        coerce_to_string=True
    )

    class Meta:
        model = Address
        fields = [
            'id',
            'label',
            'recipient_name',
            'phone_number',
            'address_line',
            'house_number',
            'room_number',
            'landmark',
            'city',
            'state',
            'postal_code',
            'country',
            'latitude',
            'longitude',
            'formatted_address',
            'is_default',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_phone_number(self, value):
        validate_indian_phone_number(value)
        return value

    def validate_latitude(self, value):
        if value < Decimal('-90.0') or value > Decimal('90.0'):
            raise serializers.ValidationError("Latitude must be between -90 and 90 degrees.")
        return value

    def validate_longitude(self, value):
        if value < Decimal('-180.0') or value > Decimal('180.0'):
            raise serializers.ValidationError("Longitude must be between -180 and 180 degrees.")
        return value
