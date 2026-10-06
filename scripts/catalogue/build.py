"""Construit le catalogue complet Rosa Parc à partir des flux Shopify des marques.

Sortie : catalogue.json (liste de produits) + images.json (slug -> URLs candidates).
"""
import json, re, html, unicodedata, hashlib

TO_USD = {"USD": 1.0, "AED": 0.2723, "EUR": 1.08, "GBP": 1.27}
MAD_PER_USD = 9.0  # prix indicatif : conversion simple, arrondie à 10 DH

def brand_lattafa(p): return "Lattafa"
def brand_fa(p):
    return "French Avenue" if "french avenue" in p["vendor"].lower() else "Fragrance World"
def brand_parisbleu(p):
    if p["vendor"] == "Cyrus & Sistelle":
        tags = " ".join(p["tags"]).lower()
        return "Sistelle Paris" if "women" in tags or "sistelle" in p["title"].lower() else "Paris Bleu"
    return "Paris Bleu"
def fixed(name): return lambda p: name

SOURCES = [
    ("lattafa-usa.com", lambda p: "lattafa" in p["vendor"].lower(), brand_lattafa, True),
    ("armaf.com", lambda p: True, fixed("Armaf"), True),
    ("afnan.com", lambda p: True, fixed("Afnan"), True),
    ("frenchavenue.com", lambda p: True, brand_fa, True),
    ("zimayaperfumes.com", lambda p: True, fixed("Zimaya"), True),
    ("rayhaanperfumes.com", lambda p: True, fixed("Rayhaan"), True),
    ("maisonasrar.com", lambda p: True, fixed("Maison Asrar"), True),
    ("geparlys.com", lambda p: True, fixed("Geparlys"), True),
    ("parisbleu.com", lambda p: p["vendor"] in ("Paris Bleu", "Cyrus & Sistelle", "Paris BLEU PARFUMS"), brand_parisbleu, True),
    ("franckolivier.fr", lambda p: True, fixed("Franck Olivier"), True),
    ("us.ruebrocaparfums.com", lambda p: True, fixed("Rue Broca"), True),
    ("maisonalhambra-usa.com", lambda p: p["vendor"] == "Maison Alhambra", fixed("Alhambra"), True),
    # Marques sans boutique officielle exploitable : revendeur (photos revendeur).
    ("beautyhouse.com", lambda p: p["vendor"] in ("Rasasi", "Asdaaf", "Riiffs", "La Rive"), lambda p: p["vendor"], False),
]

BRAND_WORDS = ["maison alhambra", "alhambra", "lattafa pride", "lattafa", "rasasi", "asdaaf", "riiffs", "la rive", "armaf",
               "afnan", "zimaya", "rayhaan", "maison asrar", "geparlys", "franck olivier", "french avenue",
               "fragrance world", "paris bleu", "rue broca", "sistelle", "yves de sistelle", "cyrus"]

EXCLUDE = re.compile(r"(gift|\bsets?\b|coffret|\bduo\b|\btrio\b|travel|\bmini\b|miniature|decant|discovery|sampler|sample|tester|"
                     r"shower|\bgel\b|lotion|soap|savon|shampoo|diffuser|room spray|air fresh|freshener|candle|bougie|hair|cheveux|"
                     r"poudre|powder|gift card|e-gift|insurance|protection|bakh?oor|bukhoor|\boils?\b|huile|cream|cr[eè]me|\bkit\b|bundle|"
                     r"\bpack\b|\d+\s?x\s?\d+|briefcase|refill|recharge|\bvial|incense|brume|\bmist\b|wipes|hand wash|body wash|"
                     r"package|\bcopy of\b|reed|car perfume|perfume for car|scented|collection \d|4 ?pcs|3 ?pcs|2 ?pcs|pieces|\+)", re.I)
DEO = re.compile(r"(deodorant|d[ée]odorant|\bdeo\b|body spray|all over spray|all-over spray|perfume body spray|anti-?perspirant|roll[ -]on|perfumed stick|\bstick\b)", re.I)

