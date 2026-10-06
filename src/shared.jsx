import React, { useEffect, useId, useMemo, useState } from "react";
import IMPORTED from "./data/catalogue.json";
import PRICES_MA from "./data/prix-maroc.json";

/* Données et utilitaires partagés par les maquettes 2 et 3. */

export const WHATSAPP_NUMBER = "212784884694";
export const WHATSAPP_DISPLAY = "+212 7 84 88 46 94";
export const INSTAGRAM_URL = "https://instagram.com/rosaparcparfumerie";
export const FREE_SHIPPING_FROM = 500;
export const SHIPPING_FEE = 35;

export const BRANDS = [
  "Afnan", "Alhambra", "Armaf", "Asdaaf", "Fragrance World", "Franck Olivier",
  "French Avenue", "Geparlys", "La Rive", "Lattafa", "Maison Asrar", "Paris Bleu",
  "Rasasi", "Rayhaan", "Riiffs", "Rue Broca", "Sistelle Paris", "Zimaya",
];

export const MOODS = {
  gourmand: "Gourmand & vanillé",
  boise: "Boisé & oriental",
  frais: "Frais & aquatique",
  floral: "Floral & fruité",
};

/* Sélection de départ (fiches enrichies à la main). Prix indicatifs en MAD.
   mood = famille simplifiée, gender = h / f / m (mixte). */
