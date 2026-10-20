from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'category',
        'price',
        'weight_grams',
        'stock_quantity',
        'is_available',
        'is_vegetarian',
        'updated_at',
    )
    list_filter = (
        'category',
        'is_available',
        'is_vegetarian',
        'created_at',
    )
    search_fields = (
        'name',
        'slug',
        'description',
        'ingredients',
    )
    prepopulated_fields = {
        'slug': ('name',)
    }
    readonly_fields = (
        'created_at',
        'updated_at',
    )
    ordering = ('-created_at',)
    list_editable = ('is_available', 'stock_quantity')
    list_per_page = 20

    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name',
                'slug',
                'category',
                'description',
                'is_vegetarian',
            )
        }),
        ('Pricing & Inventory', {
            'fields': (
                'price',
                'weight_grams',
                'stock_quantity',
                'is_available',
            )
        }),
        ('Media', {
            'fields': (
                'image',
            )
        }),
        ('Formulation & Details', {
            'fields': (
                'ingredients',
                'allergen_information',
                'nutritional_information',
            )
        }),
        ('Audit Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
