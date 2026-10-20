import os
import uuid
from decimal import Decimal
from django.conf import settings
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from products.models import Product
from accounts.models import Address, validate_indian_phone_number


def order_receipt_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.pdf']:
        ext = '.jpg'
    safe_name = f"{uuid.uuid4().hex}{ext}"
    if hasattr(instance, 'public_id'):
        order_id = str(instance.public_id)
    elif hasattr(instance, 'order') and instance.order:
        order_id = str(instance.order.public_id)
    else:
        order_id = 'general'
    return os.path.join('receipts', order_id, safe_name)



class Cart(models.Model):
    """
    Persistent shopping cart for an authenticated customer.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.username}"

    @property
    def subtotal(self) -> Decimal:
        """Dynamically computes subtotal from current product prices."""
        total = Decimal('0.00')
        for item in self.items.select_related('product').all():
            total += item.line_total
        return total

    @property
    def total_items(self) -> int:
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """
    Individual product item inside a customer's persistent cart.
    """
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product')
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gt=0),
                name='cart_item_quantity_positive'
            )
        ]

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def line_total(self) -> Decimal:
        return self.product.price * self.quantity


class Order(models.Model):
    """
    Real customer order with immutable price snapshots, delivery fee calculation,
    and WhatsApp click-to-chat integration.
    """
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_PREPARING = 'preparing'
    STATUS_READY_FOR_DISPATCH = 'ready_for_dispatch'
    STATUS_OUT_FOR_DELIVERY = 'out_for_delivery'
    STATUS_DELIVERED = 'delivered'
    STATUS_REJECTED = 'rejected'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending Approval'),
        (STATUS_APPROVED, 'Approved by Store'),
        (STATUS_PREPARING, 'Preparing Order'),
        (STATUS_READY_FOR_DISPATCH, 'Ready for Dispatch'),
        (STATUS_OUT_FOR_DELIVERY, 'Out for Delivery'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_REJECTED, 'Rejected'),
        (STATUS_CANCELLED, 'Cancelled by Customer'),
    ]

    PAYMENT_UNPAID = 'unpaid'
    PAYMENT_SUBMITTED = 'submitted'
    PAYMENT_VERIFIED = 'verified'
    PAYMENT_REJECTED = 'rejected'

    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_UNPAID, 'Unpaid'),
        (PAYMENT_SUBMITTED, 'Submitted (Awaiting Verification)'),
        (PAYMENT_VERIFIED, 'Verified'),
        (PAYMENT_REJECTED, 'Payment Rejected'),
    ]

    public_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        help_text="Unpredictable external order UUID"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='orders'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_UNPAID,
        db_index=True
    )
    rejection_reason = models.TextField(
        blank=True,
        default='',
        help_text="Reason provided if order was rejected by owner"
    )
    payment_rejection_reason = models.TextField(
        blank=True,
        default='',
        help_text="Reason provided if payment proof was rejected by owner"
    )
    payment_instructions = models.TextField(
        blank=True,
        default='',
        help_text="Payment instructions provided to customer when order is approved"
    )
    payment_receipt = models.FileField(
        upload_to=order_receipt_upload_path,
        null=True,
        blank=True,
        help_text="Latest customer payment proof"
    )
    payment_submitted_at = models.DateTimeField(null=True, blank=True)
    payment_verified_at = models.DateTimeField(null=True, blank=True)
    payment_verified_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='verified_orders',
        help_text="Store owner/staff member who verified manual payment"
    )
    internal_note = models.TextField(
        blank=True,
        default='',
        help_text="Internal notes for owner staff"
    )

    # Stage 5 Delivery & Driver Management
    driver_name = models.CharField(max_length=150, blank=True, default='')
    driver_phone = models.CharField(
        max_length=20,
        blank=True,
        default='',
        validators=[validate_indian_phone_number],
        help_text="Assigned driver contact number"
    )
    dispatched_at = models.DateTimeField(null=True, blank=True)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    is_customer_confirmed = models.BooleanField(default=False)
    customer_confirmed_at = models.DateTimeField(null=True, blank=True)

    # Financial & Delivery calculations
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    road_distance_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    billable_distance_km = models.PositiveIntegerField()
    delivery_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Standard calculated delivery fee before discount"
    )
    delivery_fee_charged = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Actual fee charged (0.00 if free delivery applies)"
    )
    is_free_delivery = models.BooleanField(default=False)
    free_delivery_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Grand total = subtotal + delivery_fee_charged"
    )
    currency = models.CharField(max_length=10, default='INR')

    # Immutable address snapshot
    source_address = models.ForeignKey(
        Address,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='orders',
        help_text="Reference to original address, if still present"
    )
    address_snapshot = models.JSONField(
        default=dict,
        help_text="Permanent snapshot of delivery address at time of order"
    )
    recipient_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20)
    delivery_instructions = models.TextField(blank=True, default='')

    # Idempotency token to prevent duplicate accidental submissions
    idempotency_key = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order MM-{str(self.public_id)[:8].upper()} ({self.status}) - ₹{self.total}"

    @property
    def reference(self) -> str:
        return f"MM-{str(self.public_id)[:8].upper()}"


class OrderItem(models.Model):
    """
    Immutable snapshot of a product purchased within an order.
    Preserved even if the original product is modified or removed.
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='order_items'
    )
    product_name = models.CharField(max_length=255)
    product_slug = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    weight_grams = models.PositiveIntegerField()
    product_image_url = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity}x {self.product_name} (₹{self.unit_price})"