export const CORE_PRODUCTS = [
  { id: 1, brand: "Lattafa", name: "Khamrah", category: "parfum", volume: "100 ml EDP", price: 450, oldPrice: 520, rating: 4.9, popularity: 98, family: "Oriental gourmand", mood: "gourmand", gender: "m", shape: "classic", colors: ["#7A2E1F", "#D98C4A"], bestseller: true,
    notes: { top: "Cannelle, Muscade, Bergamote", heart: "Dattes, Praline, Tubéreuse", base: "Vanille, Fève Tonka, Benjoin" } },
  { id: 2, brand: "Armaf", name: "Club de Nuit Intense Man", category: "parfum", volume: "105 ml EDT", price: 520, rating: 4.8, popularity: 96, family: "Boisé fruité", mood: "frais", gender: "h", shape: "tall", colors: ["#111111", "#3D3D3D"], bestseller: true,
    notes: { top: "Citron, Ananas, Cassis", heart: "Bouleau, Jasmin, Rose", base: "Musc, Ambre gris, Patchouli" } },
  { id: 3, brand: "French Avenue", name: "Royal Blend", category: "parfum", volume: "100 ml EDP", price: 480, rating: 4.7, popularity: 88, family: "Ambré épicé", mood: "boise", gender: "m", shape: "square", colors: ["#1E2A5A", "#C59B27"], bestseller: true,
    notes: { top: "Safran, Poivre rose", heart: "Rose de Taïf, Oud", base: "Ambre, Vanille, Bois de santal" } },
  { id: 4, brand: "Afnan", name: "9PM", category: "parfum", volume: "100 ml EDP", price: 420, oldPrice: 480, rating: 4.8, popularity: 94, family: "Oriental vanillé", mood: "gourmand", gender: "h", shape: "tall", colors: ["#0E0E12", "#6B3FA0"], bestseller: true,
    notes: { top: "Pomme, Cannelle, Lavande", heart: "Fleur d'oranger, Muguet", base: "Vanille, Fève Tonka, Ambre" } },
  { id: 5, brand: "Lattafa", name: "Asad", category: "parfum", volume: "100 ml EDP", price: 350, rating: 4.6, popularity: 90, family: "Ambré boisé", mood: "gourmand", gender: "h", shape: "classic", colors: ["#1B1B1B", "#B8862B"],
    notes: { top: "Poivre noir, Tabac, Ananas", heart: "Café, Iris, Patchouli", base: "Vanille, Ambre, Benjoin" } },
  { id: 6, brand: "Rasasi", name: "Hawas for Him", category: "parfum", volume: "100 ml EDP", price: 650, rating: 4.7, popularity: 85, family: "Aquatique fruité", mood: "frais", gender: "h", shape: "round", colors: ["#2C6E91", "#9ED6E8"],
    notes: { top: "Pomme, Bergamote, Citron, Cannelle", heart: "Fleur d'oranger, Cardamome, Prune", base: "Patchouli, Ambre gris, Bois flotté, Musc" } },
  { id: 7, brand: "Alhambra", name: "Philos Pura", category: "parfum", volume: "100 ml EDP", price: 290, rating: 4.4, popularity: 76, family: "Aromatique fruité", mood: "frais", gender: "m", shape: "square", colors: ["#3A3A3A", "#BFBFBF"],
    notes: { top: "Orange, Bergamote, Citron", heart: "Notes fruitées", base: "Musc blanc, Vanille de Madagascar, Ambre" } },
  { id: 8, brand: "Maison Asrar", name: "Gentle Oud", category: "parfum", volume: "80 ml EDP", price: 350, rating: 4.5, popularity: 72, family: "Oud boisé cuiré", mood: "boise", gender: "h", shape: "round", colors: ["#3B1E12", "#A5652E"],
    notes: { top: "Lavande, Accord épicé", heart: "Notes florales, Bois, Oud", base: "Cuir, Ambre" } },
  { id: 9, brand: "Zimaya", name: "Sharaf Blend", category: "parfum", volume: "100 ml EDP", price: 430, oldPrice: 490, rating: 4.6, popularity: 80, family: "Oriental ambré", mood: "boise", gender: "m", shape: "classic", colors: ["#E8C5C8", "#C59B27"],
    notes: { top: "Bergamote, Safran", heart: "Rose, Jasmin, Oud", base: "Ambre, Vanille, Musc blanc" } },
  { id: 10, brand: "Fragrance World", name: "Barakkat Rouge 540", category: "parfum", volume: "100 ml EDP", price: 320, rating: 4.5, popularity: 92, family: "Ambré floral", mood: "floral", gender: "m", shape: "classic", colors: ["#B3122B", "#F2A5A5"], bestseller: true,
    notes: { top: "Safran, Amande amère", heart: "Jasmin d'Égypte, Cèdre", base: "Ambre gris, Musc, Notes boisées" } },
  { id: 11, brand: "Asdaaf", name: "Ameerat Al Arab", category: "parfum", volume: "100 ml EDP", price: 260, rating: 4.5, popularity: 78, family: "Floral oriental", mood: "floral", gender: "m", shape: "round", colors: ["#F4A9B8", "#FFE1E8"],
    notes: { top: "Agrumes, Bergamote", heart: "Musc blanc, Aloe vera", base: "Jasmin, Bois, Musc, Oud" } },
  { id: 12, brand: "Rue Broca", name: "Théorème Pour Homme", category: "parfum", volume: "90 ml EDP", price: 280, rating: 4.4, popularity: 70, family: "Ambré boisé", mood: "boise", gender: "h", shape: "tall", colors: ["#2A1625", "#7C5A44"],
    notes: { top: "Agrumes", heart: "Ambre, Bois", base: "Musc, Patchouli" } },
  { id: 13, brand: "Rayhaan", name: "Elixir", category: "parfum", volume: "100 ml EDP", price: 310, rating: 4.3, popularity: 66, family: "Frais fruité", mood: "frais", gender: "m", shape: "square", colors: ["#0F5C4D", "#7FD1B9"],
    notes: { top: "Ananas, Citron vert", heart: "Bouleau, Jasmin", base: "Musc, Ambre gris" } },
  { id: 14, brand: "Lattafa", name: "Yara All Over Spray", category: "deodorant", volume: "200 ml", price: 75, rating: 4.8, popularity: 95, family: "Gourmand poudré", mood: "gourmand", gender: "f", shape: "deo", colors: ["#F2B8C6", "#FCE4EC"], bestseller: true,
    notes: { top: "Orchidée, Héliotrope", heart: "Mandarine, Accord gourmand", base: "Vanille, Musc, Santal" } },
  { id: 15, brand: "Armaf", name: "Club de Nuit Intense Man Body Spray", category: "deodorant", volume: "200 ml", price: 85, rating: 4.6, popularity: 84, family: "Boisé fruité", mood: "frais", gender: "h", shape: "deo", colors: ["#121212", "#4A4A4A"],
    notes: { top: "Citron, Ananas", heart: "Bouleau, Rose", base: "Musc, Ambre gris" } },
  { id: 16, brand: "Franck Olivier", name: "Sun Java for Men", category: "parfum", volume: "75 ml EDT", price: 160, oldPrice: 190, rating: 4.4, popularity: 70, family: "Aromatique fougère", mood: "frais", gender: "h", shape: "tall", colors: ["#0B3D91", "#5AA0E6"],
    notes: { top: "Orange, Mandarine, Menthe, Bergamote", heart: "Pastèque, Géranium", base: "Vanille, Ambre, Musc, Palissandre" } },
  { id: 17, brand: "Sistelle Paris", name: "Secret de Sistelle", category: "parfum", volume: "85 ml EDP", price: 190, rating: 4.4, popularity: 66, family: "Oriental gourmand fruité", mood: "gourmand", gender: "f", shape: "round", colors: ["#8E2B4F", "#E8C5C8"],
    notes: { top: "Bergamote, Cassis, Freesia", heart: "Rose, Jasmin, Noisette", base: "Bois ambrés, Vétiver, Vanille" } },
  { id: 18, brand: "Paris Bleu", name: "Chairman Legacy", category: "parfum", volume: "100 ml EDP", price: 170, rating: 4.3, popularity: 63, family: "Boisé aromatique", mood: "boise", gender: "h", shape: "square", colors: ["#1D2B4F", "#9CC3E6"],
    notes: { top: "Bergamote, Géranium, Lavande, Ananas", heart: "Iris, Jasmin", base: "Ambre, Fève tonka, Vanille, Labdanum, Baume du Pérou" } },
  { id: 19, brand: "Geparlys", name: "Bois Noir", category: "parfum", volume: "100 ml EDP", price: 260, rating: 4.4, popularity: 65, family: "Boisé ambré fumé", mood: "boise", gender: "h", shape: "tall", colors: ["#1A1A1A", "#7C5A44"],
    notes: { top: "Accord feu de bois", heart: "Cèdre fumé", base: "Ambre, Vanille" } },
  { id: 20, brand: "Riiffs", name: "Seasons Rise", category: "parfum", volume: "100 ml EDP", price: 320, rating: 4.6, popularity: 74, family: "Floral gourmand", mood: "gourmand", gender: "m", shape: "classic", colors: ["#C46A1C", "#F3D98B"],
    notes: { top: "Fleur d'oranger, Poivre rose, Muscade, Racine d'iris", heart: "Sauge sclarée, Cannelle, Caramel, Toffee", base: "Vanille, Bois de cachemire, Ambroxan, Praline, Ambre" } },
  { id: 21, brand: "La Rive", name: "Cabana Déodorant", category: "deodorant", volume: "150 ml", price: 35, oldPrice: 45, rating: 4.0, popularity: 55, family: "Boisé épicé", mood: "boise", gender: "h", shape: "deo", colors: ["#2E7D6B", "#B6E3D4"],
    notes: { top: "Cardamome, Cannelle", heart: "Clou de girofle, Eucalyptus, Lavande", base: "Mousse, Vanille" } },
  { id: 27, brand: "Armaf", name: "Club de Nuit Woman Body Spray", category: "deodorant", volume: "200 ml", price: 85, rating: 4.6, popularity: 76, family: "Floral fruité", mood: "floral", gender: "f", shape: "deo", colors: ["#7A1F3D", "#E8A0B4"],
    notes: { top: "Bergamote, Pamplemousse, Pêche, Orange", heart: "Géranium, Jasmin, Litchi, Rose", base: "Musc, Patchouli, Vanille, Vétiver" } },
  { id: 28, brand: "La Rive", name: "Brave Man Déodorant", category: "deodorant", volume: "150 ml", price: 45, rating: 4.2, popularity: 61, family: "Aquatique boisé", mood: "frais", gender: "h", shape: "deo", colors: ["#123A5C", "#7FB2D9"],
    notes: { top: "Accords marins, Pamplemousse", heart: "Laurier, Jasmin sambac", base: "Patchouli, Ambre gris, Bois de gaïac, Mousse de chêne" } },
  { id: 22, brand: "Lattafa", name: "Yara", category: "parfum", volume: "100 ml EDP", price: 320, rating: 4.9, popularity: 97, family: "Gourmand poudré", mood: "gourmand", gender: "f", shape: "round", colors: ["#E78FA8", "#FBD3DE"], bestseller: true,
    notes: { top: "Orchidée, Héliotrope, Mandarine", heart: "Accord gourmand, Fruits tropicaux", base: "Vanille, Musc, Santal" } },
  { id: 23, brand: "Armaf", name: "Club de Nuit Woman", category: "parfum", volume: "105 ml EDP", price: 450, rating: 4.6, popularity: 82, family: "Floral fruité", mood: "floral", gender: "f", shape: "tall", colors: ["#7A1F3D", "#E8A0B4"],
    notes: { top: "Bergamote, Orange, Pamplemousse", heart: "Rose, Jasmin, Pêche", base: "Patchouli, Vanille, Musc" } },
  { id: 24, brand: "Alhambra", name: "Delilah", category: "parfum", volume: "100 ml EDP", price: 280, oldPrice: 330, rating: 4.5, popularity: 79, family: "Floral poudré", mood: "floral", gender: "f", shape: "round", colors: ["#D9A3B8", "#FFF0F4"],
    notes: { top: "Bergamote, Litchi, Rhubarbe", heart: "Pivoine, Lys sauvage, Rose", base: "Vanille, Musc blanc, Cachemire" } },
  { id: 25, brand: "Rasasi", name: "Hawas for Her", category: "parfum", volume: "100 ml EDP", price: 620, rating: 4.6, popularity: 74, family: "Fruité floral", mood: "floral", gender: "f", shape: "classic", colors: ["#C2185B", "#F8BBD0"],
    notes: { top: "Poire, Pomme, Bergamote", heart: "Fleur d'oranger, Jasmin", base: "Ambre, Musc, Vanille" } },
  { id: 26, brand: "Zimaya", name: "Fatima", category: "parfum", volume: "100 ml EDP", price: 350, rating: 4.4, popularity: 68, family: "Oriental floral", mood: "boise", gender: "f", shape: "square", colors: ["#5B1A3A", "#D4AF37"],
    notes: { top: "Safran, Framboise", heart: "Rose, Oud", base: "Ambre, Musc, Vanille" } },
];

