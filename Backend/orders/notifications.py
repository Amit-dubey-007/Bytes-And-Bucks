from django.contrib.auth.models import User
from accounts.models import UserProfile
from .models import Notification


def create_notification(recipient, notification_type, title, message, order=None):
    """
    Creates an in-app database notification for a given user.
    """
    if not recipient:
        return None
    return Notification.objects.create(
        recipient=recipient,
        order=order,
        notification_type=notification_type,
        title=title,
        message=message,
        is_read=False
    )


def notify_owners(notification_type, title, message, order=None):
    """
    Creates in-app database notifications for all registered store owners.
    """
    owner_users = User.objects.filter(profile__role=UserProfile.ROLE_OWNER)
    notifications = []
    for owner in owner_users:
        notifications.append(
            Notification(
                recipient=owner,
                order=order,
                notification_type=notification_type,
                title=title,
                message=message,
                is_read=False
            )
        )
    if notifications:
        Notification.objects.bulk_create(notifications)
