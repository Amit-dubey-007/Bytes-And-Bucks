import logging
from django.conf import settings
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)


def verify_google_id_token(token_string):
    """
    Verifies a Google OAuth 2.0 / OpenID Connect ID token using Google's official library.
    Validates cryptographic signature, audience, issuer, and expiration.
    
    Returns the parsed payload dict containing 'sub', 'email', 'email_verified', 'name', 'picture'.
    """
    if not token_string or not str(token_string).strip():
        raise AuthenticationFailed("Google token/credential was not provided.")

    client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
    audience = client_id.strip() if client_id and client_id.strip() else None

    try:
        idinfo = id_token.verify_oauth2_token(
            token_string,
            requests.Request(),
            audience=audience
        )

        issuer = idinfo.get('iss')
        if issuer not in ['accounts.google.com', 'https://accounts.google.com']:
            raise AuthenticationFailed("Invalid Google token issuer.")

        sub = idinfo.get('sub')
        if not sub:
            raise AuthenticationFailed("Missing stable subject identifier ('sub') in Google token.")

        return idinfo
    except ValueError as exc:
        logger.warning(f"Google token verification failed: {exc}")
        raise AuthenticationFailed(f"Invalid Google credential: {str(exc)}")
    except Exception as exc:
        if isinstance(exc, AuthenticationFailed):
            raise
        logger.error(f"Unexpected error verifying Google token: {exc}")
        raise AuthenticationFailed("Authentication failed: Unable to verify Google token.")
