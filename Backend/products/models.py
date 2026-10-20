from decimal import Decimal
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, validate_slug
from django.db import models
from django.utils.text import slugify


def validate_product_image(image):
    """
    Validate that the uploaded file is a valid image (JPEG, PNG, WEBP)
    and does not exceed 5MB.
    """
    if not image:
        return

    max_size_mb = 5
    if hasattr(image, 'size') and image.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Image file size cannot exceed {max_size_mb}MB.")

    # Validate image content with Pillow if file object has read attribute
    if hasattr(image, 'file'):
        try:
            from PIL import Image
            img = Image.open(image.file)
            img_format = (img.format or "").upper()
            if img_format not in ["JPEG", "JPG", "PNG", "WEBP"]:
                raise ValidationError("Unsupported image format. Allowed formats: JPEG, PNG, WEBP.")
            # Rewind file pointer
            if hasattr(image.file, 'seek'):
                image.file.seek(0)
        except Exception as exc:
            if isinstance(exc, ValidationError):
                raise
            raise ValidationError("Uploaded file is not a valid image.")


class Product(models.Model):
    """
    Food products sold by MilletMarg Cafe & Store.
    """
    name = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Product name (e.g. Ragi Laddu, Foxtail Millet Khichdi Mix)"
    )
    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True,
        db_index=True,
        help_text="URL-friendly identifier. Auto-generated if left blank."
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed description of the product"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Selling price in INR (non-negative, exact decimal)"
    )
    image = models.ImageField(
        upload_to='products/%Y/%m/',
        null=True,
        blank=True,
        validators=[validate_product_image],
        help_text="Primary product image (Max 5MB; JPEG, PNG, or WEBP)"
    )
    category = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Category or food type (e.g., Snacks, Grains, Ready to Cook, Bakery)"
    )
    weight_grams = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Quantity/net weight of the product in grams (must be positive)"
    )
    ingredients = models.TextField(
        blank=True,
        help_text="List of ingredients used in the product"
    )
    is_vegetarian = models.BooleanField(
        default=True,
        help_text="Whether this food product is vegetarian"
    )
    allergen_information = models.TextField(
        blank=True,
        null=True,
        help_text="Optional allergen details (e.g. Contains nuts, Gluten-free facility)"
    )
    nutritional_information = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        help_text="Optional structured nutritional data (e.g., calories, protein, carbs)"
    )
    stock_quantity = models.PositiveIntegerField(
        default=0,
        help_text="Current available inventory stock quantity"
    )
    is_available = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Whether the product is currently available for purchase"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the product was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the product was last updated"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Product"
        verbose_name_plural = "Products"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(price__gte=0),
                name='product_price_non_negative'
            ),
            models.CheckConstraint(
                condition=models.Q(weight_grams__gt=0),
                name='product_weight_positive'
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.category}) - ₹{self.price}"

    def clean(self):
        super().clean()
        if self.price is not None and self.price < Decimal('0.00'):
            raise ValidationError({'price': "Price cannot be negative."})

        if self.weight_grams is not None and self.weight_grams < 1:
            raise ValidationError({'weight_grams': "Weight must be positive (at least 1 gram)."})

        # Validate manually supplied slug
        if self.slug:
            self.slug = self.slug.strip().lower()
            validate_slug(self.slug)
            existing = Product.objects.filter(slug=self.slug)
            if self.pk:
                existing = existing.exclude(pk=self.pk)
            if existing.exists():
                raise ValidationError({'slug': f"Product with slug '{self.slug}' already exists."})

    def save(self, *args, **kwargs):
        # Only generate a slug if one is not already provided
        if not self.slug:
            base_slug = slugify(self.name)
            if not base_slug:
                base_slug = "product"

            candidate_slug = base_slug
            counter = 1
            qs = Product.objects.all()
            if self.pk:
                qs = qs.exclude(pk=self.pk)

            while qs.filter(slug=candidate_slug).exists():
                candidate_slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = candidate_slug
        else:
            # Normalize slug to lowercase stripped
            self.slug = self.slug.strip().lower()

        super().save(*args, **kwargs)
