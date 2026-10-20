from rest_framework import serializers
from .models import Product


class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializer for product listing cards.
    Provides all public card attributes with absolute image URLs.
    """
    image = serializers.SerializerMethodField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'price',
            'image',
            'category',
            'weight_grams',
            'ingredients',
            'is_vegetarian',
            'allergen_information',
            'nutritional_information',
            'stock_quantity',
            'is_available',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for comprehensive product detail view.
    """
    image = serializers.SerializerMethodField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'price',
            'image',
            'category',
            'weight_grams',
            'ingredients',
            'is_vegetarian',
            'allergen_information',
            'nutritional_information',
            'stock_quantity',
            'is_available',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class ProductWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating products by store owner.
    Category is optional and defaults to 'Bowls' if omitted or empty.
    Slug is optional and auto-generated from product name.
    Booleans (is_vegetarian, is_available) accept "true"/"false" strings from FormData.
    """
    category = serializers.CharField(required=False, default="Bowls", allow_blank=True)
    slug = serializers.CharField(required=False, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True)
    is_vegetarian = serializers.CharField(required=False, default="true")
    is_available = serializers.CharField(required=False, default="true")

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'price',
            'image',
            'category',
            'weight_grams',
            'ingredients',
            'is_vegetarian',
            'allergen_information',
            'nutritional_information',
            'stock_quantity',
            'is_available',
        ]

    def validate_category(self, value):
        if not value or not str(value).strip():
            return "Bowls"
        return str(value).strip()

    def validate_slug(self, value):
        if not value or not str(value).strip():
            return ""
        return str(value).strip().lower()

    def validate_is_vegetarian(self, value):
        if isinstance(value, bool):
            return value
        return str(value).lower() in ("true", "1", "yes")

    def validate_is_available(self, value):
        if isinstance(value, bool):
            return value
        return str(value).lower() in ("true", "1", "yes")

