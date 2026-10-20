from decimal import Decimal
from django.core.management.base import BaseCommand
from products.models import Product


SAMPLE_PRODUCTS = [
    {
        "name": "Organic Ragi Laddu",
        "description": "Handcrafted traditional laddus made from sprouted finger millet (ragi), pure desi ghee, and organic jaggery.",
        "price": Decimal("180.00"),
        "category": "Snacks",
        "weight_grams": 250,
        "ingredients": "Sprouted Ragi Flour, Desi Ghee, Organic Jaggery, Cardamom, Almonds",
        "is_vegetarian": True,
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
        "is_available": True
    },
    {
        "name": "Foxtail Millet Khichdi Mix",
        "description": "Ready-to-cook healthy khichdi mix combining foxtail millet and split yellow moong dal with roasted spices.",
        "price": Decimal("140.00"),
        "category": "Ready to Cook",
        "weight_grams": 300,
        "ingredients": "Foxtail Millet, Moong Dal, Cumin Seeds, Ginger Powder, Turmeric, Black Pepper, Curry Leaves, Salt",
        "is_vegetarian": True,
        "allergen_information": "Gluten-free. Processed in a facility that handles nuts.",
        "nutritional_information": {
            "serving_size": "100g",
            "calories_kcal": 345,
            "protein_g": 12.0,
            "carbohydrates_g": 66.0,
            "dietary_fiber_g": 7.8,
            "fat_g": 2.8,
            "iron_mg": 3.4
        },
        "stock_quantity": 60,
        "is_available": True
    },
    {
        "name": "Little Millet Veggie Noodles",
        "description": "Sun-dried 100% millet noodles made with zero maida and no artificial tastemakers.",
        "price": Decimal("95.00"),
        "category": "Snacks",
        "weight_grams": 180,
        "ingredients": "Little Millet Flour, Whole Wheat Flour, Cluster Bean Powder, Salt",
        "is_vegetarian": True,
        "allergen_information": "Contains wheat gluten.",
        "nutritional_information": {
            "serving_size": "90g",
            "calories_kcal": 310,
            "protein_g": 9.5,
            "carbohydrates_g": 62.0,
            "dietary_fiber_g": 6.5,
            "fat_g": 1.4
        },
        "stock_quantity": 50,
        "is_available": True
    },
    {
        "name": "Bajra (Pearl Millet) Flour",
        "description": "Stone-ground whole grain pearl millet flour ideal for rotis, parathas, and winter delicacies.",
        "price": Decimal("110.00"),
        "category": "Flours",
        "weight_grams": 1000,
        "ingredients": "100% Whole Pearl Millet Grains",
        "is_vegetarian": True,
        "allergen_information": "Naturally gluten-free.",
        "nutritional_information": {
            "serving_size": "100g",
            "calories_kcal": 361,
            "protein_g": 11.6,
            "carbohydrates_g": 67.5,
            "dietary_fiber_g": 8.5,
            "fat_g": 5.0,
            "iron_mg": 8.0
        },
        "stock_quantity": 30,
        "is_available": True
    },
    {
        "name": "Barnyard Millet Flakes",
        "description": "Crispy flattened barnyard millet flakes, perfect for quick poha or wholesome breakfast bowls.",
        "price": Decimal("125.00"),
        "category": "Breakfast Cereals",
        "weight_grams": 400,
        "ingredients": "100% Barnyard Millet",
        "is_vegetarian": True,
        "allergen_information": "Gluten-free.",
        "nutritional_information": {
            "serving_size": "50g",
            "calories_kcal": 160,
            "protein_g": 4.0,
            "carbohydrates_g": 32.0,
            "dietary_fiber_g": 5.0,
            "fat_g": 1.1
        },
        "stock_quantity": 25,
        "is_available": True
    },
    {
        "name": "Spiced Jowar Puffs",
        "description": "Light, crunchy roasted sorghum puffs seasoned with chaat masala and cold-pressed sunflower oil.",
        "price": Decimal("75.00"),
        "category": "Snacks",
        "weight_grams": 100,
        "ingredients": "Roasted Jowar Puffs, Sunflower Oil, Chaat Masala, Pink Himalayan Salt, Amchur",
        "is_vegetarian": True,
        "allergen_information": "Gluten-free.",
        "nutritional_information": {
            "serving_size": "30g",
            "calories_kcal": 115,
            "protein_g": 3.2,
            "carbohydrates_g": 21.0,
            "dietary_fiber_g": 2.8,
            "fat_g": 2.2
        },
        "stock_quantity": 80,
        "is_available": True
    },
    {
        "name": "Kodo Millet Almond Cookies",
        "description": "Artisanal butter cookies made from kodo millet flour, real butter, and crushed Californian almonds.",
        "price": Decimal("220.00"),
        "category": "Bakery",
        "weight_grams": 200,
        "ingredients": "Kodo Millet Flour, Butter, Brown Sugar, Almonds, Cardamom, Baking Powder",
        "is_vegetarian": True,
        "allergen_information": "Contains dairy (butter) and tree nuts (almonds).",
        "nutritional_information": {
            "serving_size": "40g",
            "calories_kcal": 195,
            "protein_g": 3.5,
            "carbohydrates_g": 24.0,
            "dietary_fiber_g": 2.5,
            "fat_g": 9.5
        },
        "stock_quantity": 0,
        "is_available": False
    }
]


class Command(BaseCommand):
    help = "Loads optional demonstration food products for MilletMarg (clearly labeled as demo data)."

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing sample products matching demo titles before loading',
        )

    def handle(self, *args, **options):
        if options['clear']:
            names = [p['name'] for p in SAMPLE_PRODUCTS]
            deleted_count, _ = Product.objects.filter(name__in=names).delete()
            self.stdout.write(self.style.WARNING(f"Cleared {deleted_count} sample products."))

        created_count = 0
        for item in SAMPLE_PRODUCTS:
            product, created = Product.objects.get_or_create(
                name=item['name'],
                defaults=item
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created demo product: {product.name} (slug: {product.slug})"))
            else:
                self.stdout.write(f"Product already exists: {product.name} (slug: {product.slug})")

        self.stdout.write(self.style.SUCCESS(f"Finished loading sample data. Total newly created: {created_count}."))