/* ---------- Pages & routage par ancre (#/homme, #/femme, #/mixte, #/contact) ---------- */

export const GENDER_PAGES = {
  homme: {
    gender: "h", title: "Parfums Homme", kicker: "Pour lui",
    intro: "Boisés intenses, ambres épicés et fraîcheurs aquatiques : les signatures masculines les plus demandées au Maroc.",
  },
  femme: {
    gender: "f", title: "Parfums Femme", kicker: "Pour elle",
    intro: "Florales poudrées, gourmands vanillés et roses orientales : des sillages féminins élégants et tenaces.",
  },
  mixte: {
    gender: "m", title: "Parfums Mixtes", kicker: "À partager",
    intro: "Ouds, ambres et musc : des créations unisexes qui se portent avec la même élégance, pour elle comme pour lui.",
  },
};
export const GENDER_LABEL = { h: "Homme", f: "Femme", m: "Mixte" };

export const getRoute = () => {
  const r = window.location.hash.replace(/^#\/?/, "");
  if (GENDER_PAGES[r] || r === "contact") return r;
  const m = r.match(/^produit\/(\d+)$/);
  return m && PRODUCTS.some((p) => p.id === +m[1]) ? r : "accueil";
};
export const productRoute = (id) => `produit/${id}`;
export const productIdFromRoute = (route) => (route.startsWith("produit/") ? +route.split("/")[1] : null);
export function useHashRoute() {
  const [route, setRoute] = useState(getRoute);
  useEffect(() => {
    const onChange = () => { setRoute(getRoute()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
export const goTo = (route) => {
  if (route === "accueil") history.pushState(null, "", window.location.pathname + window.location.search);
  else window.location.hash = `/${route}`;
  if (route === "accueil") window.dispatchEvent(new HashChangeEvent("hashchange"));
};
/* Aller à une section de l'accueil depuis n'importe quelle page. */
export const goToSection = (_route, id) => scrollToId(id);

/* Navigation commune aux 3 maquettes. */
export const SITE_NAV = [
  { label: "Homme", page: "homme" },
  { label: "Femme", page: "femme" },
  { label: "Mixte", page: "mixte" },
  { label: "Déodorants", section: "catalogue", category: "deodorant" },
  { label: "Marques", section: "marques" },
  { label: "Offres", section: "catalogue", offers: true },
  { label: "Contact", page: "contact" },
];

export const HOURS = [
  ["Lundi – Samedi", "10h00 – 21h00"],
  ["Dimanche", "14h00 – 20h00"],
  ["WhatsApp", "Réponse 7j/7"],
];
export const CONTACT_SUBJECTS = ["Conseil parfum", "Suivi de commande", "Disponibilité d'un produit", "Commande en gros / cadeau", "Autre"];
export function buildContactMessage(f) {
  return `Bonjour Rosa Parc Parfumerie 🌸\n\nSujet : ${f.subject}\nNom : ${f.name}` + (f.city ? `\nVille : ${f.city}` : "") + `\n\n${f.message}`;
}

/* Catalogue complet = sélection de départ + collections importées des boutiques des marques
   (src/data/catalogue.json : notes extraites des fiches officielles).
   Prix en dirhams (src/data/prix-maroc.json) : prix public relevé sur sirina.ma quand le produit
   y est vendu dans la même contenance (avec son prix barré éventuel), sinon estimation recalée
   par marque sur ces prix marocains (`priceEstimate: true`). */
const withMoroccanPrice = (p) => {
  const m = PRICES_MA[p.id];
  if (!m) return p;
  const { oldPrice, ...rest } = p;
  return { ...rest, price: m.price, ...(m.oldPrice ? { oldPrice: m.oldPrice } : {}), priceEstimate: !!m.estimate, priceSource: m.source };
};
export const PRODUCTS = [...CORE_PRODUCTS, ...IMPORTED].map(withMoroccanPrice);

export const SORTS = [
  { id: "popularity", label: "Popularité", fn: (a, b) => b.popularity - a.popularity },
  { id: "price-asc", label: "Prix croissant", fn: (a, b) => a.price - b.price },
  { id: "price-desc", label: "Prix décroissant", fn: (a, b) => b.price - a.price },
  { id: "rating", label: "Mieux notés", fn: (a, b) => (b.rating || 0) - (a.rating || 0) || b.popularity - a.popularity },
];

export const fmt = (n) => `${n.toLocaleString("fr-FR")} DH`;
export const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
/* Défile vers une section ; si elle n'est pas sur la page courante, revient à l'accueil
   et défile une fois l'animation d'entrée terminée (voir flushPendingSection). */
let pendingSection = null;
export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) return el.scrollIntoView({ behavior: "smooth", block: "start" });
  pendingSection = id;
  goTo("accueil");
};
export const flushPendingSection = () => {
  if (!pendingSection) return;
  const target = document.getElementById(pendingSection);
  pendingSection = null;
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
};
export const searchable = (p) => `${p.brand} ${p.name} ${p.family} ${Object.values(p.notes).join(" ")}`.toLowerCase();
export const discountOf = (p) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
export const quickOrderLink = (p) =>
  waLink(`Bonjour Rosa Parc Parfumerie 🌸\nJe souhaite commander :\n• ${p.brand} ${p.name} (${p.volume}) — ${fmt(p.price)}\n\nMerci de me confirmer la disponibilité.`);

/* Panier : état + totaux. */
export function useCart() {
  // Panier conservé dans le navigateur entre deux visites (ignoré si le stockage est bloqué).
  const [cart, setCart] = useState(() => {
    try { return (JSON.parse(localStorage.getItem("rosa-parc:cart")) || []).filter((c) => PRODUCTS.some((p) => p.id === c.id)); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("rosa-parc:cart", JSON.stringify(cart)); } catch { /* stockage indisponible */ } }, [cart]);
  const add = (p, qty = 1) =>
    setCart((c) => {
      const found = c.find((x) => x.id === p.id);
      return found ? c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + qty } : x)) : [...c, { id: p.id, qty }];
    });
  const setQty = (id, qty) => setCart((c) => (qty <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty } : x))));
  const remove = (id) => setCart((c) => c.filter((x) => x.id !== id));
  const clear = () => setCart([]);

  const totals = useMemo(() => {
    const items = cart.map((c) => ({ ...PRODUCTS.find((p) => p.id === c.id), qty: c.qty }));
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
    return { items, subtotal, shipping, total: subtotal + shipping, count: items.reduce((s, i) => s + i.qty, 0) };
  }, [cart]);

  return { cart, add, setQty, remove, clear, ...totals };
}

