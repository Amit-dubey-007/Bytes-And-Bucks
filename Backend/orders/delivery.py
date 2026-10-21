import math
import logging
from decimal import Decimal, InvalidOperation
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# In-memory routing cache keyed by (dest_lat_rounded, dest_lon_rounded)
_routing_cache = {}


class RoutingServiceError(Exception):
    """Raised when the routing service fails, times out, or has an infrastructure outage."""
    pass


class UnroutableLocationError(Exception):
    """Raised when no routable road can be found near the specified customer coordinate (e.g. ORS error 2010)."""
    pass


class InvalidCoordinatesError(Exception):
    """Raised when coordinates are invalid, out of bounds, or inverted."""
    pass


def validate_coordinates(lat, lon):
    """
    Validates latitude and longitude values and checks for inverted coordinates.
    - Latitude must be in [-90, 90]
    - Longitude must be in [-180, 180]
    - Checks for coordinate order inversion
    """
    if lat is None or lon is None:
        raise InvalidCoordinatesError("Coordinates cannot be empty.")
    try:
        lat_dec = Decimal(str(lat))
        lon_dec = Decimal(str(lon))
    except (TypeError, ValueError, InvalidOperation):
        raise InvalidCoordinatesError("Coordinates must be valid numeric values.")

    if lat_dec < Decimal('-90.0') or lat_dec > Decimal('90.0'):
        raise InvalidCoordinatesError(f"Latitude {lat_dec} must be between -90 and 90 degrees.")
    if lon_dec < Decimal('-180.0') or lon_dec > Decimal('180.0'):
        raise InvalidCoordinatesError(f"Longitude {lon_dec} must be between -180 and 180 degrees.")

    # Check for obvious latitude/longitude inversion
    # For Indian region (Indore/Central India): latitude is ~22, longitude is ~75.
    # If latitude > 60 and longitude < 40, coordinate order is inverted.
    if lat_dec > Decimal('60.0') and lon_dec < Decimal('40.0'):
        raise InvalidCoordinatesError("Latitude and longitude appear to be inverted. Coordinates must be latitude followed by longitude.")

    return lat_dec, lon_dec


def calculate_delivery_fees(road_distance_km: Decimal, subtotal: Decimal):
    """
    Computes delivery fee and free delivery thresholds based on MilletMarg business rules:
    - billable_km = max(1, ceil(road_distance_km))
    - base delivery_fee = max(50, billable_km * 10)
    - free delivery threshold = billable_km * 100
    - if subtotal >= free delivery threshold: delivery fee = 0
    - is_eligible = road_distance_km <= 20 km
    """
    max_distance = getattr(settings, 'MAX_DELIVERY_DISTANCE_KM', Decimal('20.0'))
    is_eligible = road_distance_km <= max_distance

    # Calculate billable km using ceiling
    billable_km = max(1, math.ceil(float(road_distance_km)))
    base_fee = max(Decimal('50.00'), Decimal(billable_km * 10))

    threshold = Decimal(billable_km * 100)
    is_free = subtotal >= threshold

    actual_fee = Decimal('0.00') if is_free else base_fee
    amount_needed = max(Decimal('0.00'), threshold - subtotal)

    return {
        "road_distance_km": road_distance_km,
        "billable_distance_km": billable_km,
        "is_eligible": is_eligible,
        "base_delivery_fee": base_fee,
        "delivery_fee_charged": actual_fee,
        "is_free_delivery": is_free,
        "free_delivery_threshold": threshold,
        "amount_needed_for_free_delivery": amount_needed,
    }


