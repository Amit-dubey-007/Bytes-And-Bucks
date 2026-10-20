# MilletMarg Backend — Product APIs & Foundation (Stage 1)

This is the Django REST Framework backend for **MilletMarg — Healthy Cafe & Millet Store**, Indore, Madhya Pradesh, India.

---

## 1. Environment Setup on Windows PowerShell

### Activate Virtual Environment
Open PowerShell inside the `Backend` directory:
```powershell
cd d:\MilletMarg\Backend
.\.venv\Scripts\Activate.ps1
```

*(If PowerShell execution policy prevents running scripts, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned`)*

### Dependencies
All backend dependencies are pinned in `requirements.txt`:
```powershell
pip install -r requirements.txt
```

Installed packages include:
- `Django==6.1.2`
- `djangorestframework==3.18.3`
- `django-cors-headers==4.9.0`
- `django-filter==26.2`
- `pillow==13.0.0`
- `psycopg==3.3.6`
- `python-decouple==3.8`

### Environment Variables (`.env`)
The project loads configurations via `python-decouple` from `Backend/.env`.
Configured variables:
```env
SECRET_KEY=<your-django-secret-key>
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
DB_NAME=<postgres-db-name>
DB_USER=<postgres-db-user>
DB_PASSWORD=<postgres-db-password>
DB_HOST=127.0.0.1
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## 2. Database Migrations

Apply database migrations to the PostgreSQL database:
```powershell
python manage.py migrate
```

To inspect migrations:
```powershell
python manage.py showmigrations
```

---

## 3. Running the Server

Start the Django development server:
```powershell
python manage.py runserver
```
The server will be reachable at `http://127.0.0.1:8000/`.

---

## 4. Product Image Handling

- **Development**: Media files are stored in `Backend/media/` and served directly by Django via `urls.py` when `DEBUG=True`.
- **Production**: Media files must not be served by Django in production. Use an S3/Cloud Storage bucket (e.g., `django-storages`) or configure Nginx/Caddy to serve the media directory directly.
- **Validation**: Uploaded product images are validated to ensure they are valid images (`JPEG`, `PNG`, or `WEBP`) and do not exceed 5MB. Serializers automatically construct absolute URLs when requested through the API.

---

## 5. API Endpoints

All product APIs are mounted under `/api/`:

| Method | Endpoint | Description | Public Permissions |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/items/` | List products with search, filters, ordering, pagination | AllowAny |
| `GET` | `/api/items/<slug>/` | Retrieve complete details for a product by slug | AllowAny |
| `GET` | `/api/items/categories/` | List unique categories in use | AllowAny |
| `POST` / `PUT` / `PATCH` / `DELETE` | `/api/items/` | Prohibited on public API (managed via Django Admin) | 405 Method Not Allowed |

---

## 6. Query Parameters for `/api/items/`

### 1. Search (`search`)
Searches across `name`, `description`, `ingredients`, and `category`.
- Example: `/api/items/?search=laddu`
- Example: `/api/items/?search=sprouted`

### 2. Price Filtering (`min_price`, `max_price`)
Filters by selling price range in INR.
- Example: `/api/items/?min_price=100`
- Example: `/api/items/?max_price=250`
- Example: `/api/items/?min_price=100&max_price=250`
- *Validation*: Negative values or `min_price > max_price` return HTTP 400 Bad Request with descriptive JSON errors.

### 3. Category & Dietary Filters
- `category`: Case-insensitive category match (e.g. `/api/items/?category=Snacks`)
- `is_vegetarian`: Boolean (`true` or `false`)
- `is_available`: Boolean (`true` or `false`)

### 4. Sorting / Ordering (`ordering`)
Supported fields: `price`, `name`, `created_at` (prefix with `-` for descending).
- Lowest price first: `/api/items/?ordering=price`
- Highest price first: `/api/items/?ordering=-price`
- Alphabetical: `/api/items/?ordering=name`
- Newest first (default): `/api/items/?ordering=-created_at`

### 5. Pagination (`page`, `page_size`)
Default page size is 12 (max 100).
- Example: `/api/items/?page=1&page_size=12`

### Combined Query Example
```http
GET /api/items/?search=millet&category=Snacks&min_price=50&max_price=300&ordering=price&page=1
```

---

## 7. Frontend Integration Contract (JSON Schemas)

### Product Listing Response (`GET /api/items/`)
```json
{
  "count": 20,
  "next": "http://127.0.0.1:8000/api/items/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Organic Ragi Laddu",
      "slug": "organic-ragi-laddu",
      "description": "Handcrafted traditional laddus made from sprouted finger millet (ragi), pure desi ghee, and organic jaggery.",
      "price": "180.00",
      "image": "http://127.0.0.1:8000/media/products/2026/10/ragi-laddu.jpg",
      "category": "Snacks",
      "weight_grams": 250,
      "ingredients": "Sprouted Ragi Flour, Desi Ghee, Organic Jaggery, Cardamom, Almonds",
      "is_vegetarian": true,
      "allergen_information": "Contains nuts (almonds) and dairy (ghee).",
      "nutritional_information": {
        "serving_size": "50g",
        "calories_kcal": 210,
        "protein_g": 3.8,
        "carbohydrates_g": 32.5,
        "dietary_fiber_g": 4.2,
        "fat_g": 7.5,
        "calcium_mg": 170
      },
      "stock_quantity": 40,
      "is_available": true,
      "created_at": "2026-10-20T10:00:00Z",
      "updated_at": "2026-10-20T10:00:00Z"
    }
  ]
}
```

### Product Detail Response (`GET /api/items/<slug>/`)
```json
{
  "id": 1,
  "name": "Organic Ragi Laddu",
  "slug": "organic-ragi-laddu",
  "description": "Handcrafted traditional laddus made from sprouted finger millet (ragi), pure desi ghee, and organic jaggery.",
  "price": "180.00",
  "image": "http://127.0.0.1:8000/media/products/2026/10/ragi-laddu.jpg",
  "category": "Snacks",
  "weight_grams": 250,
  "ingredients": "Sprouted Ragi Flour, Desi Ghee, Organic Jaggery, Cardamom, Almonds",
  "is_vegetarian": true,
  "allergen_information": "Contains nuts (almonds) and dairy (ghee).",
  "nutritional_information": {
    "serving_size": "50g",
    "calories_kcal": 210,
    "protein_g": 3.8,
    "carbohydrates_g": 32.5,
    "dietary_fiber_g": 4.2,
    "fat_g": 7.5,
    "calcium_mg": 170
  },
  "stock_quantity": 40,
  "is_available": true,
  "created_at": "2026-10-20T10:00:00Z",
  "updated_at": "2026-10-20T10:00:00Z"
}
```

### Error Responses

#### 1. Unknown Slug (404 Not Found)
```json
{
  "detail": "Not found."
}
```

#### 2. Invalid Price Filter (400 Bad Request)
```json
{
  "min_price": ["min_price cannot be negative."]
}
```
Or when `min_price > max_price`:
```json
{
  "detail": "min_price cannot be greater than max_price."
}
```

#### 3. Attempting Public Write (405 Method Not Allowed)
```json
{
  "detail": "Method \"POST\" not allowed."
}
```

---

## 8. Optional Demonstration Data

An optional management command is provided to load realistic demo products into your database for testing:
```powershell
python manage.py load_sample_products
```
To reset and reload demo data:
```powershell
python manage.py load_sample_products --clear
```
*(This is purely optional for development testing and is not run automatically).*

---

## 9. Running Tests

Run the backend automated test suite:
```powershell
python manage.py test
```
All 38 test cases (18 product tests + 20 authentication & address tests) run against an isolated test PostgreSQL database without impacting existing data.

---

# Stage 2: Authentication, Customer Profiles, Addresses & Map Integration

Stage 2 introduces secure Google OAuth customer sign-in, profile management, role isolation (`customer`, `owner`, `developer`), saved delivery addresses, centralized shop location configuration, and Leaflet OpenStreetMap location selection.

---

## 10. Stage 2 Models & Architecture

### User Profiles (`accounts.UserProfile`)
- Linked 1-to-1 with Django's built-in `User` model.
- **Roles**:
  - `customer` (default for all new registrations).
  - `owner` (MilletMarg business owner, provisioned via trusted admin).
  - `developer` (Technical administrators).
- **Attributes**: `google_sub` (unique stable subject ID), `display_name`, `profile_image_url`, `phone_number` (validated Indian mobile number format), `gender` (optional), `is_email_verified`, timestamps.
- **Security Rule**: Customers cannot escalate their role or modify their `google_sub` through any API request.

### Saved Delivery Addresses (`accounts.Address`)
- Associated with the authenticated user with server-enforced ownership.
- **Attributes**: `label` (Home, Work, Other), `recipient_name`, `phone_number`, `address_line`, `house_number`, `room_number`, `landmark`, `city`, `state`, `postal_code`, `country`, `latitude`, `longitude`, `formatted_address`, `is_default`, timestamps.
- **Coordinate Validation**: Database check constraints ensure latitude is between -90 and 90, and longitude between -180 and 180.
- **Default Invariant**: Atomic transactions ensure a customer has at most one default address. The user's first address is marked default automatically.

---

## 11. Centralized Shop Configuration

The provisional coordinates for **MilletMarg — Healthy Cafe & Millet Store** (Indore, Madhya Pradesh, India) are centralized in backend settings (`Backend/mysite/settings.py`):
- **Latitude**: `22.6955176`
- **Longitude**: `75.8333253`
- Configurable via `.env`:
  ```env
  SHOP_LATITUDE=22.6955176
  SHOP_LONGITUDE=75.8333253
  SHOP_NAME=MilletMarg — Healthy Cafe & Millet Store
  SHOP_ADDRESS=Indore, Madhya Pradesh, India
  ```
- Public endpoint: `GET /api/shop/info/` provides this metadata to the frontend.

---

## 12. Stage 2 API Endpoints

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/google/` | Authenticate Google ID token, resolve customer account, issue token | AllowAny |
| `GET` | `/api/auth/me/` | Get authenticated customer's profile & role | IsAuthenticated |
| `PATCH` | `/api/auth/me/` | Update permitted profile fields (`display_name`, `phone_number`, `gender`) | IsAuthenticated |
| `POST` | `/api/auth/logout/` | Invalidate token and end session | IsAuthenticated |
| `GET` | `/api/addresses/` | List current customer's saved addresses | IsAuthenticated |
| `POST` | `/api/addresses/` | Create delivery address for current customer | IsAuthenticated |
| `GET` | `/api/addresses/<id>/` | Retrieve owned address | IsAuthenticated + Owner |
| `PATCH` | `/api/addresses/<id>/` | Update owned address | IsAuthenticated + Owner |
| `DELETE` | `/api/addresses/<id>/` | Delete owned address | IsAuthenticated + Owner |
| `POST` | `/api/addresses/<id>/set_default/` | Mark address as customer's default delivery address | IsAuthenticated + Owner |
| `GET` | `/api/shop/info/` | Get centralized shop coordinates and cafe info | AllowAny |