export function buildOrderMessage({ items, subtotal, shipping, total }, form) {
  const lines = items.map((i) => `• ${i.qty} × ${i.brand} ${i.name} (${i.volume}) — ${fmt(i.price * i.qty)}`).join("\n");
  return (
    `Bonjour Rosa Parc Parfumerie 🌸\nJe souhaite passer la commande suivante :\n\n${lines}\n\n` +
    `Sous-total : ${fmt(subtotal)}\nLivraison : ${shipping ? fmt(shipping) : "Offerte"}\n*Total : ${fmt(total)}*\n\n` +
    `👤 Nom : ${form.name}\n📍 Ville : ${form.city}\n🏠 Adresse : ${form.address}` +
    (form.phone ? `\n📞 Téléphone : ${form.phone}` : "") +
    `\n\n💵 Paiement à la livraison. Merci !`
  );
}

/* Flacon SVG (aucune image externe). */
export function Bottle({ shape = "classic", colors = ["#E8C5C8", "#C59B27"], brand = "", className = "" }) {
  const uid = useId().replace(/:/g, "");
  const [c1, c2] = colors;
  const glass = `g-${uid}`, gold = `o-${uid}`, shine = `s-${uid}`;
  const bodies = {
    classic: <rect x="20" y="62" width="80" height="128" rx="16" fill={`url(#${glass})`} />,
    tall: <rect x="30" y="56" width="60" height="138" rx="10" fill={`url(#${glass})`} />,
    round: <ellipse cx="60" cy="132" rx="50" ry="60" fill={`url(#${glass})`} />,
    square: <path d="M18 70 L30 58 H90 L102 70 V182 L90 194 H30 L18 182 Z" fill={`url(#${glass})`} />,
    deo: <rect x="34" y="52" width="52" height="144" rx="12" fill={`url(#${glass})`} />,
  };
  const caps = {
    classic: (<><rect x="44" y="12" width="32" height="34" rx="5" fill={`url(#${gold})`} /><rect x="51" y="46" width="18" height="16" fill={`url(#${gold})`} opacity=".85" /></>),
    tall: (<><rect x="47" y="4" width="26" height="40" rx="4" fill={`url(#${gold})`} /><rect x="52" y="44" width="16" height="12" fill={`url(#${gold})`} opacity=".85" /></>),
    round: (<><circle cx="60" cy="34" r="20" fill={`url(#${gold})`} /><rect x="52" y="52" width="16" height="16" fill={`url(#${gold})`} opacity=".85" /></>),
    square: (<><path d="M38 20 L46 10 H74 L82 20 V44 H38 Z" fill={`url(#${gold})`} /><rect x="50" y="44" width="20" height="14" fill={`url(#${gold})`} opacity=".85" /></>),
    deo: (<><path d="M34 52 V30 Q34 8 60 8 Q86 8 86 30 V52 Z" fill={`url(#${gold})`} /><rect x="34" y="48" width="52" height="5" fill="#00000022" /></>),
  };
  const labelY = shape === "round" ? 120 : 112;
  return (
    <svg viewBox="0 0 120 200" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c2} stopOpacity=".95" />
          <stop offset="100%" stopColor={c1} />
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6E3A1" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9C7417" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity=".55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="197" rx="42" ry="3" fill="#000" opacity=".15" />
      {bodies[shape]}
      {caps[shape]}
      <rect x={shape === "tall" ? 36 : shape === "deo" ? 40 : 28} y="70" width="10" height="100" rx="5" fill={`url(#${shine})`} />
      <rect x="38" y={labelY} width="44" height="30" rx="3" fill="#FDF8F7" opacity=".92" />
      <text x="60" y={labelY + 13} textAnchor="middle" fontSize="7" fontFamily="Cormorant Garamond, serif" fontWeight="700" fill="#2A1625" letterSpacing="1">
        {brand.toUpperCase().slice(0, 12)}
      </text>
      <line x1="46" y1={labelY + 19} x2="74" y2={labelY + 19} stroke="#C59B27" strokeWidth=".8" />
      <text x="60" y={labelY + 25} textAnchor="middle" fontSize="4.5" fontFamily="Plus Jakarta Sans, sans-serif" fill="#2A1625" opacity=".7" letterSpacing="1.2">
        {shape === "deo" ? "DEODORANT" : "EAU DE PARFUM"}
      </text>
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.42 9.43-9.42 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.42 9.42zm8.02-17.44A11.27 11.27 0 0 0 12.05.75C5.8.75.72 5.83.72 12.08c0 2 .52 3.95 1.52 5.67L.62 23.25l5.63-1.48a11.3 11.3 0 0 0 5.4 1.37h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01z" />
    </svg>
  );
}

