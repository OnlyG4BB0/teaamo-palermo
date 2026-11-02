import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Clock,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  Star,
} from 'lucide-react';
import {
  HERO_FLAVORS,
  HeroPresetFlavor,
  TEAAMO_LINKS,
  GLOVO_STORE_SECTIONS,
  FAQ_ITEMS,
} from './data/teaamoData';
import { StudioViewport3D } from './components/three/LazyStudioViewport3D';
import { BobaLabBuilder } from './components/BobaLabBuilder';
import { MenuShowcase } from './components/MenuShowcase';
import { TikTokFeedBoard } from './components/TikTokFeedBoard';
import { SocialAndReviews } from './components/SocialAndReviews';
import {
  RevealOnScroll,
  MagneticWrap,
} from './components/ui/AnimatedPrimitives';

type HeroModelCategory = 'cup' | 'fruittea' | 'burger-giove' | 'waffle' | 'crepe' | 'pancake';

interface HeroModelTab {
  id: HeroModelCategory;
  label: string;
  badge: string;
  title: string;
  price: string;
  description: string;
  glovoUrl?: string;
}

const HERO_MODELS_LIST: HeroModelTab[] = [
  {
    id: 'cup',
    label: 'Boba',
    badge: 'SIGNATURE BOBA LAB',
    title: 'Taro Dream • Milk Tea con Perle di Tapioca',
    price: '7,00 €',
    description: 'Bicchiere sigillato con perle di tapioca cotte al miele e crema vellutata.',
    glovoUrl: GLOVO_STORE_SECTIONS.bubbleTea,
  },
  {
    id: 'fruittea',
    label: 'Fruit',
    badge: 'TÈ CRISTALLINO & FRUTTA',
    title: 'Bulbasaur • Fruit Tea con Fette di Lime & Boba',
    price: '7,00 €',
    description: 'Infusione fredda trasparente, fette di lime galleggianti e popping boba alla frutta.',
    glovoUrl: GLOVO_STORE_SECTIONS.pokemon,
  },
  {
    id: 'burger-giove',
    label: 'Burger',
    badge: 'LINEA SMASH NOTTURNA',
    title: 'Giove • Doppio Smash, Bacon & Cipolla Croccante',
    price: '11,90 €',
    description: 'Doppio patty smashato, cheddar fondente, bacon croccante, salsa algerina e anelli orbitali.',
    glovoUrl: GLOVO_STORE_SECTIONS.spacepolly,
  },
  {
    id: 'waffle',
    label: 'Waffle',
    badge: 'PATISSERIE A NIDO D\'APE',
    title: 'Bubble Waffle Cono con Doppio Gelato & Fudge',
    price: '10,90 €',
    description: 'Cialda a bolle calda arrotolata a cono con gelato artigianale, wafer e colata di cioccolato.',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetGelato,
  },
  {
    id: 'crepe',
    label: 'Crêpes',
    badge: 'DOLCI AL PIATTO',
    title: 'Crêpe Ripiegata con Nutella, Panna & Biscotto',
    price: '8,50 €',
    description: 'Crêpe francese dorata su piatto in ceramica con Nutella calda, rosetta di panna e biscotto Pan di Stelle.',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetSpecial,
  },
  {
    id: 'pancake',
    label: 'Pancake',
    badge: 'AMERICAN BAKERY',
    title: 'Triple Stack Pancakes con Glassa d\'Acero',
    price: '7,90 €',
    description: 'Torre di 3 pancake soffici con cascata di sciroppo ambrato e noce di gelato fondente.',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetGelato,
  },
];

const NAV_LINKS = [
  { href: '#menu', label: 'Menu', desc: 'SpacePolly, Bubble Tea & Sweet' },
  { href: '#boba-lab', label: 'Boba Lab 3D', desc: 'Crea il tuo bubble tea in 3D' },
  { href: '#tiktok', label: 'TikTok', desc: 'Video & trend @teaamobubbletea' },
  { href: '#delivery', label: 'Delivery', desc: 'Glovo Store & ritiro al locale' },
  { href: '#allergeni', label: 'Allergeni', desc: 'Vegan, senza glutine & lattosio' },
  { href: '#faq', label: 'FAQ', desc: 'Orari, consegna, domande frequenti' },
  { href: '#dove-siamo', label: 'Dove siamo', desc: 'Viale Strasburgo 378 Palermo' },
];