NOTE_FR = {
    "bergamot": "Bergamote", "lemon": "Citron", "lime": "Citron vert", "orange": "Orange", "mandarin": "Mandarine", "mandarin orange": "Mandarine",
    "grapefruit": "Pamplemousse", "pink pepper": "Poivre rose", "black pepper": "Poivre noir", "pepper": "Poivre", "saffron": "Safran",
    "cinnamon": "Cannelle", "cardamom": "Cardamome", "nutmeg": "Muscade", "clove": "Clou de girofle", "cloves": "Clou de girofle", "ginger": "Gingembre",
    "lavender": "Lavande", "mint": "Menthe", "sage": "Sauge", "clary sage": "Sauge sclarée", "rosemary": "Romarin", "basil": "Basilic",
    "apple": "Pomme", "pear": "Poire", "pineapple": "Ananas", "peach": "Pêche", "plum": "Prune", "cherry": "Cerise", "raspberry": "Framboise",
    "strawberry": "Fraise", "blackcurrant": "Cassis", "black currant": "Cassis", "cassis": "Cassis", "lychee": "Litchi", "litchi": "Litchi",
    "coconut": "Noix de coco", "melon": "Melon", "watermelon": "Pastèque", "fig": "Figue", "mango": "Mangue", "passion fruit": "Fruit de la passion",
    "rose": "Rose", "turkish rose": "Rose de Turquie", "damask rose": "Rose de Damas", "taif rose": "Rose de Taïf", "jasmine": "Jasmin",
    "jasmine sambac": "Jasmin sambac", "tuberose": "Tubéreuse", "orange blossom": "Fleur d'oranger", "neroli": "Néroli", "iris": "Iris",
    "violet": "Violette", "peony": "Pivoine", "lily": "Lys", "lily of the valley": "Muguet", "magnolia": "Magnolia", "freesia": "Freesia",
    "orchid": "Orchidée", "geranium": "Géranium", "ylang-ylang": "Ylang-ylang", "ylang ylang": "Ylang-ylang", "gardenia": "Gardénia", "heliotrope": "Héliotrope",
    "vanilla": "Vanille", "madagascar vanilla": "Vanille de Madagascar", "tonka bean": "Fève tonka", "tonka": "Fève tonka", "caramel": "Caramel",
    "praline": "Praline", "honey": "Miel", "chocolate": "Chocolat", "cocoa": "Cacao", "coffee": "Café", "almond": "Amande", "bitter almond": "Amande amère",
    "hazelnut": "Noisette", "toffee": "Toffee", "sugar": "Sucre", "milk": "Lait", "benzoin": "Benjoin", "dates": "Dattes", "date": "Datte",
    "amber": "Ambre", "ambergris": "Ambre gris", "grey amber": "Ambre gris", "ambroxan": "Ambroxan", "musk": "Musc", "white musk": "Musc blanc",
    "oud": "Oud", "agarwood": "Oud", "agarwood (oud)": "Oud", "sandalwood": "Santal", "cedar": "Cèdre", "cedarwood": "Cèdre", "vetiver": "Vétiver",
    "patchouli": "Patchouli", "leather": "Cuir", "tobacco": "Tabac", "incense": "Encens", "frankincense": "Encens", "myrrh": "Myrrhe",
    "labdanum": "Labdanum", "oakmoss": "Mousse de chêne", "moss": "Mousse", "guaiac wood": "Bois de gaïac", "cashmere wood": "Bois de cachemire",
    "cashmeran": "Cachemire", "woody notes": "Notes boisées", "woods": "Bois", "wood": "Bois", "driftwood": "Bois flotté", "birch": "Bouleau",
    "pine": "Pin", "fir": "Sapin", "papyrus": "Papyrus", "marine notes": "Notes marines", "sea notes": "Notes marines", "aquatic notes": "Notes aquatiques",
    "ozonic notes": "Notes ozoniques", "green notes": "Notes vertes", "fruity notes": "Notes fruitées", "spicy notes": "Notes épicées", "elemi": "Élémi",
    "rum": "Rhum", "whiskey": "Whisky", "cognac": "Cognac", "tea": "Thé", "green tea": "Thé vert", "aldehydes": "Aldéhydes", "powdery notes": "Notes poudrées",
}

