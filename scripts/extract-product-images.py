"""Extract product images from catalogue pages, remove backgrounds, and save as optimized PNGs."""
import json
import os
import sys
from pathlib import Path
from typing import Optional
from PIL import Image, ImageEnhance, ImageFilter
import rembg
import numpy as np

WORKSPACE = Path(__file__).resolve().parents[1]
CATALOGUE_DIR = WORKSPACE / "public" / "catalogue-products"
PRODUCTS_DIR = WORKSPACE / "public" / "products"
PRODUCTS_DATA = WORKSPACE / "app" / "components" / "lib" / "products-data.json"

# Ensure output directory exists
PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)

def get_catalogue_page_path(page_num: int) -> Optional[Path]:
    """Find the catalogue page image for a given page number."""
    # The catalogue images are named like catalogue-page-010.jpg
    # where the number is the PDF page number
    # Try direct match first
    direct = CATALOGUE_DIR / f"catalogue-page-{page_num:03d}.jpg"
    if direct.exists():
        return direct
    
    # Also try without leading zeros
    for f in CATALOGUE_DIR.glob("catalogue-page-*.jpg"):
        parts = f.stem.split("-")
        if len(parts) >= 3:
            try:
                file_page = int(parts[-1])
                if file_page == page_num:
                    return f
            except ValueError:
                continue
    return None

def analyze_page_layout(img: Image.Image) -> tuple:
    """
    Analyze the catalogue page to find the product image region.
    Returns (x1, y1, x2, y2) crop coordinates.
    
    Strategy: The product image is typically in the upper portion of the page.
    We'll look for the region with the most color variance (the product image)
    vs the more uniform text region.
    """
    width, height = img.size
    
    # Convert to numpy for analysis
    arr = np.array(img)
    
    # Calculate color variance in horizontal strips
    strip_height = 50
    variances = []
    for y in range(0, height - strip_height, strip_height // 2):
        strip = arr[y:y + strip_height, :, :]
        variance = np.var(strip, axis=(0, 1)).mean()
        variances.append((y, variance))
    
    # Find the region with highest variance (likely the product image)
    # The product image is usually in the upper portion
    # Let's look at the top 70% of the page
    top_70 = int(height * 0.7)
    top_variances = [(y, v) for y, v in variances if y < top_70]
    
    if top_variances:
        # Find the start of high variance region
        max_var = max(v for _, v in top_variances)
        threshold = max_var * 0.3
        
        # Find where variance starts being significant
        start_y = 0
        for y, v in top_variances:
            if v > threshold:
                start_y = y
                break
        
        # Find where variance drops off (end of product image)
        end_y = start_y + 200
        for y, v in top_variances:
            if y > start_y and v < threshold * 0.5:
                end_y = y
                break
        
        # Clamp to reasonable bounds
        start_y = max(0, start_y - 20)
        end_y = min(height, end_y + 20)
    else:
        # Fallback: use top 60% of page
        start_y = 0
        end_y = int(height * 0.6)
    
    # For the horizontal crop, use most of the width with some padding
    x1 = int(width * 0.1)
    x2 = int(width * 0.9)
    
    return (x1, start_y, x2, end_y)

def remove_background(img: Image.Image) -> Image.Image:
    """Remove background from image using rembg."""
    try:
        # Convert to RGBA for processing
        output = rembg.remove(
            img,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=5,
        )
        # rembg can return bytes, Image, or ndarray - handle all cases
        if isinstance(output, bytes):
            from io import BytesIO
            result = Image.open(BytesIO(output))
        elif isinstance(output, Image.Image):
            result = output
        else:
            # numpy array or other - convert via numpy
            arr = np.array(output)
            result = Image.fromarray(arr)
        return result.convert("RGBA")
    except Exception as e:
        print(f"  Background removal failed: {e}")
        return img.convert("RGBA")

def process_image(img: Image.Image) -> Image.Image:
    """Process image: enhance, center, add padding."""
    # Remove background
    img = remove_background(img)
    
    # Find the bounding box of non-transparent pixels
    if img.mode == "RGBA":
        alpha = img.split()[-1]
        bbox = alpha.getbbox()
        if bbox:
            img = img.crop(bbox)
    
    # Enhance sharpness
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(1.5)
    
    # Enhance contrast slightly
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.1)
    
    return img

def save_optimized(img: Image.Image, output_path: Path):
    """Save image as optimized PNG."""
    # Convert to RGBA if not already
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    
    # Save with optimization
    img.save(output_path, "PNG", optimize=True)

def main():
    # Fix Windows console encoding
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except AttributeError:
            pass
    
    # Load products data
    with open(PRODUCTS_DATA, "r", encoding="utf-8") as f:
        products = json.load(f)
    
    print(f"Processing {len(products)} products...")
    
    success_count = 0
    fail_count = 0
    unmatched = []
    
    for product in products:
        page_num = product.get("page")
        model = product.get("model", "")
        product_id = product.get("id")
        
        if not page_num:
            print(f"  Product {model} (ID {product_id}): No page number, skipping")
            unmatched.append(product)
            fail_count += 1
            continue
        
        # Find catalogue page image
        page_path = get_catalogue_page_path(page_num)
        if not page_path:
            print(f"  Product {model} (ID {product_id}): Catalogue page {page_num} not found")
            unmatched.append(product)
            fail_count += 1
            continue
        
        try:
            # Open catalogue page
            page_img = Image.open(page_path).convert("RGB")
            
            # Analyze and crop product image region
            crop_coords = analyze_page_layout(page_img)
            product_img = page_img.crop(crop_coords)
            
            # Process the image
            processed_img = process_image(product_img)
            
            # Save output
            output_path = PRODUCTS_DIR / f"product-{product_id:03d}.png"
            save_optimized(processed_img, output_path)
            
            print(f"  [OK] Product {model} (ID {product_id}): Saved to {output_path.name}")
            success_count += 1
            
        except Exception as e:
            print(f"  [FAIL] Product {model} (ID {product_id}): Error - {e}")
            unmatched.append(product)
            fail_count += 1
    
    print(f"\n=== Summary ===")
    print(f"Successfully processed: {success_count}")
    print(f"Failed/Unmatched: {fail_count}")
    
    if unmatched:
        print(f"\nUnmatched products ({len(unmatched)}):")
        for p in unmatched:
            print(f"  - {p.get('model', 'Unknown')} (ID {p.get('id', '?')}, Page {p.get('page', '?')})")
    
    # Save unmatched report
    report_path = WORKSPACE / "unmatched-products.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(unmatched, f, indent=2, ensure_ascii=False)
    print(f"\nUnmatched report saved to: {report_path}")

if __name__ == "__main__":
    main()
