"""Extract product images directly from the PDF catalogue."""
import json
import sys
from pathlib import Path
from typing import Optional
from PIL import Image, ImageEnhance
import rembg
import numpy as np
import fitz  # PyMuPDF

WORKSPACE = Path(__file__).resolve().parents[1]
PDF_PATH = WORKSPACE / "CATELOUGE LATEST 2026.pdf"
PRODUCTS_DIR = WORKSPACE / "public" / "products"
PRODUCTS_DATA = WORKSPACE / "app" / "components" / "lib" / "products-data.json"

# Ensure output directory exists
PRODUCTS_DIR.mkdir(parents=True, exist_ok=True)

def render_pdf_page(page_num: int, dpi: int = 150) -> Optional[Image.Image]:
    """Render a PDF page to an image."""
    try:
        doc = fitz.open(str(PDF_PATH))
        # Page numbers in PyMuPDF are 0-indexed
        # The products data page numbers seem to be 1-indexed PDF page numbers
        page_index = page_num - 1
        if page_index < 0 or page_index >= len(doc):
            doc.close()
            return None
        
        page = doc[page_index]
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = page.get_pixmap(matrix=mat)
        
        # Convert to PIL Image
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        doc.close()
        return img
    except Exception as e:
        print(f"  Error rendering page {page_num}: {e}")
        return None

def analyze_page_layout(img: Image.Image) -> tuple:
    """
    Analyze the catalogue page to find the product image region.
    Returns (x1, y1, x2, y2) crop coordinates.
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
    top_70 = int(height * 0.7)
    top_variances = [(y, v) for y, v in variances if y < top_70]
    
    if top_variances:
        max_var = max(v for _, v in top_variances)
        threshold = max_var * 0.3
        
        start_y = 0
        for y, v in top_variances:
            if v > threshold:
                start_y = y
                break
        
        end_y = start_y + 200
        for y, v in top_variances:
            if y > start_y and v < threshold * 0.5:
                end_y = y
                break
        
        start_y = max(0, start_y - 20)
        end_y = min(height, end_y + 20)
    else:
        start_y = 0
        end_y = int(height * 0.6)
    
    x1 = int(width * 0.1)
    x2 = int(width * 0.9)
    
    return (x1, start_y, x2, end_y)

def remove_background(img: Image.Image) -> Image.Image:
    """Remove background from image using rembg."""
    try:
        output = rembg.remove(
            img,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=5,
        )
        if isinstance(output, bytes):
            from io import BytesIO
            result = Image.open(BytesIO(output))
        elif isinstance(output, Image.Image):
            result = output
        else:
            arr = np.array(output)
            result = Image.fromarray(arr)
        return result.convert("RGBA")
    except Exception as e:
        print(f"  Background removal failed: {e}")
        return img.convert("RGBA")

def process_image(img: Image.Image) -> Image.Image:
    """Process image: remove background, enhance, center."""
    img = remove_background(img)
    
    if img.mode == "RGBA":
        alpha = img.split()[-1]
        bbox = alpha.getbbox()
        if bbox:
            img = img.crop(bbox)
    
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(1.5)
    
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.1)
    
    return img

def save_optimized(img: Image.Image, output_path: Path):
    """Save image as optimized PNG."""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    img.save(output_path, "PNG", optimize=True)

def main():
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except AttributeError:
            pass
    
    with open(PRODUCTS_DATA, "r", encoding="utf-8") as f:
        products = json.load(f)
    
    print(f"Processing {len(products)} products from PDF...")
    
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
        
        try:
            # Render PDF page
            page_img = render_pdf_page(page_num)
            if not page_img:
                print(f"  Product {model} (ID {product_id}): Failed to render page {page_num}")
                unmatched.append(product)
                fail_count += 1
                continue
            
            # Crop product image region
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
    
    report_path = WORKSPACE / "unmatched-products.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(unmatched, f, indent=2, ensure_ascii=False)
    print(f"\nUnmatched report saved to: {report_path}")

if __name__ == "__main__":
    main()
