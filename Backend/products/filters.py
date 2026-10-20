from decimal import Decimal, InvalidOperation
import django_filters
from rest_framework.exceptions import ValidationError
from .models import Product


class ProductFilter(django_filters.FilterSet):
    """
    Filter set for Product listing endpoint.
    Supports filtering by price range, category, availability, and vegetarian status.
    """
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = django_filters.CharFilter(field_name='category', lookup_expr='iexact')
    is_vegetarian = django_filters.BooleanFilter(field_name='is_vegetarian')
    is_available = django_filters.BooleanFilter(field_name='is_available')

    class Meta:
        model = Product
        fields = ['min_price', 'max_price', 'category', 'is_vegetarian', 'is_available']

    @property
    def qs(self):
        # Validate query parameters before executing the queryset filter
        data = self.data
        min_p = data.get('min_price')
        max_p = data.get('max_price')

        parsed_min = None
        parsed_max = None

        if min_p is not None and str(min_p).strip() != '':
            try:
                parsed_min = Decimal(str(min_p).strip())
                if parsed_min < 0:
                    raise ValidationError({'min_price': ['min_price cannot be negative.']})
            except (InvalidOperation, ValueError, TypeError):
                raise ValidationError({'min_price': ['min_price must be a valid non-negative number.']})

        if max_p is not None and str(max_p).strip() != '':
            try:
                parsed_max = Decimal(str(max_p).strip())
                if parsed_max < 0:
                    raise ValidationError({'max_price': ['max_price cannot be negative.']})
            except (InvalidOperation, ValueError, TypeError):
                raise ValidationError({'max_price': ['max_price must be a valid non-negative number.']})

        if parsed_min is not None and parsed_max is not None and parsed_min > parsed_max:
            raise ValidationError({'detail': 'min_price cannot be greater than max_price.'})

        return super().qs