---

## 13. Example JSON Payloads & Responses

### 1. Google Authentication (`POST /api/auth/google/`)
**Request:**
```json
{
  "credential": "<Google_ID_Token_JWT>"
}
```
**Response (200 OK):**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 5,
    "email": "customer@example.com",
    "username": "customer_a1b2c3",
    "role": "customer",
    "display_name": "Priya Sharma",
    "profile_image_url": "https://lh3.googleusercontent.com/a/...",
    "phone_number": null,
    "gender": null,
    "is_email_verified": true,
    "is_staff": false,
    "created_at": "2026-10-20T10:15:00Z",
    "updated_at": "2026-10-20T10:15:00Z"
  }
}
```

### 2. Update Profile (`PATCH /api/auth/me/`)
**Request:**
```json
{
  "display_name": "Priya S.",
  "phone_number": "9876543210"
}
```
**Response (200 OK):**
```json
{
  "id": 5,
  "email": "customer@example.com",
  "username": "customer_a1b2c3",
  "role": "customer",
  "display_name": "Priya S.",
  "profile_image_url": "https://lh3.googleusercontent.com/a/...",
  "phone_number": "9876543210",
  "gender": null,
  "is_email_verified": true,
  "is_staff": false,
  "created_at": "2026-10-20T10:15:00Z",
  "updated_at": "2026-10-20T10:16:00Z"
}
```

### 3. Create Delivery Address (`POST /api/addresses/`)
**Request:**
```json
{
  "label": "Home",
  "recipient_name": "Priya Sharma",
  "phone_number": "9876543210",
  "address_line": "123 Old Palasia Road",
  "house_number": "Flat 302, Silver Palms",
  "room_number": "302",
  "landmark": "Near Anand Bazaar",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "postal_code": "452001",
  "country": "India",
  "latitude": "22.721450",
  "longitude": "75.878910",
  "formatted_address": "Old Palasia, Indore, Madhya Pradesh 452001",
  "is_default": true
}
```
**Response (201 Created):**
```json
{
  "id": 1,
  "label": "Home",
  "recipient_name": "Priya Sharma",
  "phone_number": "9876543210",
  "address_line": "123 Old Palasia Road",
  "house_number": "Flat 302, Silver Palms",
  "room_number": "302",
  "landmark": "Near Anand Bazaar",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "postal_code": "452001",
  "country": "India",
  "latitude": "22.721450",
  "longitude": "75.878910",
  "formatted_address": "Old Palasia, Indore, Madhya Pradesh 452001",
  "is_default": true,
  "created_at": "2026-10-20T10:18:00Z",
  "updated_at": "2026-10-20T10:18:00Z"
}
```

---

## 14. Step-by-Step Google OAuth Manual Setup Guide

To activate Google Sign-In with real Google accounts:

1. **Open Google Cloud Console**: Navigate to [console.cloud.google.com](https://console.cloud.google.com/).
2. **Create or Select a Project**: E.g. `milletmarg-app`.
3. **Configure OAuth Consent Screen**:
   - User Type: **External**.
   - App Name: `MilletMarg`.
   - User Support Email: your email.
   - Developer Contact Email: your email.
   - Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
   - Test Users: Add the Gmail addresses you will use for testing during development.
4. **Create Credentials**:
   - Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
   - Application Type: **Web application**.
   - Name: `MilletMarg Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://127.0.0.1:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `http://localhost:3000/profile`
