import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Search, ShoppingBag, X, Plus, Minus, Trash2, ShieldCheck, Truck, Wallet, MessageCircle,
  Star, ArrowRight, ArrowLeft, Instagram, Check, ChevronDown, Sparkles, Wand2, RotateCcw, Percent, Menu, Phone, Clock, MapPin, Eye,
} from "lucide-react";
import {
  BRANDS, PRODUCTS, SORTS, MOODS, FREE_SHIPPING_FROM, SHIPPING_FEE, WHATSAPP_DISPLAY, WHATSAPP_NUMBER, INSTAGRAM_URL,
  fmt, waLink, scrollToId, searchable, discountOf, quickOrderLink, useCart, buildOrderMessage,
  Bottle, ProductVisual, photoOf, WhatsAppIcon, BaseStyles, GENDER_PAGES, GENDER_LABEL, SITE_NAV, HOURS, CONTACT_SUBJECTS, DELIVERY_CITIES,
  useHashRoute, goTo, useGenderProducts, useContactForm, flushPendingSection,
  productRoute, productIdFromRoute, profileOf, describeProduct, relatedTo, hasNotes,
} from "./shared.jsx";
import {
  ScrollProgress, Reveal, SplitWords, CountUp, Magnetic, useSpotlight, useFlyToCart, BackToTop, SearchOverlay, useSearchShortcut, pushRecent, useRecent,
} from "./fx.jsx";

/* =========================================================================
   MAQUETTE 3 — « ATELIER ROSE »
   Direction : clair, éditorial, grille bento rose poudré.
   Signatures : quiz olfactif, cartes qui se retournent (notes au verso),
   barre panier flottante + checkout en 3 étapes.
   ========================================================================= */

const NAV = [{ label: "Accueil", page: "accueil" }, ...SITE_NAV];
const navItem = (label) => NAV.find((n) => n.label === label);

/* ---------- BANDEAU + NAV ---------- */
function TopBar() {
  const msgs = ["Livraison offerte dès 500 DH", "Paiement à la livraison partout au Maroc", "100% originaux", "Commande express sur WhatsApp"];
  const row = [...msgs, ...msgs, ...msgs, ...msgs];
  return (
    <div className="overflow-hidden bg-[#2A1625] py-2 text-[11px] uppercase tracking-[.25em] text-[#F4E3E2]">
      <div className="marquee flex w-max gap-10">
        {row.map((m, i) => <span key={i} className="flex items-center gap-10 whitespace-nowrap">{m}<Sparkles className="h-3 w-3 text-[#D4AF37]" /></span>)}
      </div>
    </div>
  );
}

function Nav({ count, onCart, onNav, onSearch, route }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`sticky top-0 z-40 border-b bg-[#FDF8F7]/80 backdrop-blur-md transition-shadow duration-300 ${scrolled ? "border-[#E8C5C8] shadow-[0_10px_30px_-20px_rgba(42,22,37,.35)]" : "border-[#E8C5C8]/60"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center xl:hidden" aria-label={open ? "Fermer le menu" : "Menu"} aria-expanded={open}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? "x" : "m"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              {open ? <X className="h-5 w-5 text-[#2A1625]" /> : <Menu className="h-5 w-5 text-[#2A1625]" />}
            </motion.span>
          </AnimatePresence>
        </button>
        <nav className="hidden flex-1 items-center gap-5 xl:flex">
          {NAV.slice(1).map((n) => (
            <button key={n.label} onClick={() => onNav(n)} className={`group relative text-sm transition hover:text-[#2A1625] ${n.page === route ? "font-semibold text-[#2A1625]" : "text-[#2A1625]/65"}`}>
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#C59B27] transition-transform duration-300 group-hover:scale-x-100" />
              {n.page === route && <motion.span layoutId="a-nav-dot" className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#C59B27]" />}
            </button>
          ))}
        </nav>
        <button onClick={() => onNav(NAV[0])} className="flex flex-1 flex-col items-center leading-none xl:flex-none">
          <span className="font-display text-2xl font-semibold italic text-[#2A1625]">Rosa Parc</span>
          <span className="text-[8px] font-semibold uppercase tracking-[.5em] text-[#C59B27]">Parfumerie</span>
        </button>
        <div className="flex flex-1 items-center justify-end gap-2">
          <a href={waLink("Bonjour Rosa Parc Parfumerie 🌸")} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full border border-[#2A1625]/15 px-4 py-2 text-sm text-[#2A1625] transition hover:border-[#25D366] sm:inline-flex">
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> 07 84 88 46 94
          </a>
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }} onClick={onSearch} className="grid h-10 w-10 place-items-center rounded-full text-[#2A1625] transition-colors hover:bg-[#F4E3E2]" aria-label="Rechercher (⌘K)">
            <Search className="h-5 w-5" />
          </motion.button>
          <button id="cart-target" onClick={onCart} className="relative grid h-10 w-10 place-items-center rounded-full bg-[#F4E3E2] text-[#2A1625] transition-colors hover:bg-[#E8C5C8]" aria-label="Panier">
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: [1.5, 1] }} exit={{ scale: 0 }} className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#C59B27] px-1 text-[10px] font-bold text-white">{count}</motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0, transition: { duration: 0.25 } }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden border-t border-[#E8C5C8]/60 xl:hidden">
            <motion.div initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }} className="py-2">
              {NAV.map((n) => (
                <motion.button key={n.label} variants={{ hide: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }} onClick={() => { onNav(n); setOpen(false); }}
                  className={`flex w-full items-center justify-between px-6 py-2.5 text-left font-display text-2xl ${n.page === route ? "italic text-[#C59B27]" : "text-[#2A1625]"}`}>
                  {n.label} <ArrowRight className="h-4 w-4 opacity-30" />
                </motion.button>
              ))}
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- HERO BENTO ---------- */
function Tile({ className = "", children, delay = 0, onClick, as = "div", ...rest }) {
  const Comp = as === "button" ? motion.button : motion.div;
  return (
    <Comp initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }} whileTap={as === "button" ? { scale: 0.98 } : undefined} onClick={onClick} {...rest}
      className={`group relative overflow-hidden rounded-[28px] text-left ${className}`}>
      {children}
    </Comp>
  );
}

function TiltBottle({ p, className = "" }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 15 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-16, 16]), { stiffness: 150, damping: 15 });
  return (
    <motion.div style={{ perspective: 800 }} className={className}
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left) / r.width - 0.5); y.set((e.clientY - r.top) / r.height - 0.5); }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      <motion.div style={{ rotateX: rx, rotateY: ry }} animate={{ y: [0, -10, 0] }} transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }} className="flex h-full items-center justify-center">
        <ProductVisual p={p} className="h-full w-auto drop-shadow-[0_30px_30px_rgba(0,0,0,.35)]" />
      </motion.div>
    </motion.div>
  );
}

