import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Search, ShoppingBag, X, Plus, Minus, Trash2, ShieldCheck, Truck, Wallet, MessageCircle,
  Star, ArrowRight, Instagram, SlidersHorizontal, Check, Flame, Droplets, Wind, Menu, ArrowUpRight, Phone, Clock, MapPin,
} from "lucide-react";
import {
  BRANDS, CORE_PRODUCTS as PRODUCTS, SORTS, FREE_SHIPPING_FROM, WHATSAPP_DISPLAY, WHATSAPP_NUMBER, INSTAGRAM_URL,
  fmt, waLink, scrollToId, searchable, discountOf, quickOrderLink, useCart, buildOrderMessage,
  Bottle, WhatsAppIcon, BaseStyles, MOODS, GENDER_PAGES, GENDER_LABEL, SITE_NAV, HOURS, CONTACT_SUBJECTS, DELIVERY_CITIES,
  useHashRoute, goTo, useGenderProducts, useContactForm, flushPendingSection,
} from "../shared.jsx";

/* =========================================================================
   MAQUETTE 2 — « NUIT D'ORIENT »
   Direction : luxe nocturne prune / noir, accents or et rose poudré.
   Signatures : anneau typographique rotatif, parallaxe souris, carrousel
   à glisser, vue rapide produit (transition partagée), filtres en panneau.
   ========================================================================= */

const NAV = [{ label: "Accueil", page: "accueil" }, ...SITE_NAV];

/* ---------- NAV ---------- */
function Nav({ count, onCart, onNav, route }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 30);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${scrolled ? "bg-[#1A0F18]/75 py-3 backdrop-blur-md" : "py-5"}`}>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button onClick={() => setOpen(true)} className="p-1 text-white xl:hidden" aria-label="Menu"><Menu className="h-6 w-6" /></button>
        <button onClick={() => onNav(NAV[0])} className="flex items-baseline gap-2">
          <span className="font-display whitespace-nowrap text-2xl font-semibold tracking-wide text-white sm:text-3xl">Rosa Parc</span>
          <span className="gold-text hidden text-[10px] font-semibold uppercase tracking-[.4em] sm:inline">Parfumerie</span>
        </button>
        <nav className="mx-auto hidden items-center gap-6 xl:flex">
          {NAV.slice(1).map((n) => (
            <button key={n.label} onClick={() => onNav(n)} className={`group relative whitespace-nowrap text-[12px] uppercase tracking-[.2em] transition hover:text-white ${n.page === route ? "text-[#F3D98B]" : "text-white/70"}`}>
              {n.label}
              <span className={`absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#D4AF37] transition group-hover:scale-100 ${n.page === route ? "scale-100" : "scale-0"}`} />
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <a href={waLink("Bonjour Rosa Parc Parfumerie 🌸")} target="_blank" rel="noreferrer" className="hidden h-11 w-11 place-items-center rounded-full border border-white/15 text-[#25D366] transition hover:bg-white/5 sm:grid" aria-label="WhatsApp">
            <WhatsAppIcon />
          </a>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onCart} className="relative flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#C59B27] to-[#D4AF37] px-4 text-sm font-semibold text-[#1A0F18]" aria-label="Panier">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Panier</span>
            <AnimatePresence mode="popLayout">
              <motion.span key={count} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }} className="grid h-5 min-w-5 place-items-center rounded-full bg-[#1A0F18] px-1 text-[11px] text-[#F3D98B]">
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#1A0F18] p-6 xl:hidden">
            <button onClick={() => setOpen(false)} className="self-end p-2 text-white" aria-label="Fermer"><X className="h-6 w-6" /></button>
            <div className="mt-6 flex flex-col gap-1">
              {NAV.map((n, i) => (
                <motion.button key={n.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  onClick={() => { onNav(n); setOpen(false); }} className={`font-display text-left text-4xl ${n.page === route ? "italic text-[#D4AF37]" : "text-white/90"}`}>
                  {n.label}
                </motion.button>
              ))}
            </div>
            <a href={waLink("Bonjour Rosa Parc Parfumerie 🌸")} target="_blank" rel="noreferrer" className="mt-auto flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 font-semibold text-white">
              <WhatsAppIcon /> {WHATSAPP_DISPLAY}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- HERO ---------- */
function RotatingRing({ className = "" }) {
  return (
    <motion.svg viewBox="0 0 300 300" className={className} animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} aria-hidden="true">
      <defs><path id="ring" d="M150,150 m-125,0 a125,125 0 1,1 250,0 a125,125 0 1,1 -250,0" /></defs>
      <text fontSize="13" letterSpacing="6.2" fill="#D4AF37" fontFamily="Plus Jakarta Sans, sans-serif">
        <textPath href="#ring">ROSA PARC PARFUMERIE · ORIGINAUX · ORIENTAUX · FRANÇAIS · </textPath>
      </text>
    </motion.svg>
  );
}