5. **Obtain Credentials**:
   - Copy **Client ID** (e.g. `xxxxxxxxxxxx.apps.googleusercontent.com`).
   - Copy **Client Secret**.
6. **Configure Environment Variables**:
   - In `Backend/.env`:
     ```env
     GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     ```
   - In `frontend/.env.local` (create if needed):
     ```env
     NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
     NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
     ```
7. **Restart Development Servers**:
   ```powershell
   # In Backend terminal:
   python manage.py runserver

   # In frontend terminal:
   npm run dev
   ```
8. **Verify Sign-In**:
   - Open `http://localhost:3000/profile`.
   - Click "Sign in with Google", grant consent, and verify your profile card and addresses dashboard load.

---

## 15. Map & Geocoding Policy & Limitations

- **Map Rendering**: Utilizes client-side OpenStreetMap tiles via Leaflet with zero SSR flicker.
- **Reverse Geocoding**: Uses the OpenStreetMap Nominatim service.
  - Policy adherence: Rate-limited to at most 1 request per second.
  - Caching: Repeated lookups for the same coordinate are cached locally.
  - Fallback: If Nominatim is offline or rate-limited, manual entry of street and landmark fields remains 100% supported without blocking address submission.

---

# Stage 3: Cart, Checkout, Delivery Calculations & Pending Orders