/* Styles communs : polices, shimmer, marquee. */
export const BaseStyles = () => (
  <style>{`
    .font-display { font-family: 'Cormorant Garamond', 'Playfair Display', serif; }
    .font-body { font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif; }
    html { scroll-behavior: smooth; }
    .shimmer { position: relative; overflow: hidden; isolation: isolate; }
    .shimmer::after { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
      background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,.45) 50%, transparent 75%);
      transform: translateX(-120%); transition: transform .9s cubic-bezier(.2,.7,.2,1); }
    .shimmer:hover::after { transform: translateX(120%); }
    .gold-text { background: linear-gradient(90deg, #C59B27, #F3D98B, #D4AF37, #C59B27); background-size: 300% 100%;
      -webkit-background-clip: text; background-clip: text; color: transparent; animation: goldflow 6s ease-in-out infinite; }
    @keyframes goldflow { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
    @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
    .marquee { animation: marquee 40s linear infinite; }
    .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { scrollbar-width: none; }
    :focus-visible:not(input):not(textarea):not(select) { outline: 2px solid #C59B27; outline-offset: 3px; }
    button, a { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
    .marquee-hover:hover .marquee { animation-play-state: paused; }
    @media (prefers-reduced-motion: reduce) { .marquee, .gold-text { animation: none; } html { scroll-behavior: auto; } }
  `}</style>
);

