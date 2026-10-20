from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    GoogleAuthView,
    CurrentUserProfileView,
    LogoutView,
    AddressViewSet,
    ShopInfoView,
)

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    path('auth/google/', GoogleAuthView.as_view(), name='auth-google'),
    path('auth/me/', CurrentUserProfileView.as_view(), name='auth-me'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('shop/info/', ShopInfoView.as_view(), name='shop-info'),
    path('', include(router.urls)),
]
