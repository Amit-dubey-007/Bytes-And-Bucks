from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CartView,
    CartItemView,
    CartItemDetailView,
    DeliveryQuoteView,
    CheckoutBuyNowView,
    CheckoutCartView,
    OrderViewSet,
    OwnerDashboardView,
    OwnerOrderListView,
    OwnerOrderDetailView,
    OwnerOrderApproveView,
    OwnerOrderRejectView,
    OwnerPaymentVerifyView,
    OwnerPaymentRejectView,
    OwnerDeliveryStatusUpdateView,
    OwnerOrderDispatchView,
    OwnerReviewListView,
    OwnerReviewModerateView,
    NotificationListView,
    NotificationUnreadCountView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
)

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    # Cart & Checkout
    path('cart/', CartView.as_view(), name='cart-detail'),
    path('cart/items/', CartItemView.as_view(), name='cart-items'),
    path('cart/items/<int:pk>/', CartItemDetailView.as_view(), name='cart-item-detail'),
    path('delivery/quote/', DeliveryQuoteView.as_view(), name='delivery-quote'),
    path('checkout/buy-now/', CheckoutBuyNowView.as_view(), name='checkout-buy-now'),
    path('checkout/cart/', CheckoutCartView.as_view(), name='checkout-cart'),

    # Owner Dashboard & Order Management (Protected by IsAuthenticated & IsOwner)
    path('owner/dashboard/', OwnerDashboardView.as_view(), name='owner-dashboard'),
    path('owner/orders/', OwnerOrderListView.as_view(), name='owner-orders-list'),
    path('owner/orders/<uuid:public_id>/', OwnerOrderDetailView.as_view(), name='owner-order-detail'),
    path('owner/orders/<uuid:public_id>/approve/', OwnerOrderApproveView.as_view(), name='owner-order-approve'),
    path('owner/orders/<uuid:public_id>/reject/', OwnerOrderRejectView.as_view(), name='owner-order-reject'),
    path('owner/orders/<uuid:public_id>/verify-payment/', OwnerPaymentVerifyView.as_view(), name='owner-payment-verify'),
    path('owner/orders/<uuid:public_id>/reject-payment/', OwnerPaymentRejectView.as_view(), name='owner-payment-reject'),
    path('owner/orders/<uuid:public_id>/delivery-status/', OwnerDeliveryStatusUpdateView.as_view(), name='owner-order-delivery-status'),
    path('owner/orders/<uuid:public_id>/dispatch/', OwnerOrderDispatchView.as_view(), name='owner-order-dispatch'),
    path('owner/reviews/', OwnerReviewListView.as_view(), name='owner-reviews-list'),
    path('owner/reviews/<int:pk>/moderate/', OwnerReviewModerateView.as_view(), name='owner-review-moderate'),

    # In-App Notifications
    path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/unread-count/', NotificationUnreadCountView.as_view(), name='notifications-unread-count'),
    path('notifications/<int:pk>/mark-read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('notifications/mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),

    # Customer Order history, details, cancel & payment receipt
    path('', include(router.urls)),
]

