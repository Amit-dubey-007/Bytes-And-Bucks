import re
import datetime
import urllib.parse
from decimal import Decimal
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import serializers
from products.models import Product
from accounts.models import Address, validate_indian_phone_number
from .models import Cart, CartItem, Order, OrderItem, PaymentReceipt, Notification, DeliveryStatusLog, Review
from .whatsapp import generate_whatsapp_order_url


def parse_estimated_delivery_time(val):
    """
    Parses estimated delivery time input flexibly:
    - If empty/None -> None
    - If valid ISO datetime string -> parsed datetime
    - If relative minutes string (e.g. '30-40 mins', '45 min') -> timezone.now() + timedelta
    """
    if not val:
        return None
    if isinstance(val, (datetime.datetime, datetime.date)):
        return val
    if isinstance(val, str):
        val = val.strip()
        if not val:
            return None
        dt = parse_datetime(val)
        if dt:
            return dt
        nums = re.findall(r'\d+', val)
        if nums:
            mins = int(nums[-1])
            return timezone.now() + datetime.timedelta(minutes=mins)
    return None



class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    unit_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    weight_grams = serializers.IntegerField(source='product.weight_grams', read_only=True)
    is_available = serializers.BooleanField(source='product.is_available', read_only=True)
    stock_quantity = serializers.IntegerField(source='product.stock_quantity', read_only=True)
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'product_id',
            'product_name',
            'product_slug',
            'product_image',
            'unit_price',
            'quantity',
            'line_total',
            'weight_grams',
            'is_available',
            'stock_quantity',
        ]
        read_only_fields = ['id', 'line_total']

    def get_product_image(self, obj):
        if not obj.product.image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.product.image.url)
        return obj.product.image.url


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = [
            'id',
            'items',
            'subtotal',
            'total_items',
            'updated_at',
        ]


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False)
    product_slug = serializers.CharField(required=False)
    quantity = serializers.IntegerField(default=1, min_value=1)

    def validate(self, attrs):
        pid = attrs.get('product_id')
        slug = attrs.get('product_slug')
        if not pid and not slug:
            raise serializers.ValidationError("Either product_id or product_slug must be provided.")

        product = None
        if pid:
            product = Product.objects.filter(id=pid).first()
        elif slug:
            product = Product.objects.filter(slug=slug).first()

        if not product:
            raise serializers.ValidationError("Product not found.")
        if not product.is_available:
            raise serializers.ValidationError("This product is currently unavailable for purchase.")

        # Check stock limits if maintained
        requested_qty = attrs.get('quantity', 1)
        if product.stock_quantity > 0 and requested_qty > product.stock_quantity:
            raise serializers.ValidationError(
                f"Requested quantity ({requested_qty}) exceeds available stock ({product.stock_quantity})."
            )

        attrs['product'] = product
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value


