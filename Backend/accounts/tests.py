from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.test import APITestCase

from .models import Address, UserProfile


class AccountsModelTests(TestCase):
    """
    Unit tests for UserProfile and Address models, constraints, and defaults.
    """

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="test@example.com")

    def test_profile_creation_default_role(self):
        profile = UserProfile.objects.create(
            user=self.user,
            display_name="Test Customer"
        )
        self.assertEqual(profile.role, UserProfile.ROLE_CUSTOMER)
        self.assertTrue(profile.is_customer)
        self.assertFalse(profile.is_owner)
        self.assertFalse(profile.is_developer)

    def test_first_address_becomes_default_automatically(self):
        addr1 = Address.objects.create(
            user=self.user,
            recipient_name="John Doe",
            phone_number="9876543210",
            address_line="MG Road",
            city="Indore",
            state="Madhya Pradesh",
            postal_code="452001",
            latitude=Decimal("22.719568"),
            longitude=Decimal("75.857727"),
            is_default=False
        )
        # Even though is_default=False was passed, as user's first address, it should become default
        self.assertTrue(addr1.is_default)

        # Second address with is_default=True should unset addr1
        addr2 = Address.objects.create(
            user=self.user,
            recipient_name="John Doe",
            phone_number="9876543210",
            address_line="Vijay Nagar",
            city="Indore",
            state="Madhya Pradesh",
            postal_code="452010",
            latitude=Decimal("22.753300"),
            longitude=Decimal("75.893700"),
            is_default=True
        )
        addr1.refresh_from_db()
        self.assertFalse(addr1.is_default)
        self.assertTrue(addr2.is_default)

    def test_invalid_coordinates_rejected_by_model(self):
        addr = Address(
            user=self.user,
            recipient_name="Out of bounds",
            phone_number="9876543210",
            address_line="North Pole Beyond",
            city="Indore",
            postal_code="452001",
            latitude=Decimal("95.000000"),  # > 90
            longitude=Decimal("75.000000")
        )
        with self.assertRaises(ValidationError):
            addr.clean()