const MARQUEE_TOP = [
  'Bubble Tea artigianale',
  'Tapioca calda ogni giorno',
  'SpacePolly SmashBurger',
  'Bubble Waffle & Gelato',
  'Crêpes & Pancake',
  'Aperto fino alle 03:30',
];

const MARQUEE_BOTTOM = [
  'Viale Strasburgo 378 — Palermo',
  'Consegna a domicilio su Glovo',
  'Giove · Plutone · Marte · Mercurio',
  'Pokémon Limited Edition',
  'Vegan & gluten-free friendly',
];

// Pearls scattered behind the hero headline (percent positions, px size, animation offset)
const HERO_PEARLS = [
  { left: '90%', top: '6%', size: 18, delay: '0s' },
  { left: '95%', top: '46%', size: 12, delay: '-3s' },
  { left: '86%', top: '70%', size: 22, delay: '-5s' },
  { left: '70%', top: '4%', size: 9, delay: '-6.5s' },
];

/** Opening hours 12:30 – 03:30, evaluated in Palermo's time zone */
const computeIsOpenNow = (): boolean => {
  const parts = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const totalMinutes = hour * 60 + minute;
  return totalMinutes >= 750 || totalMinutes < 210;
};

/** Splits a phrase into masked words that rise in sequence */
const RisingWords: React.FC<{ text: string; startMs: number; className?: string }> = ({
  text,
  startMs,
  className = '',
}) => (
  <>
    {text.split(' ').map((word, i) => (
      <React.Fragment key={`${word}-${i}`}>
        <span className="word-rise">
          <span className={className} style={{ '--d': `${startMs + i * 70}ms` } as React.CSSProperties}>
            {word}
          </span>
        </span>{' '}
      </React.Fragment>
    ))}
  </>
);

