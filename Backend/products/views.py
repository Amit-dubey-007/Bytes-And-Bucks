from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Product
from .serializers import ProductListSerializer, ProductDetailSerializer
from .filters import ProductFilter
from .pagination import StandardResultsSetPagination


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public Read-Only API for MilletMarg Products.
    
    Provides:
      - GET /api/items/ : List products with search, min/max price filter, category filter, sorting, and pagination.
      - GET /api/items/<slug>/ : Retrieve complete product details by unique slug.
      - GET /api/items/categories/ : Retrieve list of distinct categories currently available.
    
    Write operations (POST, PUT, PATCH, DELETE) are intentionally disabled for the public API.
    Product management is handled securely through Django Admin.
    """
    queryset = Product.objects.all()
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'ingredients', 'category']
    ordering_fields = ['price', 'name', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=False, methods=['get'], url_path='categories')
    def categories(self, request):
        """
        Return a sorted list of unique category names in use.
        """
        categories = (
            Product.objects.filter(is_available=True)
            .values_list('category', flat=True)
            .distinct()
            .order_by('category')
        )
        return Response(list(categories), status=status.HTTP_200_OK)