Stage 3 introduces persistent customer order lists (Cart), dynamic road-distance delivery fees, free-delivery thresholds, buy-now & cart checkout flows, immutable order price/address snapshots, owner WhatsApp click-to-chat integration, and pending order cancellation.

---

## 16. Stage 3 Business Rules & Delivery Formula

### 1. Delivery Eligibility Limit
- **Max Radius**: 20.0 km road driving distance from MilletMarg Cafe & Store (Indore).
- **Locations $\le$ 20.0 km**: Eligible for delivery.
- **Locations $>$ 20.0 km**: Ineligible. System blocks checkout and clearly informs customer.
- Road distance is calculated via routing providers (OpenRouteService / OSRM) — straight-line distance is never substituted.

### 2. Delivery Fee Formula
$$\text{billable\_km} = \max(1, \lceil \text{road\_distance\_km} \rceil)$$
$$\text{delivery\_fee} = \max(50, \text{billable\_km} \times 10)$$

*Examples:*
| Road Distance | Billable Distance | Base Delivery Fee |
| :--- | :--- | :--- |
| 1.0 km | 1 km | ₹50.00 |
| 3.0 km | 3 km | ₹50.00 |
| 5.0 km | 5 km | ₹50.00 |
| 5.2 km | 6 km | ₹60.00 |
| 6.0 km | 6 km | ₹60.00 |
| 10.0 km | 10 km | ₹100.00 |
| 20.0 km | 20 km | ₹200.00 |

