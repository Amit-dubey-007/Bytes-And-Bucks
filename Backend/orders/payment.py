import os
from django.conf import settings
from rest_framework.exceptions import ValidationError


ALLOWED_RECEIPT_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp'}


def get_default_payment_instructions(order) -> str:
    """
    Builds structured, safe payment instructions including store UPI ID,
    bank transfer details, and reference instructions.
    """
    upi_id = getattr(settings, 'STORE_UPI_ID', 'milletmarg@upi')
    holder = getattr(settings, 'STORE_ACCOUNT_HOLDER', 'MilletMarg Healthy Cafe')
    bank_name = getattr(settings, 'STORE_BANK_NAME', 'State Bank of India')
    acc_no = getattr(settings, 'STORE_BANK_ACCOUNT_NO', '9876543210123')
    ifsc = getattr(settings, 'STORE_BANK_IFSC', 'SBIN0001234')

    lines = [
        f"1. UPI Payment: {upi_id} (Recipient: {holder})",
    ]
    if bank_name and acc_no:
        lines.append(f"2. Bank Transfer: {bank_name} | A/C: {acc_no} | IFSC: {ifsc} | Beneficiary: {holder}")
    lines.append(f"3. Note: Please add Order Reference '{order.reference}' in transaction remarks/notes.")
    lines.append("4. Upload your payment screenshot/receipt below for store verification.")
    return "\n".join(lines)


def validate_payment_receipt_file(file_obj):
    """
    Server-side validation of uploaded payment proof:
    - Size check (defaults to 5 MB)
    - Extension check
    - Image format & header verification using Pillow
    """
    if not file_obj:
        raise ValidationError("No receipt file provided.")

    max_mb = getattr(settings, 'MAX_RECEIPT_FILE_SIZE_MB', 5)
    max_bytes = max_mb * 1024 * 1024

    if file_obj.size > max_bytes:
        raise ValidationError(
            f"Receipt file size ({file_obj.size / (1024 * 1024):.1f} MB) exceeds maximum allowed limit of {max_mb} MB."
        )

    name = file_obj.name.lower()
    ext = os.path.splitext(name)[1]
    if ext not in ALLOWED_RECEIPT_EXTENSIONS:
        raise ValidationError(
            f"Unsupported file format '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP."
        )

    # Server-side content verification via Pillow
    try:
        from PIL import Image
        file_obj.seek(0)
        img = Image.open(file_obj)
        img.verify()
        file_obj.seek(0)
    except Exception:
        raise ValidationError("Uploaded file is not a valid or readable image.")
