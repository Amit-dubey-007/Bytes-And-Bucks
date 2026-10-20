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
