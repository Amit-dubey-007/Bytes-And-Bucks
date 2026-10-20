from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from accounts.permissions import IsOwner
from .models import Product
from .serializers import ProductListSerializer, ProductDetailSerializer, ProductWriteSerializer
from .filters import ProductFilter
from .pagination import StandardResultsSetPagination


class ProductViewSet(viewsets.ModelViewSet):
    """
    MilletMarg Products API.
    
    Provides:
      - GET /api/items/ : List products with search, min/max price filter, category filter, sorting, and pagination.
      - GET /api/items/<slug>/ : Retrieve complete product details by unique slug.
      - GET /api/items/categories/ : Retrieve list of distinct categories currently available.
      - POST /api/items/ : Create a new product (Owner only).
      - PUT/PATCH /api/items/<slug>/ : Update an existing product (Owner only).
      - DELETE /api/items/<slug>/ : Delete a product (Owner only).
    """
    queryset = Product.objects.all()
    lookup_field = 'slug'
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'ingredients', 'category']
    ordering_fields = ['price', 'name', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'mark_all_out_of_stock']:
            return [permissions.IsAuthenticated(), IsOwner()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer
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

    @action(detail=False, methods=['post'], url_path='mark-all-out-of-stock',
            permission_classes=[permissions.IsAuthenticated])
    def mark_all_out_of_stock(self, request):
        """
        Owner action: mark ALL products as unavailable (out of stock for today).
        Sets is_available=False on every product.
        Owner can re-enable individual products from the dashboard.
        """
        updated = Product.objects.all().update(is_available=False)
        return Response(
            {"detail": f"Marked {updated} product(s) as out of stock for today."},
            status=status.HTTP_200_OK,
        )