export function App() {
  const [selectedHeroFlavor, setSelectedHeroFlavor] = useState<HeroPresetFlavor>(
    HERO_FLAVORS[0]
  );
  const [heroModelType, setHeroModelType] = useState<HeroModelCategory>('cup');
  const [autoCycleHero, setAutoCycleHero] = useState<boolean>(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  // null until mounted, so the prerendered HTML never disagrees with the client clock
  const [isOpenNow, setIsOpenNow] = useState<boolean | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const headerRef = useRef<HTMLElement>(null);

  const activeHeroModel =
    HERO_MODELS_LIST.find((m) => m.id === heroModelType) || HERO_MODELS_LIST[0];

  // Auto-cycle Hero 3D Boba flavors every 4.5s until user selects manually
  useEffect(() => {
    if (!autoCycleHero || heroModelType !== 'cup') return;
    const id = window.setInterval(() => {
      setSelectedHeroFlavor((prev) => {
        const curIdx = HERO_FLAVORS.findIndex((f) => f.id === prev.id);
        return HERO_FLAVORS[(curIdx + 1) % HERO_FLAVORS.length];
      });
    }, 4500);
    return () => window.clearInterval(id);
  }, [autoCycleHero, heroModelType]);

  // Live open/closed status, refreshed every minute
  useEffect(() => {
    const update = () => setIsOpenNow(computeIsOpenNow());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Compact header + reading progress bar (written as a CSS variable, no re-render per frame)
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        headerRef.current?.style.setProperty('--progress', progress.toFixed(4));
        setIsScrolled(window.scrollY > 12);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Highlight the nav link of the section currently in view
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter(
      (el): el is Element => el !== null
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Close the mobile menu when resizing up to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && setIsMobileNavOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Close the mobile menu on Escape key press
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileNavOpen]);

  const stageAccent = heroModelType === 'cup' ? selectedHeroFlavor.accentHex : '#FD5E86';

  return (
    <div className="min-h-screen arch-grid-bg transition-colors duration-300">
      <div className="grain-overlay" aria-hidden="true" />

      {/* Fixed glass header with reading progress */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
          isScrolled || isMobileNavOpen
            ? 'bg-[#FFF8F3]/85 border-[#F3DFD8] shadow-[0_10px_30px_-18px_rgba(43,15,29,0.35)] backdrop-blur-xl'
            : 'bg-[#FFF8F3]/60 border-transparent backdrop-blur-md'
        }`}
      >
        <nav
          aria-label="Navigazione Principale"
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 transition-[height] duration-500 ${
            isScrolled ? 'h-16' : 'h-16 sm:h-20'
          }`}
        >
          {/* Brand Identity */}
          <a href="#top" className="group flex items-center gap-2.5 sm:gap-3 min-w-0" aria-label="TeaAmo Palermo — torna all'inizio">
            <span className="relative shrink-0">
              <span className="absolute -inset-1 rounded-full bg-[conic-gradient(from_0deg,#DE3163,#9B7BEA,#F2A65A,#DE3163)] opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-500" />
              <img
                src={`${import.meta.env.BASE_URL}teaamo-logo.png`}
                alt=""
                width={40}
                height={40}
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:rotate-[-8deg] transition-transform duration-500"
              />
            </span>
            <span className="min-w-0">
              <span className="text-xl sm:text-2xl font-serif tracking-tight block leading-none text-[#2B0F1D]">
                TeaAmo<span className="text-[#DE3163] italic">.</span>
              </span>
              <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.2em] text-[#76525F] truncate">
                Bubble Tea · Palermo
              </span>
            </span>
          </a>

          {/* Navigation Index (desktop) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#2B0F1D]">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'location' : undefined}
                  className={`relative px-2.5 xl:px-3 py-2 whitespace-nowrap transition-colors ${
                    isActive ? 'text-[#DE3163]' : 'hover:text-[#DE3163]'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-2.5 right-2.5 xl:left-3 xl:right-3 -bottom-0.5 h-[2px] bg-gradient-to-r from-[#DE3163] to-[#9B7BEA] origin-left transition-transform duration-500 ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isOpenNow !== null && (
              <span
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider border ${
                  isOpenNow
                    ? 'border-emerald-300/70 bg-emerald-50 text-emerald-700'
                    : 'border-[#F3DFD8] bg-white text-[#76525F]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-[#C9AEBB]'}`} />
                {isOpenNow ? 'Aperto ora' : 'Apre 12:30'}
              </span>
            )}
            <a
              href={TEAAMO_LINKS.glovo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-[#DE3163] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#2B0F1D] transition-colors cursor-pointer shadow-[0_8px_20px_-10px_rgba(222,49,99,0.8)]"
            >
              <span>Ordina<span className="hidden sm:inline"> su Glovo</span></span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>

            {/* Animated Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label={isMobileNavOpen ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione'}
              className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center border border-[#F3DFD8] hover:border-[#DE3163] bg-white transition-colors cursor-pointer group"
            >
              <div className="w-5 h-3.5 relative flex flex-col justify-between items-center pointer-events-none">
                <span
                  className={`w-5 h-[1.75px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${
                    isMobileNavOpen
                      ? 'rotate-45 translate-y-[6px] bg-[#DE3163]'
                      : 'bg-[#2B0F1D] group-hover:bg-[#DE3163]'
                  }`}
                />
                <span
                  className={`w-5 h-[1.75px] rounded-full transition-all duration-200 ease-out origin-left ${
                    isMobileNavOpen ? 'opacity-0 scale-x-0' : 'bg-[#2B0F1D] group-hover:bg-[#DE3163]'
                  }`}
                />
                <span
                  className={`w-5 h-[1.75px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${
                    isMobileNavOpen
                      ? '-rotate-45 -translate-y-[6px] bg-[#DE3163]'
                      : 'bg-[#2B0F1D] group-hover:bg-[#DE3163]'
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>

        {/* Collapsible Animated Mobile & Tablet Navigation Drawer */}
        <div
          id="mobile-nav-panel"
          role="region"
          aria-label="Menu di navigazione mobile"
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-t border-[#F3DFD8] bg-[#FFF8F3]/95 backdrop-blur-xl ${
            isMobileNavOpen
              ? 'max-h-[720px] opacity-100'
              : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              {NAV_LINKS.map((link, idx) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  style={{
                    transitionDelay: isMobileNavOpen ? `${idx * 45 + 70}ms` : '0ms',
                  }}
                  className={`group flex items-center justify-between px-4 py-3 border border-[#F3DFD8] bg-white/70 hover:border-[#DE3163] hover:bg-white transition-all duration-300 transform ${
                    isMobileNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  <div className="min-w-0 flex-1 flex items-baseline gap-3">
                    <span className="font-mono text-[10px] text-[#DE3163]">0{idx + 1}</span>
                    <span className="min-w-0">
                      <span className="font-serif text-xl leading-tight block group-hover:text-[#DE3163] transition-colors truncate text-[#2B0F1D]">
                        {link.label}
                      </span>
                      <span className="text-[11px] text-[#76525F] block truncate">
                        {link.desc}
                      </span>
                    </span>
                  </div>
                  <ArrowUpRight
                    className="w-4 h-4 text-[#76525F] group-hover:text-[#DE3163] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 ml-2"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>

            <div
              style={{
                transitionDelay: isMobileNavOpen ? `${NAV_LINKS.length * 45 + 90}ms` : '0ms',
              }}
              className={`pt-3 border-t border-[#F3DFD8] grid grid-cols-3 gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-all duration-300 transform ${
                isMobileNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              {[
                { href: TEAAMO_LINKS.glovo, label: 'Glovo', primary: true },
                { href: TEAAMO_LINKS.tiktok, label: 'TikTok' },
                { href: TEAAMO_LINKS.instagram, label: 'Instagram' },
              ].map((ch) => (
                <a
                  key={ch.label}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center justify-center gap-1 py-3 px-2 text-center font-medium transition-colors ${
                    ch.primary
                      ? 'bg-[#DE3163] text-white hover:bg-[#2B0F1D]'
                      : 'border border-[#DE3163] text-[#DE3163] hover:bg-white'
                  }`}
                >
                  <span>{ch.label}</span>
                  <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <span className="scroll-progress" aria-hidden="true" />
      </header>

      <main id="top" className="pt-16 sm:pt-20">
        {/* HERO: kinetic headline + live R3F stage */}
        <section className="relative border-b border-[#F3DFD8] overflow-hidden" aria-labelledby="hero-title">
          {/* Aurora flavour glows */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <span className="aurora w-[520px] h-[520px] -left-40 -top-40 bg-[#FD5E86]/40" />
            <span className="aurora w-[460px] h-[460px] left-[30%] top-[45%] bg-[#9B7BEA]/30" style={{ animationDelay: '-6s' }} />
            <span className="aurora w-[380px] h-[380px] right-[-120px] top-[-80px] bg-[#F2A65A]/30" style={{ animationDelay: '-11s' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 border-x border-[#F3DFD8]">
              {/* Left 7 Cols: Editorial Typography */}
              <div className="relative lg:col-span-7 p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-between lg:border-r border-b lg:border-b-0 border-[#F3DFD8]">
                <div className="absolute inset-0 pointer-events-none hidden sm:block" aria-hidden="true">
                  {HERO_PEARLS.map((p, i) => (
                    <span
                      key={i}
                      className="pearl opacity-80"
                      style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay }}
                    />
                  ))}
                </div>

                <div className="relative space-y-6 sm:space-y-8">
                  <div className="hero-enter flex flex-wrap items-center gap-2" style={{ '--d': '0ms' } as React.CSSProperties}>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#F3DFD8] backdrop-blur-sm font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#DE3163] shadow-sm">
                      <MapPin className="w-3 h-3" aria-hidden="true" />
                      Viale Strasburgo 378 · Palermo
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2B0F1D] font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-white">
                      <Clock className="w-3 h-3 text-[#FD5E86]" aria-hidden="true" />
                      Fino alle 03:30
                    </span>
                  </div>

                  <h1
                    id="hero-title"
                    className="text-[2.6rem] sm:text-6xl lg:text-[4.4rem] xl:text-[5.2rem] font-serif font-normal tracking-tight leading-[0.98] text-[#2B0F1D]"
                  >
                    <RisingWords text="L'arte del" startMs={80} />
                    <RisingWords text="Bubble Tea," startMs={220} className="italic text-flavor" />
                    <RisingWords text="dello" startMs={360} />
                    <RisingWords text="Smash Burger" startMs={430} className="italic text-flavor" />
                    <RisingWords text="& del" startMs={570} />
                    <RisingWords text="Sweet" startMs={710} className="italic text-flavor" />
                    <RisingWords text="a Palermo." startMs={780} />
                  </h1>

                  <p
                    className="hero-enter text-[15px] sm:text-base lg:text-lg text-[#76525F] max-w-xl leading-relaxed"
                    style={{ '--d': '700ms' } as React.CSSProperties}
                  >
                    Tè taiwanese con perle di tapioca calde preparate ogni giorno, Bubble Waffle con gelato artigianale, crêpes e gli smash burger notturni della linea SpacePolly. In Viale Strasburgo 378, aperti tutti i giorni dalle 12:30 alle 03:30.
                  </p>

                  <div
                    className="hero-enter flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1"
                    style={{ '--d': '850ms' } as React.CSSProperties}
                  >
                    <MagneticWrap strength={0.18}>
                      <a
                        href="#menu"
                        className="btn-shine group inline-flex w-full sm:w-auto items-center justify-center gap-3 px-6 py-4 bg-[#DE3163] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#2B0F1D] transition-colors shadow-[0_18px_40px_-18px_rgba(222,49,99,0.9)]"
                      >
                        <span>Scopri il Menu</span>
                        <ArrowUpRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
                      </a>
                    </MagneticWrap>

                    <MagneticWrap strength={0.15}>
                      <a
                        href="#boba-lab"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-6 py-4 border border-[#2B0F1D]/80 bg-white/60 backdrop-blur-sm text-[#2B0F1D] font-mono text-xs uppercase tracking-widest hover:bg-[#2B0F1D] hover:text-white transition-colors text-center"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#DE3163]" aria-hidden="true" />
                        <span>Crea il tuo Boba 3D</span>
                      </a>
                    </MagneticWrap>
                  </div>
                </div>

                {/* Bottom metrics */}
                <div
                  className="hero-enter relative grid grid-cols-3 gap-3 sm:gap-6 pt-8 sm:pt-10 mt-8 sm:mt-12 border-t border-[#F3DFD8]"
                  style={{ '--d': '1000ms' } as React.CSSProperties}
                >
                  <div>
                    <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest text-[#76525F] block">
                      Orario 7/7
                    </span>
                    <span className="font-serif text-lg sm:text-2xl lg:text-3xl mt-1 block text-[#2B0F1D]">
                      12:30 – 03:30
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest text-[#76525F] block">
                      Google
                    </span>
                    <span className="font-serif text-lg sm:text-2xl lg:text-3xl mt-1 flex items-center text-[#2B0F1D]">
                      <span>4.2 / 5</span>
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#F2A65A] text-[#F2A65A] ml-1.5 shrink-0 inline-block" aria-hidden="true" />
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest text-[#76525F] block">
                      Delivery
                    </span>
                    <span className="font-serif italic text-lg sm:text-2xl lg:text-3xl mt-1 block text-[#DE3163]">
                      Glovo PMO
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Interactive 3D WebGL Showcase Stage */}
              <div
                className="hero-enter lg:col-span-5 flex flex-col justify-between relative overflow-hidden bg-white/40 backdrop-blur-[2px]"
                style={{ '--d': '300ms' } as React.CSSProperties}
              >
                {/* Stage glow follows the active flavour */}
                <div
                  className="pointer-events-none absolute inset-0 transition-[background] duration-1000"
                  style={{
                    background: `radial-gradient(60% 50% at 50% 48%, ${stageAccent}38, transparent 72%), radial-gradient(40% 30% at 50% 85%, ${stageAccent}22, transparent 70%)`,
                  }}
                />

                {/* Model switcher */}
                <div
                  role="tablist"
                  aria-label="Scegli il prodotto 3D"
                  className="relative flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-6 border-b border-[#F3DFD8] font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-center bg-white/70 backdrop-blur-md"
                >
                  {HERO_MODELS_LIST.map((m, idx) => {
                    const isSelected = heroModelType === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => {
                          setHeroModelType(m.id);
                          if (m.id !== 'cup') setAutoCycleHero(false);
                        }}
                        className={`relative py-3 px-3.5 sm:px-1 flex-1 sm:flex-initial shrink-0 transition-colors cursor-pointer whitespace-nowrap text-center ${
                          isSelected ? 'text-[#DE3163] font-semibold' : 'text-[#2B0F1D] hover:text-[#DE3163]'
                        }`}
                        title={m.title}
                      >
                        <span className="text-[9px] text-[#C9AEBB] mr-1">0{idx + 1}</span>
                        {m.label}
                        <span
                          className={`absolute inset-x-2 bottom-0 h-[2px] bg-[#DE3163] origin-center transition-transform duration-500 ${
                            isSelected ? 'scale-x-100' : 'scale-x-0'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <StudioViewport3D
                  modelType={heroModelType}
                  cupConfig={{
                    liquidTopColor: selectedHeroFlavor.liquidTopColor,
                    liquidBottomColor: selectedHeroFlavor.liquidBottomColor,
                    bobaColor: selectedHeroFlavor.bobaColor,
                    bobaSecondaryColor: selectedHeroFlavor.bobaSecondaryColor,
                    creamColor: selectedHeroFlavor.creamColor,
                    hasPinkCream: true,
                    showIce: true,
                  }}
                  accentColor={selectedHeroFlavor.accentHex}
                  className="h-[340px] sm:h-[400px] lg:h-[440px]"
                />

                {/* Product caption */}
                <div className="relative p-5 sm:p-6 border-t border-[#F3DFD8] bg-white/85 backdrop-blur-md space-y-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0" aria-live="polite">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#DE3163] block truncate">
                        {heroModelType === 'cup' ? selectedHeroFlavor.badge : activeHeroModel.badge}
                      </span>
                      <p key={heroModelType === 'cup' ? selectedHeroFlavor.id : heroModelType} className="hero-enter text-xl sm:text-2xl font-serif italic truncate text-[#2B0F1D]">
                        {heroModelType === 'cup' ? selectedHeroFlavor.name : activeHeroModel.title}
                      </p>
                      <p className="text-[12px] text-[#76525F] truncate mt-0.5">
                        {activeHeroModel.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-serif text-2xl text-[#DE3163]">
                        {heroModelType === 'cup' ? selectedHeroFlavor.price : activeHeroModel.price}
                      </span>
                      <a
                        href={
                          heroModelType === 'cup'
                            ? selectedHeroFlavor.glovoUrl || activeHeroModel.glovoUrl || TEAAMO_LINKS.glovo
                            : activeHeroModel.glovoUrl || TEAAMO_LINKS.glovo
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ordina questo prodotto su Glovo"
                        className="btn-shine inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#DE3163] text-white hover:bg-[#2B0F1D] transition-colors font-mono text-[10px] uppercase tracking-wider"
                      >
                        <span>Glovo</span>
                        <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  {(heroModelType === 'cup' || heroModelType === 'fruittea') && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#F3DFD8]">
                      <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#76525F]">
                        Gusti {autoCycleHero && heroModelType === 'cup' ? '· auto' : ''}
                      </span>
                      <div className="flex items-center gap-2.5">
                        {HERO_FLAVORS.map((flav) => {
                          const active = selectedHeroFlavor.id === flav.id;
                          return (
                            <button
                              key={flav.id}
                              type="button"
                              onClick={() => {
                                setAutoCycleHero(false);
                                setSelectedHeroFlavor(flav);
                              }}
                              aria-label={`Seleziona ${flav.name}`}
                              aria-pressed={active}
                              className={`w-7 h-7 rounded-full border-2 transition-all duration-300 cursor-pointer shadow-[inset_0_-6px_10px_rgba(0,0,0,0.12)] ${
                                active
                                  ? 'scale-110 border-white ring-2 ring-[#DE3163]'
                                  : 'border-white opacity-80 hover:opacity-100 hover:scale-110'
                              }`}
                              style={{
                                background: `linear-gradient(160deg, ${flav.liquidTopColor}, ${flav.liquidBottomColor})`,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Double sticker ticker */}
        <div className="relative overflow-hidden py-6 sm:py-8" aria-hidden="true">
          <div className="-rotate-[1.5deg] scale-[1.03] bg-[#DE3163] text-white py-3 font-mono text-xs sm:text-sm uppercase tracking-[0.2em] shadow-[0_10px_30px_-12px_rgba(222,49,99,0.6)]">
            <div className="flex whitespace-nowrap animate-marquee marquee-track w-max">
              {[...MARQUEE_TOP, ...MARQUEE_TOP].map((text, index) => (
                <div key={index} className="inline-flex items-center gap-6 mx-6">
                  <span className="w-2 h-2 rounded-full bg-white/90 shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.15)]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rotate-[1deg] scale-[1.03] -mt-1 bg-[#2B0F1D] text-[#FCEFF2] py-2.5 font-serif italic text-base sm:text-lg">
            <div className="flex whitespace-nowrap animate-marquee-reverse marquee-track w-max">
              {[...MARQUEE_BOTTOM, ...MARQUEE_BOTTOM].map((text, index) => (
                <div key={index} className="inline-flex items-center gap-6 mx-6">
                  <Star className="w-3.5 h-3.5 fill-[#F2A65A] text-[#F2A65A]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <MenuShowcase />

        <BobaLabBuilder />

        {/* Night-mode band: the TikTok board renders with its dark palette */}
        <div className="dark">
          <TikTokFeedBoard />
        </div>

        <SocialAndReviews isOpenNow={isOpenNow === true} />

        {/* FAQ — mirrored in the FAQPage JSON-LD injected at prerender time */}
        <section id="faq" className="relative py-16 sm:py-24 border-t border-[#F3DFD8] overflow-hidden" aria-labelledby="faq-title">
          <span className="aurora w-[420px] h-[420px] -right-32 top-10 bg-[#9B7BEA]/20" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <RevealOnScroll className="lg:col-span-5 lg:sticky lg:top-28 self-start">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#DE3163] mb-3">
                07 / Domande frequenti
              </p>
              <h2 id="faq-title" className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight leading-[0.95] text-[#2B0F1D]">
                Tutto quello che vuoi sapere su <span className="italic text-flavor">TeaAmo</span>
              </h2>
              <p className="mt-5 text-[15px] text-[#76525F] leading-relaxed max-w-md">
                Orari, consegna a domicilio, ingredienti e allergeni. Non trovi la risposta? Chiamaci o scrivici su Instagram.
              </p>
              <a
                href={`tel:${TEAAMO_LINKS.phone}`}
                className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#2B0F1D] editorial-link"
              >
                <Phone className="w-3.5 h-3.5 text-[#DE3163]" aria-hidden="true" />
                {TEAAMO_LINKS.phoneDisplay}
              </a>
            </RevealOnScroll>

            <div className="lg:col-span-7 border-t border-[#F3DFD8]">
              {FAQ_ITEMS.map((item, i) => (
                <RevealOnScroll key={item.question} delayMs={i * 60}>
                  <details className="faq-item group border-b border-[#F3DFD8]" open={i === 0}>
                    <summary className="flex items-start justify-between gap-6 py-6 cursor-pointer list-none">
                      <h3 className="font-serif text-xl sm:text-2xl leading-snug text-[#2B0F1D] group-hover:text-[#DE3163] transition-colors">
                        {item.question}
                      </h3>
                      <span className="faq-icon mt-1 w-8 h-8 shrink-0 rounded-full border border-[#F3DFD8] bg-white flex items-center justify-center text-[#DE3163] transition-transform duration-500">
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </summary>
                    <p className="pb-6 pr-12 text-[15px] leading-relaxed text-[#76525F]">{item.answer}</p>
                  </details>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative overflow-hidden bg-[#2B0F1D] text-[#FCEFF2]">
        <span className="aurora w-[520px] h-[520px] -left-40 -bottom-60 bg-[#DE3163]/40" aria-hidden="true" />
        <span className="aurora w-[420px] h-[420px] right-0 -top-40 bg-[#9B7BEA]/25" style={{ animationDelay: '-8s' }} aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
            <div className="md:col-span-5 space-y-5">
              <p className="font-serif text-4xl sm:text-5xl leading-[0.95]">
                Ci vediamo in <span className="italic text-[#FD5E86]">Viale Strasburgo</span>.
              </p>
              <p className="text-sm text-[#C9AEBB] max-w-sm leading-relaxed">
                Bubble Tea, dolci e SpacePolly SmashBurger a Palermo, tutti i giorni dalle 12:30 alle 03:30. Anche a domicilio su Glovo.
              </p>
              <a
                href={TEAAMO_LINKS.glovo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine inline-flex items-center gap-2 px-5 py-3.5 bg-[#DE3163] text-white font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-[#2B0F1D] transition-colors"
              >
                Ordina ora su Glovo
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>

            <address className="md:col-span-3 not-italic space-y-4 text-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FD5E86]">Visita</p>
              <p className="flex gap-2.5 text-[#FCEFF2]/90">
                <MapPin className="w-4 h-4 mt-0.5 text-[#FD5E86] shrink-0" aria-hidden="true" />
                <span>Viale Strasburgo, 378<br />90146 Palermo (PA)</span>
              </p>
              <p className="flex gap-2.5 text-[#FCEFF2]/90">
                <Clock className="w-4 h-4 mt-0.5 text-[#FD5E86] shrink-0" aria-hidden="true" />
                <span>Lun – Dom<br />12:30 – 03:30</span>
              </p>
              <a href={`tel:${TEAAMO_LINKS.phone}`} className="flex gap-2.5 text-[#FCEFF2]/90 hover:text-white">
                <Phone className="w-4 h-4 mt-0.5 text-[#FD5E86] shrink-0" aria-hidden="true" />
                <span>{TEAAMO_LINKS.phoneDisplay}</span>
              </a>
            </address>

            <nav className="md:col-span-2 space-y-3 text-sm" aria-label="Sezioni del sito">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FD5E86]">Esplora</p>
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="block text-[#FCEFF2]/80 hover:text-white transition-colors">
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="md:col-span-2 space-y-3 text-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FD5E86]">Social</p>
              {[
                { href: TEAAMO_LINKS.instagram, label: 'Instagram' },
                { href: TEAAMO_LINKS.tiktok, label: 'TikTok' },
                { href: TEAAMO_LINKS.googleShare, label: 'Google Maps' },
                { href: TEAAMO_LINKS.linktree, label: 'Linktree' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1 text-[#FCEFF2]/80 hover:text-white transition-colors"
                >
                  {s.label}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Oversized wordmark */}
          <p
            className="mt-14 sm:mt-20 font-serif leading-none tracking-tight text-[22vw] lg:text-[15rem] text-transparent bg-clip-text bg-gradient-to-b from-[#FCEFF2]/25 to-[#FCEFF2]/0 select-none text-center"
            aria-hidden="true"
          >
            TeaAmo<span className="italic">.</span>
          </p>

          <div className="mt-2 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-widest text-[#C9AEBB]">
            <span>© {new Date().getFullYear()} TeaAmo Bubble Tea — Sweet &amp; Coffee · Palermo</span>
            <a href="#top" className="hover:text-white transition-colors">Torna su ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
