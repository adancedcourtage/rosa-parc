import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import {
  Search,
  ShoppingBag,
  X,
  Menu,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Truck,
  Wallet,
  MessageCircle,
  Sparkles,
  Star,
  ArrowRight,
  ArrowUpDown,
  Instagram,
  MapPin,
  Phone,
  Check,
  Flame,
  Droplets,
  Wind,
  ChevronDown,
  Clock,
} from "lucide-react";

import {
  WHATSAPP_NUMBER, WHATSAPP_DISPLAY, INSTAGRAM_URL, FREE_SHIPPING_FROM, SHIPPING_FEE,
  BRANDS, CORE_PRODUCTS as PRODUCTS, MOODS, GENDER_PAGES, GENDER_LABEL, SITE_NAV, HOURS, CONTACT_SUBJECTS, DELIVERY_CITIES,
  useHashRoute, goTo, goToSection, useGenderProducts, useContactForm, scrollToId, flushPendingSection,
} from "../shared.jsx";

/* =========================================================================
   CONFIG
   ========================================================================= */


const NAV = [{ label: "Accueil", page: "accueil" }, ...SITE_NAV];

const SORTS = [
  { id: "popularity", label: "Popularité" },
  { id: "price-asc", label: "Prix croissant" },
  { id: "price-desc", label: "Prix décroissant" },
  { id: "rating", label: "Mieux notés" },
];

const fmt = (n) => `${n.toLocaleString("fr-FR")} DH`;
const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const scrollTo = (id) => scrollToId(id);
const searchable = (p) => `${p.brand} ${p.name} ${p.family} ${Object.values(p.notes).join(" ")}`.toLowerCase();

/* =========================================================================
   GLOBAL STYLES (shimmer, marquee, gold text)
   ========================================================================= */

const GlobalStyles = () => (
  <style>{`
    .font-display { font-family: 'Cormorant Garamond', 'Playfair Display', serif; }
    .font-body { font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif; }
    html { scroll-behavior: smooth; }
    .shimmer { position: relative; overflow: hidden; isolation: isolate; }
    .shimmer::after {
      content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
      background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,.45) 50%, transparent 75%);
      transform: translateX(-120%); transition: transform .9s cubic-bezier(.2,.7,.2,1);
    }
    .shimmer:hover::after { transform: translateX(120%); }
    .gold-text {
      background: linear-gradient(90deg, #C59B27, #F3D98B, #D4AF37, #C59B27);
      background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
      animation: goldflow 6s ease-in-out infinite;
    }
    @keyframes goldflow { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
    @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
    .marquee { animation: marquee 40s linear infinite; }
    .marquee:hover { animation-play-state: paused; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { scrollbar-width: none; }
    @media (prefers-reduced-motion: reduce) {
      .marquee, .gold-text { animation: none; }
      html { scroll-behavior: auto; }
    }
  `}</style>
);

/* =========================================================================
   BOTTLE ILLUSTRATION (SVG, aucune image externe)
   ========================================================================= */

