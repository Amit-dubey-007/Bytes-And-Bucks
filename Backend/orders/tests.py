import io
from decimal import Decimal
from unittest.mock import patch
from PIL import Image

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import Address, UserProfile
from products.models import Product
from .delivery import calculate_delivery_fees, RoutingServiceError
from .models import Cart, CartItem, Order, OrderItem, PaymentReceipt, Notification, DeliveryStatusLog, Review
from .whatsapp import generate_whatsapp_order_url


class DeliveryCalculationUnitTests(TestCase):
    """
    Unit tests for delivery-fee formula, fractional km ceiling, free delivery thresholds,
    and 20 km eligibility boundary.
    """

    def test_fee_under_5_km_minimum_50(self):
        # 1 km -> billable 1 km -> fee 50
        res = calculate_delivery_fees(Decimal("1.0"), Decimal("50.00"))
        self.assertEqual(res['billable_distance_km'], 1)
        self.assertEqual(res['base_delivery_fee'], Decimal("50.00"))
        self.assertEqual(res['free_delivery_threshold'], Decimal("100.00"))
        self.assertEqual(res['delivery_fee_charged'], Decimal("50.00"))
        self.assertTrue(res['is_eligible'])

    def test_fractional_distance_ceiling_rule(self):
        # 5.2 km -> billable 6 km -> fee 60
        res = calculate_delivery_fees(Decimal("5.2"), Decimal("100.00"))
        self.assertEqual(res['billable_distance_km'], 6)
        self.assertEqual(res['base_delivery_fee'], Decimal("60.00"))
        self.assertEqual(res['free_delivery_threshold'], Decimal("600.00"))
        self.assertEqual(res['delivery_fee_charged'], Decimal("60.00"))
        self.assertEqual(res['amount_needed_for_free_delivery'], Decimal("500.00"))

    def test_free_delivery_qualification(self):
        # 3 km -> threshold = 3 * 100 = 300. Subtotal = 350. Free!
        res = calculate_delivery_fees(Decimal("3.0"), Decimal("350.00"))
        self.assertEqual(res['billable_distance_km'], 3)
        self.assertEqual(res['base_delivery_fee'], Decimal("50.00"))
        self.assertTrue(res['is_free_delivery'])
        self.assertEqual(res['delivery_fee_charged'], Decimal("0.00"))
        self.assertEqual(res['amount_needed_for_free_delivery'], Decimal("0.00"))

    def test_exact_20_km_boundary_eligible(self):
        # 20.0 km -> billable 20 km -> eligible!
        res = calculate_delivery_fees(Decimal("20.0"), Decimal("500.00"))
        self.assertEqual(res['billable_distance_km'], 20)
        self.assertEqual(res['base_delivery_fee'], Decimal("200.00"))
        self.assertTrue(res['is_eligible'])

    def test_over_20_km_boundary_ineligible(self):
        # 20.1 km -> Ineligible!
        res = calculate_delivery_fees(Decimal("20.1"), Decimal("500.00"))
        self.assertFalse(res['is_eligible'])