class GoogleAuthAPITests(APITestCase):
    """
    Tests for Google OAuth verification and local account resolution.
    """

    def setUp(self):
        self.google_auth_url = reverse('auth-google')
        self.valid_mock_payload = {
            'sub': 'google-uid-1234567890',
            'email': 'customer@milletmarg.com',
            'email_verified': True,
            'name': 'Priya Sharma',
            'picture': 'https://lh3.googleusercontent.com/a/test-pic.jpg',
            'iss': 'https://accounts.google.com'
        }

    @patch('accounts.views.verify_google_id_token')
    def test_first_time_google_identity_creates_customer(self, mock_verify):
        mock_verify.return_value = self.valid_mock_payload

        response = self.client.post(self.google_auth_url, {'credential': 'valid-mock-token'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn('token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], 'customer@milletmarg.com')
        self.assertEqual(data['user']['display_name'], 'Priya Sharma')
        self.assertEqual(data['user']['role'], 'customer')

        # Verify DB records
        profile = UserProfile.objects.get(google_sub='google-uid-1234567890')
        self.assertEqual(profile.user.email, 'customer@milletmarg.com')
        self.assertEqual(profile.role, UserProfile.ROLE_CUSTOMER)

    @patch('accounts.views.verify_google_id_token')
    def test_repeated_google_signin_resolves_to_same_account(self, mock_verify):
        mock_verify.return_value = self.valid_mock_payload

        res1 = self.client.post(self.google_auth_url, {'credential': 'valid-mock-token'})
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        token1 = res1.json()['token']

        res2 = self.client.post(self.google_auth_url, {'credential': 'valid-mock-token'})
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        token2 = res2.json()['token']

        self.assertEqual(token1, token2)
        self.assertEqual(User.objects.filter(email='customer@milletmarg.com').count(), 1)

    @patch('accounts.views.verify_google_id_token')
    def test_invalid_google_token_returns_401(self, mock_verify):
        mock_verify.side_effect = AuthenticationFailed("Invalid Google credential: Signature expired.")

        response = self.client.post(self.google_auth_url, {'credential': 'expired-token'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_credential_returns_400(self):
        response = self.client.post(self.google_auth_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('accounts.views.verify_google_id_token')
    def test_cannot_pass_role_in_auth_request(self, mock_verify):
        mock_verify.return_value = self.valid_mock_payload

        # Attempt to escalate to owner
        response = self.client.post(self.google_auth_url, {
            'credential': 'valid-mock-token',
            'role': 'owner'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['user']['role'], 'customer')


class ProfileAndLogoutAPITests(APITestCase):
    """
    Tests for /api/auth/me/ and /api/auth/logout/
    """

    def setUp(self):
        self.user = User.objects.create_user(username="customer1", email="c1@example.com")
        self.profile = UserProfile.objects.create(
            user=self.user,
            display_name="Customer One",
            role=UserProfile.ROLE_CUSTOMER,
            phone_number="9876543210"
        )
        self.token = Token.objects.create(user=self.user)
        self.me_url = reverse('auth-me')
        self.logout_url = reverse('auth-logout')

    def test_unauthenticated_profile_access_rejected(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_current_user_profile(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data['email'], 'c1@example.com')
        self.assertEqual(data['display_name'], 'Customer One')
        self.assertEqual(data['phone_number'], '9876543210')
        self.assertEqual(data['role'], 'customer')

    def test_patch_permitted_profile_fields(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.patch(self.me_url, {
            'display_name': 'Updated Name',
            'phone_number': '9123456789'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['display_name'], 'Updated Name')
        self.assertEqual(data['phone_number'], '9123456789')

    def test_patch_cannot_escalate_role(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.patch(self.me_url, {
            'role': 'owner'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.role, UserProfile.ROLE_CUSTOMER)

    def test_logout_deletes_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Token.objects.filter(user=self.user).exists())


class AddressAPITests(APITestCase):
    """
    Tests for /api/addresses/ CRUD, ownership isolation, and coordinate validation.
    """

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", email="u1@example.com")
        self.user2 = User.objects.create_user(username="user2", email="u2@example.com")
        self.token1 = Token.objects.create(user=self.user1)
        self.token2 = Token.objects.create(user=self.user2)

        self.address_url = reverse('address-list')

        # Existing address for user1
        self.addr1 = Address.objects.create(
            user=self.user1,
            label="Home",
            recipient_name="User One",
            phone_number="9876543210",
            address_line="123 Old Palasia",
            city="Indore",
            state="Madhya Pradesh",
            postal_code="452001",
            latitude=Decimal("22.720000"),
            longitude=Decimal("75.870000"),
            is_default=True
        )

    def test_unauthenticated_address_rejected(self):
        res = self.client.get(self.address_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_addresses_only_shows_owned_addresses(self):
        # Create address for user2
        Address.objects.create(
            user=self.user2,
            label="Work",
            recipient_name="User Two",
            phone_number="9876543211",
            address_line="456 Vijay Nagar",
            city="Indore",
            state="Madhya Pradesh",
            postal_code="452010",
            latitude=Decimal("22.750000"),
            longitude=Decimal("75.890000")
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.get(self.address_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['recipient_name'], "User One")

    def test_create_address_valid(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        payload = {
            "label": "Office",
            "recipient_name": "User One Work",
            "phone_number": "9876543210",
            "address_line": "Brilliant Convention Centre Road",
            "city": "Indore",
            "state": "Madhya Pradesh",
            "postal_code": "452010",
            "country": "India",
            "latitude": "22.763400",
            "longitude": "75.892100",
            "formatted_address": "Vijay Nagar, Indore, MP 452010",
            "is_default": True
        }
        response = self.client.post(self.address_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_id = response.json()['id']

        # Verify default behavior
        self.addr1.refresh_from_db()
        self.assertFalse(self.addr1.is_default)
        new_addr = Address.objects.get(id=new_id)
        self.assertTrue(new_addr.is_default)
        self.assertEqual(new_addr.user, self.user1)

    def test_cross_user_address_access_blocked(self):
        # User2 attempts to access User1's address
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2.key}')
        detail_url = reverse('address-detail', kwargs={'pk': self.addr1.id})

        # GET
        get_res = self.client.get(detail_url)
        self.assertEqual(get_res.status_code, status.HTTP_404_NOT_FOUND)

        # PATCH
        patch_res = self.client.patch(detail_url, {'recipient_name': 'Hacker'})
        self.assertEqual(patch_res.status_code, status.HTTP_404_NOT_FOUND)

        # DELETE
        del_res = self.client.delete(detail_url)
        self.assertEqual(del_res.status_code, status.HTTP_404_NOT_FOUND)

    def test_invalid_coordinates_rejected_by_api(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        payload = {
            "label": "Home",
            "recipient_name": "User One",
            "phone_number": "9876543210",
            "address_line": "Some Place",
            "city": "Indore",
            "state": "Madhya Pradesh",
            "postal_code": "452001",
            "latitude": "99.000000",  # Invalid latitude
            "longitude": "75.000000"
        }
        response = self.client.post(self.address_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('latitude', response.json())

    def test_set_default_action(self):
        addr2 = Address.objects.create(
            user=self.user1,
            label="Second",
            recipient_name="User One",
            phone_number="9876543210",
            address_line="Bhawarkua",
            city="Indore",
            state="Madhya Pradesh",
            postal_code="452001",
            latitude=Decimal("22.690000"),
            longitude=Decimal("75.860000"),
            is_default=False
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        url = reverse('address-set-default', kwargs={'pk': addr2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.addr1.refresh_from_db()
        addr2.refresh_from_db()
        self.assertFalse(self.addr1.is_default)
        self.assertTrue(addr2.is_default)


class ShopInfoAPITests(APITestCase):
    """
    Tests for /api/shop/info/
    """
    def test_shop_info_returns_coordinates(self):
        url = reverse('shop-info')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('name', data)
        self.assertIn('address', data)
        self.assertIn('latitude', data)
        self.assertIn('longitude', data)
        self.assertEqual(data['latitude'], '22.6955176')
        self.assertEqual(data['longitude'], '75.8333253')