/* Liste filtrée d'une page genre : catégorie, ambiance, tri. */
export function useGenderProducts(gender) {
  const [category, setCategory] = useState("all");
  const [mood, setMood] = useState(null);
  const [sort, setSort] = useState("popularity");
  useEffect(() => { setCategory("all"); setMood(null); }, [gender]);

  const base = useMemo(() => PRODUCTS.filter((p) => p.gender === gender), [gender]);
  const moods = useMemo(() => Object.keys(MOODS).filter((m) => base.some((p) => p.mood === m)), [base]);
  const hasDeo = base.some((p) => p.category === "deodorant");
  const list = useMemo(
    () => base
      .filter((p) => (category === "all" || p.category === category) && (!mood || p.mood === mood))
      .sort(SORTS.find((s) => s.id === sort).fn),
    [base, category, mood, sort]
  );
  const alsoMixte = useMemo(() => (gender === "m" ? [] : PRODUCTS.filter((p) => p.gender === "m" && p.category === "parfum").slice(0, 4)), [gender]);
  return { base, list, moods, hasDeo, category, setCategory, mood, setMood, sort, setSort, alsoMixte };
}

/* Formulaire de contact envoyé sur WhatsApp. */
export function useContactForm() {
  const [form, setForm] = useState({ name: "", city: "", subject: CONTACT_SUBJECTS[0], message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: false })); setSent(false); };
  const submit = () => {
    const e = { name: !form.name.trim(), message: !form.message.trim() };
    setErrors(e);
    if (e.name || e.message) return;
    window.open(waLink(buildContactMessage(form)), "_blank", "noopener");
    setSent(true);
  };
  return { form, set, errors, submit, sent };
}