MOOD_WORDS = {
    "gourmand": ["vanill", "caramel", "praline", "tonka", "honey", "miel", "chocolat", "cocoa", "cacao", "coffee", "café", "sugar", "sucre", "toffee", "candy", "gourmand", "dates", "dattes", "almond", "amande", "milk"],
    "boise": ["oud", "wood", "bois", "leather", "cuir", "amber", "ambre", "incense", "encens", "saffron", "safran", "tobacco", "tabac", "patchouli", "sandal", "santal", "cedar", "cèdre", "vetiver", "vétiver", "oriental", "smok"],
    "frais": ["citrus", "agrume", "bergamot", "bergamote", "lemon", "citron", "marine", "aquatic", "aquatique", "sea", "mint", "menthe", "lavender", "lavande", "fresh", "frais", "grapefruit", "pamplemousse", "ozonic", "green", "vert", "pineapple", "ananas", "apple", "pomme"],
    "floral": ["rose", "jasmin", "floral", "flower", "fleur", "peony", "pivoine", "tuberose", "tubéreuse", "iris", "violet", "violette", "lily", "lys", "magnolia", "freesia", "orchid", "orchidée", "fruity", "fruité", "berry", "peach", "pêche", "lychee", "litchi", "pear", "poire"],
}
FAMILY = {"gourmand": "Oriental gourmand", "boise": "Boisé oriental", "frais": "Frais aromatique", "floral": "Floral fruité"}
PALETTE = {"gourmand": ["#7A2E1F", "#D98C4A"], "boise": ["#2A1625", "#B8862B"], "frais": ["#1D4E89", "#9CC3E6"], "floral": ["#C2185B", "#F8BBD0"]}

def text(h): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h or ""))).strip()

def slugify(s):
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", s))

def clean_name(title, brand, is_deo):
    t = title.strip()
    low = t.lower()
    for b in sorted(BRAND_WORDS, key=len, reverse=True):
        if low.startswith(b + " "):
            t = t[len(b):].strip(" -–|:"); low = t.lower()
    spray = "" if is_deo else "spray|"
    pat = re.compile(r"[\s\-–|,:(]*(eau de parfum|eau de toilette|extrait de parfum|extrait|parfum|perfume|edp|edt|" + spray + r"\d+(\.\d+)?( ?oz| can)?|"
                     r"for (men|women|everyone|unisex|her|him|man|woman)|pour (homme|femme)|unisex|\d+(\.\d+)?\s?(ml|oz|fl ?oz)|\)|"
                     r"by [a-z &]+)$", re.I)
    for _ in range(8):
        t2 = pat.sub("", t).strip(" -–|,:(")
        if t2 == t: break
        t = t2
    if not t: t = title
    if t.isupper() or t.islower():
        small = {"de", "du", "des", "la", "le", "les", "et", "of", "the", "al", "el", "for", "pour", "a", "à"}
        t = " ".join(w.lower() if (i and w.lower() in small) else (w[:1].upper() + w[1:].lower()) for i, w in enumerate(t.split()))
    else:
        t = re.sub(r"\b(DE|DU|LA|LE|DES|ET|OF|THE|FOR)\b", lambda m: m.group(0).lower(), t)
    if is_deo and not DEO.search(t):
        t += " Déodorant"
    return t

def gender_of(p, body):
    s = " ".join([p["title"], p["product_type"], " ".join(p["tags"])]).lower()
    f = re.search(r"\b(women|woman|femme|her|ladies|lady|girl)\b", s)
    m = re.search(r"\b(men|man|homme|him|gentleman|king)\b", s)
    if re.search(r"\b(unisex|everyone|mixte|unisexe)\b", s) or (f and m): return "m"
    if f: return "f"
    if m: return "h"
    b = body.lower()
    if re.search(r"\bfor (women|her)\b|pour femme|feminine|féminin", b): return "f"
    if re.search(r"\bfor (men|him)\b|pour homme|masculine|masculin", b): return "h"
    return "m"

