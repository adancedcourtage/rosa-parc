"""Ajoute la marque Brand Collection au catalogue Rosa Parc.

Source : boutique du grossiste officiel au Maroc, brand-collection.ma (API WooCommerce Store,
prix publics en dirhams). Usage, depuis la racine du dépôt :
    python3 scripts/catalogue/brand_collection.py
Met à jour src/data/catalogue.json, src/data/prix-maroc.json et les photos de
src/assets/produits/. Relancer le script remplace les fiches Brand Collection existantes.
"""
import html, io, json, os, re, subprocess, sys, unicodedata
from PIL import Image, ImageChops, ImageDraw

sys.path.insert(0, os.path.dirname(__file__))
from build import FAMILY, PALETTE, mood_of, shape_for  # noqa: E402

BRAND = "Brand Collection"
STORE = "brand-collection.ma"
API = f"https://{STORE}/wp-json/wc/store/v1/products?per_page=100&page="
FIRST_ID = 1600
CATALOGUE, PRICES, PHOTOS = "src/data/catalogue.json", "src/data/prix-maroc.json", "src/assets/produits"


def slug_of(brand, name):
    # Même règle que slugOf() dans src/shared.jsx (« N°325 » -> « n-325 »), pour que la photo soit trouvée.
    s = unicodedata.normalize("NFD", f"{brand}-{name}")
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def curl(url):
    r = subprocess.run(["curl", "-sSfL", "-m", "60", url], capture_output=True, check=True)
    return r.stdout


def fetch_all():
    out, page = [], 1
    while True:
        batch = json.loads(curl(API + str(page)))
        if not batch: return out
        out += batch; page += 1


def text(h): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h or ""))).replace("’", "'").strip()


def gender_of(desc, title):
    # La description est plus fiable que le nom (certains « pour Femme » sont des parfums homme).
    for s in (desc, title):
        s = s.lower()
        if re.search(r"homme et femme|femme et homme|unisexe", s): return "m"
        if "pour femme" in s: return "f"
        if "pour homme" in s: return "h"
    return "m"


FAMILY_WORDS = r"(?:Orientale?|Ambre|Ambré|Floral|Fleuri|Boisé|Aromatique|Chypré|Hespéridé|Cuir|Fougère|Aquatique|Vert|pour)\b"


def inspiration_of(desc):
    m = re.search(r"Inspiré (?:de |d')?(.+?)(?=\s+pour (?:homme|femme)|\s*\.\s+[Pp]arfum|\s+(?:un )?[Pp]arfum " + FAMILY_WORDS + r"|\s*\|\||$)", desc)
    return m.group(1).strip(" .") if m else ""


def family_of(desc):
    m = re.search(r"[Pp]arfum ((?:Orientale?|Ambre|Ambré|Floral|Boisé|Aromatique|Chypré|Hespéridé|Cuir)[^.]*?)\s+pour", desc)
    if not m: return None
    f = re.sub(r"\bOrientale\b", "Oriental", m.group(1)).strip()
    return f[:1].upper() + f[1:].lower()


def notes_list(s):
    parts = re.split(r",| et ", s.strip(" .;"))
    return ", ".join(p.strip(" .")[:1].upper() + p.strip(" .")[1:] for p in parts if p.strip(" ."))


def notes_of(desc):
    tiers = {}
    for key, label in (("top", r"t[êe]te"), ("heart", r"c(?:œ|oe)ur"), ("base", r"fond")):
        m = re.search(r"notes de " + label + r"\s*:\s*(.+?)(?=\s*Les notes|\s*\|\||$)", desc, re.I)
        if m: tiers[key] = notes_list(m.group(1))
    if not tiers:  # « Les notes : a, b, c » sans pyramide détaillée
        m = re.search(r"Les notes\s*:\s*(.+?)(?=\s*\|\||$)", desc)
        if m: tiers["heart"] = notes_list(m.group(1))
    return {k: tiers.get(k, "") for k in ("top", "heart", "base")}


def photo(url, slug):
    url = re.sub(r"\.(jpe?g|png|webp)$", r"-1024x1024.\1", url)
    try: im = Image.open(io.BytesIO(curl(url)))
    except Exception:
        im = Image.open(io.BytesIO(curl(re.sub(r"-1024x1024", "", url))))
    im = im.convert("RGB")
    # Fond et liseré gris clair des visuels du grossiste -> blanc, puis recadrage avec marge.
    for c in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]:
        ImageDraw.floodfill(im, c, (255, 255, 255), thresh=40)
    diff = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).convert("L").point(lambda v: 255 if v > 12 else 0)
    if diff.getbbox(): im = im.crop(diff.getbbox())
    pad = int(max(im.size) * 0.08)
    cv = Image.new("RGB", (im.width + 2 * pad, im.height + 2 * pad), (255, 255, 255)); cv.paste(im, (pad, pad))
    cv.thumbnail((800, 800), Image.LANCZOS)
    cv.save(f"{PHOTOS}/{slug}.webp", "WEBP", quality=78, method=5)


def main():
    raw = fetch_all()
    catalogue = [p for p in json.load(open(CATALOGUE)) if p["brand"] != BRAND]
    prices = {k: v for k, v in json.load(open(PRICES)).items() if int(k) < FIRST_ID}
    added = []
    for rank, p in enumerate(raw):
        desc = text(p["short_description"] + " || " + p["description"])
        sku = p["sku"].strip()
        coffret = sku.upper().startswith("C")
        num = re.sub(r"\D", "", sku)
        name = f"Coffret N°{num}" if coffret else f"N°{num}"
        notes = notes_of(desc)
        fam = family_of(desc)
        mood = mood_of(notes, (fam or "") + " " + desc)
        minor = 10 ** p["prices"]["currency_minor_unit"]
        price, regular = int(p["prices"]["price"]) // minor, int(p["prices"]["regular_price"]) // minor
        pid = FIRST_ID + rank
        slug = slug_of(BRAND, name)
        added.append({
            "id": pid, "brand": BRAND, "name": name, "category": "parfum",
            "volume": "Coffret 25 ml EDP" if coffret else "25 ml EDP", "price": price,
            "popularity": max(1, 40 - rank // 3), "family": fam or FAMILY[mood], "mood": mood,
            "gender": gender_of(desc, text(p["name"])), "shape": shape_for(slug), "colors": PALETTE[mood],
            "notes": notes, "inspiration": inspiration_of(desc),
            "source": {"store": STORE, "url": p["permalink"], "official": True},
        })
        prices[str(pid)] = {"price": price, **({"oldPrice": regular} if regular > price else {}), "source": p["permalink"]}
        if p["images"] and not os.path.exists(f"{PHOTOS}/{slug}.webp"): photo(p["images"][0]["src"], slug)
    json.dump(catalogue + added, open(CATALOGUE, "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump(dict(sorted(prices.items(), key=lambda kv: int(kv[0]))), open(PRICES, "w"), ensure_ascii=False, separators=(",", ":"))
    print(len(added), "produits Brand Collection ajoutés")


if __name__ == "__main__":
    main()