export const DELIVERY_CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan", "El Jadida", "Et partout au Maroc"];

/* ---------- Fiche produit ---------- */

/* Profil d'usage indicatif, déduit de la famille olfactive (à affiner avec le client). */
export const MOOD_PROFILE = {
  gourmand: { seasons: ["Automne", "Hiver"], moments: ["Soirée", "Occasions"], sillage: 4, tenue: 5 },
  boise: { seasons: ["Automne", "Hiver"], moments: ["Soirée", "Bureau"], sillage: 4, tenue: 5 },
  frais: { seasons: ["Printemps", "Été"], moments: ["Journée", "Sport", "Bureau"], sillage: 3, tenue: 3 },
  floral: { seasons: ["Printemps", "Été"], moments: ["Journée", "Sorties"], sillage: 3, tenue: 4 },
};
export const profileOf = (p) => {
  const base = MOOD_PROFILE[p.mood];
  return p.category === "deodorant" ? { ...base, sillage: 2, tenue: 2 } : base;
};

const FOR_GENDER = { h: "pour homme", f: "pour femme", m: "mixte" };
export const hasNotes = (p) => !!(p.notes && (p.notes.top || p.notes.heart || p.notes.base));
export const describeProduct = (p) => {
  const kind = p.category === "parfum" ? "un parfum" : "un déodorant";
  const lc = (t) => t.toLowerCase();
  const intro = `${p.brand} ${p.name} est ${kind} ${FOR_GENDER[p.gender]} de la famille ${lc(p.family)}.`;
  if (!hasNotes(p)) return `${intro} La marque ne publie pas sa pyramide olfactive détaillée : demandez-nous conseil sur WhatsApp.`;
  const parts = [];
  if (p.notes.top) parts.push(`s'ouvre sur des notes de ${lc(p.notes.top)}`);
  if (p.notes.heart) parts.push(`révèle un cœur de ${lc(p.notes.heart)}`);
  if (p.notes.base) parts.push(`laisse un sillage de ${lc(p.notes.base)}`);
  return `${intro} Il ${parts.join(", ").replace(/, ([^,]*)$/, " et $1")}.`;
};

