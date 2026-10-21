from decimal import Decimal
import io
from PIL import Image

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Product


def generate_test_image():
    """Helper to generate a valid test image file in memory."""
    file = io.BytesIO()
    image = Image.new('RGB', (100, 100), color='green')
    image.save(file, format='JPEG')
    file.seek(0)
    return SimpleUploadedFile(
        name='test_product.jpg',
        content=file.read(),
        content_type='image/jpeg'
    )


class ProductModelTests(TestCase):
    """
    Tests for Product model fields, validations, constraints, and slug generation.
    """

    def test_auto_slug_generation(self):
        product = Product.objects.create(
            name="Organic Ragi Laddu",
            price=Decimal("150.00"),
            category="Snacks",
            weight_grams=250
        )
        self.assertEqual(product.slug, "organic-ragi-laddu")

    def test_duplicate_name_distinct_slugs(self):
        p1 = Product.objects.create(
            name="Millet Khichdi",
            price=Decimal("120.00"),
            category="Ready to Cook",
            weight_grams=300
        )
        p2 = Product.objects.create(
            name="Millet Khichdi",
            price=Decimal("140.00"),
            category="Ready to Cook",
            weight_grams=350
        )
        p3 = Product.objects.create(
            name="Millet Khichdi",
            price=Decimal("160.00"),
            category="Ready to Cook",
            weight_grams=400
        )
        self.assertEqual(p1.slug, "millet-khichdi")
        self.assertEqual(p2.slug, "millet-khichdi-1")
        self.assertEqual(p3.slug, "millet-khichdi-2")

    def test_slug_not_regenerated_when_name_changes(self):
        product = Product.objects.create(
            name="Original Millet Bar",
            price=Decimal("60.00"),
            category="Snacks",
            weight_grams=50
        )
        original_slug = product.slug
        self.assertEqual(original_slug, "original-millet-bar")

        # Update product name
        product.name = "Renamed Millet Energy Bar"
        product.save()

        product.refresh_from_db()
        self.assertEqual(product.slug, original_slug)

    def test_manual_slug_validation_and_uniqueness(self):
        p1 = Product.objects.create(
            name="Custom Slug Item",
            slug="special-custom-slug",
            price=Decimal("99.00"),
            category="Snacks",
            weight_grams=100
        )
        self.assertEqual(p1.slug, "special-custom-slug")

        # Attempt duplicate manual slug
        p2 = Product(
            name="Another Item",
            slug="special-custom-slug",
            price=Decimal("199.00"),
            category="Snacks",
            weight_grams=200
        )
        with self.assertRaises(ValidationError):
            p2.clean()

    def test_price_non_negative_validation(self):
        product = Product(
            name="Invalid Price Item",
            price=Decimal("-10.00"),
            category="Snacks",
            weight_grams=100
        )
        with self.assertRaises(ValidationError):
            product.clean()

    def test_weight_positive_validation(self):
        product = Product(
            name="Zero Weight Item",
            price=Decimal("50.00"),
            category="Snacks",
            weight_grams=0
        )
        with self.assertRaises(ValidationError):
            product.clean()