function Bottle({ shape = "classic", colors = ["#E8C5C8", "#C59B27"], brand = "", className = "" }) {
  const uid = useId().replace(/:/g, "");
  const [c1, c2] = colors;
  const glass = `glass-${uid}`;
  const gold = `gold-${uid}`;
  const shine = `shine-${uid}`;

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
      <ellipse cx="60" cy="197" rx="42" ry="3" fill="#2A1625" opacity=".12" />
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

/* =========================================================================
   SMALL UI PIECES
   ========================================================================= */

function GoldButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`shimmer inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#C59B27] px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_10px_30px_-10px_rgba(197,155,39,.8)] transition-shadow hover:shadow-[0_14px_40px_-8px_rgba(212,175,55,.9)] ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function WhatsAppIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.42 9.43-9.42 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.42 9.42zm8.02-17.44A11.27 11.27 0 0 0 12.05.75C5.8.75.72 5.83.72 12.08c0 2 .52 3.95 1.52 5.67L.62 23.25l5.63-1.48a11.3 11.3 0 0 0 5.4 1.37h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01z" />
    </svg>
  );
}

function Stars({ value }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-[#2A1625]/70">
      <Star className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />
      {value.toFixed(1)}
    </span>
  );
}

/* =========================================================================
   SEARCH (composant stable : ne perd pas le focus à chaque frappe)
   ========================================================================= */

function SearchBox({ query, setQuery, onPick, autoFocus = false }) {
  const [focus, setFocus] = useState(false);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? PRODUCTS.filter((p) => searchable(p).includes(q)).slice(0, 6) : [];
  }, [query]);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2A1625]/50" />
      <input
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
        onKeyDown={(e) => e.key === "Enter" && scrollTo("catalogue")}
        placeholder="Rechercher un parfum, une marque, une note…"
        className="w-full rounded-full border border-[#E8C5C8]/70 bg-white/70 py-2.5 pl-11 pr-10 text-sm text-[#1A1A1A] outline-none ring-[#D4AF37]/40 placeholder:text-[#2A1625]/40 focus:border-[#D4AF37] focus:ring-4"
      />
      {query && (
        <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#2A1625]/50 hover:bg-[#F4E3E2]" aria-label="Effacer">
          <X className="h-4 w-4" />
        </button>
      )}
      <AnimatePresence>
        {focus && query && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#E8C5C8]/60 bg-white/95 shadow-2xl backdrop-blur-xl"
          >
            {results.length === 0 ? (
              <p className="p-4 text-sm text-[#2A1625]/60">Aucun résultat pour « {query} »</p>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  onMouseDown={(e) => { e.preventDefault(); onPick(p); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[#FDF8F7]"
                >
                  <div className="h-12 w-10 shrink-0"><Bottle shape={p.shape} colors={p.colors} brand={p.brand} className="h-full w-full" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#C59B27]">{p.brand}</p>
                    <p className="truncate text-sm font-medium text-[#1A1A1A]">{p.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#2A1625]">{fmt(p.price)}</span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
   NAVBAR
   ========================================================================= */

function Navbar({ cartCount, onCart, query, setQuery, onNav, onPickProduct, route }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pick = (p) => { onPickProduct(p); setMobileSearch(false); };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`flex items-center gap-2 rounded-full border px-2 py-2 transition-all duration-500 sm:gap-3 sm:px-5 ${scrolled ? "border-[#E8C5C8]/60 bg-white/70 shadow-[0_10px_40px_-15px_rgba(42,22,37,.25)] backdrop-blur-md" : "border-white/50 bg-white/40 backdrop-blur-md"}`}>
          <button onClick={() => setMobileOpen(true)} className="rounded-full p-2 text-[#2A1625] xl:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>

          <button onClick={() => onNav(NAV[0])} className="flex shrink-0 items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#E8C5C8] to-[#D4AF37] text-white shadow-inner">
              <span className="font-display text-lg font-bold leading-none">R</span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold text-[#2A1625] sm:text-xl">Rosa Parc</span>
              <span className="gold-text text-[8px] font-semibold uppercase tracking-[.35em] sm:text-[9px]">Parfumerie</span>
            </span>
          </button>

          <nav className="ml-4 hidden items-center gap-0.5 xl:flex">
            {NAV.slice(1).map((n) => (
              <button key={n.label} onClick={() => onNav(n)} className={`group relative whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium transition hover:text-[#2A1625] ${n.page === route ? "text-[#2A1625]" : "text-[#2A1625]/70"}`}>
                {n.label}
                <span className={`absolute inset-x-2.5 bottom-1 h-px origin-left bg-[#D4AF37] transition-transform duration-300 group-hover:scale-x-100 ${n.page === route ? "scale-x-100" : "scale-x-0"}`} />
              </button>
            ))}
          </nav>

          <div className="ml-auto hidden max-w-sm flex-1 md:block xl:max-w-[230px]">
            <SearchBox query={query} setQuery={setQuery} onPick={pick} />
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:ml-2">
            <button onClick={() => setMobileSearch((s) => !s)} className="rounded-full p-2.5 text-[#2A1625] md:hidden" aria-label="Rechercher">
              <Search className="h-5 w-5" />
            </button>
            <a
              href={waLink("Bonjour Rosa Parc Parfumerie, j'ai une question 🌸")}
              target="_blank" rel="noreferrer"
              className="shimmer hidden items-center gap-2 rounded-full bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white sm:inline-flex xl:px-4"
              aria-label="Contact WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" /> <span className="hidden xl:inline">WhatsApp</span>
            </a>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onCart}
              className="relative rounded-full bg-[#2A1625] p-2.5 text-white"
              aria-label="Panier"
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: [1.6, 1], rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#D4AF37] px-1 text-[10px] font-bold text-white ring-2 ring-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {mobileSearch && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-2 md:hidden">
              <SearchBox query={query} setQuery={setQuery} onPick={pick} autoFocus />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu (glisser ← pour fermer) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-[#2A1625]/40 backdrop-blur-sm xl:hidden" />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0.4, right: 0 }}
              onDragEnd={(_, i) => i.offset.x < -80 && setMobileOpen(false)}
              className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col overflow-y-auto bg-[#FDF8F7] p-6 shadow-2xl xl:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-2xl font-semibold text-[#2A1625]">Rosa Parc</span>
                <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 hover:bg-[#F4E3E2]" aria-label="Fermer"><X className="h-5 w-5" /></button>
              </div>
              {NAV.map((n, i) => (
                <motion.button
                  key={n.label}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}
                  onClick={() => { onNav(n); setMobileOpen(false); }}
                  className={`border-b border-[#E8C5C8]/50 py-3 text-left font-display text-2xl ${n.page === route ? "text-[#C59B27]" : "text-[#2A1625]"}`}
                >
                  {n.label}
                </motion.button>
              ))}
              <a href={waLink("Bonjour Rosa Parc Parfumerie 🌸")} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-semibold text-white">
                <WhatsAppIcon /> {WHATSAPP_DISPLAY}
              </a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* =========================================================================
   HERO
   ========================================================================= */

function TiltCard({ product, index, onAdd }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [14, -14]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-14, 14]), { stiffness: 200, damping: 18 });
  const glareX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.15, duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}>
        <motion.div
          onPointerMove={onMove}
          onPointerLeave={reset}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_30px_60px_-25px_rgba(42,22,37,.35)] backdrop-blur-md"
        >
          <motion.div
            style={{ left: glareX }}
            className="pointer-events-none absolute -top-1/2 h-[200%] w-24 -translate-x-1/2 rotate-12 bg-white/40 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
          />
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-[#2A1625] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.2em] text-[#F3D98B]">Bestseller</span>
            <Stars value={product.rating} />
          </div>
          <div style={{ transform: "translateZ(50px)" }} className="mx-auto h-44 w-32 drop-shadow-[0_20px_25px_rgba(42,22,37,.3)] transition-transform duration-500 group-hover:scale-105">
            <Bottle shape={product.shape} colors={product.colors} brand={product.brand} className="h-full w-full" />
          </div>
          <div style={{ transform: "translateZ(30px)" }} className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#C59B27]">{product.brand}</p>
            <p className="font-display text-xl font-semibold leading-tight text-[#1A1A1A]">{product.name}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold text-[#2A1625]">{fmt(product.price)}</span>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => onAdd(product)} className="grid h-9 w-9 place-items-center rounded-full bg-[#2A1625] text-white transition hover:bg-[#C59B27]" aria-label={`Ajouter ${product.name}`}>
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Particles() {
  const dots = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({
      id: i, left: Math.random() * 100, top: Math.random() * 100,
      size: 3 + Math.random() * 6, dur: 8 + Math.random() * 10, delay: Math.random() * 5,
    })), []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-[#D4AF37]/40 blur-[1px]"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -60, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Hero({ onAdd }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const bestsellers = PRODUCTS.filter((p) => p.bestseller && p.category === "parfum").slice(0, 3);
  const words = ["L'Élégance", "des", "Fragrances", "d'Exception"];

  return (
    <section id="accueil" ref={ref} className="relative overflow-hidden bg-[#FDF8F7] pb-16 pt-32 sm:pt-40">
      <motion.div animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#E8C5C8] opacity-60 blur-3xl" />
      <motion.div animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-24 top-20 h-[26rem] w-[26rem] rounded-full bg-[#F3D98B] opacity-40 blur-3xl" />
      <motion.div animate={{ x: [0, 30, 0], y: [0, -40, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#F4E3E2] opacity-70 blur-3xl" />
      <Particles />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <motion.div style={{ y: yText, opacity }}>
          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-white/60 px-4 py-1.5 text-xs font-medium tracking-wide text-[#2A1625] backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#C59B27]" /> Parfums orientaux & français · 100% originaux
          </motion.span>

          <h1 className="font-display mt-6 text-[2.75rem] font-semibold leading-[1.02] text-[#1A1A1A] sm:text-6xl lg:text-7xl">
            {words.map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                className={`mr-3 inline-block ${i === 2 ? "gold-text italic" : ""}`}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-6 max-w-lg text-base leading-relaxed text-[#2A1625]/70 sm:text-lg">
            Lattafa, Armaf, Afnan, French Avenue… Les plus belles signatures olfactives sélectionnées pour vous, livrées partout au Maroc et payées à la réception.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }} className="mt-8 flex flex-wrap items-center gap-3">
            <GoldButton onClick={() => scrollTo("catalogue")}>
              Découvrir la Collection <ArrowRight className="h-4 w-4" />
            </GoldButton>
            <a href={waLink("Bonjour, je souhaite un conseil parfum 🌸")} target="_blank" rel="noreferrer" className="shimmer inline-flex items-center gap-2 rounded-full border border-[#2A1625]/15 bg-white/60 px-6 py-3.5 text-sm font-semibold text-[#2A1625] backdrop-blur-md transition hover:border-[#25D366]">
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Conseil personnalisé
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="mt-10 flex items-center gap-6 sm:gap-10">
            {[["18", "Marques"], ["4.8★", "Avis clients"], ["48h", "Livraison"]].map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-3xl font-semibold text-[#2A1625]">{v}</p>
                <p className="text-[10px] uppercase tracking-[.2em] text-[#2A1625]/50 sm:text-xs">{l}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="min-w-0">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.3em] text-[#C59B27]">
            <Flame className="h-4 w-4" /> Bestsellers du moment
          </p>
          {/* Mobile : carrousel swipe snap · Desktop : grille 3 colonnes */}
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-10 pt-2 xl:mx-0 xl:grid xl:grid-cols-3 xl:overflow-visible xl:px-0">
            {bestsellers.map((p, i) => (
              <div key={p.id} className={`w-[64vw] max-w-[230px] shrink-0 snap-center xl:w-auto xl:max-w-none ${i === 1 ? "xl:translate-y-10" : ""}`}>
                <TiltCard product={p} index={i} onAdd={onAdd} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        onClick={() => scrollTo("catalogue")}
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
        className="relative mx-auto mt-6 hidden h-10 w-10 place-items-center rounded-full border border-[#2A1625]/15 text-[#2A1625]/60 lg:grid"
        aria-label="Défiler vers la collection"
      >
        <ChevronDown className="h-5 w-5" />
      </motion.button>
    </section>
  );
}

/* =========================================================================
   REASSURANCE
   ========================================================================= */

function Reassurance() {
  const items = [
    { icon: ShieldCheck, title: "100% Authentique & Original", text: "Produits garantis d'origine" },
    { icon: Truck, title: "Livraison rapide au Maroc", text: "Partout au Maroc en 24–72h" },
    { icon: Wallet, title: "Paiement à la livraison", text: "Payez à la réception" },
    { icon: MessageCircle, title: "Service Client WhatsApp", text: "Conseil 7j/7" },
  ];
  return (
    <section className="relative border-y border-[#E8C5C8]/50 bg-white">
      <div className="no-scrollbar mx-auto flex max-w-7xl snap-x gap-6 overflow-x-auto px-4 py-6 sm:px-6 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {items.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="group flex min-w-[240px] snap-start items-center gap-4"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FDF8F7] to-[#F4E3E2] text-[#C59B27] transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-110">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
              <p className="text-xs text-[#2A1625]/60">{text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   PRODUCT CARD
   ========================================================================= */

const ProductCard = React.forwardRef(function ProductCard({ product, onAdd }, ref) {
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const quickOrder = waLink(
    `Bonjour Rosa Parc Parfumerie 🌸\nJe souhaite commander :\n• ${product.brand} ${product.name} (${product.volume}) — ${fmt(product.price)}\n\nMerci de me confirmer la disponibilité.`
  );

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#E8C5C8]/50 bg-white shadow-[0_10px_40px_-25px_rgba(42,22,37,.3)] transition-shadow duration-500 hover:shadow-[0_25px_60px_-25px_rgba(42,22,37,.45)]"
    >
      {/* Visuel (tap mobile = afficher les notes) */}
      <div
        className="relative aspect-[4/5] cursor-pointer overflow-hidden"
        style={{ background: `radial-gradient(120% 90% at 50% 100%, ${product.colors[1]}40, #FDF8F7 62%)` }}
        onClick={() => setHover((h) => !h)}
      >
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5 sm:left-3 sm:top-3">
          {product.bestseller && <span className="rounded-full bg-[#2A1625] px-2 py-1 text-[8px] font-semibold uppercase tracking-[.18em] text-[#F3D98B] sm:px-2.5 sm:text-[9px]">Bestseller</span>}
          {discount > 0 && <span className="w-fit rounded-full bg-[#D4AF37] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white sm:px-2.5">-{discount}%</span>}
        </div>
        <span className="absolute right-2.5 top-2.5 z-10 hidden rounded-full bg-white/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.18em] text-[#2A1625] backdrop-blur-md sm:block">
          {product.category === "parfum" ? "Parfum" : "Déodorant"}
        </span>

        <motion.div
          animate={hover ? { rotate: -8, scale: 1.08, y: -10 } : { rotate: 0, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="absolute inset-0 grid place-items-center p-6 sm:p-8"
        >
          <Bottle shape={product.shape} colors={hover ? [product.colors[1], product.colors[0]] : product.colors} brand={product.brand} className="h-full max-h-60 w-auto drop-shadow-[0_25px_25px_rgba(42,22,37,.25)]" />
        </motion.div>

        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ y: "110%" }} animate={{ y: 0 }} exit={{ y: "110%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-x-2 bottom-2 z-10 rounded-2xl border border-white/60 bg-white/80 p-2.5 backdrop-blur-md sm:p-3"
            >
              <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-[.25em] text-[#C59B27] sm:text-[9px]">Pyramide olfactive</p>
              {[[Wind, "Tête", product.notes.top], [Droplets, "Cœur", product.notes.heart], [Flame, "Fond", product.notes.base]].map(([Icon, label, val]) => (
                <div key={label} className="flex items-start gap-1.5 py-0.5 text-[10px] leading-snug text-[#2A1625] sm:text-[11px]">
                  <Icon className="mt-0.5 h-3 w-3 shrink-0 text-[#C59B27]" />
                  <span><b className="font-semibold">{label} :</b> {val}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[9px] font-semibold uppercase tracking-[.2em] text-[#C59B27] sm:text-[10px]">{product.brand}</p>
          <Stars value={product.rating} />
        </div>
        <h3 className="font-display mt-1 text-lg font-semibold leading-tight text-[#1A1A1A] sm:text-2xl">{product.name}</h3>
        <p className="mt-1 text-[11px] text-[#2A1625]/55 sm:text-xs">{product.family} · {product.volume}</p>

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-base font-bold text-[#2A1625] sm:text-lg">{fmt(product.price)}</span>
          {product.oldPrice && <span className="text-xs text-[#2A1625]/40 line-through sm:text-sm">{fmt(product.oldPrice)}</span>}
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <a href={quickOrder} target="_blank" rel="noreferrer" className="shimmer inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1EBE5A] sm:text-sm">
            <WhatsAppIcon className="h-4 w-4" /> Commander
          </a>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleAdd}
            className={`shimmer inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors sm:h-11 sm:w-11 ${added ? "bg-[#D4AF37]" : "bg-[#2A1625] hover:bg-[#C59B27]"}`}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span key="ok" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}><Check className="h-4 w-4" /></motion.span>
              ) : (
                <motion.span key="bag" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><ShoppingBag className="h-4 w-4" /></motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
});

/* =========================================================================
   CATALOGUE
   ========================================================================= */

function Catalogue({ category, setCategory, brand, setBrand, offersOnly, setOffersOnly, query, setQuery, onAdd }) {
  const [sort, setSort] = useState("popularity");
  const [sortOpen, setSortOpen] = useState(false);

  const tabs = [
    { id: "all", label: "Tous les produits" },
    { id: "parfum", label: "Parfums" },
    { id: "deodorant", label: "Déodorants" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PRODUCTS.filter((p) =>
      (category === "all" || p.category === category) &&
      (!brand || p.brand === brand) &&
      (!offersOnly || p.oldPrice) &&
      (!q || searchable(p).includes(q))
    );
    const sorters = {
      popularity: (a, b) => b.popularity - a.popularity,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
    };
    return [...list].sort(sorters[sort]);
  }, [category, brand, offersOnly, query, sort]);

  const brandCounts = useMemo(() => {
    const m = {};
    PRODUCTS.forEach((p) => { if (category === "all" || p.category === category) m[p.brand] = (m[p.brand] || 0) + 1; });
    return m;
  }, [category]);

  const activeFilters = [
    brand && { k: "brand", label: brand },
    offersOnly && { k: "offers", label: "Offres" },
    query && { k: "q", label: `« ${query} »` },
  ].filter(Boolean);

  const resetAll = () => { setBrand(null); setOffersOnly(false); setQuery(""); setCategory("all"); };

  return (
    <section id="catalogue" className="relative scroll-mt-20 bg-gradient-to-b from-white via-[#FDF8F7] to-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[.35em] text-[#C59B27]">La Collection</p>
          <h2 className="font-display mt-3 text-4xl font-semibold text-[#1A1A1A] sm:text-5xl">Trouvez votre signature</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#2A1625]/60 sm:text-base">Survolez ou touchez un flacon pour découvrir sa pyramide olfactive.</p>
        </motion.div>

        {/* Onglets catégories */}
        <div className="flex justify-center">
          <div className="no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-[#E8C5C8]/60 bg-white/70 p-1.5 backdrop-blur-md">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setCategory(t.id); setBrand(null); }}
                className={`relative whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:px-6 ${category === t.id ? "text-white" : "text-[#2A1625]/70 hover:text-[#2A1625]"}`}
              >
                {category === t.id && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-[#2A1625]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Marques + tri */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="relative min-w-0 flex-1">
            <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
              <button
                onClick={() => setBrand(null)}
                className={`shrink-0 snap-start rounded-full border px-4 py-2 text-xs font-semibold transition ${!brand ? "border-[#D4AF37] bg-[#D4AF37] text-white" : "border-[#E8C5C8] bg-white text-[#2A1625]/70 hover:border-[#D4AF37]"}`}
              >
                Toutes les marques
              </button>
              {BRANDS.map((b) => {
                const count = brandCounts[b] || 0;
                const active = brand === b;
                return (
                  <motion.button
                    key={b}
                    whileTap={{ scale: 0.94 }}
                    disabled={!count}
                    onClick={() => setBrand(active ? null : b)}
                    className={`shrink-0 snap-start rounded-full border px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${active ? "border-[#2A1625] bg-[#2A1625] text-[#F3D98B]" : "border-[#E8C5C8] bg-white text-[#2A1625]/80 hover:border-[#D4AF37] hover:text-[#2A1625]"}`}
                  >
                    {b} <span className="ml-1 opacity-50">{count}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="relative flex shrink-0 items-center gap-2 self-end lg:self-start">
            <button
              onClick={() => setOffersOnly(!offersOnly)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${offersOnly ? "border-[#D4AF37] bg-[#D4AF37] text-white" : "border-[#E8C5C8] bg-white text-[#2A1625]/80"}`}
            >
              % Offres
            </button>
            <button onClick={() => setSortOpen((s) => !s)} className="inline-flex items-center gap-2 rounded-full border border-[#E8C5C8] bg-white px-4 py-2 text-xs font-semibold text-[#2A1625]">
              <ArrowUpDown className="h-3.5 w-3.5" /> {SORTS.find((s) => s.id === sort).label}
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-[#E8C5C8]/60 bg-white/95 py-1 shadow-xl backdrop-blur-md"
                >
                  {SORTS.map((s) => (
                    <li key={s.id}>
                      <button onClick={() => { setSort(s.id); setSortOpen(false); }} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[#2A1625] hover:bg-[#FDF8F7]">
                        {s.label} {sort === s.id && <Check className="h-4 w-4 text-[#C59B27]" />}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Filtres actifs */}
        <div className="mt-5 flex min-h-8 flex-wrap items-center gap-2 text-sm text-[#2A1625]/60">
          <span><b className="text-[#2A1625]">{filtered.length}</b> produit{filtered.length > 1 ? "s" : ""}</span>
          <AnimatePresence>
            {activeFilters.map((f) => (
              <motion.button
                key={f.k} layout
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => (f.k === "brand" ? setBrand(null) : f.k === "offers" ? setOffersOnly(false) : setQuery(""))}
                className="inline-flex items-center gap-1 rounded-full bg-[#F4E3E2] px-3 py-1 text-xs font-medium text-[#2A1625]"
              >
                {f.label} <X className="h-3 w-3" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Grille */}
        <motion.div layout className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 text-center">
              <p className="font-display text-3xl text-[#2A1625]">Aucun produit trouvé</p>
              <p className="mt-2 text-sm text-[#2A1625]/60">Essayez une autre marque, ou demandez-nous sur WhatsApp.</p>
              <button onClick={resetAll} className="mt-6 rounded-full border border-[#2A1625] px-6 py-2.5 text-sm font-semibold text-[#2A1625]">Réinitialiser les filtres</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* =========================================================================
   BRANDS
   ========================================================================= */

function Brands({ onPick }) {
  const row = [...BRANDS, ...BRANDS];
  return (
    <section id="marques" className="relative scroll-mt-20 overflow-hidden bg-[#2A1625] py-20 text-white sm:py-28">
      <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#E8C5C8]/15 blur-3xl" />
      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#D4AF37]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[.35em] text-[#F3D98B]">Nos Marques Partenaires</p>
          <h2 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">18 maisons, une seule exigence</h2>
        </motion.div>
      </div>

      <div className="relative mt-12 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee flex w-max gap-4">
          {row.map((b, i) => (
            <span key={i} className="font-display whitespace-nowrap rounded-full border border-white/15 px-6 py-3 text-2xl italic text-white/70">{b}</span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-6">
        {BRANDS.map((b, i) => {
          const n = PRODUCTS.filter((p) => p.brand === b).length;
          return (
            <motion.button
              key={b}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.06 }}
              whileHover={{ y: -6 }}
              onClick={() => onPick(b)}
              className="shimmer group flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:border-[#D4AF37]/60 hover:bg-white/10"
            >
              <span className="font-display text-center text-xl font-semibold leading-tight text-white transition-colors group-hover:text-[#F3D98B] sm:text-2xl">{b}</span>
              <span className="mt-2 text-[10px] uppercase tracking-[.25em] text-white/40">{n} produit{n > 1 ? "s" : ""}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================================
   CART DRAWER
   ========================================================================= */

function CartDrawer({ open, onClose, cart, setQty, remove, clear }) {
  const [form, setForm] = useState({ name: "", city: "", address: "", phone: "" });
  const [errors, setErrors] = useState({});

  const items = cart.map((c) => ({ ...PRODUCTS.find((p) => p.id === c.id), qty: c.qty }));
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const checkout = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.city.trim()) e.city = true;
    if (!form.address.trim()) e.address = true;
    setErrors(e);
    if (Object.keys(e).length) return;

    const lines = items.map((i) => `• ${i.qty} × ${i.brand} ${i.name} (${i.volume}) — ${fmt(i.price * i.qty)}`).join("\n");
    const msg =
      `Bonjour Rosa Parc Parfumerie 🌸\nJe souhaite passer la commande suivante :\n\n${lines}\n\n` +
      `Sous-total : ${fmt(subtotal)}\nLivraison : ${shipping ? fmt(shipping) : "Offerte"}\n*Total : ${fmt(total)}*\n\n` +
      `👤 Nom : ${form.name}\n📍 Ville : ${form.city}\n🏠 Adresse : ${form.address}` +
      (form.phone ? `\n📞 Téléphone : ${form.phone}` : "") +
      `\n\n💵 Paiement à la livraison. Merci !`;
    window.open(waLink(msg), "_blank", "noopener");
  };

  const field = (key, label, placeholder, type = "text", autoComplete) => (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[.15em] text-[#2A1625]/60">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        value={form[key]}
        onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: false }); }}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-base outline-none transition focus:ring-4 focus:ring-[#D4AF37]/25 sm:text-sm ${errors[key] ? "border-red-400" : "border-[#E8C5C8] focus:border-[#D4AF37]"}`}
      />
    </label>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-[#2A1625]/40 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            drag="x" dragDirectionLock dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: 0.5 }}
            onDragEnd={(_, i) => (i.offset.x > 100 || i.velocity.x > 500) && onClose()}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#FDF8F7] shadow-2xl"
            role="dialog" aria-modal="true" aria-label="Panier"
          >
            <div className="flex items-center justify-between border-b border-[#E8C5C8]/60 px-5 py-4">
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#2A1625]">Votre panier</h3>
                <p className="text-xs text-[#2A1625]/50">{items.reduce((s, i) => s + i.qty, 0)} article(s) · glissez → pour fermer</p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-[#F4E3E2]" aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="h-36 w-24 opacity-60">
                  <Bottle shape="classic" colors={["#E8C5C8", "#F4E3E2"]} brand="Rosa Parc" className="h-full w-full" />
                </motion.div>
                <p className="font-display mt-6 text-2xl text-[#2A1625]">Votre panier est vide</p>
                <p className="mt-1 text-sm text-[#2A1625]/60">Laissez-vous tenter par nos fragrances.</p>
                <GoldButton className="mt-6" onClick={() => { onClose(); scrollTo("catalogue"); }}>Voir la collection</GoldButton>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
                  <div className="mb-4 rounded-2xl bg-white p-3">
                    <p className="text-xs text-[#2A1625]/70">
                      {subtotal >= FREE_SHIPPING_FROM
                        ? <>🎉 <b>Livraison offerte</b> débloquée !</>
                        : <>Plus que <b>{fmt(FREE_SHIPPING_FROM - subtotal)}</b> pour la livraison offerte</>}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F4E3E2]">
                      <motion.div animate={{ width: `${progress}%` }} className="h-full rounded-full bg-gradient-to-r from-[#E8C5C8] to-[#D4AF37]" />
                    </div>
                  </div>

                  <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {items.map((i) => (
                        <motion.li
                          key={i.id} layout
                          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
                          className="flex gap-3 rounded-2xl bg-white p-3"
                        >
                          <div className="grid h-20 w-16 shrink-0 place-items-center rounded-xl bg-[#FDF8F7] p-1.5">
                            <Bottle shape={i.shape} colors={i.colors} brand={i.brand} className="h-full w-full" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#C59B27]">{i.brand}</p>
                            <p className="truncate font-display text-lg font-semibold leading-tight text-[#1A1A1A]">{i.name}</p>
                            <p className="text-xs text-[#2A1625]/50">{i.volume}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center rounded-full border border-[#E8C5C8]">
                                <button onClick={() => setQty(i.id, i.qty - 1)} className="grid h-8 w-8 place-items-center" aria-label="Diminuer"><Minus className="h-3.5 w-3.5" /></button>
                                <motion.span key={i.qty} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-6 text-center text-sm font-semibold">{i.qty}</motion.span>
                                <button onClick={() => setQty(i.id, i.qty + 1)} className="grid h-8 w-8 place-items-center" aria-label="Augmenter"><Plus className="h-3.5 w-3.5" /></button>
                              </div>
                              <span className="text-sm font-bold text-[#2A1625]">{fmt(i.price * i.qty)}</span>
                            </div>
                          </div>
                          <button onClick={() => remove(i.id)} className="self-start rounded-full p-1.5 text-[#2A1625]/40 hover:bg-[#F4E3E2] hover:text-red-500" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  <button onClick={clear} className="mt-3 text-xs text-[#2A1625]/50 underline-offset-2 hover:underline">Vider le panier</button>

                  <div className="mt-6 space-y-3 rounded-2xl bg-white p-4">
                    <p className="font-display text-xl font-semibold text-[#2A1625]">Informations de livraison</p>
                    {field("name", "Nom complet *", "Ex : Salma Benali", "text", "name")}
                    {field("city", "Ville *", "Ex : Casablanca", "text", "address-level2")}
                    {field("address", "Adresse *", "Quartier, rue, n°…", "text", "street-address")}
                    {field("phone", "Téléphone (optionnel)", "06 XX XX XX XX", "tel", "tel")}
                    {Object.values(errors).some(Boolean) && <p className="text-xs text-red-500">Merci de remplir les champs obligatoires.</p>}
                  </div>
                </div>

                <div className="border-t border-[#E8C5C8]/60 bg-white/80 px-5 py-4 backdrop-blur-md">
                  <div className="space-y-1 text-sm text-[#2A1625]/70">
                    <div className="flex justify-between"><span>Sous-total</span><span>{fmt(subtotal)}</span></div>
                    <div className="flex justify-between"><span>Livraison</span><span>{shipping ? fmt(shipping) : <b className="text-[#C59B27]">Offerte</b>}</span></div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="font-display text-xl text-[#2A1625]">Total</span>
                    <motion.span key={total} initial={{ scale: 1.2, color: "#C59B27" }} animate={{ scale: 1, color: "#2A1625" }} className="text-2xl font-bold">{fmt(total)}</motion.span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={checkout}
                    className="shimmer mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,.7)]"
                  >
                    <WhatsAppIcon /> Finaliser ma commande sur WhatsApp
                  </motion.button>
                  <p className="mt-2 text-center text-[11px] text-[#2A1625]/50">Paiement à la livraison · Confirmation par WhatsApp</p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* =========================================================================
   FOOTER
   ========================================================================= */

function Footer({ onNav }) {
  return (
    <footer className="relative overflow-hidden bg-[#1A1A1A] text-white/80">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#2A1625] to-[#1A1A1A] p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h3 className="font-display text-3xl font-semibold text-white sm:text-4xl">Besoin d'un conseil parfum ?</h3>
            <p className="mt-2 text-sm text-white/60">Notre équipe vous répond sur WhatsApp, 7 jours sur 7.</p>
          </div>
          <a href={waLink("Bonjour, j'aimerais un conseil parfum 🌸")} target="_blank" rel="noreferrer" className="shimmer inline-flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white">
            <WhatsAppIcon /> Discuter maintenant
          </a>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-3xl font-semibold text-white">Rosa Parc</p>
            <p className="gold-text text-[10px] font-semibold uppercase tracking-[.4em]">Parfumerie</p>
            <p className="mt-4 text-sm leading-relaxed text-white/55">Parfums et déodorants originaux, orientaux et français. L'élégance livrée chez vous, partout au Maroc.</p>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-[#F3D98B]">Navigation</p>
            <ul className="space-y-2.5 text-sm">
              {NAV.map((n) => <li key={n.label}><button onClick={() => onNav(n)} className="transition hover:text-[#F3D98B]">{n.label}</button></li>)}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-[#F3D98B]">Livraison</p>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="flex gap-2"><Truck className="h-4 w-4 shrink-0 text-[#D4AF37]" /> Livraison partout au Maroc</li>
              <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-[#D4AF37]" /> Casablanca, Rabat, Marrakech, Tanger, Agadir…</li>
              <li className="flex gap-2"><Wallet className="h-4 w-4 shrink-0 text-[#D4AF37]" /> Paiement à la livraison</li>
              <li className="flex gap-2"><Sparkles className="h-4 w-4 shrink-0 text-[#D4AF37]" /> Offerte dès {fmt(FREE_SHIPPING_FROM)}</li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-[#F3D98B]">Contact</p>
            <div className="space-y-3">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-white/10 p-3 transition hover:border-[#25D366]">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon className="h-5 w-5" /></span>
                <span className="text-sm"><span className="block text-xs text-white/50">WhatsApp</span>{WHATSAPP_DISPLAY}</span>
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-white/10 p-3 transition hover:border-[#E8C5C8]">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white"><Instagram className="h-5 w-5" /></span>
                <span className="text-sm"><span className="block text-xs text-white/50">Instagram</span>@rosaparcparfumerie</span>
              </a>
              <a href="tel:+212784884694" className="flex items-center gap-2 pl-1 text-sm text-white/60 hover:text-white"><Phone className="h-4 w-4" /> 07 84 88 46 94</a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Rosa Parc Parfumerie. Tous droits réservés.</p>
          <p>Prix indicatifs en dirhams marocains (MAD), TTC.</p>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================================
   TOAST
   ========================================================================= */

function Toast({ toast }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 sm:bottom-8">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="flex items-center gap-3 rounded-full border border-white/20 bg-[#2A1625]/90 py-2 pl-2 pr-5 text-sm text-white shadow-2xl backdrop-blur-md"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#D4AF37]"><Check className="h-4 w-4" /></span>
            <span><b>{toast.name}</b> ajouté au panier</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* =========================================================================
   PAGES : HOMME / FEMME / MIXTE
   ========================================================================= */

function GenderSwitch({ current }) {
  return (
    <div className="inline-flex rounded-full border border-[#E8C5C8]/70 bg-white/70 p-1 backdrop-blur-md">
      {Object.entries(GENDER_PAGES).map(([k, v]) => (
        <button key={k} onClick={() => goTo(k)} className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${current === k ? "text-white" : "text-[#2A1625]/70 hover:text-[#2A1625]"}`}>
          {current === k && <motion.span layoutId="gender-pill" className="absolute inset-0 rounded-full bg-[#2A1625]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
          <span className="relative">{GENDER_LABEL[v.gender]}</span>
        </button>
      ))}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${active ? "border-[#2A1625] bg-[#2A1625] text-[#F3D98B]" : "border-[#E8C5C8] bg-white text-[#2A1625]/80 hover:border-[#D4AF37]"}`}>
      {children}
    </motion.button>
  );
}

function GenderPage({ pageKey, onAdd }) {
  const cfg = GENDER_PAGES[pageKey];
  const g = useGenderProducts(cfg.gender);
  const showcase = [...g.base].filter((p) => p.category === "parfum").sort((a, b) => b.popularity - a.popularity).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-[#FDF8F7] pb-14 pt-28 sm:pt-36">
        <motion.div animate={{ x: [0, 50, 0], scale: [1, 1.15, 1] }} transition={{ duration: 16, repeat: Infinity }} className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#E8C5C8] opacity-60 blur-3xl" />
        <motion.div animate={{ x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-[#F3D98B] opacity-40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs text-[#2A1625]/50">
              <button onClick={() => goTo("accueil")} className="hover:text-[#C59B27]">Accueil</button> / <span className="text-[#2A1625]">{cfg.title}</span>
            </p>
            <motion.p key={pageKey + "k"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-xs font-semibold uppercase tracking-[.35em] text-[#C59B27]">{cfg.kicker}</motion.p>
            <motion.h1 key={pageKey} initial={{ opacity: 0, y: 30, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7 }}
              className="font-display mt-3 text-5xl font-semibold leading-none text-[#1A1A1A] sm:text-7xl">
              {cfg.title.split(" ")[0]} <span className="gold-text italic">{cfg.title.split(" ").slice(1).join(" ")}</span>
            </motion.h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#2A1625]/70">{cfg.intro}</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <GenderSwitch current={pageKey} />
              <span className="text-sm text-[#2A1625]/55"><b className="text-[#2A1625]">{g.base.length}</b> produits</span>
            </div>
          </div>
          <div className="relative mx-auto flex h-64 w-full max-w-md items-end justify-center sm:h-80">
            {showcase.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 60, rotate: 0 }} animate={{ opacity: 1, y: 0, rotate: (i - 1) * 12 }} transition={{ delay: 0.2 + i * 0.12, type: "spring", stiffness: 120, damping: 14 }}
                className={`-mx-4 origin-bottom drop-shadow-[0_25px_25px_rgba(42,22,37,.3)] ${i === 1 ? "z-10 h-full" : "h-[78%]"}`}>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }} className="h-full">
                  <Bottle shape={p.shape} colors={p.colors} brand={p.brand} className="h-full w-auto" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
              <Chip active={g.category === "all"} onClick={() => g.setCategory("all")}>Tout</Chip>
              <Chip active={g.category === "parfum"} onClick={() => g.setCategory("parfum")}>Parfums</Chip>
              {g.hasDeo && <Chip active={g.category === "deodorant"} onClick={() => g.setCategory("deodorant")}>Déodorants</Chip>}
              <span className="mx-1 w-px shrink-0 bg-[#E8C5C8]" />
              {g.moods.map((m) => <Chip key={m} active={g.mood === m} onClick={() => g.setMood(g.mood === m ? null : m)}>{MOODS[m]}</Chip>)}
            </div>
            <select value={g.sort} onChange={(e) => g.setSort(e.target.value)} aria-label="Trier" className="self-end rounded-full border border-[#E8C5C8] bg-white px-4 py-2 text-xs font-semibold text-[#2A1625] outline-none">
              {SORTS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>

          <motion.div layout className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {g.list.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
            </AnimatePresence>
          </motion.div>
          {g.list.length === 0 && <p className="py-16 text-center font-display text-2xl text-[#2A1625]">Aucun produit pour ce filtre.</p>}

          {g.alsoMixte.length > 0 && (
            <div className="mt-20">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className="font-display text-3xl font-semibold text-[#1A1A1A] sm:text-4xl">Ils se portent aussi <span className="italic text-[#C59B27]">· mixtes</span></h2>
                <button onClick={() => goTo("mixte")} className="hidden items-center gap-1 text-sm font-semibold text-[#2A1625] hover:text-[#C59B27] sm:inline-flex">Tout voir <ArrowRight className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                {g.alsoMixte.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
              </div>
            </div>
          )}

          <div className="mt-20 flex flex-col items-start justify-between gap-5 rounded-3xl bg-gradient-to-br from-[#F4E3E2] to-[#FDF8F7] p-8 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-3xl font-semibold text-[#2A1625]">Vous hésitez ?</p>
              <p className="mt-1 text-sm text-[#2A1625]/60">Décrivez vos goûts, on vous conseille le parfum idéal sur WhatsApp.</p>
            </div>
            <a href={waLink(`Bonjour, je cherche un conseil pour un parfum ${GENDER_LABEL[cfg.gender].toLowerCase()} 🌸`)} target="_blank" rel="noreferrer" className="shimmer inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white">
              <WhatsAppIcon className="h-4 w-4" /> Demander conseil
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/* =========================================================================
   PAGE : CONTACT
   ========================================================================= */

function ContactPage() {
  const c = useContactForm();
  const input = "w-full rounded-2xl border bg-white px-4 py-3 text-base outline-none transition focus:ring-4 focus:ring-[#D4AF37]/25 sm:text-sm";
  const cards = [
    { icon: WhatsAppIcon, label: "WhatsApp", value: WHATSAPP_DISPLAY, href: waLink("Bonjour Rosa Parc Parfumerie 🌸"), color: "bg-[#25D366]" },
    { icon: Phone, label: "Téléphone", value: "07 84 88 46 94", href: "tel:+212784884694", color: "bg-[#2A1625]" },
    { icon: Instagram, label: "Instagram", value: "@rosaparcparfumerie", href: INSTAGRAM_URL, color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#FDF8F7] pb-20 pt-28 sm:pt-36">
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 14, repeat: Infinity }} className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#E8C5C8] opacity-50 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs text-[#2A1625]/50"><button onClick={() => goTo("accueil")} className="hover:text-[#C59B27]">Accueil</button> / <span className="text-[#2A1625]">Contact</span></p>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-display mt-6 text-5xl font-semibold text-[#1A1A1A] sm:text-7xl">
          Parlons <span className="gold-text italic">parfum</span>
        </motion.h1>
        <p className="mt-4 max-w-xl text-[#2A1625]/65">Une question, un conseil, une commande spéciale ? Écrivez-nous : votre message s'ouvre directement dans WhatsApp.</p>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-[32px] border border-white/70 bg-white/70 p-6 shadow-[0_30px_60px_-30px_rgba(42,22,37,.3)] backdrop-blur-md sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[.15em] text-[#2A1625]/60">Nom *</span>
                <input value={c.form.name} onChange={(e) => c.set("name", e.target.value)} placeholder="Votre nom" autoComplete="name" className={`${input} ${c.errors.name ? "border-red-400" : "border-[#E8C5C8] focus:border-[#D4AF37]"}`} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[.15em] text-[#2A1625]/60">Ville</span>
                <input value={c.form.city} onChange={(e) => c.set("city", e.target.value)} placeholder="Casablanca" autoComplete="address-level2" className={`${input} border-[#E8C5C8] focus:border-[#D4AF37]`} />
              </label>
            </div>
            <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[.15em] text-[#2A1625]/60">Sujet</p>
            <div className="flex flex-wrap gap-2">
              {CONTACT_SUBJECTS.map((s) => <Chip key={s} active={c.form.subject === s} onClick={() => c.set("subject", s)}>{s}</Chip>)}
            </div>
            <label className="mt-5 block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[.15em] text-[#2A1625]/60">Message *</span>
              <textarea rows={5} value={c.form.message} onChange={(e) => c.set("message", e.target.value)} placeholder="Ex : je cherche un parfum vanillé pour offrir…" className={`${input} resize-none ${c.errors.message ? "border-red-400" : "border-[#E8C5C8] focus:border-[#D4AF37]"}`} />
            </label>
            {(c.errors.name || c.errors.message) && <p className="mt-2 text-xs text-red-500">Merci d'indiquer votre nom et votre message.</p>}
            <motion.button whileTap={{ scale: 0.98 }} onClick={c.submit} className="shimmer mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,.7)]">
              <WhatsAppIcon /> Envoyer sur WhatsApp
            </motion.button>
            <AnimatePresence>
              {c.sent && (
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-center justify-center gap-2 text-sm text-[#2A1625]/70">
                  <Check className="h-4 w-4 text-[#25D366]" /> Message prêt dans WhatsApp, il ne reste qu'à l'envoyer.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="space-y-4">
            {cards.map(({ icon: Icon, label, value, href, color }, i) => (
              <motion.a key={label} href={href} target={href.startsWith("tel") ? undefined : "_blank"} rel="noreferrer"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }} whileHover={{ x: 6 }}
                className="flex items-center gap-4 rounded-3xl border border-[#E8C5C8]/60 bg-white p-4">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl text-white ${color}`}><Icon className="h-5 w-5" /></span>
                <span className="flex-1"><span className="block text-xs text-[#2A1625]/50">{label}</span><span className="font-semibold text-[#2A1625]">{value}</span></span>
                <ArrowRight className="h-4 w-4 text-[#C59B27]" />
              </motion.a>
            ))}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="rounded-3xl bg-[#2A1625] p-6 text-white">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.25em] text-[#F3D98B]"><Clock className="h-4 w-4" /> Horaires</p>
              {HOURS.map(([d, h]) => <div key={d} className="mt-3 flex justify-between border-b border-white/10 pb-3 text-sm"><span className="text-white/70">{d}</span><span>{h}</span></div>)}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="rounded-3xl border border-[#E8C5C8]/60 bg-white p-6">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.25em] text-[#C59B27]"><Truck className="h-4 w-4" /> Nous livrons</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {DELIVERY_CITIES.map((v) => <span key={v} className="rounded-full bg-[#FDF8F7] px-3 py-1 text-xs text-[#2A1625]">{v}</span>)}
              </div>
              <p className="mt-3 text-xs text-[#2A1625]/55">Paiement à la livraison · offerte dès {fmt(FREE_SHIPPING_FROM)}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   APP
   ========================================================================= */

export default function RosaParcParfumerie() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState(null);
  const [offersOnly, setOffersOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  const addToCart = (p) => {
    setCart((c) => {
      const found = c.find((x) => x.id === p.id);
      return found ? c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x)) : [...c, { id: p.id, qty: 1 }];
    });
    clearTimeout(toastTimer.current);
    setToast({ key: Date.now(), name: `${p.brand} ${p.name}` });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };
  const setQty = (id, qty) => setCart((c) => (qty <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty } : x))));
  const remove = (id) => setCart((c) => c.filter((x) => x.id !== id));
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const closeCart = React.useCallback(() => setCartOpen(false), []);

  const route = useHashRoute();
  const onNav = (n) => {
    if (n.page) { goTo(n.page); if (n.page === "accueil") window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (n.category) { setCategory(n.category); setBrand(null); setOffersOnly(false); }
    if (n.offers) { setCategory("all"); setBrand(null); setOffersOnly(true); }
    goToSection(route, n.section);
  };
  const pickBrand = (b) => { setCategory("all"); setOffersOnly(false); setQuery(""); setBrand(b); goToSection(route, "catalogue"); };
  const pickProduct = (p) => { setCategory("all"); setBrand(null); setOffersOnly(false); setQuery(p.name); goToSection(route, "catalogue"); };

  return (
    <div className="font-body min-h-screen overflow-x-hidden bg-white text-[#1A1A1A] antialiased selection:bg-[#E8C5C8] selection:text-[#2A1625]">
      <GlobalStyles />
      <Navbar cartCount={cartCount} onCart={() => setCartOpen(true)} query={query} setQuery={setQuery} onNav={onNav} onPickProduct={pickProduct} route={route} />
      <main>
        <AnimatePresence mode="wait">
          <motion.div key={route} onAnimationComplete={() => route === "accueil" && flushPendingSection()} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
            {route === "accueil" && (
              <>
                <Hero onAdd={addToCart} />
                <Reassurance />
                <Catalogue
                  category={category} setCategory={setCategory}
                  brand={brand} setBrand={setBrand}
                  offersOnly={offersOnly} setOffersOnly={setOffersOnly}
                  query={query} setQuery={setQuery}
                  onAdd={addToCart}
                />
                <Brands onPick={pickBrand} />
              </>
            )}
            {GENDER_PAGES[route] && <><GenderPage pageKey={route} onAdd={addToCart} /><Reassurance /></>}
            {route === "contact" && <ContactPage />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer onNav={onNav} />

      {/* WhatsApp flottant (mobile) */}
      <motion.a
        href={waLink("Bonjour Rosa Parc Parfumerie 🌸")} target="_blank" rel="noreferrer"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: "spring" }}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,.7)] sm:hidden"
        aria-label="Contacter sur WhatsApp"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </motion.a>

      <CartDrawer open={cartOpen} onClose={closeCart} cart={cart} setQty={setQty} remove={remove} clear={() => setCart([])} />
      <Toast toast={toast} />
    </div>
  );
}
