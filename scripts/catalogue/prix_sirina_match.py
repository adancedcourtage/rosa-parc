import json, html, re, unicodedata, sys, collections
S = sys.argv[1]
sir = json.load(open(f"{S}/all.json")); ours = json.load(open(f"{S}/ours_full.json"))
FEM = re.compile(r"\b(women|woman|femme|her|lady|pour elle)\b", re.I); MASC = re.compile(r"\b(men|man|homme|him|pour lui|uomo)\b", re.I)
def explicit_gender(name):
    f, m = bool(FEM.search(name)), bool(MASC.search(name))
    return "f" if f and not m else "h" if m and not f else None
POUR = {"Homme": "h", "Femme": "f", "Mixte": "m", "Unisexe": "m"}
BRAND = {"Maison Alhambra": "Alhambra", "Asrar": "Maison Asrar", "Cyrus": "Paris Bleu", "Sistelle": "Sistelle Paris", "Johan B": "Geparlys", "Gemina B": "Geparlys"}
GROUP = {"French Avenue": "FW", "Fragrance World": "FW", "Paris Bleu": "PB", "Sistelle Paris": "PB"}
OUR_BRANDS = {p["brand"] for p in ours}
def norm(s):
    s = unicodedata.normalize("NFKD", html.unescape(s)).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"\b(eau de parfum|eau de toilette|extrait de parfum|parfum|edp|edt|perfume|spray|vaporisateur|for men|for women|pour homme|pour femme|homme|femme|men|women|unisex|mixte|by)\b", " ", s)
    s = re.sub(r"\d+\s*(ml|ML)\b", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(s.split())
def ml(s):
    m = re.search(r"(\d+(?:[.,]\d+)?)\s*ml", (s or "").lower()); return round(float(m.group(1).replace(",", "."))) if m else None
DEO = re.compile(r"deo|déo|body spray|anti|roll", re.I)
idx = collections.defaultdict(list); skipped = collections.Counter()
for p in sir:
    attrs = {a["name"]: [t["name"] for t in a["terms"]] for a in p["attributes"]}
    brand = html.unescape((attrs.get("Marque") or ["?"])[0]); brand = BRAND.get(brand, brand)
    cats = " ".join(c["name"] for c in p["categories"])
    name = html.unescape(p["name"])
    if re.search(r"coffret|miniature|set\b|gift|échantillon|testeur|tester", name + " " + cats, re.I): skipped["coffret"] += 1; continue
    if brand not in OUR_BRANDS: skipped["autre marque"] += 1; continue
    if not p["is_in_stock"] and False: pass
    base = re.sub(re.escape(html.unescape((attrs.get("Marque") or [""])[0])), " ", name, flags=re.I)
    base = re.sub(r"[–-]\s*$|^\s*[–-]", " ", base.strip())
    pr = p["prices"]; price = int(pr["price"]) // 100; reg = int(pr["regular_price"] or 0) // 100
    if price <= 0: skipped["sans prix"] += 1; continue
    idx[(GROUP.get(brand, brand), norm(base))].append({"price": price, "reg": reg, "ml": ml(" ".join(attrs.get("Taille", [])) or name), "deo": bool(DEO.search(name + " " + cats)), "url": p["permalink"], "name": name, "stock": p["is_in_stock"], "eg": explicit_gender(name), "pour": [POUR[x] for x in attrs.get("Pour", []) if x in POUR]})
out = {}; unmatched = []
for o in ours:
    cands = idx.get((GROUP.get(o["brand"], o["brand"]), norm(o["name"])), [])
    odeo = o["category"] == "deodorant"; oml = ml(o["volume"])
    oeg = explicit_gender(o["name"])
    cands = [c for c in cands if not (c["eg"] and c["eg"] != o["gender"]) and not (oeg and c["pour"] and oeg not in c["pour"])]
    cands = [c for c in cands if c["deo"] == odeo and (c["ml"] is None or oml is None or abs(c["ml"] - oml) <= 6)]
    if not cands: continue
    c = min(cands, key=lambda c: c["price"])
    out[o["id"]] = {"price": c["price"], **({"oldPrice": c["reg"]} if c["reg"] > c["price"] else {}), "url": c["url"], **({"gender": c["pour"][0]} if len(c["pour"]) == 1 else {"gender": "m"} if len(c["pour"]) > 1 else {})}
print("index sirina (marques communes):", sum(len(v) for v in idx.values()), dict(skipped))
print("produits appariés:", len(out), "/", len(ours))
by = collections.Counter(o["brand"] for o in ours if o["id"] in out); print(by.most_common())
ch = [(o["brand"], o["name"], o["price"], out[o["id"]]["price"]) for o in ours if o["id"] in out]
import statistics; print("ratio médian sirina/nous:", round(statistics.median(b/a for *_, a, b in ch), 2))
for r in ch[:25]: print(r)
json.dump(out, open(f"{S}/prix.json", "w"), ensure_ascii=False)
