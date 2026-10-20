import urllib.parse
from django.conf import settings


def generate_whatsapp_order_url(order):
    """
    Generates a WhatsApp click-to-chat URL for notifying the MilletMarg owner.
    
    Format:
    https://wa.me/{OWNER_WHATSAPP_NUMBER}?text={URL_encoded_message}
    """
    owner_number = getattr(settings, 'OWNER_WHATSAPP_NUMBER', '918349309523').strip().replace('+', '')
    frontend_base = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:3000').rstrip('/')

    order_ref = f"MM-{str(order.public_id)[:8].upper()}"
    details_url = f"{frontend_base}/orders/{order.public_id}/details"

    message = (
        f"Hi MilletMarg! I would like to place order {order_ref}. "
        f"Please review my order here: {details_url}. "
        f"Please confirm availability and payment instructions."
    )

    encoded_text = urllib.parse.quote(message)
    return f"https://wa.me/{owner_number}?text={encoded_text}"
