from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'created_at')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'subtotal', 'total_items', 'updated_at')
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        'product_name',
        'product_slug',
        'unit_price',
        'quantity',
        'line_total',
        'weight_grams',
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'reference',
        'user',
        'recipient_name',
        'status',
        'subtotal',
        'delivery_fee_charged',
        'total',
        'road_distance_km',
        'created_at',
    )
    list_filter = (
        'status',
        'is_free_delivery',
        'created_at',
    )
    search_fields = (
        'public_id',
        'user__username',
        'recipient_name',
        'phone_number',
    )
    readonly_fields = (
        'public_id',
        'user',
        'subtotal',
        'road_distance_km',
        'billable_distance_km',
        'delivery_fee',
        'delivery_fee_charged',
        'is_free_delivery',
        'free_delivery_threshold',
        'total',
        'currency',
        'source_address',
        'address_snapshot',
        'recipient_name',
        'phone_number',
        'delivery_instructions',
        'idempotency_key',
        'created_at',
        'updated_at',
    )
    inlines = [OrderItemInline]