### 3. Free Delivery Threshold
$$\text{free\_delivery\_threshold} = \text{billable\_km} \times 100$$
- If $\text{merchandise\_subtotal} \ge \text{free\_delivery\_threshold}$, $\text{delivery\_fee\_charged} = \text{₹0.00}$.
- If below threshold, the API informs the customer of the exact remaining amount required to unlock free delivery.

---

## 17. Stage 3 Models

- **`orders.Cart`**: Persistent cart attached 1-to-1 to each customer. Subtotal dynamically computed from database product prices.
- **`orders.CartItem`**: Unique per `(cart, product)` pair; validated positive quantity; increments automatically on repeated additions; respects inventory stock.
- **`orders.Order`**: Real customer orders with unique UUID `public_id`, human-readable reference (`MM-XXXXXXXX`), pending status, subtotal, distance, fees, immutable address snapshot, contact details, and idempotency key.
- **`orders.OrderItem`**: Immutable historical snapshot (`product_name`, `product_slug`, `unit_price`, `quantity`, `line_total`, `weight_grams`, `product_image_url`). Deleting or updating a product never alters past order records.

---

## 18. Stage 3 API Endpoints

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart/` | Retrieve customer's cart, items, and live subtotal | IsAuthenticated |
| `POST` | `/api/cart/items/` | Add product to cart (or increment existing quantity) | IsAuthenticated |
| `PATCH` | `/api/cart/items/<id>/` | Update item quantity | IsAuthenticated |
| `DELETE` | `/api/cart/items/<id>/` | Remove item from cart | IsAuthenticated |
| `DELETE` | `/api/cart/` | Clear all items from cart | IsAuthenticated |
| `POST` | `/api/delivery/quote/` | Calculate road distance, delivery fee & free delivery status | AllowAny |
| `POST` | `/api/checkout/buy-now/` | Place pending order directly for single item | IsAuthenticated |
| `POST` | `/api/checkout/cart/` | Place pending order for entire cart contents | IsAuthenticated |
| `GET` | `/api/orders/` | List customer's order history | IsAuthenticated |
| `GET` | `/api/orders/<public_id>/` | Retrieve specific order by public UUID | IsAuthenticated |
| `POST` | `/api/orders/<public_id>/cancel/` | Cancel pending order | IsAuthenticated |

---

## 19. Owner WhatsApp Integration

Configured with centralized settings:
- **Owner WhatsApp**: `918349309523` (`OWNER_WHATSAPP_NUMBER` in `.env`)
- **Canonical Details Route**: `${FRONTEND_BASE_URL}/orders/${public_id}/details`
- **Click-to-Chat URL**: Generated automatically upon checkout:
  ```text
  https://wa.me/918349309523?text=Hi%20MilletMarg!%20I%20would%20like%20to%20place%20order%20MM-XXXXXXXX.%20Please%20review%20my%20order%20here%3A%20http%3A//localhost%3A3000/orders/.../details.%20Please%20confirm%20availability%20and%20payment%20instructions.
  ```

---

## 20. Stage 3 Environment Variables

Add to `Backend/.env`:
```env
# Routing & Delivery
ROUTING_PROVIDER=openrouteservice
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key_here
ROUTING_TIMEOUT_SECONDS=5
MAX_DELIVERY_DISTANCE_KM=20.0