def ml_of(s):
    m = re.search(r"(\d+(?:[.,]\d+)?)\s?ml", s, re.I)
    if m: return float(m.group(1).replace(",", "."))
    m = re.search(r"(\d+(?:[.,]\d+)?)\s?(?:fl\.?\s?)?oz", s, re.I)
    if m: return round(float(m.group(1).replace(",", ".")) * 29.57)
    return None

def pick_variant(p, is_deo):
    best = None
    for v in p["variants"]:
        ml = ml_of(v["title"]) or ml_of(p["title"])
        score = abs((ml or 100) - (200 if is_deo else 100))
        if ml and ml < 20: score += 1000
        if best is None or score < best[0]: best = (score, v, ml)
    return best[1], best[2]

def split_notes(s):
    out = []
    for n in re.split(r",|;|•| and | et |/|\||&", s):
        n = n.strip(" .:-*·()")
        if not n or len(n) > 32 or len(n.split()) > 4: continue
        if re.search(r"\b(with|burst|starts?|opens?|blend|creat|which|that|this|while|into|gives?|adds?|leav|reveal|notes?|accords? of|is|are|a|the|its)\b", n, re.I) and n.lower() not in NOTE_FR: continue
        fr = NOTE_FR.get(n.lower())
        out.append(fr or n[:1].upper() + n[1:])
    seen, res = set(), []
    for n in out:
        if n.lower() not in seen: seen.add(n.lower()); res.append(n)
    return ", ".join(res[:6]) if len(res) >= 1 else ""

def extract_notes(body):
    pats = {
        "top": r"(?:top|head|opening)\s*notes?\s*(?:are|is|include|of)?\s*[:\-–]?\s*(.+?)(?=(?:heart|middle|mid|base)\s*notes?|notes? de c|$)",
        "heart": r"(?:heart|middle|mid)\s*notes?\s*(?:are|is|include|of)?\s*[:\-–]?\s*(.+?)(?=(?:base|bottom)\s*notes?|notes? de fond|$)",
        "base": r"(?:base|bottom|dry ?down)\s*notes?\s*(?:are|is|include|of)?\s*[:\-–]?\s*(.+?)(?=\.\s|available|size|$)",
    }
    fr = {
        "top": r"(?:notes? de t[êe]te|t[êe]te)\s*[:\-–]\s*(.+?)(?=(?:notes? de )?c(?:œ|oe)ur|$)",
        "heart": r"(?:notes? de c(?:œ|oe)ur|c(?:œ|oe)ur)\s*[:\-–]\s*(.+?)(?=(?:notes? de )?fond|$)",
        "base": r"(?:notes? de fond|fond)\s*[:\-–]\s*(.+?)(?=\.\s|$)",
    }
    res = {}
    for k in ("top", "heart", "base"):
        m = re.search(pats[k], body, re.I) or re.search(fr[k], body, re.I)
        if m:
            val = split_notes(m.group(1)[:220])
            if val: res[k] = val
    if len(res) < 2: return None
    return {k: res.get(k, "") for k in ("top", "heart", "base")}

def mood_of(notes, body):
    s = ((" ".join(notes.values()) if notes else "") + " " + body[:600]).lower()
    scores = {m: sum(s.count(w) for w in ws) for m, ws in MOOD_WORDS.items()}
    return max(scores, key=scores.get) if any(scores.values()) else "boise"

def conc_of(p, body):
    s = (p["title"] + " " + p["product_type"] + " " + body[:300]).lower()
    if "extrait" in s: return "Extrait"
    if "eau de toilette" in s or re.search(r"\bedt\b", s): return "EDT"
    return "EDP"

def shape_for(slug):
    return ["classic", "tall", "round", "square"][int(hashlib.md5(slug.encode()).hexdigest(), 16) % 4]

