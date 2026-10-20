import mimetypes
from decimal import Decimal
from django.db import transaction
from django.db.models import Q, Sum
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Address
from accounts.permissions import IsOwner
from products.models import Product
from .delivery import calculate_delivery_fees, get_road_distance_km, RoutingServiceError
from .models import Cart, CartItem, Order, OrderItem, PaymentReceipt, Notification, DeliveryStatusLog, Review
from .notifications import create_notification, notify_owners
from .payment import get_default_payment_instructions, validate_payment_receipt_file
from .serializers import (
    AddToCartSerializer,
    CartItemSerializer,
    CartSerializer,
    CheckoutBuyNowSerializer,
    CheckoutCartSerializer,
    DeliveryQuoteRequestSerializer,
    OrderSerializer,
    UpdateCartItemSerializer,
    OwnerOrderListSerializer,
    OwnerOrderDetailSerializer,
    OrderApprovalSerializer,
    OrderRejectionSerializer,
    PaymentVerificationSerializer,
    PaymentRejectionSerializer,
    NotificationSerializer,
    ReviewSerializer,
    ReviewCreateUpdateSerializer,
    OrderDispatchSerializer,
    DeliveryStatusUpdateSerializer,
    ReviewModerationSerializer,
)



class CartView(APIView):
    """
    GET /api/cart/      — Retrieve current customer's persistent cart and recalculated subtotal
    DELETE /api/cart/   — Clear all items from customer's cart
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        cart = self.get_cart(request.user)
        cart.items.all().delete()
        return Response({"detail": "Cart cleared successfully."}, status=status.HTTP_200_OK)


class CartItemView(APIView):
    """
    POST /api/cart/items/       — Add product to cart (or increment quantity if already present)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        with transaction.atomic():
            item, created = CartItem.objects.select_for_update().get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )
            if not created:
                new_qty = item.quantity + quantity
                if product.stock_quantity > 0 and new_qty > product.stock_quantity:
                    raise ValidationError(
                        f"Cannot add {quantity} more. Total {new_qty} exceeds stock of {product.stock_quantity}."
                    )
                item.quantity = new_qty
                item.save(update_fields=['quantity', 'updated_at'])

        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(cart_serializer.data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    """
    PATCH /api/cart/items/<id>/   — Update quantity of a cart item
    DELETE /api/cart/items/<id>/  — Remove cart item
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_item(self, user, pk):
        cart, _ = Cart.objects.get_or_create(user=user)
        return get_object_or_404(CartItem, pk=pk, cart=cart)

    def patch(self, request, pk):
        item = self.get_item(request.user, pk)
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_qty = serializer.validated_data['quantity']
        if item.product.stock_quantity > 0 and new_qty > item.product.stock_quantity:
            raise ValidationError(
                f"Requested quantity ({new_qty}) exceeds stock ({item.product.stock_quantity})."
            )

        item.quantity = new_qty
        item.save(update_fields=['quantity', 'updated_at'])

        cart_serializer = CartSerializer(item.cart, context={'request': request})
        return Response(cart_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        item = self.get_item(request.user, pk)
        cart = item.cart
        item.delete()
        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(cart_serializer.data, status=status.HTTP_200_OK)


class DeliveryQuoteView(APIView):
    """
    POST /api/delivery/quote/
    Calculates road distance, delivery fee, and free delivery requirements.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = DeliveryQuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        addr_id = serializer.validated_data.get('address_id')
        lat = serializer.validated_data.get('latitude')
        lon = serializer.validated_data.get('longitude')
        subtotal = serializer.validated_data.get('subtotal', Decimal('0.00'))

        if addr_id:
            # If user is authenticated, address must belong to them
            if request.user.is_authenticated:
                address = Address.objects.filter(id=addr_id, user=request.user).first()
                if not address:
                    raise ValidationError({"address_id": ["Address not found or does not belong to you."]})
            else:
                address = Address.objects.filter(id=addr_id).first()
                if not address:
                    raise ValidationError({"address_id": ["Address not found."]})

            lat = address.latitude
            lon = address.longitude

        try:
            distance_km = get_road_distance_km(lat, lon)
        except RoutingServiceError as exc:
            return Response(
                {"detail": f"Routing service failure: {exc}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        quote = calculate_delivery_fees(distance_km, subtotal)
        return Response(quote, status=status.HTTP_200_OK)


def _resolve_checkout_address(user, validated_data):
    """Helper to safely resolve address, coordinate snapshots, and optional saving."""
    addr_id = validated_data.get('address_id')
    new_addr = validated_data.get('new_address')
    save_addr = validated_data.get('save_address', False)
    phone = validated_data.get('phone_number') or ''
    recipient = validated_data.get('recipient_name') or ''
    room_number = validated_data.get('room_number') or ''

    source_address = None

    if addr_id:
        source_address = Address.objects.filter(id=addr_id, user=user).first()
        if not source_address:
            raise ValidationError({"address_id": ["Address not found or does not belong to you."]})

        recipient_name = recipient or source_address.recipient_name
        phone_number = phone or source_address.phone_number
        lat = source_address.latitude
        lon = source_address.longitude

        snapshot = {
            "label": source_address.label,
            "recipient_name": recipient_name,
            "phone_number": phone_number,
            "address_line": source_address.address_line,
            "house_number": source_address.house_number,
            "room_number": room_number or source_address.room_number,
            "landmark": source_address.landmark,
            "city": source_address.city,
            "state": source_address.state,
            "postal_code": source_address.postal_code,
            "country": source_address.country,
            "latitude": str(lat),
            "longitude": str(lon),
            "formatted_address": source_address.formatted_address,
        }
    else:
        # Validate required fields in new_address
        for req_field in ['recipient_name', 'phone_number', 'address_line', 'city', 'postal_code', 'latitude', 'longitude']:
            if not new_addr.get(req_field):
                raise ValidationError({"new_address": [f"'{req_field}' is required in new_address."]})

        recipient_name = recipient or new_addr['recipient_name']
        phone_number = phone or new_addr['phone_number']
        lat = Decimal(str(new_addr['latitude']))
        lon = Decimal(str(new_addr['longitude']))

        if lat < Decimal('-90.0') or lat > Decimal('90.0'):
            raise ValidationError({"new_address": ["Latitude must be between -90 and 90."]})
        if lon < Decimal('-180.0') or lon > Decimal('180.0'):
            raise ValidationError({"new_address": ["Longitude must be between -180 and 180."]})

        snapshot = {
            "label": new_addr.get('label', 'Home'),
            "recipient_name": recipient_name,
            "phone_number": phone_number,
            "address_line": new_addr['address_line'],
            "house_number": new_addr.get('house_number', ''),
            "room_number": room_number or new_addr.get('room_number', ''),
            "landmark": new_addr.get('landmark', ''),
            "city": new_addr.get('city', 'Indore'),
            "state": new_addr.get('state', 'Madhya Pradesh'),
            "postal_code": new_addr['postal_code'],
            "country": new_addr.get('country', 'India'),
            "latitude": str(lat),
            "longitude": str(lon),
            "formatted_address": new_addr.get('formatted_address', ''),
        }

        if save_addr:
            source_address = Address.objects.create(
                user=user,
                label=snapshot['label'],
                recipient_name=recipient_name,
                phone_number=phone_number,
                address_line=snapshot['address_line'],
                house_number=snapshot['house_number'],
                room_number=snapshot['room_number'],
                landmark=snapshot['landmark'],
                city=snapshot['city'],
                state=snapshot['state'],
                postal_code=snapshot['postal_code'],
                country=snapshot['country'],
                latitude=lat,
                longitude=lon,
                formatted_address=snapshot['formatted_address'],
            )

    return source_address, snapshot, recipient_name, phone_number, lat, lon


class CheckoutBuyNowView(APIView):
    """
    POST /api/checkout/buy-now/
    Creates a pending order directly for a single product.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutBuyNowSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        product = data['product']
        quantity = data.get('quantity', 1)
        idempotency_key = data.get('idempotency_key')

        # Check idempotency
        if idempotency_key:
            existing = Order.objects.filter(
                user=request.user,
                idempotency_key=idempotency_key,
                status=Order.STATUS_PENDING
            ).first()
            if existing:
                return Response(OrderSerializer(existing, context={'request': request}).data, status=status.HTTP_200_OK)

        source_address, address_snapshot, recipient_name, phone_number, lat, lon = _resolve_checkout_address(
            request.user, data
        )

        try:
            distance_km = get_road_distance_km(lat, lon)
        except RoutingServiceError as exc:
            return Response(
                {"detail": f"Routing service error: {exc}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        fees = calculate_delivery_fees(distance_km, product.price * quantity)
        if not fees['is_eligible']:
            raise ValidationError({
                "detail": f"Delivery is unavailable for locations beyond 20 km (calculated distance: {distance_km} km)."
            })

        subtotal = product.price * quantity
        total = subtotal + fees['delivery_fee_charged']

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                status=Order.STATUS_PENDING,
                subtotal=subtotal,
                road_distance_km=distance_km,
                billable_distance_km=fees['billable_distance_km'],
                delivery_fee=fees['base_delivery_fee'],
                delivery_fee_charged=fees['delivery_fee_charged'],
                is_free_delivery=fees['is_free_delivery'],
                free_delivery_threshold=fees['free_delivery_threshold'],
                total=total,
                source_address=source_address,
                address_snapshot=address_snapshot,
                recipient_name=recipient_name,
                phone_number=phone_number,
                delivery_instructions=data.get('delivery_instructions', ''),
                idempotency_key=idempotency_key,
            )

            img_url = request.build_absolute_uri(product.image.url) if product.image else None
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_slug=product.slug,
                unit_price=product.price,
                quantity=quantity,
                line_total=subtotal,
                weight_grams=product.weight_grams,
                product_image_url=img_url,
            )

        notify_owners(
            Notification.TYPE_ORDER_PLACED,
            f"New Order {order.reference}",
            f"Customer {order.recipient_name} placed order {order.reference} for ₹{order.total}.",
            order=order
        )

        return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)


class CheckoutCartView(APIView):
    """
    POST /api/checkout/cart/
    Creates a pending order for all items currently in customer's cart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        idempotency_key = data.get('idempotency_key')

        # Check idempotency
        if idempotency_key:
            existing = Order.objects.filter(
                user=request.user,
                idempotency_key=idempotency_key,
                status=Order.STATUS_PENDING
            ).first()
            if existing:
                return Response(OrderSerializer(existing, context={'request': request}).data, status=status.HTTP_200_OK)

        cart = get_object_or_404(Cart, user=request.user)
        cart_items = list(cart.items.select_related('product').all())

        if not cart_items:
            raise ValidationError({"detail": "Cannot checkout with an empty cart."})

        # Validate product availability and stock
        subtotal = Decimal('0.00')
        for item in cart_items:
            if not item.product.is_available:
                raise ValidationError({
                    "detail": f"Product '{item.product.name}' is no longer available. Please remove it from your cart."
                })
            if item.product.stock_quantity > 0 and item.quantity > item.product.stock_quantity:
                raise ValidationError({
                    "detail": f"Quantity for '{item.product.name}' exceeds available stock ({item.product.stock_quantity})."
                })
            subtotal += item.product.price * item.quantity

        source_address, address_snapshot, recipient_name, phone_number, lat, lon = _resolve_checkout_address(
            request.user, data
        )

        try:
            distance_km = get_road_distance_km(lat, lon)
        except RoutingServiceError as exc:
            return Response(
                {"detail": f"Routing service error: {exc}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        fees = calculate_delivery_fees(distance_km, subtotal)
        if not fees['is_eligible']:
            raise ValidationError({
                "detail": f"Delivery is unavailable for locations beyond 20 km (calculated distance: {distance_km} km)."
            })

        total = subtotal + fees['delivery_fee_charged']

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                status=Order.STATUS_PENDING,
                subtotal=subtotal,
                road_distance_km=distance_km,
                billable_distance_km=fees['billable_distance_km'],
                delivery_fee=fees['base_delivery_fee'],
                delivery_fee_charged=fees['delivery_fee_charged'],
                is_free_delivery=fees['is_free_delivery'],
                free_delivery_threshold=fees['free_delivery_threshold'],
                total=total,
                source_address=source_address,
                address_snapshot=address_snapshot,
                recipient_name=recipient_name,
                phone_number=phone_number,
                delivery_instructions=data.get('delivery_instructions', ''),
                idempotency_key=idempotency_key,
            )

            for item in cart_items:
                img_url = request.build_absolute_uri(item.product.image.url) if item.product.image else None
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    product_name=item.product.name,
                    product_slug=item.product.slug,
                    unit_price=item.product.price,
                    quantity=item.quantity,
                    line_total=item.product.price * item.quantity,
                    weight_grams=item.product.weight_grams,
                    product_image_url=img_url,
                )

            # Clear cart items upon successful order creation
            cart.items.all().delete()

        notify_owners(
            Notification.TYPE_ORDER_PLACED,
            f"New Order {order.reference}",
            f"Customer {order.recipient_name} placed order {order.reference} for ₹{order.total}.",
            order=order
        )

        return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/orders/                — List customer's own order history
    GET /api/orders/<public_id>/    — Retrieve specific order details by public UUID
    POST /api/orders/<public_id>/cancel/ — Cancel pending order
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'public_id'

    def get_queryset(self):
        # Strict user ownership isolation
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, public_id=None):
        with transaction.atomic():
            order = Order.objects.select_for_update().filter(
                public_id=public_id,
                user=request.user
            ).first()

            if not order:
                return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

            if order.status != Order.STATUS_PENDING:
                return Response(
                    {"detail": f"Cannot cancel order with status '{order.status}'. Only pending orders can be cancelled."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            order.status = Order.STATUS_CANCELLED
            order.save(update_fields=['status', 'updated_at'])

        return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=['get', 'post'],
        url_path='payment-receipt',
        parser_classes=[MultiPartParser, FormParser, JSONParser]
    )
    def payment_receipt(self, request, public_id=None):
        if request.method == 'GET':
            order = get_object_or_404(Order, public_id=public_id)
            is_order_user = (request.user == order.user)
            is_store_owner = hasattr(request.user, 'profile') and request.user.profile.role == 'owner'
            if not (is_order_user or is_store_owner):
                return Response(
                    {"detail": "You do not have permission to view this receipt."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if not order.payment_receipt:
                return Response(
                    {"detail": "No payment receipt uploaded for this order."},
                    status=status.HTTP_404_NOT_FOUND
                )

            try:
                f = order.payment_receipt.open('rb')
                mime, _ = mimetypes.guess_type(order.payment_receipt.name)
                return FileResponse(f, content_type=mime or 'application/octet-stream')
            except Exception:
                return Response(
                    {"detail": "Receipt file could not be read from storage."},
                    status=status.HTTP_404_NOT_FOUND
                )

        elif request.method == 'POST':
            order = get_object_or_404(Order, public_id=public_id, user=request.user)

            if order.status != Order.STATUS_APPROVED:
                return Response(
                    {"detail": f"Cannot upload receipt for order with status '{order.status}'. Payment receipt can only be submitted for approved orders."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if order.payment_status not in [Order.PAYMENT_UNPAID, Order.PAYMENT_REJECTED]:
                return Response(
                    {"detail": f"Cannot submit payment receipt when payment status is '{order.payment_status}'."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            file_obj = request.FILES.get('receipt')
            if not file_obj:
                return Response(
                    {"detail": "No receipt file provided under 'receipt' field."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            validate_payment_receipt_file(file_obj)

            with transaction.atomic():
                PaymentReceipt.objects.create(
                    order=order,
                    receipt_file=file_obj,
                    file_name=file_obj.name,
                    file_size_bytes=file_obj.size,
                    status=Order.PAYMENT_SUBMITTED,
                )
                order.payment_receipt = file_obj
                order.payment_status = Order.PAYMENT_SUBMITTED
                order.payment_submitted_at = timezone.now()
                order.payment_rejection_reason = ''
                order.save(update_fields=[
                    'payment_receipt',
                    'payment_status',
                    'payment_submitted_at',
                    'payment_rejection_reason',
                    'updated_at'
                ])

                notify_owners(
                    Notification.TYPE_PAYMENT_SUBMITTED,
                    f"Payment Proof Submitted: {order.reference}",
                    f"Customer {order.recipient_name} submitted payment receipt for order {order.reference} (₹{order.total}).",
                    order=order
                )

            return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='confirm-delivery')
    def confirm_delivery(self, request, public_id=None):
        order = get_object_or_404(Order, public_id=public_id, user=request.user)

        if order.is_customer_confirmed:
            return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_200_OK)

        if order.status not in [Order.STATUS_OUT_FOR_DELIVERY, Order.STATUS_DELIVERED]:
            return Response(
                {
                    "detail": f"Cannot confirm delivery for order with status '{order.status}'. Order must be out for delivery or delivered."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            now = timezone.now()
            if order.status == Order.STATUS_OUT_FOR_DELIVERY:
                order.status = Order.STATUS_DELIVERED
            if not order.delivered_at:
                order.delivered_at = now
            order.is_customer_confirmed = True
            order.customer_confirmed_at = now
            order.save(update_fields=[
                'status',
                'delivered_at',
                'is_customer_confirmed',
                'customer_confirmed_at',
                'updated_at'
            ])

            DeliveryStatusLog.objects.create(
                order=order,
                status=Order.STATUS_DELIVERED,
                note="Customer confirmed receipt of order.",
                created_by=request.user
            )

            notify_owners(
                Notification.TYPE_DELIVERY_CONFIRMED,
                f"Delivery Confirmed: {order.reference}",
                f"Customer {order.recipient_name} confirmed receipt of order {order.reference}.",
                order=order
            )

        return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], url_path='review')
    def review(self, request, public_id=None):
        order = get_object_or_404(Order, public_id=public_id, user=request.user)

        if request.method == 'GET':
            review_obj = getattr(order, 'review', None)
            if not review_obj:
                return Response({"detail": "No review found for this order."}, status=status.HTTP_404_NOT_FOUND)
            return Response(ReviewSerializer(review_obj, context={'request': request}).data, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            if order.status != Order.STATUS_DELIVERED and not order.is_customer_confirmed:
                return Response(
                    {"detail": "You can only review an order after it has been delivered."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = ReviewCreateUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            rating = serializer.validated_data['rating']
            comment = serializer.validated_data.get('comment', '')

            primary_product = None
            first_item = order.items.first()
            if first_item:
                primary_product = first_item.product

            with transaction.atomic():
                review_obj, created = Review.objects.update_or_create(
                    order=order,
                    defaults={
                        'user': request.user,
                        'product': primary_product,
                        'rating': rating,
                        'comment': comment,
                        'is_visible': True,
                    }
                )

                notify_owners(
                    Notification.TYPE_REVIEW_SUBMITTED,
                    f"New Review for {order.reference}",
                    f"Customer {order.recipient_name} submitted a {rating}-star review for order {order.reference}.",
                    order=order
                )

            return Response(
                ReviewSerializer(review_obj, context={'request': request}).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )


class OwnerDashboardView(APIView):
    """
    GET /api/owner/dashboard/
    Store management overview metrics and recent orders.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get(self, request):
        pending_count = Order.objects.filter(status=Order.STATUS_PENDING).count()
        approved_unpaid = Order.objects.filter(
            status=Order.STATUS_APPROVED,
            payment_status=Order.PAYMENT_UNPAID
        ).count()
        verification_pending = Order.objects.filter(
            status=Order.STATUS_APPROVED,
            payment_status=Order.PAYMENT_SUBMITTED
        ).count()
        paid_verified = Order.objects.filter(payment_status=Order.PAYMENT_VERIFIED).count()
        rejected_or_cancelled = Order.objects.filter(
            status__in=[Order.STATUS_REJECTED, Order.STATUS_CANCELLED]
        ).count()
        total_orders = Order.objects.count()

        revenue_agg = Order.objects.filter(
            payment_status=Order.PAYMENT_VERIFIED
        ).aggregate(total=Sum('total'))
        total_revenue = revenue_agg['total'] or Decimal('0.00')

        # Delivery counts
        preparing_count = Order.objects.filter(status=Order.STATUS_PREPARING).count()
        ready_count = Order.objects.filter(status=Order.STATUS_READY_FOR_DISPATCH).count()
        out_count = Order.objects.filter(status=Order.STATUS_OUT_FOR_DELIVERY).count()
        delivered_count = Order.objects.filter(status=Order.STATUS_DELIVERED).count()

        recent_qs = Order.objects.select_related('user').prefetch_related('items').order_by('-created_at')[:8]
        recent_orders = OwnerOrderListSerializer(recent_qs, many=True, context={'request': request}).data

        return Response({
            "summary": {
                "pending_approval": pending_count,
                "approved_awaiting_payment": approved_unpaid,
                "payment_verification_pending": verification_pending,
                "paid_verified": paid_verified,
                "rejected_or_cancelled": rejected_or_cancelled,
                "preparing": preparing_count,
                "ready_for_dispatch": ready_count,
                "out_for_delivery": out_count,
                "delivered": delivered_count,
                "total_orders": total_orders,
                "total_revenue": str(total_revenue),
            },
            "recent_orders": recent_orders,
        }, status=status.HTTP_200_OK)


class OwnerOrderListView(generics.ListAPIView):
    """
    GET /api/owner/orders/
    List all store orders for owner with filtering and pagination.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    serializer_class = OwnerOrderListSerializer

    def get_queryset(self):
        qs = Order.objects.select_related('user').prefetch_related('items').order_by('-created_at')

        order_status = self.request.query_params.get('status')
        if order_status:
            qs = qs.filter(status=order_status)

        payment_status = self.request.query_params.get('payment_status')
        if payment_status:
            qs = qs.filter(payment_status=payment_status)

        search = self.request.query_params.get('search')
        if search:
            search = search.strip()
            uuid_candidate = search[3:] if search.upper().startswith('MM-') else search
            qs = qs.filter(
                Q(public_id__icontains=uuid_candidate) |
                Q(recipient_name__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search)
            )

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        return qs


class OwnerOrderDetailView(APIView):
    """
    GET /api/owner/orders/<public_id>/
    Complete order details including items, address snapshot, payment status, and receipt history.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get(self, request, public_id):
        order = get_object_or_404(
            Order.objects.select_related('user').prefetch_related('items', 'receipt_history'),
            public_id=public_id
        )
        serializer = OwnerOrderDetailSerializer(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class OwnerOrderApproveView(APIView):
    """
    POST /api/owner/orders/<public_id>/approve/
    Approves a pending order and assigns payment instructions.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request, public_id):
        order = get_object_or_404(Order, public_id=public_id)
        if order.status != Order.STATUS_PENDING:
            return Response(
                {"detail": f"Cannot approve order with status '{order.status}'. Only pending orders can be approved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = OrderApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instructions = serializer.validated_data.get('payment_instructions') or get_default_payment_instructions(order)
        internal_note = serializer.validated_data.get('internal_note', '')

        with transaction.atomic():
            order.status = Order.STATUS_APPROVED
            order.payment_instructions = instructions
            if internal_note:
                order.internal_note = internal_note
            order.save(update_fields=['status', 'payment_instructions', 'internal_note', 'updated_at'])

            create_notification(
                order.user,
                Notification.TYPE_ORDER_APPROVED,
                f"Order {order.reference} Approved!",
                "Your order has been approved by MilletMarg! Please check the payment instructions and upload your payment proof.",
                order=order
            )

        return Response(OwnerOrderDetailSerializer(order, context={'request': request}).data, status=status.HTTP_200_OK)


class OwnerOrderRejectView(APIView):
    """
    POST /api/owner/orders/<public_id>/reject/
    Rejects a pending order with a required reason.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request, public_id):
        order = get_object_or_404(Order, public_id=public_id)
        if order.status != Order.STATUS_PENDING:
            return Response(
                {"detail": f"Cannot reject order with status '{order.status}'. Only pending orders can be rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = OrderRejectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data['rejection_reason']
        internal_note = serializer.validated_data.get('internal_note', '')

        with transaction.atomic():
            order.status = Order.STATUS_REJECTED
            order.rejection_reason = reason
            if internal_note:
                order.internal_note = internal_note
            order.save(update_fields=['status', 'rejection_reason', 'internal_note', 'updated_at'])

            create_notification(
                order.user,
                Notification.TYPE_ORDER_REJECTED,
                f"Order {order.reference} Rejected",
                f"Your order could not be accepted. Reason: {reason}",
                order=order
            )

        return Response(OwnerOrderDetailSerializer(order, context={'request': request}).data, status=status.HTTP_200_OK)


class OwnerPaymentVerifyView(APIView):
    """
    POST /api/owner/orders/<public_id>/verify-payment/
    Marks manual payment as verified.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request, public_id):
        order = get_object_or_404(Order, public_id=public_id)
        if order.status != Order.STATUS_APPROVED:
            return Response(
                {"detail": f"Cannot verify payment for order with status '{order.status}'. Order must be approved first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if order.payment_status != Order.PAYMENT_SUBMITTED:
            return Response(
                {"detail": f"Cannot verify payment for order with payment status '{order.payment_status}'. Payment proof must be submitted first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PaymentVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        internal_note = serializer.validated_data.get('internal_note', '')

        with transaction.atomic():
            order.payment_status = Order.PAYMENT_VERIFIED
            order.payment_verified_at = timezone.now()
            if internal_note:
                order.internal_note = internal_note
            order.save(update_fields=['payment_status', 'payment_verified_at', 'internal_note', 'updated_at'])

            latest_receipt = order.receipt_history.first()
            if latest_receipt:
                latest_receipt.status = Order.PAYMENT_VERIFIED
                latest_receipt.save(update_fields=['status'])

            create_notification(
                order.user,
                Notification.TYPE_PAYMENT_VERIFIED,
                f"Payment Verified: {order.reference}",
                "Your payment proof has been verified by MilletMarg. We are preparing your fresh millet order!",
                order=order
            )

        return Response(OwnerOrderDetailSerializer(order, context={'request': request}).data, status=status.HTTP_200_OK)


class OwnerPaymentRejectView(APIView):
    """
    POST /api/owner/orders/<public_id>/reject-payment/
    Rejects customer submitted payment proof with a required reason.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request, public_id):
        order = get_object_or_404(Order, public_id=public_id)
        if order.status != Order.STATUS_APPROVED:
            return Response(
                {"detail": f"Cannot reject payment for order with status '{order.status}'. Order must be approved first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if order.payment_status != Order.PAYMENT_SUBMITTED:
            return Response(
                {"detail": f"Cannot reject payment for order with payment status '{order.payment_status}'. Payment proof must be submitted first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PaymentRejectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reason = serializer.validated_data['payment_rejection_reason']
        internal_note = serializer.validated_data.get('internal_note', '')

        with transaction.atomic():
            order.payment_status = Order.PAYMENT_REJECTED
            order.payment_rejection_reason = reason
            if internal_note:
                order.internal_note = internal_note
            order.save(update_fields=['payment_status', 'payment_rejection_reason', 'internal_note', 'updated_at'])

            latest_receipt = order.receipt_history.first()
            if latest_receipt:
                latest_receipt.status = Order.PAYMENT_REJECTED
                latest_receipt.review_note = reason
                latest_receipt.save(update_fields=['status', 'review_note'])

            create_notification(
                order.user,
                Notification.TYPE_PAYMENT_REJECTED,
                f"Payment Proof Rejected: {order.reference}",
                f"Your payment proof was rejected. Reason: {reason}. Please review instructions and re-upload a clear receipt.",
                order=order
            )

        return Response(OwnerOrderDetailSerializer(order, context={'request': request}).data, status=status.HTTP_200_OK)


class NotificationListView(APIView):
    """
    GET /api/notifications/
    Returns recent notifications for current authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user)[:50]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationUnreadCountView(APIView):
    """
    GET /api/notifications/unread-count/
    Returns count of unread notifications for current authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
    """
    POST /api/notifications/<id>/mark-read/
    Marks a single notification as read.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({"detail": "Notification marked as read."}, status=status.HTTP_200_OK)


class NotificationMarkAllReadView(APIView):
    """
    POST /api/notifications/mark-all-read/
    Marks all notifications for current user as read.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."}, status=status.HTTP_200_OK)


class OwnerDeliveryStatusUpdateView(APIView):
    """
    POST /api/owner/orders/<public_id>/delivery-status/
    Updates order delivery progression (preparing, ready_for_dispatch, delivered).
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request, public_id):
        order = get_object_or_404(Order, public_id=public_id)
        serializer = DeliveryStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_status = serializer.validated_data['status']
        note = serializer.validated_data.get('note', '')

        if order.status in [Order.STATUS_CANCELLED, Order.STATUS_REJECTED]:
            return Response(
                {"detail": f"Cannot update delivery status for a {order.status} order."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            if target_status == 'preparing':
                if order.payment_status != Order.PAYMENT_VERIFIED:
                    return Response(
                        {"detail": "Cannot prepare order before payment has been verified."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if order.status not in [Order.STATUS_APPROVED, Order.STATUS_PENDING]:
                    return Response(
                        {"detail": f"Cannot transition to preparing from status '{order.status}'."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                order.status = Order.STATUS_PREPARING
                order.save(update_fields=['status', 'updated_at'])
                create_notification(
                    order.user,
                    Notification.TYPE_ORDER_PREPARING,
                    f"Preparing Order {order.reference}",
                    "Your order is now being freshly prepared in our MilletMarg kitchen!",
                    order=order
                )

            elif target_status == 'ready_for_dispatch':
                if order.status != Order.STATUS_PREPARING:
                    return Response(
                        {"detail": f"Cannot mark ready for dispatch from status '{order.status}'. Order must be preparing first."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                order.status = Order.STATUS_READY_FOR_DISPATCH
                order.save(update_fields=['status', 'updated_at'])
                create_notification(
                    order.user,
                    Notification.TYPE_ORDER_READY,
                    f"Order {order.reference} Packed",
                    "Your fresh millet meal is packed and ready for dispatch!",
                    order=order
                )

            elif target_status == 'delivered':
                if order.status != Order.STATUS_OUT_FOR_DELIVERY:
                    return Response(
                        {"detail": f"Cannot mark delivered from status '{order.status}'. Order must be out for delivery first."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                order.status = Order.STATUS_DELIVERED
                order.delivered_at = timezone.now()
                order.save(update_fields=['status', 'delivered_at', 'updated_at'])
                create_notification(
                    order.user,
                    Notification.TYPE_ORDER_DELIVERED,
                    f"Order {order.reference} Delivered",
                    "Your order has been delivered by our driver. Please confirm receipt and share your review!",
                    order=order
                )

            DeliveryStatusLog.objects.create(
                order=order,
                status=order.status,
                note=note,
                driver_name=order.driver_name,
                driver_phone=order.driver_phone,
                created_by=request.user
            )

        return Response(OwnerOrderDetailSerializer(order, context={'request': request}).data, status=status.HTTP_200_OK)


class OwnerOrderDispatchView(APIView):
    """
    POST /api/owner/orders/<public_id>/dispatch/
    Assigns driver information and dispatches the order (out_for_delivery).
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request, public_id):
        order = get_object_or_404(Order, public_id=public_id)

        if order.status in [Order.STATUS_CANCELLED, Order.STATUS_REJECTED]:
            return Response(
                {"detail": f"Cannot dispatch a {order.status} order."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.payment_status != Order.PAYMENT_VERIFIED:
            return Response(
                {"detail": f"Cannot dispatch order with payment status '{order.payment_status}'. Payment must be verified before dispatching."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.status not in [Order.STATUS_READY_FOR_DISPATCH, Order.STATUS_PREPARING, Order.STATUS_APPROVED]:
            return Response(
                {"detail": f"Cannot dispatch order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = OrderDispatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        driver_name = serializer.validated_data['driver_name']
        driver_phone = serializer.validated_data['driver_phone']
        estimated_delivery_time = serializer.validated_data.get('estimated_delivery_time')
        note = serializer.validated_data.get('note', '')

        with transaction.atomic():
            order.driver_name = driver_name
            order.driver_phone = driver_phone
            order.dispatched_at = timezone.now()
            order.estimated_delivery_time = estimated_delivery_time
            order.status = Order.STATUS_OUT_FOR_DELIVERY
            order.save(update_fields=[
                'driver_name',
                'driver_phone',
                'dispatched_at',
                'estimated_delivery_time',
                'status',
                'updated_at'
            ])

            DeliveryStatusLog.objects.create(
                order=order,
                status=Order.STATUS_OUT_FOR_DELIVERY,
                note=note or "Order dispatched with driver.",
                driver_name=driver_name,
                driver_phone=driver_phone,
                created_by=request.user
            )

            create_notification(
                order.user,
                Notification.TYPE_ORDER_DISPATCHED,
                f"Order {order.reference} Out for Delivery!",
                f"Your order is on its way with driver {driver_name} (Phone: {driver_phone}).",
                order=order
            )

        return Response(OwnerOrderDetailSerializer(order, context={'request': request}).data, status=status.HTTP_200_OK)


class OwnerReviewListView(generics.ListAPIView):
    """
    GET /api/owner/reviews/
    Lists all reviews across all orders for owner inspection and moderation.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    serializer_class = ReviewSerializer
    queryset = Review.objects.select_related('order', 'user', 'user__profile').order_by('-created_at')


class OwnerReviewModerateView(APIView):
    """
    POST /api/owner/reviews/<int:pk>/moderate/
    Toggle public visibility of a review.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request, pk):
        review_obj = get_object_or_404(Review, pk=pk)
        serializer = ReviewModerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review_obj.is_visible = serializer.validated_data['is_visible']
        review_obj.save(update_fields=['is_visible', 'updated_at'])

        return Response(ReviewSerializer(review_obj, context={'request': request}).data, status=status.HTTP_200_OK)