# Owner WhatsApp & Frontend URL
OWNER_WHATSAPP_NUMBER=918349309523
FRONTEND_BASE_URL=http://localhost:3000
```

*(Note: In development, if `OPENROUTESERVICE_API_KEY` is not provided, the routing service automatically uses the OSRM fallback router to ensure seamless testing).*

---

## 21. Complete Automated Test Suite

Run all 69 tests across products, accounts, and orders:
```powershell
python manage.py test
```
All **69 automated tests** pass against the isolated test PostgreSQL database.

---

## 22. Stage 4 — Owner Dashboard, Order Management & Manual Payment Verification

Stage 4 introduces dedicated owner dashboard capabilities, manual payment instruction workflows, secure customer receipt upload with immutable audit trails, and in-app database notifications.

### Security & Role Authorization Architecture
- **Strict Server-Side Role Enforcement**: Only users whose server-side `UserProfile.role == 'owner'` can access `/api/owner/*` endpoints. Developer (`role == 'developer'`) and Customer (`role == 'customer'`) roles are blocked with HTTP 403 Forbidden.
- **Client Trust Prevention**: Roles cannot be altered via customer profile update APIs.
- **Object-Level Protection**: Customers can only view and upload receipts for their own orders (preventing Insecure Direct Object References).
- **Protected Receipt Serving**: Receipts are not exposed via open public URLs. File access is routed through an authenticated endpoint (`GET /api/orders/<uuid>/payment-receipt/`) requiring ownership or store-owner verification.

### Safe Store Owner Account Promotion
To promote a legitimate store manager/owner account safely from the backend CLI without modifying code:
```powershell
python manage.py promote_owner <username_or_email>
```
To demote back to customer:
```powershell
python manage.py promote_owner <username_or_email> --revoke
```

### Store Payment Configuration
Configured in `Backend/.env` (with production-ready defaults):
```env
STORE_UPI_ID=milletmarg@upi
STORE_ACCOUNT_HOLDER=MilletMarg Healthy Cafe
STORE_BANK_NAME=State Bank of India
STORE_BANK_ACCOUNT_NO=9876543210123
STORE_BANK_IFSC=SBIN0001234
MAX_RECEIPT_FILE_SIZE_MB=5
```

### Order & Payment State Transitions
1. **Pending Approval (`status: pending`, `payment_status: unpaid`)**: Customer places order. Store reviews stock and delivery.
2. **Approved (`status: approved`, `payment_status: unpaid`)**: Owner approves order. Payment instructions are revealed to customer.
3. **Payment Submitted (`status: approved`, `payment_status: submitted`)**: Customer uploads valid proof image. Owner is notified. Receipt upload alone **does not** mark an order as paid.
4. **Payment Verified (`status: approved`, `payment_status: verified`)**: Owner reviews submitted proof and marks verified. Fulfillment commences.
5. **Payment Rejected (`status: approved`, `payment_status: rejected`)**: Owner rejects proof with required reason. Customer can re-upload proof without losing audit history.
6. **Order Rejected (`status: rejected`)**: Owner rejects pending order with mandatory reason.

### Stage 4 API Endpoints Summary

| Method | Endpoint | Permissions | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/owner/dashboard/` | Authenticated + Owner | Metrics summary and recent orders |
| `GET` | `/api/owner/orders/` | Authenticated + Owner | Paginated orders with status/payment/search filters |
| `GET` | `/api/owner/orders/<uuid>/` | Authenticated + Owner | Full order detail with address snapshot & receipt audit |
| `POST` | `/api/owner/orders/<uuid>/approve/` | Authenticated + Owner | Approve pending order with payment instructions |
| `POST` | `/api/owner/orders/<uuid>/reject/` | Authenticated + Owner | Reject pending order with reason |
| `POST` | `/api/owner/orders/<uuid>/verify-payment/` | Authenticated + Owner | Verify submitted payment proof |
| `POST` | `/api/owner/orders/<uuid>/reject-payment/` | Authenticated + Owner | Reject submitted payment proof with reason |
| `POST` | `/api/orders/<uuid>/payment-receipt/` | Authenticated (Order Owner) | Upload payment receipt (JPG/PNG/WEBP, max 5MB) |
| `GET` | `/api/orders/<uuid>/payment-receipt/` | Authenticated (Order Owner / Store Owner) | Securely download/view payment proof |
| `GET` | `/api/notifications/` | Authenticated | List user's notifications |
| `GET` | `/api/notifications/unread-count/` | Authenticated | Unread notifications count |
| `POST` | `/api/notifications/<id>/mark-read/` | Authenticated | Mark notification as read |
| `POST` | `/api/notifications/mark-all-read/` | Authenticated | Mark all notifications as read |

---

## 23. Stage 5 — Delivery Management, Driver Assignment, Order Completion & Reviews

Stage 5 completes the post-payment order fulfillment lifecycle: kitchen preparation, packaging, driver assignment and dispatch, direct phone & WhatsApp communication, customer delivery confirmation, and post-delivery customer reviews and owner moderation.

### Architecture & Delivery Status Lifecycle
```
[Order Approved] -> (Payment Verified)
       ↓
  [preparing] (Kitchen cooking & baking)
       ↓
[ready_for_dispatch] (Packaged & sealed)
       ↓
[out_for_delivery] (Dispatched with assigned driver name & phone)
       ↓
   [delivered] (Customer confirmed or owner marked delivered)
       ↓
    [Review] (1–5 Star Rating & Optional Customer Comment)
```

### Payment Verification Guard
- Fulfillment transitions (`preparing`, `ready_for_dispatch`, `dispatch`, `delivered`) **strictly require** `payment_status == 'verified'`.
- Attempting to dispatch or mark an order preparing while unpaid or pending verification returns HTTP 400 Bad Request.

### Driver Phone Validation & Direct Contact
- Driver mobile phone numbers are strictly validated:
  - Must be valid 10-digit Indian mobile numbers (e.g. `9876543210` or `+919876543210`).
  - Leading digit must be `6`, `7`, `8`, or `9`.
- The API automatically formats and provides direct communication links:
  - `driver_call_url`: `tel:+919876543210` (one-tap native mobile dialer)
  - `driver_whatsapp_url`: `https://wa.me/919876543210?text=...` (direct WhatsApp chat)

### Customer Delivery Confirmation
- Customers can confirm receipt when an order is `out_for_delivery` or `delivered`.
- Confirmation is **idempotent**: calling it multiple times succeeds without duplicate state mutation.
- When confirmed while `out_for_delivery`, the backend automatically marks `status = 'delivered'`, timestamps `delivered_at`, sets `is_customer_confirmed = True`, sets `customer_confirmed_at`, creates a `DeliveryStatusLog`, and notifies the store owner.
- Customer confirmation **never** alters the verified payment status.

### Reviews & Ratings
- Only delivered orders (`status == 'delivered'`) can be reviewed.
- Bound validation: rating must be an integer between 1 and 5 (inclusive).
- Exactly **one review per order** is enforced at the database level via `OneToOneField(Order, related_name='review')`.
- Store owners can view all customer reviews (`GET /api/owner/reviews/`) and toggle their visibility (`POST /api/owner/reviews/<id>/moderate/`).

### Architectural Decision: Live GPS Map Tracking
- As established in architectural planning, real-time GPS map tracking requires drivers to run an authenticated mobile driver application that continuously broadcasts geolocation telemetry into a websocket or geofencing cluster.
- In MilletMarg's store-operated fleet model where orders are dispatched with partner drivers via phone, full live GPS map tracking is deferred to a future dedicated driver-app stage.
- Real-time communication is cleanly achieved via direct **Phone Call** and **WhatsApp Chat** buttons right on the customer's tracking page.

### Stage 5 API Endpoints Summary

| Method | Endpoint | Permissions | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/owner/orders/<uuid>/delivery-status/` | Authenticated + Owner | Transition order to `preparing`, `ready_for_dispatch`, or `delivered` |
| `POST` | `/api/owner/orders/<uuid>/dispatch/` | Authenticated + Owner | Assign driver (name + validated Indian phone) and dispatch order |
| `POST` | `/api/orders/<uuid>/confirm-delivery/` | Authenticated (Order Owner) | Customer marks order received (sets status to delivered) |
| `GET` | `/api/orders/<uuid>/review/` | Authenticated (Order Owner) | Retrieve review for a delivered order |
| `POST` | `/api/orders/<uuid>/review/` | Authenticated (Order Owner) | Submit 1–5 star rating and comment for delivered order |
| `GET` | `/api/owner/reviews/` | Authenticated + Owner | Paginated customer reviews list with status filters |
| `POST` | `/api/owner/reviews/<id>/moderate/` | Authenticated + Owner | Toggle review visibility (`is_visible: true/false`) |