/* Suggestions : même ambiance, genre compatible, même catégorie, puis popularité. */
export const relatedTo = (p, n = 4) =>
  PRODUCTS.filter((x) => x.id !== p.id)
    .map((x) => ({
      x,
      s: (x.mood === p.mood ? 2 : 0) + (x.gender === p.gender || x.gender === "m" ? 1 : 0) + (x.category === p.category ? 1 : 0) + x.popularity / 1000,
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((r) => r.x);

/* ---------- Photos produits ----------
   Déposez les photos dans src/assets/produits/ en les nommant d'après le slug du produit
   (ex. lattafa-khamrah.jpg, armaf-club-de-nuit-intense-man.webp). Elles remplacent
   automatiquement le flacon dessiné, sur fond blanc. Sans photo, le flacon SVG reste affiché. */
const PHOTO_FILES = import.meta.glob("./assets/produits/*.{jpg,jpeg,png,webp,avif}", { eager: true, import: "default" });
const PHOTOS = Object.fromEntries(
  Object.entries(PHOTO_FILES).map(([path, url]) => [path.split("/").pop().replace(/\.[^.]+$/, ""), url])
);
export const slugOf = (p) =>
  `${p.brand}-${p.name}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const photoOf = (p) => PHOTOS[slugOf(p)] || null;

export function ProductVisual({ p, className = "", colors }) {
  const src = photoOf(p);
  if (src) {
    // Photo officielle sur fond blanc, présentée comme une carte arrondie (lisible aussi sur les tuiles sombres).
    return <img src={src} alt={`${p.brand} ${p.name}`} loading="lazy" draggable={false} className={`${className.replace(/drop-shadow-\S+/g, "")} rounded-2xl bg-white object-contain`} />;
  }
  return <Bottle shape={p.shape} colors={colors || p.colors} brand={p.brand} className={className} />;
}