def build(curated_keys):
    products, images, seen, stats, ratios = [], {}, set(), {}, {}
    pid = 100
    for store, keep, brand_fn, official in SOURCES:
        d = json.load(open(f"{store}.json"))
        cur = d["currency"] or "USD"
        ps = d["products"]
        if store == "parisbleu.com":  # doublons par pays : préférer France, puis International
            ps = sorted(ps, key=lambda p: 0 if "France" in p["tags"] else (1 if "International" in p["tags"] else 2))
        for rank, p in enumerate(ps):
            if not keep(p) or not p.get("images") or not p.get("variants"): continue
            if EXCLUDE.search(p["title"]) or EXCLUDE.search(p["product_type"] or ""): continue
            body = text(p.get("body_html"))
            is_deo = bool(DEO.search(f'{p["title"]} {p["product_type"]} {p["handle"]}'))
            brand = brand_fn(p)
            name = clean_name(p["title"], brand, is_deo)
            key = (brand.lower(), slugify(name))
            if key in curated_keys:
                try:
                    v0, _ = pick_variant(p, is_deo)
                    raw = float(v0["price"]) * TO_USD.get(cur, 1) * MAD_PER_USD
                    if raw > 0: ratios.setdefault(store, []).append(curated_keys[key] / raw)
                except Exception: pass
                continue
            if key in seen: continue
            v, ml = pick_variant(p, is_deo)
            try: price_src = float(v["price"])
            except Exception: continue
            if price_src <= 0 or (ml and ml < 20): continue
            seen.add(key)
            price = price_src * TO_USD.get(cur, 1) * MAD_PER_USD  # brut, calibré plus bas
            notes = extract_notes(body)
            mood = mood_of(notes, body)
            vol = f"{int(ml)} ml" if ml else ("200 ml" if is_deo else "100 ml")
            if not is_deo: vol += " " + conc_of(p, body)
            slug = slugify(f"{brand}-{name}")
            products.append({
                "id": pid, "brand": brand, "name": name, "category": "deodorant" if is_deo else "parfum", "volume": vol,
                "price": price, "popularity": max(1, 50 - rank // 4), "family": FAMILY[mood], "mood": mood, "gender": gender_of(p, body),
                "shape": "deo" if is_deo else shape_for(slug), "colors": PALETTE[mood],
                "notes": notes or {"top": "", "heart": "", "base": ""},
                "source": {"store": store, "url": f"https://{store}/products/{p['handle']}", "official": official},
            })
            images[slug] = [i["src"] for i in p["images"][:4]]
            stats[brand] = stats.get(brand, 0) + 1
            pid += 1
    import statistics
    factor = {st: min(1.5, max(0.3, statistics.median(r))) for st, r in ratios.items()}
    for p in products:
        f = factor.get(p["source"]["store"], 1.0)
        p["price"] = max(40, int(round(p["price"] * f / 10.0)) * 10)
    print("calibration prix par boutique:", {k: round(v, 2) for k, v in factor.items()})
    # Garde-fou : un prix > 3x la médiane de la marque est ramené à 2x la médiane (erreur de flux probable).
    by_brand = {}
    for p in products: by_brand.setdefault(p["brand"], []).append(p["price"])
    med = {b: statistics.median(v) for b, v in by_brand.items()}
    for p in products:
        if p["price"] > 3 * med[p["brand"]]:
            p["price"] = int(round(2 * med[p["brand"]] / 10.0)) * 10
    return products, images, stats

if __name__ == "__main__":
    raw = json.load(open("curated_raw.json"))
    keys = {}
    for b, n, c, price in raw:
        for nm in (n, clean_name(n, b, c == "deodorant")):
            keys[(b.lower(), slugify(nm))] = price
    keys[("afnan", "9-pm")] = 420; keys[("rasasi", "hawas")] = 650
    products, images, stats = build(keys)
    json.dump(products, open("catalogue.json", "w"), ensure_ascii=False, indent=0)
    json.dump(images, open("images.json", "w"), indent=0)
    print(len(products), "produits importés")
    for b, n in sorted(stats.items(), key=lambda x: -x[1]): print(f"  {b}: {n}")
    print("avec notes:", sum(1 for p in products if p["notes"]["top"] or p["notes"]["base"]), "| déodorants:", sum(1 for p in products if p["category"] == "deodorant"))