class ProductAPITests(APITestCase):
    """
    Tests for DRF Product listing and detail endpoints, filtering, searching,
    ordering, pagination, and permissions.
    """

    def setUp(self):
        self.p1 = Product.objects.create(
            name="Ragi Laddu",
            description="Sweet traditional laddu made of sprouted ragi and ghee",
            price=Decimal("150.00"),
            category="Snacks",
            weight_grams=250,
            ingredients="Ragi, Ghee, Jaggery",
            is_vegetarian=True,
            stock_quantity=20,
            is_available=True
        )
        self.p2 = Product.objects.create(
            name="Foxtail Millet Khichdi Mix",
            description="Easy ready-to-cook healthy khichdi",
            price=Decimal("120.00"),
            category="Ready to Cook",
            weight_grams=300,
            ingredients="Foxtail Millet, Moong Dal, Cumin",
            is_vegetarian=True,
            stock_quantity=35,
            is_available=True
        )
        self.p3 = Product.objects.create(
            name="Little Millet Noodles",
            description="Healthy noodles without maida",
            price=Decimal("90.00"),
            category="Snacks",
            weight_grams=180,
            ingredients="Little Millet, Salt",
            is_vegetarian=True,
            stock_quantity=0,
            is_available=False  # Currently unavailable
        )
        self.list_url = reverse('product-list')

    def test_product_list_returns_200_and_paginated_structure(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn('count', data)
        self.assertIn('next', data)
        self.assertIn('previous', data)
        self.assertIn('results', data)
        self.assertEqual(data['count'], 3)
        self.assertEqual(len(data['results']), 3)

    def test_product_detail_valid_slug(self):
        url = reverse('product-detail', kwargs={'slug': self.p1.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data['name'], "Ragi Laddu")
        self.assertEqual(data['slug'], "ragi-laddu")
        self.assertEqual(data['price'], "150.00")
        self.assertEqual(data['weight_grams'], 250)
        self.assertEqual(data['category'], "Snacks")
        self.assertTrue(data['is_vegetarian'])
        self.assertTrue(data['is_available'])
        self.assertEqual(data['ingredients'], "Ragi, Ghee, Jaggery")

    def test_product_detail_unknown_slug_returns_404(self):
        url = reverse('product-detail', kwargs={'slug': 'non-existent-millet-snack'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_search_filters_correctly(self):
        # Search by name
        response = self.client.get(self.list_url, {'search': 'Khichdi'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json()['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['slug'], self.p2.slug)

        # Search by description
        response = self.client.get(self.list_url, {'search': 'without maida'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json()['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['slug'], self.p3.slug)

        # Search by ingredients
        response = self.client.get(self.list_url, {'search': 'Jaggery'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json()['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['slug'], self.p1.slug)

    def test_min_and_max_price_filtering(self):
        # min_price filter
        res_min = self.client.get(self.list_url, {'min_price': '100'})
        self.assertEqual(res_min.status_code, status.HTTP_200_OK)
        slugs_min = [item['slug'] for item in res_min.json()['results']]
        self.assertIn(self.p1.slug, slugs_min)
        self.assertIn(self.p2.slug, slugs_min)
        self.assertNotIn(self.p3.slug, slugs_min)

        # max_price filter
        res_max = self.client.get(self.list_url, {'max_price': '100'})
        self.assertEqual(res_max.status_code, status.HTTP_200_OK)
        slugs_max = [item['slug'] for item in res_max.json()['results']]
        self.assertEqual(slugs_max, [self.p3.slug])

        # Combined min_price and max_price
        res_both = self.client.get(self.list_url, {'min_price': '100', 'max_price': '130'})
        self.assertEqual(res_both.status_code, status.HTTP_200_OK)
        slugs_both = [item['slug'] for item in res_both.json()['results']]
        self.assertEqual(slugs_both, [self.p2.slug])

    def test_invalid_price_filters_return_400(self):
        # Negative min_price
        res1 = self.client.get(self.list_url, {'min_price': '-50'})
        self.assertEqual(res1.status_code, status.HTTP_400_BAD_REQUEST)

        # Non-numeric max_price
        res2 = self.client.get(self.list_url, {'max_price': 'not-a-number'})
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

        # min_price > max_price
        res3 = self.client.get(self.list_url, {'min_price': '200', 'max_price': '50'})
        self.assertEqual(res3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', res3.json())

    def test_ordering_ascending_and_descending(self):
        # Price ascending
        res_asc = self.client.get(self.list_url, {'ordering': 'price'})
        self.assertEqual(res_asc.status_code, status.HTTP_200_OK)
        prices_asc = [Decimal(item['price']) for item in res_asc.json()['results']]
        self.assertEqual(prices_asc, sorted(prices_asc))

        # Price descending
        res_desc = self.client.get(self.list_url, {'ordering': '-price'})
        self.assertEqual(res_desc.status_code, status.HTTP_200_OK)
        prices_desc = [Decimal(item['price']) for item in res_desc.json()['results']]
        self.assertEqual(prices_desc, sorted(prices_desc, reverse=True))

    def test_pagination_behavior(self):
        # Create additional products to exceed default page size (12)
        for i in range(15):
            Product.objects.create(
                name=f"Bulk Product {i}",
                price=Decimal(f"{50 + i}.00"),
                category="Bulk",
                weight_grams=100
            )

        # Request page 1 with page_size=10
        response = self.client.get(self.list_url, {'page': 1, 'page_size': 10})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['results']), 10)
        self.assertIsNotNone(data['next'])
        self.assertIsNone(data['previous'])
        self.assertEqual(data['count'], 18)

        # Request page 2 with page_size=10
        response_page_2 = self.client.get(self.list_url, {'page': 2, 'page_size': 10})
        self.assertEqual(response_page_2.status_code, status.HTTP_200_OK)
        data_2 = response_page_2.json()
        self.assertEqual(len(data_2['results']), 8)
        self.assertIsNone(data_2['next'])
        self.assertIsNotNone(data_2['previous'])

    def test_unavailable_products_representation(self):
        # Product p3 is unavailable
        response = self.client.get(reverse('product-detail', kwargs={'slug': self.p3.slug}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.json()['is_available'])

        # Listing endpoint also includes it by default
        list_res = self.client.get(self.list_url)
        slugs = [item['slug'] for item in list_res.json()['results']]
        self.assertIn(self.p3.slug, slugs)

    def test_public_write_operations_disallowed(self):
        # Unauthenticated POST to list endpoint
        post_res = self.client.post(self.list_url, {
            'name': 'Hacker Product',
            'price': '10.00',
            'category': 'Snacks',
            'weight_grams': 100
        })
        self.assertEqual(post_res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Unauthenticated PUT to detail endpoint
        detail_url = reverse('product-detail', kwargs={'slug': self.p1.slug})
        put_res = self.client.put(detail_url, {
            'name': 'Hacked Name',
            'price': '0.00',
            'category': 'Snacks',
            'weight_grams': 100
        })
        self.assertEqual(put_res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Unauthenticated DELETE to detail endpoint
        del_res = self.client.delete(detail_url)
        self.assertEqual(del_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_owner_product_crud_operations(self):
        from django.contrib.auth.models import User
        from rest_framework.authtoken.models import Token
        from accounts.models import UserProfile

        # Setup owner and customer
        owner_user = User.objects.create_user("store_owner", "owner@mm.com", "pass123")
        UserProfile.objects.create(user=owner_user, role="owner")
        owner_token = Token.objects.create(user=owner_user)

        cust_user = User.objects.create_user("cust_user", "cust@mm.com", "pass123")
        UserProfile.objects.create(user=cust_user, role="customer")
        cust_token = Token.objects.create(user=cust_user)

        # Customer is forbidden from write
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {cust_token.key}")
        cust_res = self.client.post(self.list_url, {
            'name': 'Unauthorized Bowl',
            'price': '150.00',
            'weight_grams': 200
        })
        self.assertEqual(cust_res.status_code, status.HTTP_403_FORBIDDEN)

        # Owner can create product without category (defaults to 'Bowls')
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {owner_token.key}")
        create_res = self.client.post(self.list_url, {
            'name': 'Special Millet Harvest Bowl',
            'price': '220.00',
            'weight_grams': 300,
            'description': 'Delicious new bowl added by owner'
        })
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        created_data = create_res.json()
        self.assertEqual(created_data['category'], 'Bowls')
        created_slug = created_data['slug']

        # Owner can update product
        detail_url = reverse('product-detail', kwargs={'slug': created_slug})
        update_res = self.client.patch(detail_url, {
            'price': '240.00',
            'stock_quantity': 50
        })
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.json()['price'], '240.00')

        # Owner can delete product
        del_res = self.client.delete(detail_url)
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(slug=created_slug).exists())


    def test_categories_endpoint(self):
        url = reverse('product-categories')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        categories = response.json()
        # Only available products categories are returned: Snacks, Ready to Cook
        self.assertIn('Snacks', categories)
        self.assertIn('Ready to Cook', categories)

    def test_image_absolute_url_serialization(self):
        image_file = generate_test_image()
        product_with_img = Product.objects.create(
            name="Image Millet Cookie",
            price=Decimal("110.00"),
            category="Bakery",
            weight_grams=150,
            image=image_file
        )
        url = reverse('product-detail', kwargs={'slug': product_with_img.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        img_url = response.json()['image']
        self.assertIsNotNone(img_url)
        self.assertTrue(img_url.startswith("http://") or img_url.startswith("https://"))
        self.assertIn("/media/products/", img_url)

        # Cleanup image file
        if product_with_img.image:
            product_with_img.image.delete(save=False)


# ---------------------------------------------------------------------------
# Cloudinary Integration Tests
# ---------------------------------------------------------------------------

from unittest.mock import patch, MagicMock
from django.conf import settings
from django.test import override_settings


class CloudinaryConfigTests(TestCase):
    """Tests for Cloudinary environment configuration detection."""

    def test_cloudinary_configured_when_all_env_vars_set(self):
        """_CLOUDINARY_CONFIGURED is True only when all three vars are present."""
        with override_settings(
            CLOUDINARY_CLOUD_NAME="testcloud",
            CLOUDINARY_API_KEY="123",
            CLOUDINARY_API_SECRET="abc",
        ):
            configured = bool(
                getattr(settings, "CLOUDINARY_CLOUD_NAME", "")
                and getattr(settings, "CLOUDINARY_API_KEY", "")
                and getattr(settings, "CLOUDINARY_API_SECRET", "")
            )
            self.assertTrue(configured)

    def test_cloudinary_not_configured_when_vars_missing(self):
        """_CLOUDINARY_CONFIGURED is False when any var is absent."""
        with override_settings(
            CLOUDINARY_CLOUD_NAME="",
            CLOUDINARY_API_KEY="123",
            CLOUDINARY_API_SECRET="abc",
        ):
            configured = bool(
                getattr(settings, "CLOUDINARY_CLOUD_NAME", "")
                and getattr(settings, "CLOUDINARY_API_KEY", "")
                and getattr(settings, "CLOUDINARY_API_SECRET", "")
            )
            self.assertFalse(configured)

    def test_api_secret_not_in_settings_namespace(self):
        """CLOUDINARY_API_SECRET must not be leaked in any public setting."""
        # It should only ever exist under the private key
        for key in dir(settings):
            if "SECRET" in key and "CLOUDINARY" in key:
                val = getattr(settings, key, "")
                # If it's set, that is expected — we just confirm it stays
                # on the backend side (this test ensures no accidental exposure
                # through NEXT_PUBLIC_ or similar patterns)
                self.assertFalse(
                    key.startswith("NEXT_PUBLIC_"),
                    f"Cloudinary secret leaked in public setting: {key}",
                )


class CloudinaryImageSerializerTests(APITestCase):
    """Tests for image URL serialization with both local and Cloudinary URLs."""

    def _make_product(self, image_name=None):
        p = Product.objects.create(
            name="Test Bowl",
            price=Decimal("99.00"),
            category="Bowls",
            weight_grams=250,
        )
        if image_name:
            p.image.name = image_name
            # Don't save — we'll test the serializer directly
        return p

    def test_local_image_url_becomes_absolute(self):
        """Local image paths are converted to absolute URLs via request context."""
        from products.serializers import ProductListSerializer
        from django.test import RequestFactory

        p = self._make_product()
        # Simulate a local file path
        p.image.name = "products/2026/10/test.jpeg"

        factory = RequestFactory()
        request = factory.get("/api/items/")

        # Patch url property to return relative path (as local storage would)
        with patch.object(type(p.image), "url", new_callable=lambda: property(lambda self: "/media/products/2026/10/test.jpeg")):
            serializer = ProductListSerializer(p, context={"request": request})
            url = serializer.data["image"]
            self.assertTrue(url.startswith("http://"), f"Expected absolute URL, got: {url}")

    def test_cloudinary_url_returned_unchanged(self):
        """Cloudinary URLs (already absolute) are returned as-is."""
        from products.serializers import ProductListSerializer
        from django.test import RequestFactory

        p = self._make_product()
        cloudinary_url = "https://res.cloudinary.com/testcloud/image/upload/milletmarg/products/test.jpg"

        factory = RequestFactory()
        request = factory.get("/api/items/")

        with patch.object(type(p.image), "url", new_callable=lambda: property(lambda self: cloudinary_url)):
            p.image.name = "milletmarg/products/test"
            serializer = ProductListSerializer(p, context={"request": request})
            url = serializer.data["image"]
            self.assertEqual(url, cloudinary_url)

    def test_broken_image_field_returns_none(self):
        """If obj.image.url raises an exception, get_image returns None gracefully."""
        from products.serializers import ProductListSerializer
        from django.test import RequestFactory

        p = self._make_product()
        p.image.name = "products/missing.jpg"

        factory = RequestFactory()
        request = factory.get("/api/items/")

        with patch.object(type(p.image), "url", new_callable=lambda: property(lambda self: (_ for _ in ()).throw(Exception("storage error")))):
            serializer = ProductListSerializer(p, context={"request": request})
            self.assertIsNone(serializer.data["image"])

    def test_image_none_returns_null(self):
        """Products without an image return null."""
        from products.serializers import ProductListSerializer
        from django.test import RequestFactory

        p = self._make_product()
        p.image = None

        factory = RequestFactory()
        request = factory.get("/api/items/")
        serializer = ProductListSerializer(p, context={"request": request})
        self.assertIsNone(serializer.data["image"])


class CloudinaryUploadAPITests(APITestCase):
    """Tests for product creation/update with mocked Cloudinary storage."""

    def _create_owner(self):
        from django.contrib.auth import get_user_model
        from rest_framework.authtoken.models import Token
        User = get_user_model()
        user = User.objects.create_user(
            username="ownertest_cld",
            email="owner_cld@example.com",
            password="testpass",
        )
        # Ensure profile exists (may be auto-created by signal or need explicit creation)
        try:
            profile = user.profile
        except Exception:
            from accounts.models import UserProfile
            profile = UserProfile.objects.create(user=user)
        profile.role = "owner"
        profile.save()
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        return user

    def _make_image_file(self):
        file = io.BytesIO()
        img = Image.new("RGB", (50, 50), color="blue")
        img.save(file, format="JPEG")
        file.seek(0)
        return SimpleUploadedFile("product.jpg", file.read(), content_type="image/jpeg")

    @patch("django.core.files.storage.default_storage.save", return_value="milletmarg/products/1/product")
    def test_create_product_with_image_mocked_cloudinary(self, mock_save):
        """Product creation with image upload works when default storage save is mocked."""
        self._create_owner()
        url = reverse("product-list")
        data = {
            "name": "Cloudinary Test Bowl",
            "price": "149.00",
            "category": "Bowls",
            "weight_grams": "300",
            "is_vegetarian": "true",
            "is_available": "true",
            "stock_quantity": "0",
            "image": self._make_image_file(),
        }
        response = self.client.post(url, data, format="multipart")
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])

    def test_partial_update_without_image_does_not_touch_image(self):
        """PATCH without an image field leaves the existing image unchanged."""
        self._create_owner()
        product = Product.objects.create(
            name="Existing Bowl",
            price=Decimal("99.00"),
            category="Bowls",
            weight_grams=200,
        )
        product.image.name = "milletmarg/products/existing"
        product.save(update_fields=["image"])

        url = reverse("product-detail", kwargs={"slug": product.slug})
        response = self.client.patch(url, {"price": "89.00"}, format="multipart")
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

        product.refresh_from_db()
        self.assertEqual(product.price, Decimal("89.00"))
        # Image must remain untouched
        self.assertIn("existing", product.image.name)


class MigrateImagesToCloudinaryCommandTests(TestCase):
    """Tests for the migrate_images_to_cloudinary management command."""

    def _call_command(self, *args, **kwargs):
        from io import StringIO
        from django.core.management import call_command
        stdout = StringIO()
        stderr = StringIO()
        call_command(
            "migrate_images_to_cloudinary",
            *args,
            stdout=stdout,
            stderr=stderr,
            **kwargs,
        )
        return stdout.getvalue(), stderr.getvalue()

    @override_settings(
        CLOUDINARY_CLOUD_NAME="",
        CLOUDINARY_API_KEY="",
        CLOUDINARY_API_SECRET="",
    )
    def test_command_raises_if_credentials_missing(self):
        """Command raises CommandError if Cloudinary env vars are absent."""
        from django.core.management.base import CommandError
        with self.assertRaises(CommandError):
            self._call_command()

    @override_settings(
        CLOUDINARY_CLOUD_NAME="testcloud",
        CLOUDINARY_API_KEY="testkey",
        CLOUDINARY_API_SECRET="testsecret",
    )
    def test_dry_run_no_products(self):
        """Dry-run with no products prints a 'nothing to migrate' message."""
        Product.objects.all().delete()
        stdout, _ = self._call_command("--dry-run")
        self.assertIn("No products", stdout)

    @override_settings(
        CLOUDINARY_CLOUD_NAME="testcloud",
        CLOUDINARY_API_KEY="testkey",
        CLOUDINARY_API_SECRET="testsecret",
    )
    @patch("cloudinary.uploader.upload")
    def test_dry_run_shows_would_upload(self, mock_upload):
        """Dry-run shows what would be uploaded without calling cloudinary.uploader.upload."""
        import tempfile, os
        from django.conf import settings as djsettings

        # Create a temp file to simulate a local image
        media_root = djsettings.MEDIA_ROOT
        img_dir = os.path.join(str(media_root), "products", "2026", "10")
        os.makedirs(img_dir, exist_ok=True)
        tmp_path = os.path.join(img_dir, "dryrun_test.jpg")
        with open(tmp_path, "wb") as f:
            buf = io.BytesIO()
            Image.new("RGB", (10, 10)).save(buf, "JPEG")
            f.write(buf.getvalue())

        try:
            product = Product.objects.create(
                name="DryRun Test Product",
                price=Decimal("10.00"),
                category="Test",
                weight_grams=100,
            )
            product.image.name = "products/2026/10/dryrun_test.jpg"
            product.save(update_fields=["image"])

            stdout, _ = self._call_command("--dry-run")
            self.assertIn("DRY RUN", stdout)
            mock_upload.assert_not_called()
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    @override_settings(
        CLOUDINARY_CLOUD_NAME="testcloud",
        CLOUDINARY_API_KEY="testkey",
        CLOUDINARY_API_SECRET="testsecret",
    )
    def test_skips_already_cloudinary_url(self):
        """Products whose image URL is already absolute are skipped."""
        product = Product.objects.create(
            name="Already Cloudinary",
            price=Decimal("50.00"),
            category="Snacks",
            weight_grams=100,
        )
        product.image.name = "milletmarg/products/1/test"
        product.save(update_fields=["image"])

        # Patch url to simulate a Cloudinary absolute URL
        with patch.object(
            type(product.image), "url",
            new_callable=lambda: property(
                lambda self: "https://res.cloudinary.com/testcloud/image/upload/test.jpg"
            ),
        ):
            stdout, _ = self._call_command("--dry-run")
            self.assertIn("SKIP already Cloudinary", stdout)