def get_road_distance_km(dest_latitude: Decimal, dest_longitude: Decimal) -> Decimal:
    """
    Calculates actual road driving distance between configured MilletMarg shop coordinates
    and customer coordinates using OpenRouteService Directions API (or fallback).
    Coordinates are validated and passed in [longitude, latitude] GeoJSON order to provider.
    Distinguishes error 2010 (unroutable location) from genuine provider outages.
    """
    dest_latitude, dest_longitude = validate_coordinates(dest_latitude, dest_longitude)

    shop_lat = getattr(settings, 'SHOP_LATITUDE', Decimal('22.6955176'))
    shop_lon = getattr(settings, 'SHOP_LONGITUDE', Decimal('75.8333253'))
    validate_coordinates(shop_lat, shop_lon)

    # Check cache (rounded to 4 decimal places, ~11 meters precision)
    cache_key = (
        round(float(shop_lat), 4),
        round(float(shop_lon), 4),
        round(float(dest_latitude), 4),
        round(float(dest_longitude), 4)
    )
    if cache_key in _routing_cache:
        return _routing_cache[cache_key]

    provider = getattr(settings, 'ROUTING_PROVIDER', 'openrouteservice').lower()
    timeout = getattr(settings, 'ROUTING_TIMEOUT_SECONDS', 5)

    if provider == 'openrouteservice':
        api_key = getattr(settings, 'OPENROUTESERVICE_API_KEY', '').strip()
        if not api_key:
            # Check if OSRM can be used as unauthenticated fallback for development
            return _fetch_osrm_distance(shop_lat, shop_lon, dest_latitude, dest_longitude, timeout, cache_key)

        url = "https://api.openrouteservice.org/v2/directions/driving-car"
        headers = {
            "Authorization": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json, application/geo+json",
        }
        # OpenRouteService Directions expects coordinates as [longitude, latitude]
        body = {
            "coordinates": [
                [float(shop_lon), float(shop_lat)],
                [float(dest_longitude), float(dest_latitude)]
            ]
        }
        try:
            resp = requests.post(url, json=body, headers=headers, timeout=timeout)
            if resp.status_code == 200:
                data = resp.json()
                meters = data['routes'][0]['summary']['distance']
                distance_km = Decimal(str(round(meters / 1000.0, 2)))
                _routing_cache[cache_key] = distance_km
                return distance_km

            # Parse error response body
            err_code = None
            err_msg = ""
            try:
                err_data = resp.json()
                if isinstance(err_data, dict) and 'error' in err_data:
                    err_info = err_data['error']
                    if isinstance(err_info, dict):
                        err_code = err_info.get('code')
                        err_msg = str(err_info.get('message', ''))
                    else:
                        err_msg = str(err_info)
            except Exception:
                err_data = {}

            # Distinguish error 2010 (Could not find routable point near coordinate)
            is_unroutable = (
                str(err_code) == '2010' or
                'could not find routable point' in err_msg.lower()
            )

            if is_unroutable:
                # Attempt supported radius expansion up to a maximum of 1000 meters for customer destination
                # to snap gated communities / off-street locations without accepting unreasonably far points
                snapped_body = {
                    "coordinates": [
                        [float(shop_lon), float(shop_lat)],
                        [float(dest_longitude), float(dest_latitude)]
                    ],
                    "radiuses": [350, 1000]
                }
                try:
                    snap_resp = requests.post(url, json=snapped_body, headers=headers, timeout=timeout)
                    if snap_resp.status_code == 200:
                        snap_data = snap_resp.json()
                        meters = snap_data['routes'][0]['summary']['distance']
                        distance_km = Decimal(str(round(meters / 1000.0, 2)))
                        _routing_cache[cache_key] = distance_km
                        return distance_km
                except requests.RequestException:
                    pass

                # If still unroutable, raise a client-actionable UnroutableLocationError
                raise UnroutableLocationError(
                    "Could not find an accessible road near the selected location. Please adjust your map pin closer to an accessible road and retry."
                )

            # Any other provider error (e.g. 401, 403, 429, 500, 502, 503)
            logger.warning(f"OpenRouteService returned status {resp.status_code}: {resp.text}")
            raise RoutingServiceError(f"Routing provider error: HTTP {resp.status_code}")

        except requests.Timeout as exc:
            logger.error(f"Routing provider timeout: {exc}")
            raise RoutingServiceError(f"Routing provider timed out after {timeout} seconds")
        except requests.RequestException as exc:
            logger.error(f"Routing request error: {exc}")
            raise RoutingServiceError(f"Failed to communicate with routing provider: {exc}")

    elif provider == 'osrm':
        return _fetch_osrm_distance(shop_lat, shop_lon, dest_latitude, dest_longitude, timeout, cache_key)

    else:
        raise RoutingServiceError(f"Unsupported routing provider: {provider}")


def _fetch_osrm_distance(shop_lat, shop_lon, dest_lat, dest_lon, timeout, cache_key) -> Decimal:
    """Fallback router using public OSRM demonstration server for road routing."""
    url = f"https://router.project-osrm.org/route/v1/driving/{float(shop_lon)},{float(shop_lat)};{float(dest_lon)},{float(dest_lat)}?overview=false"
    try:
        resp = requests.get(url, timeout=timeout, headers={"User-Agent": "MilletMarg-Store/1.0"})
        if resp.status_code == 200:
            data = resp.json()
            if data.get('code') == 'Ok' and data.get('routes'):
                meters = data['routes'][0]['distance']
                distance_km = Decimal(str(round(meters / 1000.0, 2)))
                _routing_cache[cache_key] = distance_km
                return distance_km
            if data.get('code') in ['NoRoute', 'NoSegment']:
                raise UnroutableLocationError(
                    "Could not find an accessible road near the selected location. Please adjust your map pin closer to an accessible road and retry."
                )
        raise RoutingServiceError("Routing service returned no viable route.")
    except (requests.Timeout, requests.ConnectionError) as exc:
        raise RoutingServiceError(f"Routing network failure: {exc}")
    except requests.RequestException as exc:
        raise RoutingServiceError(f"Routing network failure: {exc}")
