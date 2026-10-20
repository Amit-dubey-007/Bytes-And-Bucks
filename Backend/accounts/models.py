import re
from decimal import Decimal
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models, transaction


def validate_indian_phone_number(value):
    """
    Validate Indian mobile phone numbers:
    Accepts 10 digits starting with 6, 7, 8, or 9,
    optionally prefixed with +91, 91, or 0.
    """
    if not value:
        return
    cleaned = re.sub(r'[\s\-()]', '', str(value))
    pattern = r'^(?:\+91|91|0)?[6-9]\d{9}$'
    if not re.match(pattern, cleaned):
        raise ValidationError("Enter a valid 10-digit Indian mobile number starting with 6-9 (optional +91).")


class UserProfile(models.Model):
    """
    Customer / User profile linked 1-to-1 with Django's User model.
    Stores Google Identity, role, and contact information.
    """
    ROLE_CUSTOMER = 'customer'
    ROLE_OWNER = 'owner'
    ROLE_DEVELOPER = 'developer'

    ROLE_CHOICES = [
        (ROLE_CUSTOMER, 'Customer'),
        (ROLE_OWNER, 'Owner'),
        (ROLE_DEVELOPER, 'Developer'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    google_sub = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text="Stable Google provider subject identifier"
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_CUSTOMER,
        db_index=True,
        help_text="User role: customer, owner, or developer"
    )
    display_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Public display name"
    )
    profile_image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="External profile picture URL (e.g. from Google account)"
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[validate_indian_phone_number],
        help_text="Primary contact mobile number"
    )
    gender = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Optional gender field"
    )
    is_email_verified = models.BooleanField(
        default=False,
        help_text="Whether email was verified by the identity provider"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"{self.display_name or self.user.username} ({self.role})"

    @property
    def is_customer(self):
        return self.role == self.ROLE_CUSTOMER

    @property
    def is_owner(self):
        return self.role == self.ROLE_OWNER

    @property
    def is_developer(self):
        return self.role == self.ROLE_DEVELOPER


class Address(models.Model):
    """
    Saved delivery address for a customer.
    Includes precise coordinates for map integration and distance calculation.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses'
    )
    label = models.CharField(
        max_length=50,
        default='Home',
        help_text="Address label (e.g. Home, Work, Other)"
    )
    recipient_name = models.CharField(
        max_length=150,
        help_text="Recipient's contact name"
    )
    phone_number = models.CharField(
        max_length=20,
        validators=[validate_indian_phone_number],
        help_text="Delivery contact phone number"
    )
    address_line = models.CharField(
        max_length=255,
        help_text="Street name, road, or area"
    )
    house_number = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="Flat, house, or building number"
    )
    room_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        default='',
        help_text="Optional room/unit number"
    )
    landmark = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        default='',
        help_text="Optional nearby landmark"
    )
    city = models.CharField(
        max_length=100,
        default='Indore'
    )
    state = models.CharField(
        max_length=100,
        default='Madhya Pradesh'
    )
    postal_code = models.CharField(
        max_length=20,
        help_text="Postal code / PIN"
    )
    country = models.CharField(
        max_length=100,
        default='India'
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[
            MinValueValidator(Decimal('-90.0')),
            MaxValueValidator(Decimal('90.0'))
        ],
        help_text="Geographic latitude (-90 to +90)"
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[
            MinValueValidator(Decimal('-180.0')),
            MaxValueValidator(Decimal('180.0'))
        ],
        help_text="Geographic longitude (-180 to +180)"
    )
    formatted_address = models.TextField(
        blank=True,
        default='',
        help_text="Human-readable address string returned by reverse-geocoding"
    )
    is_default = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this is the user's primary/default delivery address"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_default', '-created_at']
        verbose_name = "Delivery Address"
        verbose_name_plural = "Delivery Addresses"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(latitude__gte=-90, latitude__lte=90),
                name='address_latitude_range'
            ),
            models.CheckConstraint(
                condition=models.Q(longitude__gte=-180, longitude__lte=180),
                name='address_longitude_range'
            ),
        ]

    def __str__(self):
        return f"{self.label} - {self.recipient_name}, {self.city} ({self.postal_code})"

    def clean(self):
        super().clean()
        if self.latitude is not None and (self.latitude < Decimal('-90.0') or self.latitude > Decimal('90.0')):
            raise ValidationError({'latitude': "Latitude must be between -90 and 90 degrees."})
        if self.longitude is not None and (self.longitude < Decimal('-180.0') or self.longitude > Decimal('180.0')):
            raise ValidationError({'longitude': "Longitude must be between -180 and 180 degrees."})

    def save(self, *args, **kwargs):
        with transaction.atomic():
            # Check if this is the user's first address
            other_addresses = Address.objects.filter(user=self.user)
            if self.pk:
                other_addresses = other_addresses.exclude(pk=self.pk)

            if not other_addresses.exists():
                self.is_default = True
            elif self.is_default:
                other_addresses.filter(is_default=True).update(is_default=False)

            super().save(*args, **kwargs)