function Hero({ onAdd }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const bottleX = useTransform(sx, [-0.5, 0.5], [-30, 30]);
  const bottleY = useTransform(sy, [-0.5, 0.5], [-20, 20]);
  const bottleR = useTransform(sx, [-0.5, 0.5], [-6, 6]);
  const glowX = useTransform(sx, [-0.5, 0.5], ["30%", "70%"]);
  const glowY = useTransform(sy, [-0.5, 0.5], ["30%", "70%"]);
  const glow = useTransform([glowX, glowY], ([x, y]) => `radial-gradient(600px circle at ${x} ${y}, rgba(212,175,55,.18), transparent 60%)`);
  const hero = PRODUCTS[0];

  const onMove = (e) => {
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  return (
    <section id="n-accueil" onPointerMove={onMove} className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#1A0F18] pb-16 pt-28">
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#E8C5C8]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <motion.p initial={{ opacity: 0, letterSpacing: "0.1em" }} animate={{ opacity: 1, letterSpacing: "0.45em" }} transition={{ duration: 1.4 }} className="text-[11px] font-semibold uppercase text-[#E8C5C8]">
            Collection Nuit d'Orient
          </motion.p>
          <h1 className="font-display mt-5 text-5xl font-medium leading-[0.95] text-white sm:text-7xl xl:text-8xl">
            {["L'Élégance", "des Fragrances", "d'Exception"].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-2">
                <motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.2 + i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className={`block ${i === 1 ? "italic gold-text" : ""}`}>
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-6 max-w-md text-base leading-relaxed text-white/60">
            Ambres, ouds et vanilles des grandes maisons orientales et françaises. 100% originaux, livrés partout au Maroc, payés à la réception.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="mt-9 flex flex-wrap gap-3">
            <button onClick={() => scrollToId("n-catalogue")} className="shimmer group inline-flex items-center gap-3 rounded-full bg-[#F4E3E2] py-2 pl-7 pr-2 text-sm font-semibold text-[#1A0F18]">
              Découvrir la Collection
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1A0F18] text-[#F3D98B] transition-transform duration-500 group-hover:rotate-[-45deg]"><ArrowRight className="h-4 w-4" /></span>
            </button>
            <a href={waLink("Bonjour, je souhaite un conseil parfum 🌸")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:border-[#25D366]">
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Conseil WhatsApp
            </a>
          </motion.div>
        </div>

        <div className="relative order-1 mx-auto grid aspect-square w-full max-w-[340px] place-items-center sm:max-w-[460px] lg:order-2">
          <RotatingRing className="absolute inset-0 h-full w-full opacity-80" />
          <div className="absolute inset-[18%] rounded-full bg-gradient-to-b from-[#D98C4A]/30 to-transparent blur-2xl" />
          <motion.div initial={{ opacity: 0, scale: 0.7, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ x: bottleX, y: bottleY, rotate: bottleR }} className="relative h-[62%] drop-shadow-[0_40px_50px_rgba(0,0,0,.6)]">
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="h-full">
              <Bottle shape={hero.shape} colors={hero.colors} brand={hero.brand} className="h-full w-auto" />
            </motion.div>
          </motion.div>
          <motion.button initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.3 }} onClick={() => onAdd(hero)}
            className="absolute bottom-[6%] right-0 rounded-2xl border border-white/15 bg-white/10 p-3 text-left backdrop-blur-md transition hover:border-[#D4AF37] sm:right-[-4%]">
            <p className="text-[10px] uppercase tracking-[.25em] text-[#F3D98B]">Lattafa</p>
            <p className="font-display text-xl text-white">Khamrah</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-white/70">{fmt(hero.price)} <Plus className="h-4 w-4 text-[#D4AF37]" /></p>
          </motion.button>
        </div>
      </div>
    </section>
  );
}

/* ---------- RÉASSURANCE ---------- */
function Reassurance() {
  const items = [
    [ShieldCheck, "100% Authentique & Original"],
    [Truck, "Livraison rapide au Maroc"],
    [Wallet, "Paiement à la livraison"],
    [MessageCircle, "Service Client WhatsApp"],
  ];
  return (
    <section className="border-y border-[#D4AF37]/20 bg-[#140B12]">
      <div className="no-scrollbar mx-auto flex max-w-7xl gap-8 overflow-x-auto px-4 py-5 sm:px-6 lg:justify-between">
        {items.map(([Icon, t]) => (
          <div key={t} className="flex shrink-0 items-center gap-3 text-sm text-white/75">
            <Icon className="h-5 w-5 text-[#D4AF37]" /> {t}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- BESTSELLERS : carrousel à glisser ---------- */
function Bestsellers({ onOpen }) {
  const track = useRef(null);
  const [width, setWidth] = useState(0);
  const items = PRODUCTS.filter((p) => p.bestseller);
  useEffect(() => {
    const f = () => track.current && setWidth(Math.max(0, track.current.scrollWidth - track.current.parentElement.offsetWidth));
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  return (
    <section className="overflow-hidden bg-[#1A0F18] py-20">
      <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6">
        <div>
          <p className="text-[11px] uppercase tracking-[.4em] text-[#E8C5C8]">Les plus désirés</p>
          <h2 className="font-display mt-2 text-4xl text-white sm:text-6xl">Bestsellers <span className="italic text-[#D4AF37]">du moment</span></h2>
        </div>
        <p className="hidden text-sm text-white/40 sm:block">← Glissez →</p>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div ref={track} drag="x" dragConstraints={{ left: -width, right: 0 }} dragElastic={0.08} className="flex cursor-grab gap-5 active:cursor-grabbing">
          {items.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group relative h-[420px] w-[260px] shrink-0 overflow-hidden rounded-[32px] sm:w-[300px]"
              style={{ background: `linear-gradient(160deg, ${p.colors[1]}55, ${p.colors[0]}cc 70%, #1A0F18)` }}>
              <span className="font-display absolute left-5 top-4 text-7xl text-white/10">0{i + 1}</span>
              <div className="pointer-events-none absolute inset-x-0 top-10 grid h-60 place-items-center transition-transform duration-700 group-hover:-translate-y-3 group-hover:scale-110">
                <Bottle shape={p.shape} colors={p.colors} brand={p.brand} className="h-full w-auto drop-shadow-[0_30px_30px_rgba(0,0,0,.5)]" />
              </div>
              <div className="absolute inset-x-3 bottom-3 rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[.3em] text-[#F3D98B]">{p.brand}</p>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <p className="font-display text-2xl leading-tight text-white">{p.name}</p>
                  <button onClick={() => onOpen(p)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#1A0F18] transition group-hover:bg-[#D4AF37]" aria-label={`Voir ${p.name}`}>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-white/70">{fmt(p.price)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- FILTRES ---------- */
function Filters({ category, setCategory, brands, toggleBrand, clearBrands, offersOnly, setOffersOnly, sort, setSort, maxPrice, setMaxPrice, idPrefix }) {
  const counts = useMemo(() => {
    const m = {};
    PRODUCTS.forEach((p) => { if (category === "all" || p.category === category) m[p.brand] = (m[p.brand] || 0) + 1; });
    return m;
  }, [category]);
  const label = "mb-3 text-[10px] font-semibold uppercase tracking-[.3em] text-[#E8C5C8]";
  return (
    <div className="space-y-8 text-white">
      <div>
        <p className={label}>Catégorie</p>
        <div className="flex flex-col gap-1">
          {[["all", "Tous les produits"], ["parfum", "Parfums"], ["deodorant", "Déodorants"]].map(([id, l]) => (
            <button key={id} onClick={() => setCategory(id)} className="relative py-1.5 pl-5 text-left text-sm text-white/70 transition hover:text-white">
              {category === id && <motion.span layoutId={`${idPrefix}-cat-dot`} className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#D4AF37]" />}
              <span className={category === id ? "text-white" : ""}>{l}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className={label}>Trier par</p>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]">
          {SORTS.map((s) => <option key={s.id} value={s.id} className="bg-[#1A0F18]">{s.label}</option>)}
        </select>
      </div>
      <div>
        <p className={label}>Prix max · <span className="text-white">{fmt(maxPrice)}</span></p>
        <input type="range" min={35} max={650} step={5} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-[#D4AF37]" aria-label="Prix maximum" />
      </div>
      <button onClick={() => setOffersOnly(!offersOnly)} aria-pressed={offersOnly} className="flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm">
        Offres uniquement
        <span className={`relative h-6 w-11 rounded-full transition ${offersOnly ? "bg-[#D4AF37]" : "bg-white/15"}`}>
          <motion.span layout className={`absolute top-1 h-4 w-4 rounded-full bg-white ${offersOnly ? "right-1" : "left-1"}`} />
        </span>
      </button>
      <div>
        <div className="flex items-center justify-between"><p className={label}>Marques</p>{brands.length > 0 && <button onClick={clearBrands} className="mb-3 text-xs text-[#D4AF37]">Effacer</button>}</div>
        <div className="space-y-0.5">
          {BRANDS.map((b) => {
            const n = counts[b] || 0;
            const on = brands.includes(b);
            return (
              <button key={b} disabled={!n} onClick={() => toggleBrand(b)} className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left text-sm text-white/75 transition hover:bg-white/5 disabled:opacity-30">
                <span className={`grid h-4 w-4 place-items-center rounded border transition ${on ? "border-[#D4AF37] bg-[#D4AF37]" : "border-white/30"}`}>
                  {on && <Check className="h-3 w-3 text-[#1A0F18]" />}
                </span>
                <span className="flex-1">{b}</span>
                <span className="text-xs text-white/35">{n}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- CARTE PRODUIT ---------- */
const Card = React.forwardRef(function Card({ p, onOpen, onAdd }, ref) {
  const d = discountOf(p);
  return (
    <motion.article ref={ref} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="group relative flex flex-col">
      <button onClick={() => onOpen(p)} className="relative block aspect-[3/4] w-full overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[.06] to-white/[.02] text-left" aria-label={`Voir ${p.name}`}>
        <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: `radial-gradient(80% 60% at 50% 70%, ${p.colors[1]}55, transparent)` }} />
        {d > 0 && <span className="absolute left-3 top-3 z-10 rounded-full bg-[#E8C5C8] px-2.5 py-1 text-[10px] font-bold text-[#1A0F18]">-{d}%</span>}
        <div className="absolute inset-0 grid place-items-center p-8 transition-transform duration-700 group-hover:-translate-y-2 group-hover:rotate-[-4deg]">
          <Bottle shape={p.shape} colors={p.colors} brand={p.brand} className="h-full max-h-56 w-auto drop-shadow-[0_25px_25px_rgba(0,0,0,.55)]" />
        </div>
        <div className="absolute inset-x-3 bottom-3 translate-y-4 rounded-2xl bg-[#1A0F18]/80 p-3 text-[11px] leading-relaxed text-white/80 opacity-0 backdrop-blur-md transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-[#D4AF37]">Notes :</span> {p.notes.top.split(",")[0]} · {p.notes.heart.split(",")[0]} · {p.notes.base.split(",")[0]}
        </div>
      </button>
      <div className="mt-3 flex items-start justify-between gap-2 px-1">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[.25em] text-[#E8C5C8]/80">{p.brand}</p>
          <h3 className="font-display truncate text-xl text-white sm:text-2xl">{p.name}</h3>
          <p className="text-sm text-white/60">
            {fmt(p.price)} {p.oldPrice && <span className="ml-1 text-white/30 line-through">{fmt(p.oldPrice)}</span>}
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.85, rotate: 90 }} onClick={() => onAdd(p)} className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A0F18]" aria-label={`Ajouter ${p.name}`}>
          <Plus className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.article>
  );
});

/* ---------- CATALOGUE ---------- */
function Catalogue({ state, onOpen, onAdd }) {
  const { category, brands, offersOnly, sort, maxPrice, query, setQuery } = state;
  const [sheet, setSheet] = useState(false);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) =>
      (category === "all" || p.category === category) &&
      (!brands.length || brands.includes(p.brand)) &&
      (!offersOnly || p.oldPrice) && p.price <= maxPrice &&
      (!q || searchable(p).includes(q))
    ).sort(SORTS.find((s) => s.id === sort).fn);
  }, [category, brands, offersOnly, sort, maxPrice, query]);

  return (
    <section id="n-catalogue" className="scroll-mt-20 bg-[#1A0F18] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[.4em] text-[#E8C5C8]">Catalogue</p>
            <h2 className="font-display mt-2 text-5xl text-white sm:text-6xl">La Collection</h2>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher : oud, vanille, Lattafa…" aria-label="Rechercher"
                className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-base text-white outline-none placeholder:text-white/35 focus:border-[#D4AF37] sm:text-sm" />
            </div>
            <button onClick={() => setSheet(true)} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filtres
            </button>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block"><div className="sticky top-24"><Filters {...state} idPrefix="desk" /></div></aside>
          <div>
            <p className="mb-5 text-sm text-white/45">{list.length} création{list.length > 1 ? "s" : ""}</p>
            <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {list.map((p) => <Card key={p.id} p={p} onOpen={onOpen} onAdd={onAdd} />)}
              </AnimatePresence>
            </motion.div>
            {list.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-display text-3xl text-white">Aucune création ne correspond</p>
                <p className="mt-2 text-sm text-white/50">Ajustez vos filtres ou écrivez-nous sur WhatsApp.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtres mobile : bottom sheet à glisser vers le bas */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} className="fixed inset-0 z-50 bg-black/60 lg:hidden" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 280 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }} onDragEnd={(_, i) => i.offset.y > 120 && setSheet(false)}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto rounded-t-[28px] border-t border-white/10 bg-[#211420] p-6 lg:hidden">
              <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-white/20" />
              <Filters {...state} idPrefix="sheet" />
              <button onClick={() => setSheet(false)} className="mt-8 w-full rounded-full bg-[#D4AF37] py-3.5 text-sm font-semibold text-[#1A0F18]">Voir {list.length} résultat{list.length > 1 ? "s" : ""}</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------- VUE RAPIDE ---------- */
function QuickView({ p, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  useEffect(() => { setQty(1); }, [p]);
  useEffect(() => {
    if (!p) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [p, onClose]);

  return (
    <AnimatePresence>
      {p && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-end bg-black/70 backdrop-blur-sm sm:place-items-center sm:p-6" onClick={onClose}>
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={p.name}
            className="relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-[32px] border border-white/10 bg-[#211420] sm:rounded-[32px] md:grid-cols-2">
            <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white" aria-label="Fermer"><X className="h-5 w-5" /></button>
            <div className="relative grid min-h-[300px] place-items-center p-10" style={{ background: `radial-gradient(70% 60% at 50% 60%, ${p.colors[1]}66, transparent)` }}>
              <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -10, y: 30 }} animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.1 }} className="h-64 sm:h-80">
                <Bottle shape={p.shape} colors={p.colors} brand={p.brand} className="h-full w-auto drop-shadow-[0_30px_35px_rgba(0,0,0,.6)]" />
              </motion.div>
            </div>
            <div className="p-6 text-white sm:p-10">
              <p className="text-[11px] uppercase tracking-[.35em] text-[#F3D98B]">{p.brand}</p>
              <h3 className="font-display mt-2 text-4xl leading-tight">{p.name}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
                <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" /> {p.rating.toFixed(1)} · {p.family} · {p.volume}
              </p>
              <div className="mt-6 space-y-3">
                {[[Wind, "Notes de tête", p.notes.top], [Droplets, "Notes de cœur", p.notes.heart], [Flame, "Notes de fond", p.notes.base]].map(([Icon, l, v], i) => (
                  <motion.div key={l} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="flex gap-3 rounded-2xl bg-white/5 p-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                    <div><p className="text-[10px] uppercase tracking-[.2em] text-white/45">{l}</p><p className="text-sm">{v}</p></div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-semibold">{fmt(p.price)}</span>
                {p.oldPrice && <span className="text-white/35 line-through">{fmt(p.oldPrice)}</span>}
              </div>
              <div className="mt-5 flex gap-3">
                <div className="flex items-center rounded-full border border-white/15">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-12 w-11 place-items-center" aria-label="Diminuer"><Minus className="h-4 w-4" /></button>
                  <span className="w-6 text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="grid h-12 w-11 place-items-center" aria-label="Augmenter"><Plus className="h-4 w-4" /></button>
                </div>
                <button onClick={() => { onAdd(p, qty); onClose(); }} className="shimmer flex-1 rounded-full bg-gradient-to-r from-[#C59B27] to-[#D4AF37] text-sm font-semibold text-[#1A0F18]">Ajouter au panier</button>
              </div>
              <a href={quickOrderLink(p)} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-full border border-[#25D366]/50 py-3 text-sm font-semibold text-[#25D366] transition hover:bg-[#25D366] hover:text-white">
                <WhatsAppIcon className="h-4 w-4" /> Commander via WhatsApp
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- MARQUES : index typographique ---------- */
function Brands({ onPick }) {
  const [hover, setHover] = useState(null);
  const hp = hover && PRODUCTS.find((p) => p.brand === hover);
  return (
    <section id="n-marques" className="relative scroll-mt-20 overflow-hidden bg-[#F4E3E2] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-[11px] uppercase tracking-[.4em] text-[#2A1625]/60">Nos Marques Partenaires</p>
        <h2 className="font-display mt-2 text-5xl text-[#2A1625] sm:text-6xl">18 maisons d'exception</h2>
        <div className="relative mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {BRANDS.map((b, i) => (
            <motion.button key={b} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.05 }}
              onMouseEnter={() => setHover(b)} onMouseLeave={() => setHover(null)} onClick={() => onPick(b)}
              className="group flex items-center justify-between border-b border-[#2A1625]/15 py-4 text-left">
              <span className="flex items-baseline gap-4">
                <span className="text-xs text-[#2A1625]/40">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-3xl text-[#2A1625] transition-all duration-500 group-hover:translate-x-2 group-hover:italic group-hover:text-[#C59B27]">{b}</span>
              </span>
              <ArrowUpRight className="h-5 w-5 text-[#2A1625]/30 transition group-hover:rotate-45 group-hover:text-[#C59B27]" />
            </motion.button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {hp && (
          <motion.div key={hp.id} initial={{ opacity: 0, scale: 0.8, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-none fixed bottom-10 right-10 z-30 hidden h-56 w-40 lg:block">
            <Bottle shape={hp.shape} colors={hp.colors} brand={hp.brand} className="h-full w-full drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------- PANIER ---------- */
function Cart({ open, onClose, cart }) {
  const [form, setForm] = useState({ name: "", city: "", address: "", phone: "" });
  const [err, setErr] = useState(false);
  const { items, subtotal, shipping, total, setQty, remove } = cart;
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const submit = () => {
    if (!form.name.trim() || !form.city.trim() || !form.address.trim()) return setErr(true);
    window.open(waLink(buildOrderMessage(cart, form)), "_blank", "noopener");
  };
  const input = (k, ph, type = "text") => (
    <input type={type} value={form[k]} placeholder={ph} aria-label={ph} onChange={(e) => { setForm({ ...form, [k]: e.target.value }); setErr(false); }}
      className={`w-full border-b bg-transparent py-3 text-base text-white outline-none placeholder:text-white/35 sm:text-sm ${err && !form[k].trim() && k !== "phone" ? "border-red-400" : "border-white/15 focus:border-[#D4AF37]"}`} />
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 260 }}
            drag="x" dragDirectionLock dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: 0.5 }} onDragEnd={(_, i) => i.offset.x > 100 && onClose()}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-[#1A0F18] text-white" role="dialog" aria-modal="true" aria-label="Panier">
            <div className="flex items-center justify-between px-6 py-5">
              <h3 className="font-display text-3xl">Panier <span className="text-[#D4AF37]">({cart.count})</span></h3>
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/5" aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            {items.length === 0 ? (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <p className="font-display text-3xl">Votre panier est vide</p>
                  <button onClick={() => { onClose(); scrollToId("n-catalogue"); }} className="mt-5 rounded-full border border-[#D4AF37] px-6 py-3 text-sm text-[#D4AF37]">Explorer la collection</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto overscroll-contain px-6">
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <motion.div key={i.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 80 }} className="flex gap-4 border-b border-white/10 py-4">
                        <div className="h-20 w-14 shrink-0"><Bottle shape={i.shape} colors={i.colors} brand={i.brand} className="h-full w-full" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-[.25em] text-[#E8C5C8]">{i.brand}</p>
                          <p className="font-display truncate text-xl">{i.name}</p>
                          <div className="mt-2 flex items-center gap-3 text-sm">
                            <button onClick={() => setQty(i.id, i.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full border border-white/15" aria-label="Diminuer"><Minus className="h-3 w-3" /></button>
                            {i.qty}
                            <button onClick={() => setQty(i.id, i.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full border border-white/15" aria-label="Augmenter"><Plus className="h-3 w-3" /></button>
                            <span className="ml-auto">{fmt(i.price * i.qty)}</span>
                          </div>
                        </div>
                        <button onClick={() => remove(i.id)} className="self-start text-white/35 hover:text-red-400" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div className="py-6">
                    <p className="mb-1 text-[10px] uppercase tracking-[.3em] text-[#E8C5C8]">Livraison</p>
                    {input("name", "Nom complet *")}
                    {input("city", "Ville *")}
                    {input("address", "Adresse complète *")}
                    {input("phone", "Téléphone (optionnel)", "tel")}
                    {err && <p className="mt-2 text-xs text-red-400">Nom, ville et adresse sont obligatoires.</p>}
                  </div>
                </div>
                <div className="border-t border-white/10 px-6 py-5">
                  <div className="flex justify-between text-sm text-white/55"><span>Sous-total</span><span>{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-sm text-white/55"><span>Livraison</span><span>{shipping ? fmt(shipping) : "Offerte"}</span></div>
                  {subtotal < FREE_SHIPPING_FROM && <p className="mt-1 text-xs text-[#E8C5C8]">Plus que {fmt(FREE_SHIPPING_FROM - subtotal)} pour la livraison offerte</p>}
                  <div className="mt-3 flex items-baseline justify-between"><span className="font-display text-2xl">Total</span><span className="text-2xl font-semibold text-[#F3D98B]">{fmt(total)}</span></div>
                  <button onClick={submit} className="shimmer mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 text-sm font-semibold text-white">
                    <WhatsAppIcon /> Finaliser ma commande sur WhatsApp
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- FOOTER ---------- */
function Footer({ onNav }) {
  return (
    <footer className="bg-[#140B12] text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="font-display text-[18vw] leading-none text-white/[.06] sm:text-[9rem]">Rosa Parc</p>
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
          <div className="space-y-2 text-sm">
            {NAV.map((n) => <button key={n.label} onClick={() => onNav(n)} className="block hover:text-[#F3D98B]">{n.label}</button>)}
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-[10px] uppercase tracking-[.3em] text-[#E8C5C8]">Livraison</p>
            <p>Partout au Maroc en 24–72h</p>
            <p>Paiement à la livraison</p>
            <p>Offerte dès {fmt(FREE_SHIPPING_FROM)}</p>
          </div>
          <div className="space-y-3 text-sm">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#25D366]"><WhatsAppIcon className="h-4 w-4" /> {WHATSAPP_DISPLAY}</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#E8C5C8]"><Instagram className="h-4 w-4" /> @rosaparcparfumerie</a>
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-xs text-white/35">© {new Date().getFullYear()} Rosa Parc Parfumerie · Prix indicatifs en MAD</p>
      </div>
    </footer>
  );
}

/* ---------- TOAST ---------- */
function Toast({ toast }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div key={toast.key} initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#1A0F18]/90 px-5 py-2.5 text-sm text-white shadow-2xl backdrop-blur-md">
            <Check className="h-4 w-4 text-[#D4AF37]" /> {toast.name} ajouté
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* ---------- PAGES HOMME / FEMME / MIXTE ---------- */
function GenderPage({ pageKey, onOpen, onAdd }) {
  const cfg = GENDER_PAGES[pageKey];
  const g = useGenderProducts(cfg.gender);
  const hero = [...g.base].filter((p) => p.category === "parfum").sort((a, b) => b.popularity - a.popularity)[0];
  const pill = (active) => `shrink-0 rounded-full border px-4 py-2 text-xs transition ${active ? "border-[#D4AF37] bg-[#D4AF37] text-[#1A0F18]" : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"}`;

  return (
    <>
      <section className="relative overflow-hidden bg-[#1A0F18] pb-16 pt-28 sm:pt-36">
        <motion.p key={pageKey} initial={{ opacity: 0, x: -80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-display pointer-events-none absolute -bottom-8 left-0 select-none whitespace-nowrap text-[28vw] font-semibold uppercase leading-none text-transparent [-webkit-text-stroke:1px_rgba(212,175,55,.18)] lg:text-[16rem]">
          {GENDER_LABEL[cfg.gender]}
        </motion.p>
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(60% 60% at 75% 40%, ${hero?.colors[1] ?? "#D4AF37"}33, transparent)` }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[.4em] text-[#E8C5C8]">{cfg.kicker}</p>
            <h1 className="font-display mt-4 text-6xl leading-[0.95] text-white sm:text-8xl">
              {cfg.title.split(" ").map((w, i) => (
                <span key={w + pageKey} className="block overflow-hidden">
                  <motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.1 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className={`block ${i === 1 ? "italic gold-text" : ""}`}>{w}</motion.span>
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-md text-white/60">{cfg.intro}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {Object.keys(GENDER_PAGES).map((k) => (
                <button key={k} onClick={() => goTo(k)} className={`rounded-full border px-5 py-2.5 text-sm transition ${k === pageKey ? "border-[#D4AF37] text-[#F3D98B]" : "border-white/15 text-white/60 hover:text-white"}`}>
                  {GENDER_PAGES[k].title}
                </button>
              ))}
            </div>
          </div>
          {hero && (
            <motion.button key={hero.id} onClick={() => onOpen(hero)} initial={{ opacity: 0, scale: 0.8, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 14 }}
              className="group relative mx-auto grid h-72 w-72 place-items-center rounded-full border border-[#D4AF37]/25 sm:h-96 sm:w-96" aria-label={`Voir ${hero.name}`}>
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-3 rounded-full border border-dashed border-[#D4AF37]/30" />
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="h-56 drop-shadow-[0_40px_40px_rgba(0,0,0,.6)] sm:h-72">
                <Bottle shape={hero.shape} colors={hero.colors} brand={hero.brand} className="h-full w-auto transition-transform duration-700 group-hover:scale-105" />
              </motion.div>
              <span className="absolute -bottom-2 rounded-full border border-white/15 bg-[#1A0F18] px-4 py-1.5 text-xs text-white/80">N°1 · {hero.brand} {hero.name}</span>
            </motion.button>
          )}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#1A0F18] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
              <button className={pill(g.category === "all")} onClick={() => g.setCategory("all")}>Tout</button>
              <button className={pill(g.category === "parfum")} onClick={() => g.setCategory("parfum")}>Parfums</button>
              {g.hasDeo && <button className={pill(g.category === "deodorant")} onClick={() => g.setCategory("deodorant")}>Déodorants</button>}
              <span className="mx-1 w-px shrink-0 bg-white/15" />
              {g.moods.map((m) => <button key={m} className={pill(g.mood === m)} onClick={() => g.setMood(g.mood === m ? null : m)}>{MOODS[m]}</button>)}
            </div>
            <select value={g.sort} onChange={(e) => g.setSort(e.target.value)} aria-label="Trier" className="self-end rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white outline-none">
              {SORTS.map((o) => <option key={o.id} value={o.id} className="bg-[#1A0F18]">{o.label}</option>)}
            </select>
          </div>
          <p className="mt-6 text-sm text-white/45">{g.list.length} création{g.list.length > 1 ? "s" : ""}</p>
          <motion.div layout className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {g.list.map((p) => <Card key={p.id} p={p} onOpen={onOpen} onAdd={onAdd} />)}
            </AnimatePresence>
          </motion.div>

          {g.alsoMixte.length > 0 && (
            <div className="mt-20 rounded-[32px] border border-white/10 bg-white/[.03] p-6 sm:p-10">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-display text-4xl text-white">À partager <span className="italic text-[#D4AF37]">· mixtes</span></h2>
                <button onClick={() => goTo("mixte")} className="inline-flex items-center gap-2 text-sm text-[#F3D98B]">Voir les mixtes <ArrowUpRight className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                {g.alsoMixte.map((p) => <Card key={p.id} p={p} onOpen={onOpen} onAdd={onAdd} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ---------- PAGE CONTACT ---------- */
function ContactPage() {
  const c = useContactForm();
  const line = (err) => `w-full border-b bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30 sm:text-sm ${err ? "border-red-400" : "border-white/15 focus:border-[#D4AF37]"}`;
  const links = [
    [WhatsAppIcon, "WhatsApp", WHATSAPP_DISPLAY, waLink("Bonjour Rosa Parc Parfumerie 🌸")],
    [Phone, "Téléphone", "07 84 88 46 94", "tel:+212784884694"],
    [Instagram, "Instagram", "@rosaparcparfumerie", INSTAGRAM_URL],
  ];
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#1A0F18] pb-20 pt-28 sm:pt-36">
      <div className="pointer-events-none absolute -right-40 top-20 h-[32rem] w-[32rem] rounded-full bg-[#E8C5C8]/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-[11px] uppercase tracking-[.4em] text-[#E8C5C8]">Contact</p>
        <h1 className="font-display mt-4 text-6xl leading-[0.95] text-white sm:text-8xl">
          <span className="block overflow-hidden"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="block">Écrivez-nous,</motion.span></span>
          <span className="block overflow-hidden"><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="gold-text block italic">on vous répond.</motion.span></span>
        </h1>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="grid gap-x-8 sm:grid-cols-2">
              <input aria-label="Nom" value={c.form.name} onChange={(e) => c.set("name", e.target.value)} placeholder="Votre nom *" className={line(c.errors.name)} />
              <input aria-label="Ville" value={c.form.city} onChange={(e) => c.set("city", e.target.value)} placeholder="Votre ville" className={line(false)} />
            </div>
            <p className="mb-3 mt-8 text-[10px] uppercase tracking-[.3em] text-[#E8C5C8]">Sujet</p>
            <div className="flex flex-wrap gap-2">
              {CONTACT_SUBJECTS.map((s) => (
                <button key={s} onClick={() => c.set("subject", s)} className={`rounded-full border px-4 py-2 text-xs transition ${c.form.subject === s ? "border-[#D4AF37] bg-[#D4AF37] text-[#1A0F18]" : "border-white/15 text-white/70 hover:text-white"}`}>{s}</button>
              ))}
            </div>
            <textarea aria-label="Message" rows={5} value={c.form.message} onChange={(e) => c.set("message", e.target.value)} placeholder="Votre message *" className={`${line(c.errors.message)} mt-6 resize-none`} />
            {(c.errors.name || c.errors.message) && <p className="mt-2 text-xs text-red-400">Nom et message sont obligatoires.</p>}
            <button onClick={c.submit} className="shimmer group mt-8 inline-flex items-center gap-3 rounded-full bg-[#25D366] py-2 pl-7 pr-2 text-sm font-semibold text-white">
              Envoyer sur WhatsApp
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-[-45deg]"><ArrowRight className="h-4 w-4" /></span>
            </button>
            <AnimatePresence>
              {c.sent && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 text-sm text-white/70"><Check className="h-4 w-4 text-[#25D366]" /> Message prêt dans WhatsApp.</motion.p>}
            </AnimatePresence>
          </motion.div>

          <div className="space-y-6">
            <div className="divide-y divide-white/10 border-y border-white/10">
              {links.map(([Icon, l, v, href], i) => (
                <motion.a key={l} href={href} target={href.startsWith("tel") ? undefined : "_blank"} rel="noreferrer" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.08 }}
                  className="group flex items-center gap-4 py-5 text-white">
                  <Icon className="h-5 w-5 text-[#D4AF37]" />
                  <span className="flex-1"><span className="block text-[10px] uppercase tracking-[.3em] text-white/40">{l}</span><span className="font-display text-2xl">{v}</span></span>
                  <ArrowUpRight className="h-5 w-5 text-white/30 transition group-hover:rotate-45 group-hover:text-[#D4AF37]" />
                </motion.a>
              ))}
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[.03] p-6 text-white">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[.3em] text-[#E8C5C8]"><Clock className="h-4 w-4" /> Horaires</p>
              {HOURS.map(([d, h]) => <div key={d} className="mt-3 flex justify-between text-sm"><span className="text-white/55">{d}</span><span>{h}</span></div>)}
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[.03] p-6 text-white">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[.3em] text-[#E8C5C8]"><MapPin className="h-4 w-4" /> Livraison</p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{DELIVERY_CITIES.join(" · ")}</p>
              <p className="mt-3 text-xs text-[#F3D98B]">Paiement à la livraison · offerte dès {fmt(FREE_SHIPPING_FROM)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- APP ---------- */
export default function RosaParcNuit() {
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [quick, setQuick] = useState(null);
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const [category, setCategory] = useState("all");
  const [brands, setBrands] = useState([]);
  const [offersOnly, setOffersOnly] = useState(false);
  const [sort, setSort] = useState("popularity");
  const [maxPrice, setMaxPrice] = useState(650);
  const [query, setQuery] = useState("");
  const toggleBrand = (b) => setBrands((bs) => (bs.includes(b) ? bs.filter((x) => x !== b) : [...bs, b]));
  const filterState = { category, setCategory, brands, toggleBrand, clearBrands: () => setBrands([]), offersOnly, setOffersOnly, sort, setSort, maxPrice, setMaxPrice, query, setQuery };

  const add = (p, qty = 1) => {
    cart.add(p, qty);
    clearTimeout(timer.current);
    setToast({ key: Date.now(), name: `${p.brand} ${p.name}` });
    timer.current = setTimeout(() => setToast(null), 2000);
  };
  const route = useHashRoute();
  const onNav = (n) => {
    if (n.page) { goTo(n.page); if (n.page === "accueil") window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (n.category) { setCategory(n.category); setOffersOnly(false); }
    if (n.offers) { setCategory("all"); setOffersOnly(true); }
    scrollToId(`n-${n.section}`);
  };
  const closeQuick = useCallback(() => setQuick(null), []);

  return (
    <div className="font-body min-h-screen overflow-x-hidden bg-[#1A0F18] antialiased selection:bg-[#D4AF37] selection:text-[#1A0F18]">
      <BaseStyles />
      <Nav count={cart.count} onCart={() => setCartOpen(true)} onNav={onNav} route={route} />
      <main>
        <AnimatePresence mode="wait">
          <motion.div key={route} onAnimationComplete={() => route === "accueil" && flushPendingSection()} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            {route === "accueil" && (
              <>
                <Hero onAdd={add} />
                <Reassurance />
                <Bestsellers onOpen={setQuick} />
                <Catalogue state={filterState} onOpen={setQuick} onAdd={add} />
                <Brands onPick={(b) => { setCategory("all"); setBrands([b]); scrollToId("n-catalogue"); }} />
              </>
            )}
            {GENDER_PAGES[route] && <GenderPage pageKey={route} onOpen={setQuick} onAdd={add} />}
            {route === "contact" && <ContactPage />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer onNav={onNav} />
      <QuickView p={quick} onClose={closeQuick} onAdd={add} />
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />
      <Toast toast={toast} />
    </div>
  );
}
