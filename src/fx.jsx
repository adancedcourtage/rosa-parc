import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, animate, useInView, useMotionValue, useSpring, useScroll, useMotionTemplate } from "framer-motion";
import { ArrowUp, Search, X, ArrowRight, Check, CornerDownLeft } from "lucide-react";
import { PRODUCTS, BRANDS, ProductVisual, fmt, goTo, productRoute, searchable } from "./shared.jsx";

/* =========================================================================
   Effets et interactions du site « Atelier Rose » :
   barre de progression, révélations au scroll, boutons magnétiques,
   envol vers le panier, recherche instantanée, vus récemment.
   Toutes les animations respectent prefers-reduced-motion (MotionConfig).
   ========================================================================= */

export const EASE = [0.16, 1, 0.3, 1];

/* ---------- Progression de lecture ---------- */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#C59B27] via-[#F3D98B] to-[#D4AF37]" />;
}

/* ---------- Révélation au scroll ---------- */
export function Reveal({ children, delay = 0, y = 28, className = "", as = "div" }) {
  const Comp = motion[as];
  return (
    <Comp initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }} className={className}>
      {children}
    </Comp>
  );
}

/* Titre révélé mot à mot, chaque mot glisse hors d'un masque. */
export function SplitWords({ text, className = "", delay = 0, inView = false }) {
  const words = text.split(" ");
  const trigger = inView ? { whileInView: "show", viewport: { once: true, margin: "-40px" } } : { animate: "show" };
  return (
    <motion.span initial="hide" {...trigger} transition={{ staggerChildren: 0.06, delayChildren: delay }} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span className="inline-block" variants={{ hide: { y: "110%" }, show: { y: 0, transition: { duration: 0.8, ease: EASE } } }}>
            {w}{i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* ---------- Compteur qui défile jusqu'à sa valeur quand il devient visible ---------- */
export function CountUp({ to, duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to, duration]);
  return <span ref={ref}>{v.toLocaleString("fr-FR")}</span>;
}

/* ---------- Bouton magnétique (suit légèrement le pointeur) ---------- */
export function Magnetic({ children, strength = 0.3, className = "" }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15 }), sy = useSpring(y, { stiffness: 220, damping: 15 });
  return (
    <motion.div style={{ x: sx, y: sy }} className={`inline-flex ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.div>
  );
}

/* ---------- Halo qui suit le pointeur sur une tuile ---------- */
export function useSpotlight(color = "rgba(243,217,139,.45)") {
  const mx = useMotionValue(-400), my = useMotionValue(-400);
  const background = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, ${color}, transparent 70%)`;
  const onPointerMove = (e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set(e.clientX - r.left); my.set(e.clientY - r.top); };
  const onPointerLeave = () => { mx.set(-400); my.set(-400); };
  const layer = <motion.div aria-hidden style={{ background }} className="pointer-events-none absolute inset-0 z-0" />;
  return { handlers: { onPointerMove, onPointerLeave }, layer };
}

/* ---------- Envol vers le panier + toast ---------- */
let lastPointer = null;
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", (e) => { lastPointer = { x: e.clientX, y: e.clientY }; }, { capture: true, passive: true });
}

export function useFlyToCart(onOpenCart) {
  const [flights, setFlights] = useState([]);
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const fly = (p, qty = 1) => {
    const target = document.getElementById("cart-target")?.getBoundingClientRect();
    const start = lastPointer || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (target) {
      const id = Date.now() + Math.random();
      setFlights((f) => [...f, { id, p, from: start, to: { x: target.left + target.width / 2, y: target.top + target.height / 2 } }]);
    }
    setToast({ p, qty, key: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
    document.getElementById("cart-target")?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(.92)" }, { transform: "scale(1)" }],
      { duration: 550, delay: 520, easing: "cubic-bezier(.16,1,.3,1)" }
    );
  };

  const layer = (
    <>
      <div className="pointer-events-none fixed inset-0 z-[70]">
        <AnimatePresence>
          {flights.map((f) => (
            <motion.div key={f.id} className="absolute h-16 w-12 -translate-x-1/2 -translate-y-1/2"
              initial={{ left: f.from.x, top: f.from.y, scale: 1, opacity: 1, rotate: 0 }}
              animate={{ left: [f.from.x, (f.from.x + f.to.x) / 2, f.to.x], top: [f.from.y, Math.min(f.from.y, f.to.y) - 120, f.to.y], scale: [1, 0.9, 0.25], rotate: [0, -12, 0], opacity: [1, 1, 0.4] }}
              transition={{ duration: 0.65, ease: "easeInOut", times: [0, 0.45, 1] }}
              onAnimationComplete={() => setFlights((fs) => fs.filter((x) => x.id !== f.id))}>
              <ProductVisual p={f.p} className="h-full w-full shadow-xl" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[65] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div key={toast.key} initial={{ y: -24, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -16, opacity: 0, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-white p-2.5 pr-3 shadow-[0_20px_50px_-15px_rgba(42,22,37,.45)] ring-1 ring-[#E8C5C8]">
              <div className="h-12 w-10 shrink-0"><ProductVisual p={toast.p} className="h-full w-full" /></div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-[#1E9E50]"><Check className="h-3.5 w-3.5" /> Ajouté au panier{toast.qty > 1 ? ` (×${toast.qty})` : ""}</p>
                <p className="truncate text-sm text-[#2A1625]">{toast.p.brand} {toast.p.name}</p>
              </div>
              <button onClick={() => { setToast(null); onOpenCart(); }} className="shrink-0 rounded-full bg-[#2A1625] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#C59B27]">Voir</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
  return { fly, layer };
}

/* ---------- Retour en haut ---------- */
export function BackToTop({ raised }) {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useEffect(() => scrollY.on("change", (v) => setShow(v > 900)), [scrollY]);
  return (
    <AnimatePresence>
      {show && (
        <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1, bottom: raised ? 88 : 20 }} exit={{ opacity: 0, scale: 0.6 }}
          whileHover={{ y: -3 }} whileTap={{ scale: 0.9 }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-white text-[#2A1625] shadow-lg ring-1 ring-[#E8C5C8]" aria-label="Revenir en haut">
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ---------- Recherche instantanée (⌘K / « / ») ---------- */
const INDEX = PRODUCTS.map((p) => ({ p, s: searchable(p), n: `${p.brand} ${p.name}`.toLowerCase() }));
const SUGGESTIONS = ["Khamrah", "Oud", "Vanille", "Club de Nuit", "Yara", "Déodorant"];

export function SearchOverlay({ open, onClose, onPickBrand }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const { results, brands } = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return { results: [], brands: [] };
    const terms = t.split(/\s+/);
    const results = INDEX.filter((x) => terms.every((w) => x.s.includes(w)))
      .map((x) => ({ ...x, rank: (x.n.startsWith(t) ? 0 : x.n.includes(t) ? 1 : 2) - x.p.popularity / 1000 }))
      .sort((a, b) => a.rank - b.rank).slice(0, 8).map((x) => x.p);
    return { results, brands: BRANDS.filter((b) => b.toLowerCase().includes(t)).slice(0, 4) };
  }, [q]);

  const open_ = (p) => { onClose(); goTo(productRoute(p.id)); };
  const onKey = (e) => {
    if (e.key === "Escape") onClose();
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % results.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + results.length) % results.length); }
    if (e.key === "Enter") open_(results[active]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} onClick={onClose}
          className="fixed inset-0 z-[55] flex items-start justify-center bg-[#2A1625]/45 px-3 pt-[8vh] backdrop-blur-sm">
          <motion.div initial={{ y: -20, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: -12, opacity: 0, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }} onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-label="Recherche" className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-[#FDF8F7] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#E8C5C8]/70 px-5">
              <Search className="h-5 w-5 shrink-0 text-[#C59B27]" />
              <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey}
                placeholder={`Rechercher parmi ${PRODUCTS.length.toLocaleString("fr-FR")} produits…`} aria-label="Rechercher un produit"
                className="h-16 min-w-0 flex-1 bg-transparent text-base text-[#2A1625] outline-none placeholder:text-[#2A1625]/40" />
              <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F4E3E2]" aria-label="Fermer la recherche"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-3">
              {!q.trim() && (
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[.3em] text-[#C59B27]">Recherches populaires</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button key={s} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                        onClick={() => { setQ(s); inputRef.current?.focus(); }} className="rounded-full bg-white px-4 py-2 text-sm text-[#2A1625] ring-1 ring-[#E8C5C8] transition hover:ring-[#C59B27]">{s}</motion.button>
                    ))}
                  </div>
                </div>
              )}
              {brands.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2 pb-2">
                  {brands.map((b) => (
                    <button key={b} onClick={() => { onClose(); onPickBrand(b); }} className="inline-flex items-center gap-1.5 rounded-full bg-[#2A1625] px-3.5 py-1.5 text-xs font-semibold text-white">
                      Marque · {b} <ArrowRight className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
              <ul>
                {results.map((p, i) => (
                  <motion.li key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}>
                    <button onMouseEnter={() => setActive(i)} onClick={() => open_(p)}
                      className={`relative flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors ${i === active ? "bg-white shadow-sm ring-1 ring-[#E8C5C8]" : ""}`}>
                      <div className="h-14 w-11 shrink-0"><ProductVisual p={p} className="h-full w-full" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-[.2em] text-[#C59B27]">{p.brand}</p>
                        <p className="font-display truncate text-lg leading-tight text-[#2A1625]">{p.name}</p>
                        <p className="truncate text-xs text-[#2A1625]/55">{p.family} · {p.volume}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[#2A1625]">{fmt(p.price)}</span>
                      {i === active && <CornerDownLeft className="hidden h-4 w-4 shrink-0 text-[#2A1625]/40 sm:block" />}
                    </button>
                  </motion.li>
                ))}
              </ul>
              {q.trim() && !results.length && !brands.length && (
                <p className="p-6 text-center text-sm text-[#2A1625]/60">Aucun résultat pour « {q} ». Essayez une marque ou une note (oud, vanille…).</p>
              )}
            </div>
            <div className="hidden items-center gap-4 border-t border-[#E8C5C8]/70 px-5 py-2.5 text-[11px] text-[#2A1625]/45 sm:flex">
              <span>↑↓ naviguer</span><span>↵ ouvrir</span><span>Échap fermer</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Raccourcis clavier : ⌘K / Ctrl+K ou « / » ouvrent la recherche. */
export function useSearchShortcut(setOpen) {
  useEffect(() => {
    const onKey = (e) => {
      const typing = /input|textarea|select/i.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}

/* ---------- Vus récemment (stocké dans le navigateur) ---------- */
const RECENT_KEY = "rosa-parc:recent";
const readRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; } };
export function pushRecent(id) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...readRecent().filter((x) => x !== id)].slice(0, 12))); } catch { /* stockage indisponible */ }
}
export function useRecent() {
  const [ids] = useState(readRecent);
  return useMemo(() => ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean), [ids]);
}
