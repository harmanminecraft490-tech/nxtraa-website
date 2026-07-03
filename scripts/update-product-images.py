"""Update products-data.json with extracted product image URLs."""
import json

PRODUCTS_DATA_PATH = "app/components/lib/products-data.json"

# Map of product ID to extracted image filename
PRODUCT_IMAGES = {
    1: "product-1.png",
    9: "product-009.png",
    12: "product-012.png",
    19: "product-019.png",
    23: "product-023.png",
    27: "product-027.png",
    32: "product-032.png",
    43: "product-043.png",
    44: "product-044.png",
    49: "product-049.png",
    60: "product-060.png",
    63: "product-063.png",
    77: "product-077.png",
    89: "product-089.png",
    96: "product-096.png",
    99: "product-099.png",
    104: "product-104.png",
    107: "product-107.png",
    113: "product-113.png",
    119: "product-119.png",
    125: "product-125.png",
    133: "product-133.png",
}

with open(PRODUCTS_DATA_PATH, "r", encoding="utf-8") as f:
    products = json.load(f)

updated_count = 0
for product in products:
    product_id = product.get("id")
    if product_id in PRODUCT_IMAGES:
        image_url = f"/products/{PRODUCT_IMAGES[product_id]}"
        # Always update the imageUrls for products in the mapping
        product["imageUrls"] = [image_url]
        updated_count += 1
        print(f"  Updated product {product.get('model')} (ID {product_id}): {image_url}")

with open(PRODUCTS_DATA_PATH, "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"\nUpdated {updated_count} products with extracted images.")