class DeliveryQuoteRequestSerializer(serializers.Serializer):
    address_id = serializers.IntegerField(required=False, allow_null=True)
    latitude = serializers.DecimalField(required=False, max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(required=False, max_digits=9, decimal_places=6)
    subtotal = serializers.DecimalField(required=False, default=Decimal('0.00'), max_digits=10, decimal_places=2)

    def validate(self, attrs):
        addr_id = attrs.get('address_id')
        lat = attrs.get('latitude')
        lon = attrs.get('longitude')

        if not addr_id and (lat is None or lon is None):
            raise serializers.ValidationError("Provide either a valid address_id or latitude and longitude.")

        if lat is not None and (lat < Decimal('-90.0') or lat > Decimal('90.0')):
            raise serializers.ValidationError({"latitude": "Latitude must be between -90 and 90 degrees."})
        if lon is not None and (lon < Decimal('-180.0') or lon > Decimal('180.0')):
            raise serializers.ValidationError({"longitude": "Longitude must be between -180 and 180 degrees."})

        if lat is not None and lon is not None:
            if lat > Decimal('60.0') and lon < Decimal('40.0'):
                raise serializers.ValidationError("Latitude and longitude appear to be inverted. Coordinates should be latitude followed by longitude.")

        return attrs


class BaseCheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField(required=False, allow_null=True)
    new_address = serializers.DictField(required=False, allow_null=True)
    save_address = serializers.BooleanField(default=False)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    recipient_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    room_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    delivery_instructions = serializers.CharField(required=False, allow_blank=True)
    idempotency_key = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate(self, attrs):
        addr_id = attrs.get('address_id')
        new_addr = attrs.get('new_address')

        if not addr_id and not new_addr:
            raise serializers.ValidationError("Either a saved address_id or new_address details must be provided.")

        phone = attrs.get('phone_number')
        if phone:
            validate_indian_phone_number(phone)

        return attrs


class CheckoutBuyNowSerializer(BaseCheckoutSerializer):
    product_id = serializers.IntegerField(required=False)
    product_slug = serializers.CharField(required=False)
    quantity = serializers.IntegerField(default=1, min_value=1)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        pid = attrs.get('product_id')
        slug = attrs.get('product_slug')

        if not pid and not slug:
            raise serializers.ValidationError("Either product_id or product_slug is required for Buy Now.")

        product = None
        if pid:
            product = Product.objects.filter(id=pid).first()
        elif slug:
            product = Product.objects.filter(slug=slug).first()

        if not product:
            raise serializers.ValidationError("Product not found.")
        if not product.is_available:
            raise serializers.ValidationError("This product is currently unavailable for purchase.")

        qty = attrs.get('quantity', 1)
        if product.stock_quantity > 0 and qty > product.stock_quantity:
            raise serializers.ValidationError(
                f"Requested quantity ({qty}) exceeds available stock ({product.stock_quantity})."
            )

        attrs['product'] = product
        return attrs


class CheckoutCartSerializer(BaseCheckoutSerializer):
    pass


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_name',
            'product_slug',
            'unit_price',
            'quantity',
            'line_total',
            'weight_grams',
            'product_image_url',
        ]


class ReviewSerializer(serializers.ModelSerializer):
    order_public_id = serializers.UUIDField(source='order.public_id', read_only=True)
    order_reference = serializers.CharField(source='order.reference', read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'order_public_id',
            'order_reference',
            'customer_name',
            'customer_username',
            'rating',
            'comment',
            'is_visible',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'order_public_id',
            'order_reference',
            'customer_name',
            'customer_username',
            'created_at',
            'updated_at',
        ]

    def get_customer_name(self, obj):
        profile = getattr(obj.user, 'profile', None)
        return profile.display_name if profile and profile.display_name else obj.user.username


class ReviewCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class DeliveryStatusLogSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryStatusLog
        fields = [
            'id',
            'status',
            'note',
            'driver_name',
            'driver_phone',
            'created_at',
            'updated_by_name',
        ]
        read_only_fields = fields

    def get_updated_by_name(self, obj):
        if not obj.created_by:
            return "System / Store Staff"
        profile = getattr(obj.created_by, 'profile', None)
        return profile.display_name if profile and profile.display_name else obj.created_by.username


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    reference = serializers.CharField(read_only=True)
    whatsapp_url = serializers.SerializerMethodField()
    payment_instructions = serializers.SerializerMethodField()
    has_payment_receipt = serializers.SerializerMethodField()
    receipt_url = serializers.SerializerMethodField()
    driver_call_url = serializers.SerializerMethodField()
    driver_whatsapp_url = serializers.SerializerMethodField()
    review = ReviewSerializer(read_only=True)
    delivery_logs = DeliveryStatusLogSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'public_id',
            'reference',
            'status',
            'payment_status',
            'subtotal',
            'road_distance_km',
            'billable_distance_km',
            'delivery_fee',
            'delivery_fee_charged',
            'is_free_delivery',
            'free_delivery_threshold',
            'total',
            'currency',
            'address_snapshot',
            'recipient_name',
            'phone_number',
            'delivery_instructions',
            'payment_instructions',
            'rejection_reason',
            'payment_rejection_reason',
            'payment_submitted_at',
            'payment_verified_at',
            'has_payment_receipt',
            'receipt_url',
            # Stage 5 Delivery fields
            'driver_name',
            'driver_phone',
            'driver_call_url',
            'driver_whatsapp_url',
            'dispatched_at',
            'estimated_delivery_time',
            'delivered_at',
            'is_customer_confirmed',
            'customer_confirmed_at',
            'items',
            'whatsapp_url',
            'review',
            'delivery_logs',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_whatsapp_url(self, obj):
        return generate_whatsapp_order_url(obj)

    def get_payment_instructions(self, obj):
        if obj.status in [
            Order.STATUS_APPROVED,
            Order.STATUS_PREPARING,
            Order.STATUS_READY_FOR_DISPATCH,
            Order.STATUS_OUT_FOR_DELIVERY,
            Order.STATUS_DELIVERED,
        ]:
            return obj.payment_instructions
        return None

    def get_has_payment_receipt(self, obj):
        return bool(obj.payment_receipt)

    def get_receipt_url(self, obj):
        if not obj.payment_receipt:
            return None
        request = self.context.get('request')
        endpoint = f"/api/orders/{obj.public_id}/payment-receipt/"
        return request.build_absolute_uri(endpoint) if request else endpoint

    def get_driver_call_url(self, obj):
        return f"tel:{obj.driver_phone}" if obj.driver_phone else None

    def get_driver_whatsapp_url(self, obj):
        if not obj.driver_phone:
            return None
        digits = re.sub(r'\D', '', obj.driver_phone)
        if len(digits) == 10:
            digits = f"91{digits}"
        return f"https://wa.me/{digits}"


class PaymentReceiptSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = PaymentReceipt
        fields = [
            'id',
            'file_name',
            'file_size_bytes',
            'uploaded_at',
            'status',
            'review_note',
            'download_url',
        ]
        read_only_fields = fields

    def get_download_url(self, obj):
        request = self.context.get('request')
        endpoint = f"/api/orders/{obj.order.public_id}/payment-receipt/"
        return request.build_absolute_uri(endpoint) if request else endpoint


class OwnerOrderListSerializer(serializers.ModelSerializer):
    reference = serializers.CharField(read_only=True)
    customer_username = serializers.CharField(source='user.username', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    items_count = serializers.SerializerMethodField()
    has_payment_receipt = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'public_id',
            'reference',
            'status',
            'payment_status',
            'recipient_name',
            'phone_number',
            'customer_username',
            'customer_email',
            'items_count',
            'subtotal',
            'delivery_fee_charged',
            'total',
            'currency',
            'has_payment_receipt',
            'driver_name',
            'driver_phone',
            'dispatched_at',
            'delivered_at',
            'is_customer_confirmed',
            'payment_submitted_at',
            'payment_verified_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_items_count(self, obj):
        return obj.items.count()

    def get_has_payment_receipt(self, obj):
        return bool(obj.payment_receipt)


class OwnerOrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    reference = serializers.CharField(read_only=True)
    customer_username = serializers.CharField(source='user.username', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    receipt_history = PaymentReceiptSerializer(many=True, read_only=True)
    whatsapp_url = serializers.SerializerMethodField()
    receipt_url = serializers.SerializerMethodField()
    has_payment_receipt = serializers.SerializerMethodField()
    driver_call_url = serializers.SerializerMethodField()
    driver_whatsapp_url = serializers.SerializerMethodField()
    payment_verified_by_name = serializers.SerializerMethodField()
    review = ReviewSerializer(read_only=True)
    delivery_logs = DeliveryStatusLogSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'public_id',
            'reference',
            'user_id',
            'customer_username',
            'customer_email',
            'status',
            'payment_status',
            'subtotal',
            'road_distance_km',
            'billable_distance_km',
            'delivery_fee',
            'delivery_fee_charged',
            'is_free_delivery',
            'free_delivery_threshold',
            'total',
            'currency',
            'address_snapshot',
            'recipient_name',
            'phone_number',
            'delivery_instructions',
            'payment_instructions',
            'rejection_reason',
            'payment_rejection_reason',
            'internal_note',
            'payment_submitted_at',
            'payment_verified_at',
            'payment_verified_by',
            'payment_verified_by_name',
            'has_payment_receipt',
            'receipt_url',
            'receipt_history',
            # Stage 5 Delivery & Review fields
            'driver_name',
            'driver_phone',
            'driver_call_url',
            'driver_whatsapp_url',
            'dispatched_at',
            'estimated_delivery_time',
            'delivered_at',
            'is_customer_confirmed',
            'customer_confirmed_at',
            'items',
            'whatsapp_url',
            'review',
            'delivery_logs',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_payment_verified_by_name(self, obj):
        if not obj.payment_verified_by:
            return None
        profile = getattr(obj.payment_verified_by, 'profile', None)
        if profile and profile.display_name:
            return profile.display_name
        return obj.payment_verified_by.get_full_name() or obj.payment_verified_by.username

    def get_whatsapp_url(self, obj):
        if obj.phone_number:
            digits = re.sub(r'\D', '', obj.phone_number)
            if len(digits) == 10:
                digits = f"91{digits}"
            order_ref = f"MM-{str(obj.public_id)[:8].upper()}"
            msg = urllib.parse.quote(f"Hi {obj.recipient_name}, this is MilletMarg regarding your order {order_ref}.")
            return f"https://wa.me/{digits}?text={msg}"
        return generate_whatsapp_order_url(obj)

    def get_has_payment_receipt(self, obj):
        return bool(obj.payment_receipt)

    def get_receipt_url(self, obj):
        if not obj.payment_receipt:
            return None
        request = self.context.get('request')
        endpoint = f"/api/orders/{obj.public_id}/payment-receipt/"
        return request.build_absolute_uri(endpoint) if request else endpoint

    def get_driver_call_url(self, obj):
        return f"tel:{obj.driver_phone}" if obj.driver_phone else None

    def get_driver_whatsapp_url(self, obj):
        if not obj.driver_phone:
            return None
        digits = re.sub(r'\D', '', obj.driver_phone)
        if len(digits) == 10:
            digits = f"91{digits}"
        return f"https://wa.me/{digits}"


class OrderApprovalSerializer(serializers.Serializer):
    payment_instructions = serializers.CharField(required=False, allow_blank=True, default='')
    internal_note = serializers.CharField(required=False, allow_blank=True, default='')
    driver_name = serializers.CharField(required=False, allow_blank=True, default='', max_length=150)
    driver_phone = serializers.CharField(required=False, allow_blank=True, default='')
    estimated_delivery_time = serializers.CharField(required=False, allow_blank=True, default='', allow_null=True)

    def validate_driver_phone(self, value):
        if value and value.strip():
            validate_indian_phone_number(value.strip())
        return value.strip() if value else ''


class OrderDriverUpdateSerializer(serializers.Serializer):
    driver_name = serializers.CharField(required=False, allow_blank=True, default='', max_length=150)
    driver_phone = serializers.CharField(required=False, allow_blank=True, default='')
    estimated_delivery_time = serializers.CharField(required=False, allow_blank=True, default='', allow_null=True)
    internal_note = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_driver_phone(self, value):
        if value and value.strip():
            validate_indian_phone_number(value.strip())
        return value.strip() if value else ''


class OrderRejectionSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=True, min_length=3, max_length=1000)
    internal_note = serializers.CharField(required=False, allow_blank=True, default='')


class PaymentVerificationSerializer(serializers.Serializer):
    internal_note = serializers.CharField(required=False, allow_blank=True, default='')


class PaymentRejectionSerializer(serializers.Serializer):
    payment_rejection_reason = serializers.CharField(required=True, min_length=3, max_length=1000)
    internal_note = serializers.CharField(required=False, allow_blank=True, default='')


class PaymentReceiptUploadSerializer(serializers.Serializer):
    receipt = serializers.FileField(required=True)


class OrderDispatchSerializer(serializers.Serializer):
    driver_name = serializers.CharField(required=False, allow_blank=True, default='', max_length=150)
    driver_phone = serializers.CharField(required=False, allow_blank=True, default='')
    estimated_delivery_time = serializers.CharField(required=False, allow_blank=True, default='', allow_null=True)
    note = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_driver_phone(self, value):
        if value and value.strip():
            validate_indian_phone_number(value.strip())
        return value.strip() if value else ''



class DeliveryStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['preparing', 'ready_for_dispatch', 'delivered'])
    note = serializers.CharField(required=False, allow_blank=True, default='')


class ReviewModerationSerializer(serializers.Serializer):
    is_visible = serializers.BooleanField(required=True)


class NotificationSerializer(serializers.ModelSerializer):
    order_public_id = serializers.UUIDField(source='order.public_id', read_only=True, allow_null=True)
    order_reference = serializers.CharField(source='order.reference', read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'title',
            'message',
            'order_public_id',
            'order_reference',
            'is_read',
            'created_at',
        ]
        read_only_fields = fields