function HeroBento({ onQuiz, onNav, onAdd }) {
  const star = PRODUCTS.find((p) => p.id === 4);
  const deo = PRODUCTS.find((p) => p.id === 14);
  const deoFrom = Math.min(...PRODUCTS.filter((p) => p.category === "deodorant").map((p) => p.price));
  const offers = PRODUCTS.filter((p) => p.oldPrice).sort((a, b) => b.popularity - a.popularity);
  const maxDiscount = Math.max(0, ...offers.map(discountOf));
  const spot = useSpotlight();
  return (
    <section id="a-accueil" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-10 pt-6 sm:px-6">
      <div className="grid auto-rows-[minmax(150px,auto)] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Tile {...spot.handlers} className="col-span-2 row-span-2 flex flex-col justify-between gap-8 bg-gradient-to-br from-[#F4E3E2] via-[#FDF8F7] to-[#E8C5C8] p-7 sm:p-10">
          {spot.layer}
          <motion.div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#F3D98B]/40 blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity }} />
          <motion.span initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs text-[#2A1625] backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#25D366]" /> Conseillère disponible sur WhatsApp
          </motion.span>
          <div className="relative">
            <h1 className="font-display text-[2.6rem] leading-[1] text-[#2A1625] sm:text-6xl lg:text-7xl">
              <SplitWords text="L'Élégance des Fragrances" delay={0.15} /> <em className="text-[#C59B27]"><SplitWords text="d'Exception" delay={0.45} /></em>
            </h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="mt-4 max-w-md text-sm text-[#2A1625]/65 sm:text-base">Parfums & déodorants originaux, orientaux et français. Livrés chez vous partout au Maroc.</motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.6 }} className="mt-6 flex flex-wrap gap-3">
              <Magnetic>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => scrollToId("a-catalogue")} className="shimmer group/cta inline-flex items-center gap-2 rounded-full bg-[#2A1625] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(42,22,37,.7)]">
                  Découvrir la Collection <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                </motion.button>
              </Magnetic>
              <Magnetic strength={0.2}>
                <motion.button whileTap={{ scale: 0.96 }} onClick={onQuiz} className="group/quiz inline-flex items-center gap-2 rounded-full border border-[#2A1625]/20 bg-white/60 px-5 py-3.5 text-sm font-semibold text-[#2A1625] transition-colors hover:bg-white">
                  <Wand2 className="h-4 w-4 text-[#C59B27] transition-transform group-hover/quiz:-rotate-12" /> Trouver mon parfum
                </motion.button>
              </Magnetic>
            </motion.div>
          </div>
        </Tile>

        <Tile delay={0.1} className="row-span-2 flex flex-col bg-[#2A1625] p-5 text-white">
          <span className="text-[10px] uppercase tracking-[.3em] text-[#F3D98B]">N°1 des ventes</span>
          <TiltBottle p={star} className="my-4 h-48 flex-1 sm:h-56" />
          <p className="text-[10px] uppercase tracking-[.25em] text-white/50">{star.brand}</p>
          <div className="flex items-end justify-between">
            <div><button onClick={() => goTo(productRoute(star.id))} className="font-display text-2xl hover:text-[#F3D98B]">{star.name}</button><p className="text-sm text-white/70">{fmt(star.price)}</p></div>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => onAdd(star)} className="grid h-10 w-10 place-items-center rounded-full bg-[#D4AF37] text-[#2A1625]" aria-label="Ajouter 9PM"><Plus className="h-4 w-4" /></motion.button>
          </div>
        </Tile>

        <Tile as="button" delay={0.2} onClick={onQuiz} className="flex flex-col justify-between bg-[#F3D98B]/50 p-5">
          <Wand2 className="h-6 w-6 text-[#2A1625]" />
          <div>
            <p className="font-display text-2xl leading-tight text-[#2A1625]">Votre parfum idéal en 30 s</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#2A1625]/70">Faire le quiz <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" /></p>
          </div>
        </Tile>

        <Tile as="button" delay={0.3} onClick={() => onNav(navItem("Déodorants"))} className="flex items-end justify-between bg-[#FCE4EC] p-5">
          <div>
            <p className="text-[10px] uppercase tracking-[.3em] text-[#2A1625]/60">Déodorants</p>
            <p className="font-display text-2xl leading-tight text-[#2A1625]">dès {fmt(deoFrom)}</p>
          </div>
          <div className="h-24 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110"><ProductVisual p={deo} className="h-full w-auto" /></div>
        </Tile>

        <Tile as="button" delay={0.4} onClick={() => onNav(navItem("Offres"))} className="col-span-2 flex items-center justify-between bg-white p-5 ring-1 ring-[#E8C5C8]">
          <div>
            <p className="text-[10px] uppercase tracking-[.3em] text-[#C59B27]">Offres du moment</p>
            <p className="font-display text-3xl text-[#2A1625]">Jusqu'à -{maxDiscount}%</p>
            <p className="text-xs text-[#2A1625]/60">{offers.length} produits en promo · {offers.slice(0, 3).map((p) => p.name).join(", ")}…</p>
          </div>
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-dashed border-[#C59B27] text-[#C59B27]">
            <Percent className="h-7 w-7" />
          </motion.span>
        </Tile>

        <Tile delay={0.5} className="col-span-2 grid grid-cols-3 divide-x divide-[#E8C5C8] bg-[#FDF8F7] p-5 ring-1 ring-[#E8C5C8]">
          {[[<CountUp to={BRANDS.length} />, "marques"], [<CountUp to={PRODUCTS.length} />, "produits"], ["24–72h", "livraison"]].map(([v, l]) => (
            <div key={l} className="flex flex-col justify-center px-2 text-center">
              <p className="font-display text-3xl text-[#2A1625]">{v}</p>
              <p className="text-[10px] uppercase tracking-[.2em] text-[#2A1625]/50">{l}</p>
            </div>
          ))}
        </Tile>
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
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3 rounded-[28px] bg-white p-4 ring-1 ring-[#E8C5C8] sm:p-6 lg:grid-cols-4">
        {items.map(([Icon, t], i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F4E3E2] text-[#C59B27] transition duration-300 group-hover:-rotate-12 group-hover:scale-110 group-hover:bg-[#2A1625] group-hover:text-[#F3D98B]"><Icon className="h-5 w-5" /></span>
            <span className="text-xs font-medium leading-snug text-[#2A1625] sm:text-sm">{t}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- RUBAN DE MARQUES (défile, pause au survol, clic = filtre) ---------- */
function BrandRibbon({ onPick }) {
  const row = [...BRANDS, ...BRANDS];
  return (
    <section aria-label="Nos marques" className="marquee-hover mt-10 overflow-hidden border-y border-[#E8C5C8]/70 bg-white py-5">
      <div className="marquee flex w-max items-center gap-10" style={{ animationDuration: "60s" }}>
        {row.map((b, i) => (
          <button key={i} onClick={() => onPick(b)} tabIndex={i < BRANDS.length ? 0 : -1} aria-hidden={i >= BRANDS.length}
            className="group flex items-center gap-10 whitespace-nowrap font-display text-2xl italic text-[#2A1625]/40 transition-colors hover:text-[#2A1625] sm:text-3xl">
            <span className="relative">{b}<span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#C59B27] transition-transform duration-300 group-hover:scale-x-100" /></span>
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- VUS RÉCEMMENT (mémorisés dans le navigateur) ---------- */
function RecentlyViewed() {
  const recent = useRecent();
  if (recent.length < 2) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
      <Reveal className="mb-5 flex items-end justify-between">
        <h2 className="font-display text-3xl text-[#2A1625] sm:text-4xl">Vus <em className="text-[#C59B27]">récemment</em></h2>
        <p className="text-xs text-[#2A1625]/50">Faites défiler →</p>
      </Reveal>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {recent.map((p, i) => (
          <motion.button key={p.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
            whileHover={{ y: -4 }} onClick={() => goTo(productRoute(p.id))}
            className="flex w-60 shrink-0 snap-start items-center gap-3 rounded-2xl bg-white p-3 text-left ring-1 ring-[#E8C5C8] transition-shadow hover:shadow-lg">
            <div className="h-16 w-12 shrink-0"><ProductVisual p={p} className="h-full w-full" /></div>
            <div className="min-w-0">
              <p className="truncate text-[10px] uppercase tracking-[.2em] text-[#C59B27]">{p.brand}</p>
              <p className="font-display truncate text-lg leading-tight text-[#2A1625]">{p.name}</p>
              <p className="text-xs text-[#2A1625]/60">{fmt(p.price)}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

/* ---------- QUIZ OLFACTIF ---------- */
const QUESTIONS = [
  { key: "category", q: "Que recherchez-vous ?", options: [["parfum", "Un parfum"], ["deodorant", "Un déodorant"], ["any", "Peu importe"]] },
  { key: "gender", q: "Pour qui ?", options: [["f", "Pour elle"], ["h", "Pour lui"], ["m", "Mixte / à partager"]] },
  { key: "mood", q: "Quelle ambiance vous attire ?", options: Object.entries(MOODS) },
  { key: "budget", q: "Votre budget ?", options: [["100", "Moins de 100 DH"], ["350", "Jusqu'à 350 DH"], ["9999", "Pas de limite"]] },
];

function Quiz({ open, onClose, onAdd }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [dir, setDir] = useState(1);
  useEffect(() => { if (open) { setStep(0); setAnswers({}); } }, [open]);

  const results = useMemo(() => {
    if (step < QUESTIONS.length) return [];
    return PRODUCTS.map((p) => {
      let s = 0;
      if (answers.category === "any" || p.category === answers.category) s += 3;
      if (p.gender === answers.gender || p.gender === "m") s += 2;
      if (p.mood === answers.mood) s += 3;
      if (p.price <= +answers.budget) s += 2;
      return { p, s: s + p.popularity / 100 };
    }).sort((a, b) => b.s - a.s).slice(0, 3).map((r) => r.p);
  }, [step, answers]);

  const choose = (key, val) => { setAnswers({ ...answers, [key]: val }); setDir(1); setStep(step + 1); };
  const back = () => { setDir(-1); setStep(step - 1); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-end bg-[#2A1625]/40 backdrop-blur-sm sm:place-items-center sm:p-6" onClick={onClose}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-label="Quiz olfactif"
            className="relative max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-[32px] bg-[#FDF8F7] p-6 sm:rounded-[32px] sm:p-10">
            <button onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[#F4E3E2]" aria-label="Fermer"><X className="h-5 w-5" /></button>
            <div className="mb-6 flex gap-1.5 pr-12">
              {QUESTIONS.map((_, i) => (
                <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-[#E8C5C8]/60">
                  <motion.div className="h-full bg-[#C59B27]" initial={false} animate={{ width: i < step ? "100%" : "0%" }} />
                </div>
              ))}
            </div>
            <div className="relative min-h-[320px]">
              <AnimatePresence mode="wait">
                {step < QUESTIONS.length ? (
                  <motion.div key={step} initial={{ x: dir * 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -dir * 60, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <p className="text-xs uppercase tracking-[.3em] text-[#C59B27]">Question {step + 1}/{QUESTIONS.length}</p>
                    <h3 className="font-display mt-2 text-4xl text-[#2A1625]">{QUESTIONS[step].q}</h3>
                    <div className="mt-6 grid gap-2">
                      {QUESTIONS[step].options.map(([v, l]) => (
                        <motion.button key={v} whileHover={{ x: 6 }} whileTap={{ scale: 0.98 }} onClick={() => choose(QUESTIONS[step].key, v)}
                          className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-[#2A1625] transition ${answers[QUESTIONS[step].key] === v ? "border-[#C59B27] bg-white" : "border-[#E8C5C8] bg-white/60 hover:border-[#C59B27]"}`}>
                          {l} <ArrowRight className="h-4 w-4 text-[#C59B27]" />
                        </motion.button>
                      ))}
                    </div>
                    {step > 0 && <button onClick={back} className="mt-5 inline-flex items-center gap-1 text-sm text-[#2A1625]/60"><ArrowLeft className="h-4 w-4" /> Retour</button>}
                  </motion.div>
                ) : (
                  <motion.div key="res" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                    <p className="text-xs uppercase tracking-[.3em] text-[#C59B27]">Votre sélection</p>
                    <h3 className="font-display mt-2 text-4xl text-[#2A1625]">Nos 3 coups de cœur pour vous</h3>
                    <div className="mt-6 space-y-3">
                      {results.map((p, i) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-[#E8C5C8]">
                          <div className="h-16 w-12 shrink-0"><ProductVisual p={p} className="h-full w-full" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-[.2em] text-[#C59B27]">{p.brand}</p>
                            <button onClick={() => { onClose(); goTo(productRoute(p.id)); }} className="font-display block max-w-full truncate text-left text-xl text-[#2A1625] hover:text-[#C59B27]">{p.name}</button>
                            <p className="text-xs text-[#2A1625]/60">{p.family} · {fmt(p.price)}</p>
                          </div>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => onAdd(p)} className="grid h-10 w-10 place-items-center rounded-full bg-[#2A1625] text-white" aria-label={`Ajouter ${p.name}`}><Plus className="h-4 w-4" /></motion.button>
                        </motion.div>
                      ))}
                    </div>
                    <button onClick={() => { setStep(0); setAnswers({}); }} className="mt-5 inline-flex items-center gap-2 text-sm text-[#2A1625]/60"><RotateCcw className="h-4 w-4" /> Recommencer</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- CARTE RETOURNABLE ---------- */
const FlipCard = React.forwardRef(function FlipCard({ p, onAdd, index = 0 }, ref) {
  const [flipped, setFlipped] = useState(false);
  const [added, setAdded] = useState(false);
  const d = discountOf(p);
  const add = () => { onAdd(p); setAdded(true); setTimeout(() => setAdded(false), 1200); };
  const appear = { delay: (index % 4) * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] };

  return (
    <motion.article ref={ref} layout initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ layout: { type: "spring", stiffness: 260, damping: 26 }, opacity: appear, y: appear }}>
      <div className="relative aspect-[4/5] cursor-pointer rounded-[24px] transition-shadow duration-300 hover:shadow-[0_25px_50px_-25px_rgba(42,22,37,.45)]" style={{ perspective: 1200 }}
        role="button" tabIndex={0} aria-pressed={flipped} aria-label={`${p.brand} ${p.name} : afficher les notes`}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); } }}
        onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)} onClick={() => setFlipped((f) => !f)}>
        <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 120, damping: 16 }} style={{ transformStyle: "preserve-3d" }} className="relative h-full w-full">
          <div className="absolute inset-0 overflow-hidden rounded-[24px]" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", background: photoOf(p) ? "#FFFFFF" : `linear-gradient(170deg, #FFFFFF, ${p.colors[1]}33)` }}>
            {d > 0 && <span className="absolute left-3 top-3 rounded-full bg-[#C59B27] px-2 py-0.5 text-[10px] font-bold text-white">-{d}%</span>}
            {p.bestseller && <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#2A1625]">Best</span>}
            <div className="absolute inset-0 grid place-items-center p-8"><ProductVisual p={p} className="h-full max-h-52 w-auto drop-shadow-[0_20px_20px_rgba(42,22,37,.2)]" /></div>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/80 px-3 py-1 text-[10px] text-[#2A1625]/60 backdrop-blur-md">Notes au verso ↻</span>
          </div>
          <div className="absolute inset-0 flex flex-col justify-between rounded-[24px] bg-[#2A1625] p-4 text-white sm:p-5" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <div>
              <p className="text-[9px] uppercase tracking-[.3em] text-[#F3D98B]">{p.family}</p>
              {hasNotes(p) ? [["Tête", p.notes.top], ["Cœur", p.notes.heart], ["Fond", p.notes.base]].filter(([, v]) => v).map(([l, v]) => (
                <div key={l} className="mt-2 sm:mt-3">
                  <p className="text-[9px] uppercase tracking-[.2em] text-white/40">{l}</p>
                  <p className="line-clamp-2 text-[11px] leading-snug sm:text-sm">{v}</p>
                </div>
              )) : (
                <p className="mt-3 text-[11px] leading-snug text-white/70 sm:text-sm">{p.category === "parfum" ? "Parfum" : "Déodorant"} · {p.volume}. Pyramide olfactive non communiquée par la marque : demandez conseil sur WhatsApp.</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <button onClick={(e) => { e.stopPropagation(); goTo(productRoute(p.id)); }} className="flex items-center justify-center gap-1.5 rounded-full bg-white/10 py-2.5 text-xs font-semibold ring-1 ring-white/20 transition hover:bg-white/20">
                <Eye className="h-4 w-4" /> Voir la fiche
              </button>
              <a href={quickOrderLink(p)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-2.5 text-xs font-semibold">
                <WhatsAppIcon className="h-4 w-4" /> Commander
              </a>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] uppercase tracking-[.2em] text-[#C59B27]">{p.brand}</p>
          <h3 className="font-display truncate text-lg leading-tight text-[#2A1625] sm:text-xl"><button onClick={() => goTo(productRoute(p.id))} className="max-w-full truncate text-left transition hover:text-[#C59B27]">{p.name}</button></h3>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-[#2A1625]">
            <b className="font-semibold">{fmt(p.price)}</b>
            {p.oldPrice && <s className="text-xs text-[#2A1625]/40">{fmt(p.oldPrice)}</s>}
            {p.rating && <span className="hidden items-center gap-0.5 text-xs text-[#2A1625]/50 sm:inline-flex"><Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />{p.rating}</span>}
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.85 }} onClick={add} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors ${added ? "bg-[#25D366] text-white" : "bg-[#F4E3E2] text-[#2A1625] hover:bg-[#2A1625] hover:text-white"}`} aria-label={`Ajouter ${p.name}`}>
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </motion.button>
      </div>
    </motion.article>
  );
});

/* ---------- GRILLE PAGINÉE (catalogue de plusieurs centaines de produits) ---------- */
const PAGE = 24;
function MoreGrid({ items, onAdd }) {
  const [count, setCount] = useState(PAGE);
  useEffect(() => { setCount(PAGE); }, [items]);
  const shown = items.slice(0, count);
  const rest = items.length - shown.length;
  return (
    <>
      <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => <FlipCard key={p.id} p={p} onAdd={onAdd} index={i} />)}
        </AnimatePresence>
      </motion.div>
      {items.length > PAGE && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="h-1 w-48 overflow-hidden rounded-full bg-[#E8C5C8]/60">
            <motion.div className="h-full bg-[#C59B27]" animate={{ width: `${(shown.length / items.length) * 100}%` }} />
          </div>
          <p className="text-xs text-[#2A1625]/55">{shown.length} sur {items.length} produits</p>
          {rest > 0 && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCount((c) => c + PAGE)} className="shimmer rounded-full bg-[#2A1625] px-7 py-3.5 text-sm font-semibold text-white">
              Voir plus ({Math.min(PAGE, rest)} sur {rest} restants)
            </motion.button>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- SÉLECTEUR DE MARQUE ---------- */
function BrandSelect({ value, onChange, category }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const available = BRANDS.filter((b) => PRODUCTS.some((p) => p.brand === b && (category === "all" || p.category === category)));
  const shown = available.filter((b) => b.toLowerCase().includes(q.toLowerCase()));
  return (
    <div ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm ${value ? "border-[#2A1625] bg-[#2A1625] text-white" : "border-[#E8C5C8] bg-white text-[#2A1625]"}`}>
        {value || "Toutes les marques"} <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
            className="absolute left-4 top-full z-30 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-[#E8C5C8] sm:left-auto">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher une marque…" aria-label="Chercher une marque" className="mb-1 w-full rounded-xl bg-[#FDF8F7] px-3 py-2 text-base outline-none sm:text-sm" />
            <div className="max-h-64 overflow-y-auto">
              <button onClick={() => { onChange(null); setOpen(false); }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#2A1625] hover:bg-[#FDF8F7]">Toutes les marques</button>
              {shown.map((b) => (
                <button key={b} onClick={() => { onChange(b); setOpen(false); setQ(""); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#2A1625] hover:bg-[#FDF8F7]">
                  {b} {value === b && <Check className="h-4 w-4 text-[#C59B27]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- CATALOGUE ---------- */
function Catalogue({ category, setCategory, brand, setBrand, offersOnly, setOffersOnly, query, setQuery, onAdd }) {
  const [sort, setSort] = useState("popularity");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) =>
      (category === "all" || p.category === category) && (!brand || p.brand === brand) &&
      (!offersOnly || p.oldPrice) && (!q || searchable(p).includes(q))
    ).sort(SORTS.find((s) => s.id === sort).fn);
  }, [category, brand, offersOnly, query, sort]);

  return (
    <section id="a-catalogue" className="mx-auto max-w-7xl scroll-mt-16 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="font-display text-4xl leading-none text-[#2A1625] sm:text-6xl"><SplitWords text="Le Catalogue" inView /></h2>
        <motion.p key={list.length} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-sm tabular-nums text-[#2A1625]/50">{list.length.toLocaleString("fr-FR")} produit{list.length > 1 ? "s" : ""}</motion.p>
      </div>

      {/* Barre d'outils collante (popover marque positionné hors du conteneur défilant) */}
      <div className="sticky top-16 z-20 -mx-4 mb-8 border-y border-[#E8C5C8]/60 bg-[#FDF8F7]/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-full sm:border sm:px-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex shrink-0 rounded-full bg-[#F4E3E2] p-1">
            {[["all", "Tout"], ["parfum", "Parfums"], ["deodorant", "Déodorants"]].map(([id, l]) => (
              <button key={id} onClick={() => { setCategory(id); setBrand(null); }} className="relative rounded-full px-3 py-1.5 text-sm sm:px-4">
                {category === id && <motion.span layoutId="a-seg" className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className={`relative ${category === id ? "font-semibold text-[#2A1625]" : "text-[#2A1625]/60"}`}>{l}</span>
              </button>
            ))}
          </div>
          <BrandSelect value={brand} onChange={setBrand} category={category} />
          <button onClick={() => setOffersOnly(!offersOnly)} className={`shrink-0 rounded-full border px-4 py-2.5 text-sm ${offersOnly ? "border-[#C59B27] bg-[#C59B27] text-white" : "border-[#E8C5C8] bg-white text-[#2A1625]"}`}>Offres</button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier" className="shrink-0 rounded-full border border-[#E8C5C8] bg-white px-4 py-2.5 text-sm text-[#2A1625] outline-none">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <div className="relative w-full lg:ml-auto lg:w-60">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2A1625]/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher…" aria-label="Rechercher"
              className="w-full rounded-full border border-[#E8C5C8] bg-white py-2.5 pl-10 pr-4 text-base text-[#2A1625] outline-none focus:border-[#C59B27] sm:text-sm" />
          </div>
        </div>
      </div>

      <MoreGrid items={list} onAdd={onAdd} />
      {list.length === 0 && (
        <div className="rounded-[28px] bg-white py-16 text-center ring-1 ring-[#E8C5C8]">
          <p className="font-display text-3xl text-[#2A1625]">Rien ne correspond… pour l'instant</p>
          <a href={waLink(`Bonjour, je cherche : ${query || brand || "un parfum"}`)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white">
            <WhatsAppIcon className="h-4 w-4" /> Demander sur WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}

/* ---------- MARQUES A–Z ---------- */
function Brands({ onPick }) {
  const groups = BRANDS.reduce((acc, b) => { (acc[b[0]] = acc[b[0]] || []).push(b); return acc; }, {});
  return (
    <section id="a-marques" className="scroll-mt-16 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl text-[#2A1625] sm:text-6xl"><SplitWords text="Nos Marques" inView /> <em className="text-[#C59B27]"><SplitWords text="de A à Z" inView delay={0.2} /></em></h2>
          <Reveal as="p" delay={0.2} className="max-w-xs text-sm text-[#2A1625]/55">18 maisons orientales et françaises, sélectionnées pour leur authenticité.</Reveal>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(groups).map(([letter, list], i) => (
            <motion.div key={letter} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 5) * 0.05 }}
              whileHover={{ y: -4 }} className="group/letter rounded-[24px] bg-[#FDF8F7] p-5 ring-1 ring-[#E8C5C8]/70 transition-shadow hover:shadow-lg hover:ring-[#C59B27]/50">
              <p className="font-display text-5xl italic text-[#E8C5C8] transition-colors duration-300 group-hover/letter:text-[#C59B27]">{letter}</p>
              <div className="mt-2 space-y-1">
                {list.map((b) => (
                  <button key={b} onClick={() => onPick(b)} className="group flex w-full items-center justify-between text-left text-[#2A1625]">
                    <span className="font-display text-xl transition group-hover:text-[#C59B27]">{b}</span>
                    <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CHECKOUT EN 3 ÉTAPES ---------- */
function Checkout({ open, onClose, cart }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", city: "", address: "", phone: "" });
  const [touched, setTouched] = useState(false);
  const { items, subtotal, shipping, total, setQty, remove, count } = cart;
  useEffect(() => { if (open) setStep(0); }, [open]);
  useEffect(() => { if (!count && step > 0) setStep(0); }, [count, step]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const valid = form.name.trim() && form.city.trim() && form.address.trim();
  const steps = ["Panier", "Livraison", "Confirmation"];
  const next = () => {
    if (step === 1 && !valid) return setTouched(true);
    setStep(step + 1);
  };
  const field = (k, label, ph, type = "text") => (
    <label className="block">
      <span className="text-xs font-semibold text-[#2A1625]/70">{label}</span>
      <input type={type} value={form[k]} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        className={`mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:ring-4 focus:ring-[#E8C5C8]/50 sm:text-sm ${touched && k !== "phone" && !form[k].trim() ? "border-red-400" : "border-[#E8C5C8] focus:border-[#C59B27]"}`} />
    </label>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-end bg-[#2A1625]/40 backdrop-blur-sm sm:place-items-center sm:p-6" onClick={onClose}>
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Commande"
            className="flex max-h-[92svh] w-full max-w-lg flex-col rounded-t-[32px] bg-[#FDF8F7] sm:rounded-[32px]">
            <div className="flex items-center justify-between px-6 pb-2 pt-6">
              <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${i <= step ? "text-[#2A1625]" : "text-[#2A1625]/35"}`}>
                      <motion.span animate={{ backgroundColor: i < step ? "#C59B27" : i === step ? "#2A1625" : "#E8C5C8" }} className="grid h-6 w-6 place-items-center rounded-full text-[10px] text-white">
                        {i < step ? <Check className="h-3 w-3" /> : i + 1}
                      </motion.span>
                      <span className="hidden sm:inline">{s}</span>
                    </span>
                    {i < steps.length - 1 && <span className="h-px w-5 bg-[#E8C5C8]" />}
                  </React.Fragment>
                ))}
              </div>
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[#F4E3E2]" aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
              {count === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-display text-3xl text-[#2A1625]">Votre panier est vide</p>
                  <button onClick={() => { onClose(); scrollToId("a-catalogue"); }} className="mt-5 rounded-full bg-[#2A1625] px-6 py-3 text-sm font-semibold text-white">Voir le catalogue</button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.25 }}>
                    {step === 0 && (
                      <div className="space-y-2">
                        <h3 className="font-display mb-3 text-3xl text-[#2A1625]">Votre panier</h3>
                        {items.map((i) => (
                          <motion.div layout key={i.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-[#E8C5C8]/60">
                            <div className="h-14 w-10 shrink-0"><ProductVisual p={i} className="h-full w-full" /></div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[#2A1625]">{i.brand} {i.name}</p>
                              <p className="text-xs text-[#2A1625]/55">{fmt(i.price)} · {i.volume}</p>
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-[#FDF8F7] p-1">
                              <button onClick={() => setQty(i.id, i.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full bg-white" aria-label="Diminuer"><Minus className="h-3 w-3" /></button>
                              <span className="w-5 text-center text-sm">{i.qty}</span>
                              <button onClick={() => setQty(i.id, i.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-white" aria-label="Augmenter"><Plus className="h-3 w-3" /></button>
                            </div>
                            <button onClick={() => remove(i.id)} className="p-1 text-[#2A1625]/35 hover:text-red-500" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
                          </motion.div>
                        ))}
                        <div className="rounded-2xl bg-[#F4E3E2] p-3 text-xs text-[#2A1625]">
                          {subtotal >= FREE_SHIPPING_FROM ? "🎉 Livraison offerte !" : `Ajoutez ${fmt(FREE_SHIPPING_FROM - subtotal)} pour la livraison offerte`}
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                            <motion.div animate={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%` }} className="h-full rounded-full bg-[#C59B27]" />
                          </div>
                        </div>
                      </div>
                    )}
                    {step === 1 && (
                      <div className="space-y-3">
                        <h3 className="font-display mb-1 text-3xl text-[#2A1625]">Où livrer ?</h3>
                        <p className="text-sm text-[#2A1625]/55">Paiement à la livraison, partout au Maroc.</p>
                        {field("name", "Nom complet *", "Salma Benali")}
                        {field("city", "Ville *", "Casablanca")}
                        {field("address", "Adresse *", "Quartier, rue, numéro…")}
                        {field("phone", "Téléphone (optionnel)", "06 XX XX XX XX", "tel")}
                        {touched && !valid && <p className="text-xs text-red-500">Merci de compléter nom, ville et adresse.</p>}
                      </div>
                    )}
                    {step === 2 && (
                      <div>
                        <h3 className="font-display mb-3 text-3xl text-[#2A1625]">Récapitulatif</h3>
                        <div className="rounded-2xl bg-white p-4 text-sm text-[#2A1625] ring-1 ring-[#E8C5C8]/60">
                          {items.map((i) => <div key={i.id} className="flex justify-between gap-3 py-1"><span>{i.qty} × {i.name}</span><span className="shrink-0">{fmt(i.price * i.qty)}</span></div>)}
                          <div className="mt-2 border-t border-dashed border-[#E8C5C8] pt-2 text-[#2A1625]/60">
                            <div className="flex justify-between"><span>Livraison</span><span>{shipping ? fmt(shipping) : "Offerte"}</span></div>
                          </div>
                        </div>
                        <div className="mt-3 rounded-2xl bg-white p-4 text-sm text-[#2A1625] ring-1 ring-[#E8C5C8]/60">
                          <p className="font-semibold">{form.name}</p>
                          <p className="text-[#2A1625]/60">{form.address}, {form.city}{form.phone && ` · ${form.phone}`}</p>
                          <button onClick={() => setStep(1)} className="mt-1 text-xs text-[#C59B27] underline">Modifier</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {count > 0 && (
              <div className="border-t border-[#E8C5C8]/60 px-6 pb-6 pt-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-sm text-[#2A1625]/60">Total ({count} article{count > 1 ? "s" : ""})</span>
                  <motion.span key={total} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-display text-3xl text-[#2A1625]">{fmt(total)}</motion.span>
                </div>
                <div className="flex gap-2">
                  {step > 0 && <button onClick={() => setStep(step - 1)} className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#E8C5C8]" aria-label="Étape précédente"><ArrowLeft className="h-5 w-5" /></button>}
                  {step < 2 ? (
                    <button onClick={next} className="shimmer flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#2A1625] text-sm font-semibold text-white">
                      {step === 0 ? "Continuer vers la livraison" : "Vérifier ma commande"} <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button onClick={() => window.open(waLink(buildOrderMessage(cart, form)), "_blank", "noopener")} className="shimmer flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-3 text-sm font-semibold text-white">
                      <WhatsAppIcon /> Finaliser sur WhatsApp
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- BARRE PANIER FLOTTANTE ---------- */
function FloatingCart({ cart, onOpen, hidden }) {
  return (
    <AnimatePresence>
      {cart.count > 0 && !hidden && (
        <motion.button initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: "spring", damping: 22, stiffness: 260 }}
          onClick={onOpen} className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-full bg-[#2A1625] py-2 pl-2 pr-5 text-white shadow-[0_20px_50px_-15px_rgba(42,22,37,.6)]">
          <span className="flex -space-x-3">
            {cart.items.slice(0, 3).map((i) => (
              <span key={i.id} className="grid h-11 w-11 place-items-center rounded-full bg-[#FDF8F7] p-1.5 ring-2 ring-[#2A1625]"><ProductVisual p={i} className="h-full w-full" /></span>
            ))}
          </span>
          <span className="flex-1 text-left text-sm">
            <motion.b key={cart.count} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="block">{cart.count} article{cart.count > 1 ? "s" : ""}</motion.b>
            <span className="text-white/60">{fmt(cart.total)}</span>
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-[#F3D98B]">Commander <ArrowRight className="h-4 w-4" /></span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ---------- FOOTER ---------- */
function Footer({ onNav }) {
  return (
    <footer className="bg-[#F4E3E2] pb-28 pt-16 text-[#2A1625]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-4xl italic">Rosa Parc</p>
          <p className="text-[10px] font-semibold uppercase tracking-[.5em] text-[#C59B27]">Parfumerie</p>
          <p className="mt-4 max-w-xs text-sm text-[#2A1625]/60">Parfums et déodorants originaux, orientaux et français, livrés partout au Maroc.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.3em] text-[#C59B27]">Boutique</p>
          {NAV.map((n) => <button key={n.label} onClick={() => onNav(n)} className="block text-[#2A1625]/70 hover:text-[#2A1625]">{n.label}</button>)}
        </div>
        <div className="space-y-2 text-sm text-[#2A1625]/70">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.3em] text-[#C59B27]">Livraison</p>
          <p>Tout le Maroc, 24–72h</p><p>Paiement à la livraison</p><p>Offerte dès {fmt(FREE_SHIPPING_FROM)}</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.3em] text-[#C59B27]">Contact</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex items-center gap-2"><WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> {WHATSAPP_DISPLAY}</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2"><Instagram className="h-4 w-4 text-[#C59B27]" /> @rosaparcparfumerie</a>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl border-t border-[#2A1625]/10 px-4 pt-6 text-xs text-[#2A1625]/45 sm:px-6">© {new Date().getFullYear()} Rosa Parc Parfumerie · Prix indicatifs en MAD</p>
    </footer>
  );
}


/* ---------- PAGES HOMME / FEMME / MIXTE ---------- */
function GenderPage({ pageKey, onAdd, onQuiz }) {
  const cfg = GENDER_PAGES[pageKey];
  const g = useGenderProducts(cfg.gender);
  const top = [...g.base].filter((p) => p.category === "parfum").sort((a, b) => b.popularity - a.popularity).slice(0, 2);
  const tint = { h: "from-[#E9E4F2] via-[#FDF8F7] to-[#F4E3E2]", f: "from-[#FCE4EC] via-[#FDF8F7] to-[#F4E3E2]", m: "from-[#F3D98B]/40 via-[#FDF8F7] to-[#F4E3E2]" }[cfg.gender];
  const chip = (active) => `shrink-0 rounded-full border px-4 py-2 text-sm transition ${active ? "border-[#2A1625] bg-[#2A1625] text-white" : "border-[#E8C5C8] bg-white text-[#2A1625] hover:border-[#C59B27]"}`;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-6">
        <div className="grid auto-rows-[minmax(140px,auto)] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Tile className={`col-span-2 row-span-2 flex flex-col justify-between gap-8 bg-gradient-to-br p-7 sm:p-10 ${tint}`}>
            <p className="text-xs text-[#2A1625]/55"><button onClick={() => goTo("accueil")} className="hover:text-[#C59B27]">Accueil</button> / {cfg.title}</p>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.35em] text-[#C59B27]">{cfg.kicker}</p>
              <h1 className="font-display mt-2 text-5xl leading-none text-[#2A1625] sm:text-7xl">{cfg.title.split(" ")[0]} <em className="text-[#C59B27]">{cfg.title.split(" ").slice(1).join(" ")}</em></h1>
              <p className="mt-4 max-w-md text-sm text-[#2A1625]/65 sm:text-base">{cfg.intro}</p>
            </div>
          </Tile>
          {top.map((p, i) => (
            <Tile key={p.id} delay={0.1 + i * 0.1} className={`row-span-2 flex flex-col p-5 ${i === 0 ? "bg-[#2A1625] text-white" : "bg-white text-[#2A1625] ring-1 ring-[#E8C5C8]"}`}>
              <span className={`text-[10px] uppercase tracking-[.3em] ${i === 0 ? "text-[#F3D98B]" : "text-[#C59B27]"}`}>{i === 0 ? "N°1" : "Coup de cœur"}</span>
              <TiltBottle p={p} className="my-4 h-44 flex-1 sm:h-52" />
              <p className={`text-[10px] uppercase tracking-[.25em] ${i === 0 ? "text-white/50" : "text-[#2A1625]/50"}`}>{p.brand}</p>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0"><button onClick={() => goTo(productRoute(p.id))} className="font-display block max-w-full truncate text-left text-2xl hover:text-[#C59B27]">{p.name}</button><p className="text-sm opacity-70">{fmt(p.price)}</p></div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => onAdd(p)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${i === 0 ? "bg-[#D4AF37] text-[#2A1625]" : "bg-[#2A1625] text-white"}`} aria-label={`Ajouter ${p.name}`}><Plus className="h-4 w-4" /></motion.button>
              </div>
            </Tile>
          ))}
          <Tile delay={0.3} className="col-span-2 flex flex-wrap items-center gap-2 bg-white p-4 ring-1 ring-[#E8C5C8] lg:col-span-2">
            {Object.keys(GENDER_PAGES).map((k) => (
              <button key={k} onClick={() => goTo(k)} className="relative rounded-full px-5 py-2.5 text-sm">
                {k === pageKey && <motion.span layoutId="a-gender" className="absolute inset-0 rounded-full bg-[#F4E3E2]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <span className={`relative ${k === pageKey ? "font-semibold text-[#2A1625]" : "text-[#2A1625]/60"}`}>{GENDER_PAGES[k].title}</span>
              </button>
            ))}
          </Tile>
          <Tile as="button" delay={0.4} onClick={onQuiz} className="col-span-2 flex items-center justify-between bg-[#F3D98B]/50 p-5 lg:col-span-2">
            <div>
              <p className="font-display text-2xl text-[#2A1625]">Pas sûr·e ? Faites le quiz</p>
              <p className="text-xs text-[#2A1625]/60">4 questions, 3 recommandations</p>
            </div>
            <Wand2 className="h-7 w-7 text-[#2A1625] transition group-hover:rotate-12" />
          </Tile>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <button className={chip(g.category === "all")} onClick={() => g.setCategory("all")}>Tout · {g.base.length}</button>
            <button className={chip(g.category === "parfum")} onClick={() => g.setCategory("parfum")}>Parfums</button>
            {g.hasDeo && <button className={chip(g.category === "deodorant")} onClick={() => g.setCategory("deodorant")}>Déodorants</button>}
            {g.moods.map((m) => <button key={m} className={chip(g.mood === m)} onClick={() => g.setMood(g.mood === m ? null : m)}>{MOODS[m]}</button>)}
          </div>
          <select value={g.sort} onChange={(e) => g.setSort(e.target.value)} aria-label="Trier" className="self-end rounded-full border border-[#E8C5C8] bg-white px-4 py-2.5 text-sm text-[#2A1625] outline-none">
            {SORTS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <MoreGrid items={g.list} onAdd={onAdd} />

        {g.alsoMixte.length > 0 && (
          <div className="mt-16 rounded-[28px] bg-white p-5 ring-1 ring-[#E8C5C8] sm:p-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl text-[#2A1625] sm:text-4xl">Ils se portent aussi <em className="text-[#C59B27]">· mixtes</em></h2>
              <button onClick={() => goTo("mixte")} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#2A1625]">Tout voir <ArrowRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
              {g.alsoMixte.map((p, i) => <FlipCard key={p.id} p={p} onAdd={onAdd} index={i} />)}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

/* ---------- PAGE CONTACT ---------- */
function ContactPage() {
  const c = useContactForm();
  const field = (err) => `mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:ring-4 focus:ring-[#E8C5C8]/50 sm:text-sm ${err ? "border-red-400" : "border-[#E8C5C8] focus:border-[#C59B27]"}`;
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-4">
        <Tile className="flex flex-col justify-end bg-gradient-to-br from-[#F4E3E2] via-[#FDF8F7] to-[#E8C5C8] p-7 sm:p-10 lg:col-span-2 lg:row-span-2">
          <p className="text-xs text-[#2A1625]/55"><button onClick={() => goTo("accueil")} className="hover:text-[#C59B27]">Accueil</button> / Contact</p>
          <h1 className="font-display mt-10 text-5xl leading-none text-[#2A1625] sm:text-7xl">Parlons <em className="text-[#C59B27]">parfum</em></h1>
          <p className="mt-4 max-w-md text-sm text-[#2A1625]/65 sm:text-base">Conseil, disponibilité, suivi de commande ou cadeau : votre message s'ouvre directement dans WhatsApp.</p>
        </Tile>

        <Tile delay={0.1} className="bg-white p-6 ring-1 ring-[#E8C5C8] lg:col-span-2 lg:row-span-3">
          <p className="font-display text-3xl text-[#2A1625]">Votre message</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="text-xs font-semibold text-[#2A1625]/70">Nom *</span>
              <input value={c.form.name} onChange={(e) => c.set("name", e.target.value)} placeholder="Votre nom" autoComplete="name" className={field(c.errors.name)} /></label>
            <label className="block"><span className="text-xs font-semibold text-[#2A1625]/70">Ville</span>
              <input value={c.form.city} onChange={(e) => c.set("city", e.target.value)} placeholder="Casablanca" className={field(false)} /></label>
          </div>
          <p className="mb-2 mt-4 text-xs font-semibold text-[#2A1625]/70">Sujet</p>
          <div className="flex flex-wrap gap-2">
            {CONTACT_SUBJECTS.map((s) => (
              <button key={s} onClick={() => c.set("subject", s)} className={`rounded-full px-3.5 py-2 text-xs transition ${c.form.subject === s ? "bg-[#2A1625] text-white" : "bg-[#FDF8F7] text-[#2A1625] ring-1 ring-[#E8C5C8]"}`}>{s}</button>
            ))}
          </div>
          <label className="mt-4 block"><span className="text-xs font-semibold text-[#2A1625]/70">Message *</span>
            <textarea rows={5} value={c.form.message} onChange={(e) => c.set("message", e.target.value)} placeholder="Ex : je cherche un parfum oriental pour offrir…" className={`${field(c.errors.message)} resize-none`} /></label>
          {(c.errors.name || c.errors.message) && <p className="mt-2 text-xs text-red-500">Merci d'indiquer votre nom et votre message.</p>}
          <button onClick={c.submit} className="shimmer mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white">
            <WhatsAppIcon /> Envoyer sur WhatsApp
          </button>
          <AnimatePresence>
            {c.sent && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-center justify-center gap-2 text-sm text-[#2A1625]/70"><Check className="h-4 w-4 text-[#25D366]" /> Message prêt dans WhatsApp.</motion.p>}
          </AnimatePresence>
        </Tile>

        <Tile delay={0.2} className="bg-[#25D366] p-0 text-white">
          <a href={waLink("Bonjour Rosa Parc Parfumerie 🌸")} target="_blank" rel="noreferrer" className="flex h-full flex-col justify-between gap-6 p-5">
            <WhatsAppIcon className="h-7 w-7" />
            <div><p className="text-xs opacity-80">WhatsApp</p><p className="font-display text-2xl">{WHATSAPP_DISPLAY}</p></div>
          </a>
        </Tile>
        <Tile delay={0.25} className="bg-[#2A1625] p-0 text-white">
          <a href="tel:+212784884694" className="flex h-full flex-col justify-between gap-6 p-5">
            <Phone className="h-6 w-6 text-[#F3D98B]" />
            <div><p className="text-xs opacity-70">Téléphone</p><p className="font-display text-2xl">07 84 88 46 94</p></div>
          </a>
        </Tile>
        <Tile delay={0.3} className="bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-0 text-white">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex h-full flex-col justify-between gap-6 p-5">
            <Instagram className="h-6 w-6" />
            <div><p className="text-xs opacity-80">Instagram</p><p className="font-display text-2xl">@rosaparcparfumerie</p></div>
          </a>
        </Tile>
        <Tile delay={0.35} className="bg-white p-5 ring-1 ring-[#E8C5C8]">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.3em] text-[#C59B27]"><Clock className="h-4 w-4" /> Horaires</p>
          {HOURS.map(([d, h]) => <div key={d} className="mt-2.5 flex justify-between gap-2 text-sm text-[#2A1625]"><span className="opacity-60">{d}</span><span>{h}</span></div>)}
        </Tile>
        <Tile delay={0.4} className="bg-[#FCE4EC] p-5 lg:col-span-4">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.3em] text-[#C59B27]"><MapPin className="h-4 w-4" /> Nous livrons partout au Maroc · paiement à la livraison · offerte dès {fmt(FREE_SHIPPING_FROM)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DELIVERY_CITIES.map((v) => <span key={v} className="rounded-full bg-white px-3 py-1.5 text-xs text-[#2A1625]">{v}</span>)}
          </div>
        </Tile>
      </div>
    </section>
  );
}


/* ---------- FICHE PRODUIT ---------- */
const VIEWS = [
  { id: "face", label: "Face" },
  { id: "angle", label: "Profil" },
  { id: "detail", label: "Détail" },
];

function BottleView({ p, view, className = "" }) {
  const t = { face: { rotate: 0, scale: 1, y: 0, rotateY: 0 }, angle: { rotate: -10, scale: 0.95, y: 0, rotateY: 35 }, detail: { rotate: 0, scale: 2.1, y: "-22%", rotateY: 0 } }[view];
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`} style={{ perspective: 900 }}>
      <motion.div animate={t} transition={{ type: "spring", stiffness: 120, damping: 18 }} className="flex h-full items-center justify-center">
        <ProductVisual p={p} colors={view === "angle" ? [p.colors[1], p.colors[0]] : p.colors} className="h-full w-auto drop-shadow-[0_30px_30px_rgba(42,22,37,.25)]" />
      </motion.div>
    </div>
  );
}

function Gauge({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-[#2A1625]/60"><span>{label}</span><span>{value}/5</span></div>
      <div className="mt-1.5 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.span key={i} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className={`h-1.5 flex-1 origin-left rounded-full ${i <= value ? "bg-[#C59B27]" : "bg-[#E8C5C8]/60"}`} />
        ))}
      </div>
    </div>
  );
}

function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-[#E8C5C8]/70">
      {items.map(([title, body], i) => (
        <div key={title}>
          <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between py-4 text-left font-display text-xl text-[#2A1625]" aria-expanded={open === i}>
            {title} <motion.span animate={{ rotate: open === i ? 45 : 0 }}><Plus className="h-5 w-5 text-[#C59B27]" /></motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pb-5 text-sm leading-relaxed text-[#2A1625]/70">{body}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function ProductPage({ id, onAdd, onOpenCart, cartCount }) {
  const p = PRODUCTS.find((x) => x.id === id);
  const [view, setView] = useState("face");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  useEffect(() => { setView("face"); setQty(1); setAdded(false); pushRecent(id); }, [id]);

  const d = discountOf(p);
  const profile = profileOf(p);
  const related = relatedTo(p);
  const genderPage = { h: "homme", f: "femme", m: "mixte" }[p.gender];
  const add = () => { onAdd(p, qty); setAdded(true); setTimeout(() => setAdded(false), 1800); };
  const orderLink = waLink(`Bonjour Rosa Parc Parfumerie 🌸\nJe souhaite commander :\n• ${qty} × ${p.brand} ${p.name} (${p.volume}) — ${fmt(p.price * qty)}\n\nMerci de me confirmer la disponibilité.`);
  const tiers = [
    ["Notes de tête", "Les premières minutes", p.notes.top, "w-1/2"],
    ["Notes de cœur", "Les premières heures", p.notes.heart, "w-3/4"],
    ["Notes de fond", "Le sillage qui reste", p.notes.base, "w-full"],
  ];

  return (
    <div className="pb-28 lg:pb-0">
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <p className="mb-4 truncate text-xs text-[#2A1625]/55">
          <button onClick={() => goTo("accueil")} className="hover:text-[#C59B27]">Accueil</button> / <button onClick={() => goTo(genderPage)} className="hover:text-[#C59B27]">{GENDER_PAGES[genderPage].title}</button> / <span className="text-[#2A1625]">{p.brand} {p.name}</span>
        </p>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Tile className="relative flex flex-col p-4 sm:p-6">
            <div className="absolute inset-0 rounded-[28px]" style={{ background: photoOf(p) ? "#FFFFFF" : `radial-gradient(90% 70% at 50% 60%, ${p.colors[1]}55, #FDF8F7 70%)` }} />
            <div className="relative flex gap-2">
              {d > 0 && <span className="rounded-full bg-[#C59B27] px-3 py-1 text-xs font-bold text-white">-{d}%</span>}
              {p.bestseller && <span className="rounded-full bg-[#2A1625] px-3 py-1 text-[10px] font-semibold uppercase tracking-[.2em] text-[#F3D98B]">Bestseller</span>}
              <span className="ml-auto rounded-full bg-white/80 px-3 py-1 text-xs text-[#2A1625]">{GENDER_LABEL[p.gender]}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.3 }} className="relative">
                {view === "face" ? <TiltBottle p={p} className="mx-auto h-[340px] sm:h-[460px]" /> : <BottleView p={p} view={view} className="mx-auto h-[340px] sm:h-[460px]" />}
              </motion.div>
            </AnimatePresence>
            <div className="relative mt-2 flex justify-center gap-2">
              {VIEWS.map((v) => (
                <button key={v.id} onClick={() => setView(v.id)} aria-label={`Vue ${v.label}`}
                  className={`relative h-20 w-16 overflow-hidden rounded-2xl bg-white p-1.5 ring-2 transition ${view === v.id ? "ring-[#C59B27]" : "ring-transparent hover:ring-[#E8C5C8]"}`}>
                  <BottleView p={p} view={v.id} className="h-full" />
                  <span className="absolute inset-x-0 bottom-0 bg-white/85 text-[9px] text-[#2A1625]">{v.label}</span>
                </button>
              ))}
            </div>
          </Tile>

          <Tile delay={0.1} className="flex flex-col bg-white p-6 ring-1 ring-[#E8C5C8] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[.3em] text-[#C59B27]">{p.brand}</p>
            <h1 className="font-display mt-2 text-5xl leading-none text-[#2A1625] sm:text-6xl">{p.name}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#2A1625]/60">
              {p.rating && <><span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" /> {p.rating.toFixed(1)}/5</span><span>·</span></>}
              <span>{p.family}</span><span>·</span><span>{p.category === "parfum" ? "Parfum" : "Déodorant"}</span>
            </p>
            <div className="mt-6 flex items-end gap-3">
              <motion.span key={qty} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl text-[#2A1625]">{fmt(p.price * qty)}</motion.span>
              {p.oldPrice && <s className="mb-2 text-[#2A1625]/40">{fmt(p.oldPrice * qty)}</s>}
            </div>
            <p className="mt-1 text-xs text-[#2A1625]/50">{qty > 1 ? `${qty} × ${fmt(p.price)} · ` : ""}Paiement à la livraison</p>

            <p className="mb-2 mt-6 text-xs font-semibold text-[#2A1625]/70">Contenance</p>
            <span className="w-fit rounded-full bg-[#2A1625] px-4 py-2 text-sm text-white">{p.volume}</span>

            <div className="mt-6 flex gap-2">
              <div className="flex items-center rounded-full bg-[#FDF8F7] p-1 ring-1 ring-[#E8C5C8]">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-11 place-items-center rounded-full bg-white" aria-label="Diminuer"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="grid h-11 w-11 place-items-center rounded-full bg-white" aria-label="Augmenter"><Plus className="h-4 w-4" /></button>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={add} className={`shimmer flex flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-colors ${added ? "bg-[#C59B27]" : "bg-[#2A1625]"}`}>
                <AnimatePresence mode="wait" initial={false}>
                  {added
                    ? <motion.span key="ok" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2"><Check className="h-4 w-4" /> Ajouté au panier</motion.span>
                    : <motion.span key="add" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Ajouter au panier</motion.span>}
                </AnimatePresence>
              </motion.button>
            </div>
            <a href={orderLink} target="_blank" rel="noreferrer" className="shimmer mt-2 flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white">
              <WhatsAppIcon className="h-4 w-4" /> Commander directement via WhatsApp
            </a>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.button initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onClick={onOpenCart}
                  className="mt-3 flex items-center justify-center gap-1 text-sm font-semibold text-[#C59B27]">
                  Voir mon panier ({cartCount}) <ArrowRight className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>

            <div className="mt-auto grid grid-cols-3 gap-2 pt-6 text-center text-[11px] text-[#2A1625]/70">
              {[[ShieldCheck, "100% original"], [Truck, "Livraison 24–72h"], [Wallet, "Paiement à la livraison"]].map(([Icon, t]) => (
                <div key={t} className="rounded-2xl bg-[#FDF8F7] p-3"><Icon className="mx-auto mb-1 h-5 w-5 text-[#C59B27]" />{t}</div>
              ))}
            </div>
          </Tile>
        </div>
      </section>

      <section className="mx-auto mt-4 grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <Tile className="bg-[#2A1625] p-6 text-white sm:p-10">
          <p className="text-[10px] uppercase tracking-[.35em] text-[#F3D98B]">Pyramide olfactive</p>
          <h2 className="font-display mt-2 text-4xl">Comment il évolue sur la peau</h2>
          {!hasNotes(p) && (
            <div className="mt-6 rounded-2xl bg-white/10 p-5 text-sm leading-relaxed text-white/80">
              La marque ne publie pas la pyramide détaillée de ce {p.category === "parfum" ? "parfum" : "déodorant"}. Famille : <b className="text-[#F3D98B]">{p.family}</b>.
              <a href={waLink(`Bonjour, pouvez-vous me décrire ${p.brand} ${p.name} ? 🌸`)} target="_blank" rel="noreferrer" className="mt-4 flex w-fit items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white">
                <WhatsAppIcon className="h-4 w-4" /> Demander les notes
              </a>
            </div>
          )}
          <div className="mt-8 flex flex-col items-center gap-2">
            {tiers.filter(([, , notes]) => notes).map(([title, when, notes, w], i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`${w} rounded-2xl p-4 text-center`} style={{ background: `rgba(212,175,55,${0.12 + i * 0.1})` }}>
                <p className="text-[10px] uppercase tracking-[.25em] text-[#F3D98B]">{title} · <span className="normal-case tracking-normal text-white/50">{when}</span></p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {notes.split(",").map((n) => <span key={n} className="rounded-full bg-white/10 px-3 py-1 text-xs">{n.trim()}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </Tile>
        <Tile delay={0.1} className="bg-white p-6 ring-1 ring-[#E8C5C8] sm:p-8">
          <p className="text-[10px] uppercase tracking-[.35em] text-[#C59B27]">Profil</p>
          <h2 className="font-display mt-2 text-3xl text-[#2A1625]">{MOODS[p.mood]}</h2>
          <div className="mt-6 space-y-4">
            <Gauge label="Sillage" value={profile.sillage} />
            <Gauge label="Tenue" value={profile.tenue} />
          </div>
          <p className="mb-2 mt-6 text-xs font-semibold text-[#2A1625]/70">Saisons</p>
          <div className="flex flex-wrap gap-1.5">{profile.seasons.map((x) => <span key={x} className="rounded-full bg-[#F4E3E2] px-3 py-1 text-xs text-[#2A1625]">{x}</span>)}</div>
          <p className="mb-2 mt-4 text-xs font-semibold text-[#2A1625]/70">Moments</p>
          <div className="flex flex-wrap gap-1.5">{profile.moments.map((x) => <span key={x} className="rounded-full bg-[#FDF8F7] px-3 py-1 text-xs text-[#2A1625] ring-1 ring-[#E8C5C8]">{x}</span>)}</div>
        </Tile>
      </section>

      <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
        <Tile className="bg-white px-6 py-2 ring-1 ring-[#E8C5C8] sm:px-10">
          <Accordion items={[
            ["Description", describeProduct(p)],
            ["Conseils d'application", "Vaporisez à 15 cm de la peau sur les points de chaleur : poignets, cou, derrière les oreilles. Évitez de frotter pour préserver les notes de tête. Sur les vêtements, la tenue est encore prolongée."],
            ["Livraison & paiement", `Livraison partout au Maroc en 24 à 72h. Frais de ${fmt(SHIPPING_FEE)}, offerts dès ${fmt(FREE_SHIPPING_FROM)} d'achat. Vous payez en espèces à la réception du colis. Confirmation de commande par WhatsApp.`],
            ["Authenticité", "Tous nos produits sont 100% originaux. Une question sur un produit ? Demandez-nous des photos ou une vidéo sur WhatsApp avant de commander."],
          ]} />
        </Tile>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl text-[#2A1625] sm:text-5xl"><SplitWords text="Vous aimerez" inView /> <em className="text-[#C59B27]"><SplitWords text="aussi" inView delay={0.15} /></em></h2>
          <button onClick={() => goTo(genderPage)} className="hidden items-center gap-1 text-sm font-semibold text-[#2A1625] sm:inline-flex">{GENDER_PAGES[genderPage].title} <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
          {related.map((r, i) => <FlipCard key={r.id} p={r} onAdd={onAdd} index={i} />)}
        </div>
      </section>

      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.4, type: "spring", damping: 22 }}
        className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 rounded-full bg-[#2A1625] p-2 pl-4 text-white shadow-[0_20px_50px_-15px_rgba(42,22,37,.6)] lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-white/60">{p.brand} {p.name}</p>
          <p className="font-semibold">{fmt(p.price * qty)}</p>
        </div>
        <a href={orderLink} target="_blank" rel="noreferrer" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366]" aria-label="Commander via WhatsApp"><WhatsAppIcon className="h-5 w-5" /></a>
        <motion.button whileTap={{ scale: 0.95 }} onClick={add} className={`h-11 shrink-0 rounded-full px-5 text-sm font-semibold ${added ? "bg-[#C59B27] text-white" : "bg-[#F3D98B] text-[#2A1625]"}`}>
          {added ? "Ajouté ✓" : "Ajouter"}
        </motion.button>
        {cartCount > 0 && (
          <button onClick={onOpenCart} className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10" aria-label="Voir le panier">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#C59B27] px-1 text-[10px] font-bold">{cartCount}</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}

/* ---------- APP ---------- */
export default function RosaParcAtelier() {
  const cart = useCart();
  const [checkout, setCheckout] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [search, setSearch] = useState(false);
  useSearchShortcut(setSearch);
  const flyer = useFlyToCart(() => setCheckout(true));
  const onAdd = (p, qty = 1) => { cart.add(p, qty); flyer.fly(p, qty); };
  const pickBrand = (b) => { setCategory("all"); setOffersOnly(false); setBrand(b); scrollToId("a-catalogue"); };
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState(null);
  const [offersOnly, setOffersOnly] = useState(false);
  const [query, setQuery] = useState("");

  const route = useHashRoute();
  const onNav = (n) => {
    if (n.page) { goTo(n.page); if (n.page === "accueil") window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (n.category) { setCategory(n.category); setBrand(null); setOffersOnly(false); }
    if (n.offers) { setCategory("all"); setBrand(null); setOffersOnly(true); }
    scrollToId(`a-${n.section}`);
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="font-body min-h-screen overflow-x-clip bg-[#FDF8F7] text-[#2A1625] antialiased selection:bg-[#E8C5C8]">
      <BaseStyles />
      <ScrollProgress />
      <a href="#contenu" className="sr-only z-[80] rounded-full bg-[#2A1625] px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Aller au contenu</a>
      <TopBar />
      <Nav count={cart.count} onCart={() => setCheckout(true)} onNav={onNav} onSearch={() => setSearch(true)} route={route} />
      <main id="contenu">
        <AnimatePresence mode="wait">
          <motion.div key={route} onAnimationComplete={() => route === "accueil" && flushPendingSection()} initial={{ opacity: 0, y: 30, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            {route === "accueil" && (
              <>
                <HeroBento onQuiz={() => setQuiz(true)} onNav={onNav} onAdd={onAdd} />
                <Reassurance />
                <RecentlyViewed />
                <BrandRibbon onPick={pickBrand} />
                <Catalogue category={category} setCategory={setCategory} brand={brand} setBrand={setBrand} offersOnly={offersOnly} setOffersOnly={setOffersOnly} query={query} setQuery={setQuery} onAdd={onAdd} />
                <Brands onPick={pickBrand} />
              </>
            )}
            {GENDER_PAGES[route] && <GenderPage pageKey={route} onAdd={onAdd} onQuiz={() => setQuiz(true)} />}
            {route === "contact" && <ContactPage />}
            {productIdFromRoute(route) && <ProductPage id={productIdFromRoute(route)} onAdd={onAdd} onOpenCart={() => setCheckout(true)} cartCount={cart.count} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer onNav={onNav} />
      <FloatingCart cart={cart} onOpen={() => setCheckout(true)} hidden={checkout || quiz || search || !!productIdFromRoute(route)} />
      <BackToTop raised={cart.count > 0 || !!productIdFromRoute(route)} />
      <Quiz open={quiz} onClose={() => setQuiz(false)} onAdd={onAdd} />
      <SearchOverlay open={search} onClose={() => setSearch(false)} onPickBrand={pickBrand} />
      <Checkout open={checkout} onClose={() => setCheckout(false)} cart={cart} />
      {flyer.layer}
    </div>
    </MotionConfig>
  );
}
