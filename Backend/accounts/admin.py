from django.contrib import admin
from .models import UserProfile, Address


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'role',
        'display_name',
        'phone_number',
        'is_email_verified',
        'created_at',
    )
    list_filter = (
        'role',
        'is_email_verified',
        'created_at',
    )
    search_fields = (
        'user__username',
        'user__email',
        'display_name',
        'phone_number',
        'google_sub',
    )
    readonly_fields = (
        'google_sub',
        'created_at',
        'updated_at',
    )
    fieldsets = (
        ('Account Association', {
            'fields': ('user', 'google_sub', 'role')
        }),
        ('Customer Profile', {
            'fields': ('display_name', 'profile_image_url', 'phone_number', 'gender', 'is_email_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = (
        'recipient_name',
        'user',
        'label',
        'phone_number',
        'city',
        'state',
        'postal_code',
        'is_default',
        'created_at',
    )
    list_filter = (
        'is_default',
        'city',
        'state',
        'created_at',
    )
    search_fields = (
        'recipient_name',
        'user__username',
        'user__email',
        'address_line',
        'city',
        'postal_code',
        'phone_number',
    )
    readonly_fields = (
        'created_at',
        'updated_at',
    )
    fieldsets = (
        ('User & Classification', {
            'fields': ('user', 'label', 'is_default')
        }),
        ('Recipient & Contact', {
            'fields': ('recipient_name', 'phone_number')
        }),
        ('Street & Location Details', {
            'fields': ('address_line', 'house_number', 'room_number', 'landmark', 'city', 'state', 'postal_code', 'country')
        }),
        ('Geographic Coordinates', {
            'fields': ('latitude', 'longitude', 'formatted_address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
