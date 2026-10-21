"""
migrate_images_to_cloudinary
============================
Safely upload existing local product images to Cloudinary.

Usage
-----
    # Preview what would happen (no uploads, no DB changes):
    python manage.py migrate_images_to_cloudinary --dry-run

    # Run the actual migration:
    python manage.py migrate_images_to_cloudinary

    # Migrate only a specific product (by ID):
    python manage.py migrate_images_to_cloudinary --product-id 1

Safety guarantees
-----------------
- Products whose image field already points to a Cloudinary URL are skipped.
- Products whose local file is missing are skipped with a warning.
- The DB record is only updated AFTER a successful upload.
- Local files are NEVER deleted by this command.
- Running the command a second time is safe (idempotent).
"""

from __future__ import annotations

import os
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from products.models import Product


class Command(BaseCommand):
    help = "Migrate existing local product images to Cloudinary storage."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Preview what would be uploaded without making any changes.",
        )
        parser.add_argument(
            "--product-id",
            type=int,
            default=None,
            metavar="ID",
            help="Migrate only the product with this primary key.",
        )

    def handle(self, *args, **options):
        dry_run: bool = options["dry_run"]
        product_id: int | None = options["product_id"]

        # ------------------------------------------------------------------ #
        # Guard: Cloudinary must be configured
        # ------------------------------------------------------------------ #
        cloud_name = getattr(settings, "CLOUDINARY_CLOUD_NAME", "")
        api_key = getattr(settings, "CLOUDINARY_API_KEY", "")
        api_secret = getattr(settings, "CLOUDINARY_API_SECRET", "")

        if not (cloud_name and api_key and api_secret):
            raise CommandError(
                "Cloudinary credentials are not configured.\n"
                "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and "
                "CLOUDINARY_API_SECRET in Backend/.env before running this command."
            )

        try:
            import cloudinary
            import cloudinary.uploader
        except ImportError:
            raise CommandError(
                "The 'cloudinary' package is not installed.\n"
                "Run: pip install cloudinary django-cloudinary-storage"
            )

        # ------------------------------------------------------------------ #
        # Select products
        # ------------------------------------------------------------------ #
        qs = Product.objects.exclude(image="").exclude(image__isnull=True)
        if product_id is not None:
            qs = qs.filter(pk=product_id)
            if not qs.exists():
                raise CommandError(
                    f"No product with id={product_id} found, or it has no image."
                )

        total = qs.count()
        if total == 0:
            self.stdout.write(self.style.WARNING("No products with images found. Nothing to migrate."))
            return

        if dry_run:
            self.stdout.write(self.style.WARNING(f"[DRY RUN] Would process {total} product(s):\n"))
        else:
            self.stdout.write(self.style.HTTP_INFO(f"Migrating {total} product image(s) to Cloudinary...\n"))

        # ------------------------------------------------------------------ #
        # Process each product
        # ------------------------------------------------------------------ #
        skipped_already = 0
        skipped_missing = 0
        succeeded = 0
        failed = 0

        for product in qs.iterator():
            image_name: str = product.image.name  # e.g. products/2026/10/foo.jpeg

            # Skip products already on Cloudinary
            try:
                url = product.image.url
                if url.startswith(("http://", "https://", "//")):
                    self.stdout.write(
                        f"  ⏭  [SKIP already Cloudinary] ID={product.id} — {product.name}"
                    )
                    skipped_already += 1
                    continue
            except Exception:
                pass  # url() might fail for missing local files; handle below

            # Resolve local file path
            local_path = Path(settings.MEDIA_ROOT) / image_name
            if not local_path.exists():
                self.stdout.write(
                    self.style.WARNING(
                        f"  ⚠   [SKIP missing file] ID={product.id} — {product.name} "
                        f"(expected at {local_path})"
                    )
                )
                skipped_missing += 1
                continue

            # Build a deterministic Cloudinary public_id from the relative path
            # e.g.  milletmarg/products/2026/10/foo
            stem = Path(image_name).stem
            cloudinary_public_id = f"milletmarg/products/{product.pk}/{stem}"

            if dry_run:
                self.stdout.write(
                    f"  [DRY RUN] Would upload: {local_path}\n"
                    f"            → cloudinary public_id: {cloudinary_public_id}"
                )
                succeeded += 1
                continue

            # Actual upload
            try:
                result = cloudinary.uploader.upload(
                    str(local_path),
                    public_id=cloudinary_public_id,
                    overwrite=False,       # do not re-upload if already there
                    resource_type="image",
                    folder="",             # public_id already contains full path
                )
                cloudinary_url: str = result["secure_url"]

                # Update DB record with the Cloudinary URL as the image path
                # django-cloudinary-storage stores the public_id as the field value
                product.image.name = result.get("public_id", cloudinary_public_id)
                product.save(update_fields=["image"])

                self.stdout.write(
                    self.style.SUCCESS(
                        f"  ✔  ID={product.id} — {product.name}\n"
                        f"     Cloudinary URL: {cloudinary_url}"
                    )
                )
                succeeded += 1

            except Exception as exc:
                self.stderr.write(
                    self.style.ERROR(
                        f"  ✘  FAILED ID={product.id} — {product.name}: {exc}"
                    )
                )
                failed += 1

        # ------------------------------------------------------------------ #
        # Summary
        # ------------------------------------------------------------------ #
        self.stdout.write("\n" + "─" * 60)
        if dry_run:
            self.stdout.write(self.style.WARNING(f"[DRY RUN] {succeeded} would be uploaded."))
        else:
            self.stdout.write(
                self.style.SUCCESS(f"Done. ✔ Uploaded: {succeeded}") + "  "
                + (self.style.WARNING(f"⏭ Already on Cloudinary: {skipped_already}") if skipped_already else "")
            )
            if skipped_missing:
                self.stdout.write(self.style.WARNING(f"⚠  Skipped (file missing): {skipped_missing}"))
            if failed:
                self.stdout.write(self.style.ERROR(f"✘  Failed: {failed}"))
                raise CommandError("Some uploads failed. Check the output above.")
