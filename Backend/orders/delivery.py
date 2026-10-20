import math
import logging
from decimal import Decimal
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# In-memory routing cache keyed by (dest_lat_rounded, dest_lon_rounded)
_routing_cache = {}


class RoutingServiceError(Exception):
    """Raised when routing service fails, times out, or is improperly configured."""
    pass


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
    and customer coordinates.
    """
    shop_lat = getattr(settings, 'SHOP_LATITUDE', Decimal('22.6955176'))
    shop_lon = getattr(settings, 'SHOP_LONGITUDE', Decimal('75.8333253'))

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
            else:
                logger.warning(f"OpenRouteService returned status {resp.status_code}: {resp.text}")
                raise RoutingServiceError(f"Routing provider error: HTTP {resp.status_code}")
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
        raise RoutingServiceError("Routing service returned no viable route.")
    except requests.RequestException as exc:
        raise RoutingServiceError(f"Routing network failure: {exc}")