class PaymentReceipt(models.Model):
    """
    Audit log of payment proofs uploaded by customer for an order.
    Ensures payment proof history is not silently overwritten upon resubmission.
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='receipt_history'
    )
    receipt_file = models.FileField(upload_to=order_receipt_upload_path)
    file_name = models.CharField(max_length=255)
    file_size_bytes = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=Order.PAYMENT_STATUS_CHOICES,
        default=Order.PAYMENT_SUBMITTED
    )
    review_note = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"Receipt for {self.order.reference} at {self.uploaded_at}"


class Notification(models.Model):
    """
    In-app database notifications for customers and store owners.
    """
    TYPE_ORDER_PLACED = 'order_placed'
    TYPE_ORDER_APPROVED = 'order_approved'
    TYPE_ORDER_REJECTED = 'order_rejected'
    TYPE_PAYMENT_SUBMITTED = 'payment_submitted'
    TYPE_PAYMENT_VERIFIED = 'payment_verified'
    TYPE_PAYMENT_REJECTED = 'payment_rejected'
    TYPE_ORDER_PREPARING = 'order_preparing'
    TYPE_ORDER_READY = 'order_ready'
    TYPE_ORDER_DISPATCHED = 'order_dispatched'
    TYPE_ORDER_DELIVERED = 'order_delivered'
    TYPE_DELIVERY_CONFIRMED = 'delivery_confirmed'
    TYPE_REVIEW_SUBMITTED = 'review_submitted'

    TYPE_CHOICES = [
        (TYPE_ORDER_PLACED, 'Order Placed'),
        (TYPE_ORDER_APPROVED, 'Order Approved'),
        (TYPE_ORDER_REJECTED, 'Order Rejected'),
        (TYPE_PAYMENT_SUBMITTED, 'Payment Proof Submitted'),
        (TYPE_PAYMENT_VERIFIED, 'Payment Verified'),
        (TYPE_PAYMENT_REJECTED, 'Payment Rejected'),
        (TYPE_ORDER_PREPARING, 'Order Preparing'),
        (TYPE_ORDER_READY, 'Ready for Dispatch'),
        (TYPE_ORDER_DISPATCHED, 'Order Dispatched'),
        (TYPE_ORDER_DELIVERED, 'Order Delivered'),
        (TYPE_DELIVERY_CONFIRMED, 'Delivery Confirmed by Customer'),
        (TYPE_REVIEW_SUBMITTED, 'New Review Submitted'),
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES, db_index=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification to {self.recipient.username}: {self.title}"


class DeliveryStatusLog(models.Model):
    """
    Audit log of delivery transitions and driver assignments for an order.
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='delivery_logs'
    )
    status = models.CharField(max_length=30)
    note = models.TextField(blank=True, default='')
    driver_name = models.CharField(max_length=150, blank=True, default='')
    driver_phone = models.CharField(max_length=20, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_delivery_logs'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order.reference} -> {self.status} at {self.created_at}"


class Review(models.Model):
    """
    Customer review and 1-5 rating linked to a completed order.
    Only one review per completed order.
    """
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='review'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    product = models.ForeignKey(
        Product,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reviews'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating score from 1 to 5"
    )
    comment = models.TextField(blank=True, default='')
    is_visible = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for {self.order.reference} by {self.user.username} ({self.rating} stars)"


