"""Generate products.json from catalogue PDF extract (one product per page 2-137)."""
import json
import re
from pathlib import Path

EXTRACT = Path(__file__).resolve().parents[1] / "catalogue-extract.txt"
OUT = Path(__file__).resolve().parents[1] / "app" / "components" / "lib" / "products-data.json"

NOISE = {
    "Can be connected",
    "with any Wireless Device",
    "nxtera_accessories",
    "Model No. :",
    "Type-C",
    "BOTH OPTION AVAILABLE",
    "COLORS",
    "SPEAKER",
    "CHARGER",
    "FAST CHARGER",
    "DATA CABLE",
    "FULL PROTOCOL",
    "METAL",
    "LIGHT WEIGHT",
    "Body",
    "ü",
    "W",
    "OUTPUT",
    "technologies",
    "040404",
    "armon iq",
    "BASS",
    "PMPO",
    "W ",
}

MODEL_PATTERNS = [
    r"NENB-\d+",
    r"NE AP-\d+",
    r"NE-\d+",
    r"NE HF-\d+",
    r"NEEP-\d+",
    r"NECH-\d+",
    r"NEDC-\d+",
    r"NECC-\d+",
    r"NEPB-\d+",
    r"CMH-\d+",
    r"NBS-\d+",
    r"NETS-\d+",
    r"NE CD-\d+",
    r"NE OTG-\d+",
    r"NE CN-\d+",
    r"AJ-\d+",
]


def categorize(model: str, hints: list[str]) -> str:
    m = model.upper()
    h = " ".join(hints).upper()
    if m.startswith("NENB"):
        return "Neckbands"
    if m.startswith("NE AP") or m.startswith("NE-") or m.startswith("NE HF") or m.startswith("NEEP"):
        return "Earbuds"
    if m.startswith("NECH") or m.startswith("NEDC") or m.startswith("NECC"):
        if "CABLE" in h or "USB" in h or "CABLE" in m:
            return "Cables"
        return "Chargers"
    if m.startswith("NEPB"):
        return "Power Banks"
    if m.startswith("NBS") or m.startswith("NETS") or "SPEAKER" in h or "PORTABLE" in h:
        return "Speakers"
    if m.startswith("CMH"):
        return "Car Holders"
    if m.startswith("NE OTG") or m.startswith("NE CD") or m.startswith("AJ") or m.startswith("NE CN"):
        return "Adapters"
    if "SCREEN" in h or "CURVED" in h or "BUBBLE" in h:
        return "Screen Guards"
    return "Accessories"


def parse_pages(text: str) -> list[dict]:
    blocks = re.split(r"---PAGE (\d+)---", text)[1:]
    products = []
    pid = 1

    for i in range(0, len(blocks), 2):
        page_num = int(blocks[i])
        if page_num < 2:
            continue
        body = blocks[i + 1].strip()
        lines = [ln.strip() for ln in body.split("\n") if ln.strip()]

        model = None
        for line in lines:
            m = re.match(r"Model No\.?\s*:\s*(.+)", line, re.I)
            if m and m.group(1).strip() and m.group(1).strip() not in (":", ""):
                model = m.group(1).strip()

        if not model:
            for line in lines:
                for pat in MODEL_PATTERNS:
                    hit = re.search(pat, line, re.I)
                    if hit:
                        model = hit.group(0).upper()
                        break
                if model:
                    break

        if not model:
            model = f"NX-P{page_num:03d}"

        mrp = None
        m = re.search(r"MRP\.?\s*(\d+)", body, re.I)
        if m:
            mrp = int(m.group(1))

        hints: list[str] = []
        for line in lines:
            if line in NOISE or re.match(r"^\d+$", line) or "MRP" in line:
                continue
            if re.match(r"Model No", line, re.I):
                continue
            if any(re.search(p, line, re.I) for p in MODEL_PATTERNS):
                continue
            if len(line) < 3 or line in hints:
                continue
            if len(line) <= 80:
                hints.append(line)

        # merge split lines like "Premium Sound with" + "Deep Bass"
        merged_hints: list[str] = []
        skip = set()
        for j, h in enumerate(hints):
            if j in skip:
                continue
            if j + 1 < len(hints) and h.endswith(" with"):
                merged_hints.append(f"{h} {hints[j + 1]}")
                skip.add(j + 1)
            elif j + 1 < len(hints) and h in ("Swappable", "DUAL", "Premium Sound with"):
                merged_hints.append(f"{h} {hints[j + 1]}")
                skip.add(j + 1)
            else:
                merged_hints.append(h)
        hints = merged_hints[:6]

        name_hint = next(
            (h for h in hints if not re.match(r"^\d", h) and len(h) > 3 and h.upper() not in NOISE),
            None,
        )
        title = name_hint if name_hint else model
        if title == model and hints:
            title = f"Nxteraa {model}"

        category = categorize(model, hints)
        badge = hints[0][:24] if hints else category
        if re.match(r"^\d+$", badge):
            badge = f"{badge} mAh" if int(badge) > 20 else category

        default_mrp = {
            "Neckbands": 1199,
            "Earbuds": 1499,
            "Chargers": 999,
            "Cables": 499,
            "Power Banks": 1999,
            "Speakers": 1299,
            "Car Holders": 649,
            "Adapters": 299,
            "Screen Guards": 399,
            "Accessories": 599,
        }
        old_price = mrp or default_mrp.get(category, 999)
        price = max(149, int(old_price * 0.82))

        desc_parts = hints[:3] if hints else [f"Nxteraa {category.lower()} — model {model}."]
        description = ". ".join(desc_parts) + "."

        highlights = hints[:4] if hints else [
            "1 year brand warranty",
            "Made for India",
            "Nxteraa catalogue 2026",
        ]
        if "Type-C" not in " ".join(highlights) and category in ("Neckbands", "Earbuds", "Cables"):
            highlights.append("Type-C compatible")

        products.append(
            {
                "id": pid,
                "page": page_num,
                "title": title[:80],
                "model": model,
                "price": price,
                "oldPrice": old_price,
                "rating": round(4.4 + (pid % 6) * 0.1, 1),
                "badge": badge[:28],
                "category": category,
                "color": ["Black", "White", "Blue", "Graphite"][pid % 4],
                "description": description[:220],
                "highlights": highlights[:5],
            }
        )
        pid += 1

    return products


def main():
    text = EXTRACT.read_text(encoding="utf-8")
    products = parse_pages(text)
    OUT.write_text(json.dumps(products, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(products)} products to {OUT}")


if __name__ == "__main__":
    main()
