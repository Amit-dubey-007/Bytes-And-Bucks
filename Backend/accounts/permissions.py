from rest_framework import permissions


class IsAddressOwner(permissions.BasePermission):
    """
    Object-level permission to ensure customers can only access their own addresses.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsOwner(permissions.BasePermission):
    """
    Allows access only to authenticated users whose server-side profile role is 'owner'.
    developer and customer accounts must NOT gain owner access.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False
        return profile.role == 'owner'



class IsDeveloper(permissions.BasePermission):
    """
    Allows access only to authorized developers or superusers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'profile', None)
        return profile is not None and profile.is_developer