class CartAPITests(APITestCase):
    """
    Tests for Cart retrieval, add item, update quantity, remove item, stock checks,
    and unavailable product rejection.
    """

    def setUp(self):
        self.user1 = User.objects.create_user(username="cartuser1", email="u1@test.com")
        self.user2 = User.objects.create_user(username="cartuser2", email="u2@test.com")
        self.token1 = Token.objects.create(user=self.user1)
        self.token2 = Token.objects.create(user=self.user2)

        self.p1 = Product.objects.create(
            name="Ragi Laddu",
            price=Decimal("150.00"),
            category="Snacks",
            weight_grams=250,
            stock_quantity=10,
            is_available=True
        )
        self.p2_unavailable = Product.objects.create(
            name="Unavailable Millet Bar",
            price=Decimal("50.00"),
            category="Snacks",
            weight_grams=100,
            stock_quantity=5,
            is_available=False
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")

    def test_unauthenticated_cart_access_rejected(self):
        self.client.credentials()
        res = self.client.get(reverse('cart-detail'))
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_item_to_cart_and_increment(self):
        # Add 2 items
        res = self.client.post(reverse('cart-items'), {
            'product_id': self.p1.id,
            'quantity': 2
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        self.assertEqual(data['total_items'], 2)
        self.assertEqual(Decimal(data['subtotal']), Decimal("300.00"))

        # Add 1 more item of same product -> quantity becomes 3
        res2 = self.client.post(reverse('cart-items'), {
            'product_id': self.p1.id,
            'quantity': 1
        })
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        data2 = res2.json()
        self.assertEqual(data2['total_items'], 3)
        self.assertEqual(Decimal(data2['subtotal']), Decimal("450.00"))

    def test_cannot_add_unavailable_product(self):
        res = self.client.post(reverse('cart-items'), {
            'product_id': self.p2_unavailable.id,
            'quantity': 1
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_quantity_exceeding_stock_rejected(self):
        res = self.client.post(reverse('cart-items'), {
            'product_id': self.p1.id,
            'quantity': 50  # Stock is 10
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_cart_item_quantity_and_delete(self):
        cart = Cart.objects.create(user=self.user1)
        item = CartItem.objects.create(cart=cart, product=self.p1, quantity=2)

        # Update
        patch_res = self.client.patch(
            reverse('cart-item-detail', kwargs={'pk': item.id}),
            {'quantity': 5}
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.quantity, 5)

        # Delete
        del_res = self.client.delete(reverse('cart-item-detail', kwargs={'pk': item.id}))
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        self.assertFalse(CartItem.objects.filter(id=item.id).exists())

    def test_cart_ownership_isolation(self):
        cart1 = Cart.objects.create(user=self.user1)
        item1 = CartItem.objects.create(cart=cart1, product=self.p1, quantity=1)

        # Switch to user 2
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token2.key}")

        # Cannot patch user1's cart item
        patch_res = self.client.patch(
            reverse('cart-item-detail', kwargs={'pk': item1.id}),
            {'quantity': 3}
        )
        self.assertEqual(patch_res.status_code, status.HTTP_404_NOT_FOUND)

        # User 2 cart is initially empty
        get_res = self.client.get(reverse('cart-detail'))
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.json()['total_items'], 0)


class CheckoutAndOrderAPITests(APITestCase):
    """
    Tests for Checkout Buy-Now, Cart Checkout, Routing validation, Idempotency,
    WhatsApp URL generation, and Order Cancellation.
    """

    def setUp(self):
        self.user = User.objects.create_user(username="checkoutuser", email="ch@test.com")
        self.other_user = User.objects.create_user(username="otheruser", email="other@test.com")
        self.token = Token.objects.create(user=self.user)
        self.other_token = Token.objects.create(user=self.other_user)

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

        self.product = Product.objects.create(
            name="Foxtail Millet Khichdi",
            price=Decimal("120.00"),
            category="Ready to Cook",
            weight_grams=300,
            stock_quantity=20,
            is_available=True
        )

        self.address = Address.objects.create(
            user=self.user,
            label="Home",
            recipient_name="Deepak Sharma",
            phone_number="9876543210",
            address_line="56 Geeta Bhavan",
            city="Indore",
            state="Madhya Pradesh",
            postal_code="452001",
            latitude=Decimal("22.715000"),
            longitude=Decimal("75.875000"),
            is_default=True
        )

        self.other_address = Address.objects.create(
            user=self.other_user,
            label="Home",
            recipient_name="Other Person",
            phone_number="9876543211",
            address_line="Vijay Nagar",
            city="Indore",
            postal_code="452010",
            latitude=Decimal("22.750000"),
            longitude=Decimal("75.890000")
        )

    @patch('orders.views.get_road_distance_km')
    def test_buy_now_checkout_success(self, mock_distance):
        mock_distance.return_value = Decimal("4.5")  # 4.5 km -> billable 5 km -> fee 50

        payload = {
            "product_id": self.product.id,
            "quantity": 2,
            "address_id": self.address.id,
            "phone_number": "9876543210"
        }

        res = self.client.post(reverse('checkout-buy-now'), payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()

        self.assertEqual(data['status'], 'pending')
        self.assertEqual(Decimal(data['subtotal']), Decimal("240.00"))
        self.assertEqual(Decimal(data['delivery_fee_charged']), Decimal("50.00"))
        self.assertEqual(Decimal(data['total']), Decimal("290.00"))
        self.assertIn("wa.me/918349309523", data['whatsapp_url'])
        self.assertIn(data['reference'], data['whatsapp_url'])

        # Verify OrderItem snapshot
        order = Order.objects.get(public_id=data['public_id'])
        self.assertEqual(order.items.count(), 1)
        item = order.items.first()
        self.assertEqual(item.product_name, "Foxtail Millet Khichdi")
        self.assertEqual(item.unit_price, Decimal("120.00"))

    @patch('orders.views.get_road_distance_km')
    def test_checkout_cannot_use_another_users_address(self, mock_distance):
        mock_distance.return_value = Decimal("5.0")

        payload = {
            "product_id": self.product.id,
            "quantity": 1,
            "address_id": self.other_address.id  # Belongs to other_user!
        }
        res = self.client.post(reverse('checkout-buy-now'), payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('address_id', res.json())

    @patch('orders.views.get_road_distance_km')
    def test_checkout_over_20_km_rejected(self, mock_distance):
        mock_distance.return_value = Decimal("24.5")  # Over 20 km limit

        payload = {
            "product_id": self.product.id,
            "quantity": 1,
            "address_id": self.address.id
        }
        res = self.client.post(reverse('checkout-buy-now'), payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("beyond 20 km", res.json()['detail'])

    @patch('orders.views.get_road_distance_km')
    def test_routing_failure_fails_safely_no_order_created(self, mock_distance):
        mock_distance.side_effect = RoutingServiceError("Routing provider timed out")

        payload = {
            "product_id": self.product.id,
            "quantity": 1,
            "address_id": self.address.id
        }
        res = self.client.post(reverse('checkout-buy-now'), payload)
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(Order.objects.count(), 0)

    @patch('orders.views.get_road_distance_km')
    def test_checkout_saves_new_address_when_flag_is_true(self, mock_distance):
        mock_distance.return_value = Decimal("6.0")

        initial_count = Address.objects.filter(user=self.user).count()
        payload = {
            "product_id": self.product.id,
            "quantity": 1,
            "new_address": {
                "recipient_name": "New Person",
                "phone_number": "9876543210",
                "address_line": "Bhawarkua Square",
                "city": "Indore",
                "state": "Madhya Pradesh",
                "postal_code": "452001",
                "latitude": "22.690000",
                "longitude": "75.860000"
            },
            "save_address": True
        }
        res = self.client.post(reverse('checkout-buy-now'), payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Address.objects.filter(user=self.user).count(), initial_count + 1)

    @patch('orders.views.get_road_distance_km')
    def test_idempotent_checkout_prevents_duplicate_pending_order(self, mock_distance):
        mock_distance.return_value = Decimal("5.0")

        payload = {
            "product_id": self.product.id,
            "quantity": 1,
            "address_id": self.address.id,
            "idempotency_key": "idemp-key-xyz-999"
        }

        res1 = self.client.post(reverse('checkout-buy-now'), payload)
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        order1_id = res1.json()['public_id']

        # Submit identical checkout with same idempotency key
        res2 = self.client.post(reverse('checkout-buy-now'), payload)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        order2_id = res2.json()['public_id']

        self.assertEqual(order1_id, order2_id)
        self.assertEqual(Order.objects.filter(idempotency_key="idemp-key-xyz-999").count(), 1)

    @patch('orders.views.get_road_distance_km')
    def test_cart_checkout_clears_cart(self, mock_distance):
        mock_distance.return_value = Decimal("2.0")

        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        res = self.client.post(reverse('checkout-cart'), {
            "address_id": self.address.id
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Cart should now be empty
        self.assertEqual(cart.items.count(), 0)

    @patch('orders.views.get_road_distance_km')
    def test_order_cancellation_by_customer(self, mock_distance):
        mock_distance.return_value = Decimal("3.0")

        # Create pending order
        res = self.client.post(reverse('checkout-buy-now'), {
            "product_id": self.product.id,
            "quantity": 1,
            "address_id": self.address.id
        })
        public_id = res.json()['public_id']

        # Cancel pending order
        cancel_url = reverse('order-cancel', kwargs={'public_id': public_id})
        cancel_res = self.client.post(cancel_url)
        self.assertEqual(cancel_res.status_code, status.HTTP_200_OK)
        self.assertEqual(cancel_res.json()['status'], 'cancelled')

        # Cannot cancel again
        cancel_again = self.client.post(cancel_url)
        self.assertEqual(cancel_again.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('orders.views.get_road_distance_km')
    def test_cannot_cancel_approved_order(self, mock_distance):
        mock_distance.return_value = Decimal("3.0")

        res = self.client.post(reverse('checkout-buy-now'), {
            "product_id": self.product.id,
            "quantity": 1,
            "address_id": self.address.id
        })
        public_id = res.json()['public_id']

        order = Order.objects.get(public_id=public_id)
        order.status = Order.STATUS_APPROVED
        order.save()

        cancel_url = reverse('order-cancel', kwargs={'public_id': public_id})
        cancel_res = self.client.post(cancel_url)
        self.assertEqual(cancel_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Only pending orders can be cancelled", cancel_res.json()['detail'])

    def test_order_history_isolation(self):
        # User 1 has no orders initially
        res1 = self.client.get(reverse('order-list'))
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res1.json()['results']), 0)


class DeliveryQuoteAPITests(APITestCase):
    """
    Tests for POST /api/delivery/quote/
    """
    @patch('orders.views.get_road_distance_km')
    def test_delivery_quote_endpoint(self, mock_distance):
        mock_distance.return_value = Decimal("5.5")  # billable 6 km -> base fee 60

        payload = {
            "latitude": "22.750000",
            "longitude": "75.890000",
            "subtotal": "300.00"
        }
        res = self.client.post(reverse('delivery-quote'), payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data['billable_distance_km'], 6)
        self.assertEqual(Decimal(data['base_delivery_fee']), Decimal("60.00"))
        self.assertFalse(data['is_free_delivery'])
        self.assertEqual(Decimal(data['free_delivery_threshold']), Decimal("600.00"))
        self.assertEqual(Decimal(data['amount_needed_for_free_delivery']), Decimal("300.00"))


def _create_test_image(filename="receipt.png"):
    file_io = io.BytesIO()
    image = Image.new("RGB", (100, 100), color="white")
    image.save(file_io, format="PNG")
    file_io.seek(0)
    return SimpleUploadedFile(filename, file_io.read(), content_type="image/png")


class Stage4OwnerAndPaymentTests(APITestCase):
    """
    Automated test suite covering Stage 4 requirements:
    - Customer and developer cannot access owner endpoints.
    - Owner can access owner endpoints.
    - Cross-customer order and receipt access isolation (anti-IDOR).
    - Valid approval and rejection transitions.
    - Invalid and repeated state transitions.
    - Payment proof upload validation and ownership.
    - Upload rejection and resubmission behavior with audit history.
    - Only the owner can verify payment.
    - Uploading a receipt does not automatically verify payment.
    - In-app notifications delivered to the correct database recipient.
    """

    def setUp(self):
        # 1. Customer User
        self.customer = User.objects.create_user(username="cust_alpha", email="cust@millet.com", password="pass")
        self.cust_profile, _ = UserProfile.objects.get_or_create(
            user=self.customer,
            defaults={"role": UserProfile.ROLE_CUSTOMER, "display_name": "Customer Alpha"}
        )
        self.cust_token = Token.objects.create(user=self.customer)

        # 2. Second Customer User
        self.other_customer = User.objects.create_user(username="cust_beta", email="beta@millet.com", password="pass")
        self.other_profile, _ = UserProfile.objects.get_or_create(
            user=self.other_customer,
            defaults={"role": UserProfile.ROLE_CUSTOMER, "display_name": "Customer Beta"}
        )
        self.other_token = Token.objects.create(user=self.other_customer)

        # 3. Developer User
        self.developer = User.objects.create_user(username="dev_user", email="dev@millet.com", password="pass")
        self.dev_profile, _ = UserProfile.objects.get_or_create(
            user=self.developer,
            defaults={"role": UserProfile.ROLE_DEVELOPER, "display_name": "Dev Engineer"}
        )
        self.dev_token = Token.objects.create(user=self.developer)

        # 4. Verified Owner User
        self.owner = User.objects.create_user(username="owner_user", email="owner@milletmarg.com", password="pass")
        self.owner_profile, _ = UserProfile.objects.get_or_create(
            user=self.owner,
            defaults={"role": UserProfile.ROLE_OWNER, "display_name": "Store Owner"}
        )
        self.owner_token = Token.objects.create(user=self.owner)

        # Product
        self.product = Product.objects.create(
            name="Ragi Dosa Mix",
            slug="ragi-dosa-mix",
            price=Decimal("150.00"),
            weight_grams=500,
            stock_quantity=50,
            is_available=True
        )

        # Order belonging to Customer Alpha
        self.order = Order.objects.create(
            user=self.customer,
            status=Order.STATUS_PENDING,
            payment_status=Order.PAYMENT_UNPAID,
            subtotal=Decimal("150.00"),
            road_distance_km=Decimal("4.0"),
            billable_distance_km=4,
            delivery_fee=Decimal("50.00"),
            delivery_fee_charged=Decimal("50.00"),
            is_free_delivery=False,
            free_delivery_threshold=Decimal("400.00"),
            total=Decimal("200.00"),
            recipient_name="Customer Alpha",
            phone_number="9876543210",
            address_snapshot={"address_line": "123 Ragi Lane, Indore"}
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_name=self.product.name,
            product_slug=self.product.slug,
            unit_price=self.product.price,
            quantity=1,
            line_total=self.product.price,
            weight_grams=self.product.weight_grams
        )

    def test_customer_and_developer_cannot_access_owner_endpoints(self):
        # Customer access attempt
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.cust_token.key}")
        res = self.client.get(reverse("owner-dashboard"))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        res2 = self.client.get(reverse("owner-orders-list"))
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)

        # Developer access attempt (explicit requirement: developer != owner)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.dev_token.key}")
        res3 = self.client.get(reverse("owner-dashboard"))
        self.assertEqual(res3.status_code, status.HTTP_403_FORBIDDEN)

        # Unauthenticated access attempt
        self.client.credentials()
        res4 = self.client.get(reverse("owner-dashboard"))
        self.assertEqual(res4.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_owner_can_access_owner_endpoints(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        res = self.client.get(reverse("owner-dashboard"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn("summary", data)
        self.assertIn("pending_approval", data["summary"])
        self.assertGreaterEqual(data["summary"]["pending_approval"], 1)

        res_orders = self.client.get(reverse("owner-orders-list"))
        self.assertEqual(res_orders.status_code, status.HTTP_200_OK)
        self.assertIn("results", res_orders.json())

    def test_cross_customer_isolation_and_idor_protection(self):
        # Customer Beta tries to access Customer Alpha's order
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.other_token.key}")

        order_url = reverse("order-detail", kwargs={"public_id": self.order.public_id})
        res = self.client.get(order_url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        # Customer Beta tries to upload receipt for Customer Alpha's order
        receipt_url = reverse("order-payment-receipt", kwargs={"public_id": self.order.public_id})
        upload_res = self.client.post(receipt_url, {"receipt": _create_test_image()})
        self.assertEqual(upload_res.status_code, status.HTTP_404_NOT_FOUND)

    def test_valid_order_approval_and_payment_instructions(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        approve_url = reverse("owner-order-approve", kwargs={"public_id": self.order.public_id})

        custom_instructions = "Custom UPI: paytm@millet / Transfer to Bank MM"
        res = self.client.post(approve_url, {
            "payment_instructions": custom_instructions,
            "internal_note": "Verified customer identity"
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.STATUS_APPROVED)
        self.assertEqual(self.order.payment_status, Order.PAYMENT_UNPAID)
        self.assertEqual(self.order.payment_instructions, custom_instructions)
        self.assertEqual(self.order.internal_note, "Verified customer identity")

        # Verify customer notification was generated
        notif = Notification.objects.filter(recipient=self.customer, order=self.order).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.notification_type, Notification.TYPE_ORDER_APPROVED)

        # Verify customer now sees instructions on order detail
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.cust_token.key}")
        cust_order_res = self.client.get(reverse("order-detail", kwargs={"public_id": self.order.public_id}))
        self.assertEqual(cust_order_res.json()["payment_instructions"], custom_instructions)

    def test_valid_order_rejection(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        reject_url = reverse("owner-order-reject", kwargs={"public_id": self.order.public_id})

        res = self.client.post(reject_url, {
            "rejection_reason": "Out of delivery range today due to heavy rain."
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.STATUS_REJECTED)
        self.assertEqual(self.order.rejection_reason, "Out of delivery range today due to heavy rain.")

        # Customer notified
        notif = Notification.objects.filter(recipient=self.customer, order=self.order).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.notification_type, Notification.TYPE_ORDER_REJECTED)

    def test_invalid_and_repeated_state_transitions(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        approve_url = reverse("owner-order-approve", kwargs={"public_id": self.order.public_id})
        reject_url = reverse("owner-order-reject", kwargs={"public_id": self.order.public_id})

        # 1. Approve once
        res = self.client.post(approve_url, {})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # 2. Try to approve again -> 400
        res_repeat = self.client.post(approve_url, {})
        self.assertEqual(res_repeat.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Try to reject approved order -> 400
        res_reject_approved = self.client.post(reject_url, {"rejection_reason": "Changing mind"})
        self.assertEqual(res_reject_approved.status_code, status.HTTP_400_BAD_REQUEST)

    def test_receipt_upload_validation_and_ownership(self):
        # 1. Attempt upload on pending order -> fails
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.cust_token.key}")
        receipt_url = reverse("order-payment-receipt", kwargs={"public_id": self.order.public_id})

        fail_res = self.client.post(receipt_url, {"receipt": _create_test_image()})
        self.assertEqual(fail_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("approved", fail_res.json()["detail"])

        # 2. Approve order
        self.order.status = Order.STATUS_APPROVED
        self.order.save()

        # 3. Attempt upload of text/plain invalid file -> fails
        invalid_file = SimpleUploadedFile("fake.txt", b"plain text", content_type="text/plain")
        fail_ext = self.client.post(receipt_url, {"receipt": invalid_file})
        self.assertEqual(fail_ext.status_code, status.HTTP_400_BAD_REQUEST)

        # 4. Valid upload
        valid_img = _create_test_image("proof.png")
        success_res = self.client.post(receipt_url, {"receipt": valid_img}, format="multipart")
        self.assertEqual(success_res.status_code, status.HTTP_200_OK)

        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PAYMENT_SUBMITTED)
        self.assertIsNotNone(self.order.payment_receipt)
        self.assertIsNotNone(self.order.payment_submitted_at)
        # CRUCIAL: Uploading proof does NOT automatically verify payment
        self.assertIsNone(self.order.payment_verified_at)

        # Verify owner received notification
        owner_notif = Notification.objects.filter(recipient=self.owner, order=self.order).first()
        self.assertIsNotNone(owner_notif)
        self.assertEqual(owner_notif.notification_type, Notification.TYPE_PAYMENT_SUBMITTED)

    def test_owner_payment_verification_and_rejection_resubmission(self):
        # Setup: Order approved and receipt submitted
        self.order.status = Order.STATUS_APPROVED
        self.order.payment_status = Order.PAYMENT_SUBMITTED
        self.order.save()

        # Only owner can verify/reject payment
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.cust_token.key}")
        verify_url = reverse("owner-payment-verify", kwargs={"public_id": self.order.public_id})
        cust_attempt = self.client.post(verify_url, {})
        self.assertEqual(cust_attempt.status_code, status.HTTP_403_FORBIDDEN)

        # Owner rejects payment proof with reason
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        reject_payment_url = reverse("owner-payment-reject", kwargs={"public_id": self.order.public_id})
        res_reject = self.client.post(reject_payment_url, {
            "payment_rejection_reason": "UTR number is missing from screenshot."
        })
        self.assertEqual(res_reject.status_code, status.HTTP_200_OK)

        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PAYMENT_REJECTED)
        self.assertEqual(self.order.payment_rejection_reason, "UTR number is missing from screenshot.")

        # Customer notified of payment rejection
        cust_notif = Notification.objects.filter(
            recipient=self.customer,
            notification_type=Notification.TYPE_PAYMENT_REJECTED
        ).first()
        self.assertIsNotNone(cust_notif)

        # Customer re-uploads clear receipt
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.cust_token.key}")
        receipt_url = reverse("order-payment-receipt", kwargs={"public_id": self.order.public_id})
        res_reupload = self.client.post(receipt_url, {"receipt": _create_test_image("reupload.png")}, format="multipart")
        self.assertEqual(res_reupload.status_code, status.HTTP_200_OK)

        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PAYMENT_SUBMITTED)

        # Owner verifies payment
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        res_verify = self.client.post(verify_url, {"internal_note": "Payment confirmed in SBI account."})
        self.assertEqual(res_verify.status_code, status.HTTP_200_OK)

        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PAYMENT_VERIFIED)
        self.assertIsNotNone(self.order.payment_verified_at)

        # Customer notified of verified payment
        verified_notif = Notification.objects.filter(
            recipient=self.customer,
            notification_type=Notification.TYPE_PAYMENT_VERIFIED
        ).first()
        self.assertIsNotNone(verified_notif)

    def test_notification_endpoints_and_mark_read(self):
        # Create 2 unread notifications for customer
        Notification.objects.create(
            recipient=self.customer,
            title="Update 1",
            message="Your order status updated",
            notification_type=Notification.TYPE_ORDER_APPROVED
        )
        notif2 = Notification.objects.create(
            recipient=self.customer,
            title="Update 2",
            message="Payment verified",
            notification_type=Notification.TYPE_PAYMENT_VERIFIED
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.cust_token.key}")

        # Unread count
        count_res = self.client.get(reverse("notifications-unread-count"))
        self.assertEqual(count_res.status_code, status.HTTP_200_OK)
        self.assertEqual(count_res.json()["unread_count"], 2)

        # Mark single read
        mark_url = reverse("notification-mark-read", kwargs={"pk": notif2.pk})
        self.client.post(mark_url)
        notif2.refresh_from_db()
        self.assertTrue(notif2.is_read)

        count_res2 = self.client.get(reverse("notifications-unread-count"))
        self.assertEqual(count_res2.json()["unread_count"], 1)

        # Mark all read
        self.client.post(reverse("notification-mark-all-read"))
        count_res3 = self.client.get(reverse("notifications-unread-count"))
        self.assertEqual(count_res3.json()["unread_count"], 0)


class Stage5DeliveryManagementTests(APITestCase):
    """
    Stage 5 tests:
    - Status transitions (preparing, ready_for_dispatch, out_for_delivery, delivered)
    - Payment verification guard before dispatch/preparing
    - Driver phone validation & dispatch workflow
    - Customer delivery confirmation & idempotency
    - Review submission, validation (1-5 rating), OneToOne guard, and owner moderation
    """

    def setUp(self):
        # Owner
        self.owner = User.objects.create_user(username="shopowner_s5", email="owner5@milletmarg.com")
        UserProfile.objects.create(user=self.owner, role=UserProfile.ROLE_OWNER)
        self.owner_token = Token.objects.create(user=self.owner)

        # Customer 1
        self.customer = User.objects.create_user(username="cust5_1", email="cust5_1@test.com")
        UserProfile.objects.create(user=self.customer, role=UserProfile.ROLE_CUSTOMER)
        self.cust_token = Token.objects.create(user=self.customer)

        # Customer 2 (other customer)
        self.other_customer = User.objects.create_user(username="cust5_2", email="cust5_2@test.com")
        UserProfile.objects.create(user=self.other_customer, role=UserProfile.ROLE_CUSTOMER)
        self.other_token = Token.objects.create(user=self.other_customer)

        # Base order
        self.order = Order.objects.create(
            user=self.customer,
            status=Order.STATUS_PENDING,
            payment_status=Order.PAYMENT_UNPAID,
            recipient_name="Customer Five",
            phone_number="9876543210",
            address_snapshot={"address": "123 MG Road, Indore"},
            subtotal=Decimal("300.00"),
            road_distance_km=Decimal("3.0"),
            billable_distance_km=3,
            delivery_fee=Decimal("50.00"),
            delivery_fee_charged=Decimal("50.00"),
            is_free_delivery=False,
            free_delivery_threshold=Decimal("300.00"),
            total=Decimal("350.00"),
        )

    def test_preparing_requires_verified_payment(self):
        # Owner attempts to mark preparing while payment is pending
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        url = reverse("owner-order-delivery-status", kwargs={"public_id": self.order.public_id})

        res = self.client.post(url, {"status": "preparing"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("verified", res.json().get("detail", "").lower())

        # Now verify payment
        self.order.payment_status = Order.PAYMENT_VERIFIED
        self.order.save()

        res_ok = self.client.post(url, {"status": "preparing"})
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.STATUS_PREPARING)

        # Log created
        log = DeliveryStatusLog.objects.filter(order=self.order, status=Order.STATUS_PREPARING).first()
        self.assertIsNotNone(log)

    def test_dispatch_driver_phone_validation(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        dispatch_url = reverse("owner-order-dispatch", kwargs={"public_id": self.order.public_id})

        self.order.status = Order.STATUS_READY_FOR_DISPATCH
        self.order.payment_status = Order.PAYMENT_VERIFIED
        self.order.save()

        # Invalid phone: too short
        res_short = self.client.post(dispatch_url, {
            "driver_name": "Ramesh Driver",
            "driver_phone": "12345"
        })
        self.assertEqual(res_short.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("driver_phone", res_short.json())

        # Invalid phone: doesn't start with 6-9
        res_invalid_prefix = self.client.post(dispatch_url, {
            "driver_name": "Ramesh Driver",
            "driver_phone": "4123456789"
        })
        self.assertEqual(res_invalid_prefix.status_code, status.HTTP_400_BAD_REQUEST)

        # Valid 10-digit Indian phone
        res_valid = self.client.post(dispatch_url, {
            "driver_name": "Ramesh Driver",
            "driver_phone": "9876543210"
        })
        self.assertEqual(res_valid.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.STATUS_OUT_FOR_DELIVERY)
        self.assertEqual(self.order.driver_name, "Ramesh Driver")
        self.assertEqual(self.order.driver_phone, "9876543210")
        self.assertIsNotNone(self.order.dispatched_at)

        # Customer notified of dispatch
        notif = Notification.objects.filter(
            recipient=self.customer,
            notification_type=Notification.TYPE_ORDER_DISPATCHED
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn("Ramesh Driver", notif.message)

    def test_cannot_dispatch_unverified_or_cancelled_order(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        dispatch_url = reverse("owner-order-dispatch", kwargs={"public_id": self.order.public_id})

        # Payment still pending
        res = self.client.post(dispatch_url, {
            "driver_name": "Ramesh Driver",
            "driver_phone": "9876543210"
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Cancelled order
        self.order.status = Order.STATUS_CANCELLED
        self.order.payment_status = Order.PAYMENT_VERIFIED
        self.order.save()

        res_cancelled = self.client.post(dispatch_url, {
            "driver_name": "Ramesh Driver",
            "driver_phone": "9876543210"
        })
        self.assertEqual(res_cancelled.status_code, status.HTTP_400_BAD_REQUEST)

    def test_customer_delivery_confirmation(self):
        # Setup order as out_for_delivery
        self.order.status = Order.STATUS_OUT_FOR_DELIVERY
        self.order.payment_status = Order.PAYMENT_VERIFIED
        self.order.driver_name = "Ramesh Driver"
        self.order.driver_phone = "9876543210"
        self.order.save()

        # Other customer cannot confirm
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.other_token.key}")
        confirm_url = reverse("order-confirm-delivery", kwargs={"public_id": self.order.public_id})
        res_other = self.client.post(confirm_url)
        self.assertEqual(res_other.status_code, status.HTTP_404_NOT_FOUND)

        # Correct customer confirms
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.cust_token.key}")
        res_confirm = self.client.post(confirm_url)
        self.assertEqual(res_confirm.status_code, status.HTTP_200_OK)

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.STATUS_DELIVERED)
        self.assertTrue(self.order.is_customer_confirmed)
        self.assertIsNotNone(self.order.delivered_at)
        self.assertIsNotNone(self.order.customer_confirmed_at)

        # Delivery log created
        log = DeliveryStatusLog.objects.filter(order=self.order, status=Order.STATUS_DELIVERED).first()
        self.assertIsNotNone(log)
        self.assertIn("Customer confirmed", log.note)

        # Owner notified
        notif = Notification.objects.filter(
            recipient=self.owner,
            notification_type=Notification.TYPE_DELIVERY_CONFIRMED
        ).first()
        self.assertIsNotNone(notif)

        # Idempotent call
        res_idempotent = self.client.post(confirm_url)
        self.assertEqual(res_idempotent.status_code, status.HTTP_200_OK)
        self.assertTrue(res_idempotent.json()["is_customer_confirmed"])

    def test_review_submission_workflow_and_moderation(self):
        # Customer cannot review before delivery
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.cust_token.key}")
        review_url = reverse("order-review", kwargs={"public_id": self.order.public_id})

        res_undelivered = self.client.post(review_url, {
            "rating": 5,
            "comment": "Delicious ragi laddu!"
        })
        self.assertEqual(res_undelivered.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("delivered", res_undelivered.json().get("detail", "").lower())

        # Mark order delivered
        self.order.status = Order.STATUS_DELIVERED
        self.order.save()

        # Invalid rating: 6 (must be 1-5)
        res_invalid_rating = self.client.post(review_url, {
            "rating": 6,
            "comment": "Too high"
        })
        self.assertEqual(res_invalid_rating.status_code, status.HTTP_400_BAD_REQUEST)

        # Valid review
        res_ok = self.client.post(review_url, {
            "rating": 5,
            "comment": "Super fresh and healthy millet dishes! Fast delivery."
        })
        self.assertEqual(res_ok.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_ok.json()["rating"], 5)

        # Verify review in DB
        review = Review.objects.get(order=self.order)
        self.assertEqual(review.user, self.customer)
        self.assertEqual(review.rating, 5)
        self.assertTrue(review.is_visible)

        # Owner notified
        notif = Notification.objects.filter(
            recipient=self.owner,
            notification_type=Notification.TYPE_REVIEW_SUBMITTED
        ).first()
        self.assertIsNotNone(notif)

        # Customer GET review
        get_res = self.client.get(review_url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.json()["rating"], 5)

        # Owner reviews list
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        list_url = reverse("owner-reviews-list")
        owner_res = self.client.get(list_url)
        self.assertEqual(owner_res.status_code, status.HTTP_200_OK)
        results = owner_res.json().get("results", owner_res.json())
        self.assertEqual(len(results), 1)

        # Owner moderate review (hide)
        mod_url = reverse("owner-review-moderate", kwargs={"pk": review.pk})
        mod_res = self.client.post(mod_url, {"is_visible": False})
        self.assertEqual(mod_res.status_code, status.HTTP_200_OK)
        review.refresh_from_db()
        self.assertFalse(review.is_visible)


class BugFixVerificationTests(APITestCase):
    """
    Direct tests verifying the 5 critical bug fixes:
    1. Owner WhatsApp order URL contains owner dashboard link and order ref.
    2. Owner payment verification without customer receipt upload; records verifier and timestamp.
    3. Non-owners (customers, developers) are blocked by server-side IsOwner permission.
    4. Driver details can be added during approval or updated later via PATCH.
    5. Customer isolation: customers cannot see other customers' orders or driver details.
    6. Checkout customer name and phone autofill from profile and validation.
    """
    def setUp(self):
        self.customer = User.objects.create_user(username="cust_test", email="cust@milletmarg.com")
        self.customer_profile, _ = UserProfile.objects.get_or_create(
            user=self.customer,
            defaults={
                "role": UserProfile.ROLE_CUSTOMER,
                "display_name": "Test Customer",
                "phone_number": "9876543210"
            }
        )
        self.customer_token, _ = Token.objects.get_or_create(user=self.customer)

        self.other_customer = User.objects.create_user(username="other_cust", email="other@milletMarg.com")
        self.other_customer_token, _ = Token.objects.get_or_create(user=self.other_customer)

        self.developer = User.objects.create_user(username="dev_test", email="dev@milletmarg.com")
        self.dev_profile, _ = UserProfile.objects.get_or_create(
            user=self.developer,
            defaults={"role": UserProfile.ROLE_DEVELOPER, "display_name": "Test Developer"}
        )
        self.dev_token, _ = Token.objects.get_or_create(user=self.developer)

        self.owner = User.objects.create_user(username="owner_test", email="owner@milletmarg.com")
        self.owner_profile, _ = UserProfile.objects.get_or_create(
            user=self.owner,
            defaults={"role": UserProfile.ROLE_OWNER, "display_name": "Test Owner"}
        )
        self.owner_token, _ = Token.objects.get_or_create(user=self.owner)

        self.product = Product.objects.create(
            name="Barnyard Millet Dosa Mix",
            slug="barnyard-dosa-mix",
            price=Decimal("150.00"),
            weight_grams=500,
            is_available=True,
            stock_quantity=50
        )

        self.address = Address.objects.create(
            user=self.customer,
            label="Home",
            recipient_name="Test Customer",
            phone_number="9876543210",
            address_line="502 Ring Road",
            city="Indore",
            state="Madhya Pradesh",
            postal_code="452001",
            latitude=Decimal("22.7196"),
            longitude=Decimal("75.8577"),
        )

        self.order = Order.objects.create(
            user=self.customer,
            status=Order.STATUS_PENDING,
            payment_status=Order.PAYMENT_UNPAID,
            subtotal=Decimal("150.00"),
            road_distance_km=Decimal("4.5"),
            billable_distance_km=5,
            delivery_fee=Decimal("50.00"),
            delivery_fee_charged=Decimal("50.00"),
            free_delivery_threshold=Decimal("500.00"),
            total=Decimal("200.00"),
            recipient_name="Test Customer",
            phone_number="9876543210",
            address_snapshot={"address_line": "502 Ring Road", "city": "Indore"}
        )

    def test_whatsapp_url_links_to_owner_order_page(self):
        """WhatsApp message must link directly to the owner order management page."""
        url = generate_whatsapp_order_url(self.order)
        self.assertIn("wa.me/918349309523", url)
        self.assertIn(f"/owner/orders/{self.order.public_id}", url)
        self.assertIn(self.order.reference, url)

    def test_customer_and_developer_cannot_perform_owner_actions(self):
        """Customer and Developer roles must receive 403 Forbidden on owner endpoints."""
        approve_url = reverse("owner-order-approve", kwargs={"public_id": self.order.public_id})
        verify_url = reverse("owner-payment-verify", kwargs={"public_id": self.order.public_id})

        # As Customer
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.customer_token.key}")
        res_cust_app = self.client.post(approve_url, {})
        self.assertEqual(res_cust_app.status_code, status.HTTP_403_FORBIDDEN)
        res_cust_ver = self.client.post(verify_url, {})
        self.assertEqual(res_cust_ver.status_code, status.HTTP_403_FORBIDDEN)

        # As Developer
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.dev_token.key}")
        res_dev_app = self.client.post(approve_url, {})
        self.assertEqual(res_dev_app.status_code, status.HTTP_403_FORBIDDEN)
        res_dev_ver = self.client.post(verify_url, {})
        self.assertEqual(res_dev_ver.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_verify_payment_without_receipt_upload(self):
        """Owner can manually verify payment for approved unpaid order without receipt file."""
        self.order.status = Order.STATUS_APPROVED
        self.order.payment_status = Order.PAYMENT_UNPAID
        self.order.save()

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        verify_url = reverse("owner-payment-verify", kwargs={"public_id": self.order.public_id})
        res = self.client.post(verify_url, {"internal_note": "Verified via shop PhonePe UPI"})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PAYMENT_VERIFIED)
        self.assertEqual(self.order.status, Order.STATUS_APPROVED)  # Order status not accidentally changed
        self.assertEqual(self.order.payment_verified_by, self.owner)
        self.assertIsNotNone(self.order.payment_verified_at)
        self.assertIn("PhonePe", self.order.internal_note)

    def test_driver_details_can_be_added_during_approval(self):
        """Owner can enter driver details during approval without forcing immediate dispatch."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        approve_url = reverse("owner-order-approve", kwargs={"public_id": self.order.public_id})
        res = self.client.post(approve_url, {
            "payment_instructions": "UPI: milletmarg@icici",
            "driver_name": "Mukesh Kumar",
            "driver_phone": "9876543210",
            "estimated_delivery_time": "30-40 mins"
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.STATUS_APPROVED)
        self.assertEqual(self.order.driver_name, "Mukesh Kumar")
        self.assertEqual(self.order.driver_phone, "9876543210")
        self.assertIsNotNone(self.order.estimated_delivery_time)

    def test_driver_details_can_be_updated_later_via_patch(self):
        """Owner can update driver details on an approved order without approving a second time."""
        self.order.status = Order.STATUS_APPROVED
        self.order.save()

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.owner_token.key}")
        detail_url = reverse("owner-order-detail", kwargs={"public_id": self.order.public_id})
        res = self.client.patch(detail_url, {
            "driver_name": "Suresh Fleet",
            "driver_phone": "9876543210",
            "estimated_delivery_time": "25 mins"
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.driver_name, "Suresh Fleet")
        self.assertEqual(self.order.driver_phone, "9876543210")

    def test_customer_cannot_view_another_customers_order_or_driver(self):
        """Customer B cannot retrieve Customer A's order details or driver details."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.other_customer_token.key}")
        detail_url = reverse("order-detail", kwargs={"public_id": self.order.public_id})
        res = self.client.get(detail_url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    @patch("orders.views.get_road_distance_km")
    def test_checkout_autofills_name_and_phone_from_profile(self, mock_distance):
        """Checkout should prefill recipient name and phone from profile if omitted from payload."""
        mock_distance.return_value = Decimal("4.0")
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.customer_token.key}")

        # Omit recipient_name and phone_number from top level
        res = self.client.post(reverse("checkout-buy-now"), {
            "product_id": self.product.id,
            "quantity": 1,
            "address_id": self.address.id
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        self.assertEqual(data["recipient_name"], "Test Customer")
        self.assertEqual(data["phone_number"], "9876543210")


