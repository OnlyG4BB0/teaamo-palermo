import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  HERO_FLAVORS,
  HeroPresetFlavor,
  TEAAMO_LINKS,
  GLOVO_STORE_SECTIONS,
} from './data/teaamoData';
import { StudioViewport3D, ModelType } from './components/three/TeaAmo3DModels';
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
    label: 'Boba Milk Tea',
    badge: 'SIGNATURE BOBA LAB',
    title: 'Taro Dream • Milk Tea con Perle di Tapioca',
    price: '7,00 €',
    description: 'Bicchiere sigillato con perle di tapioca cotte al miele e crema vellutata.',
    glovoUrl: GLOVO_STORE_SECTIONS.bubbleTea,
  },
  {
    id: 'fruittea',
    label: 'Fruit Tea',
    badge: 'TÈ CRISTALLINO & FRUTTA',
    title: 'Bulbasaur • Fruit Tea con Fette di Lime & Boba',
    price: '7,00 €',
    description: 'Infusione fredda trasparente, fette di lime galleggianti e popping boba alla frutta.',
    glovoUrl: GLOVO_STORE_SECTIONS.pokemon,
  },
  {
    id: 'burger-giove',
    label: 'SpacePolly Giove',
    badge: 'LINEA SMASH NOTTURNA',
    title: 'Giove • Doppio Smash, Bacon & Cipolla Croccante',
    price: '11,90 €',
    description: 'Doppio patty smashato, cheddar fondente, bacon croccante, salsa algerina e anelli orbitali.',
    glovoUrl: GLOVO_STORE_SECTIONS.spacepolly,
  },
  {
    id: 'waffle',
    label: 'Bubble Waffle',
    badge: 'PATISSERIE A NIDO D\'APE',
    title: 'Bubble Waffle Cono con Doppio Gelato & Fudge',
    price: '10,90 €',
    description: 'Cialda a bolle calda arrotolata a cono con gelato artigianale, wafer e colata di cioccolato.',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetGelato,
  },
  {
    id: 'crepe',
    label: 'Crêpe Pan di Stelle',
    badge: 'DOLCI AL PIATTO',
    title: 'Crêpe Ripiegata con Nutella, Panna & Biscotto',
    price: '8,50 €',
    description: 'Crêpe francese dorata su piatto in ceramica con Nutella calda, rosetta di panna e biscotto Pan di Stelle.',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetSpecial,
  },
  {
    id: 'pancake',
    label: 'Pancake Stack',
    badge: 'AMERICAN BAKERY',
    title: 'Triple Stack Pancakes con Glassa d\'Acero',
    price: '7,90 €',
    description: 'Torre di 3 pancake soffici con cascata di sciroppo ambrato e noce di gelato fondente.',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetGelato,
  },
];

export function App() {
  const [selectedHeroFlavor, setSelectedHeroFlavor] = useState<HeroPresetFlavor>(
    HERO_FLAVORS[0]
  );
  const [heroModelType, setHeroModelType] = useState<HeroModelCategory>('cup');
  const [autoCycleHero, setAutoCycleHero] = useState<boolean>(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

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

  const navLinks = [
    { href: '#menu', label: '01 / Catalogo Glovo', desc: 'SpacePolly, Bubble Tea & Sweet' },
    { href: '#boba-lab', label: '02 / Simulatore 3D', desc: 'Laboratorio di formulazione 3D' },
    { href: '#tiktok', label: '03 / Bacheca TikTok', desc: 'Video & trend @teaamobubbletea' },
    { href: '#delivery', label: '04 / Delivery & Take Away', desc: 'Glovo Store & Ritiro al Locale' },
    { href: '#dove-siamo', label: '05 / Sede & Orari', desc: 'Viale Strasburgo 378 Palermo' },
  ];

  const checkIsOpenNow = (): boolean => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    return totalMinutes >= 750 || totalMinutes <= 210;
  };

  const isOpenNow = checkIsOpenNow();

  const marqueeItems = [
    'TEAAMO® PALERMO — VIALE STRASBURGO 378',
    'APERTO TUTTI I GIORNI 12:30 — 03:30 CET',
    'BUBBLE TEA ARTIGIANALE & TAPIOCA CALDA',
    'SPACEPOLLY SMASHBURGER: GIOVE / PLUTONE / MARTE / MERCURIO',
    'BUBBLE WAFFLE CON GELATO ARTIGIANALE & CRÊPES PAN DI STELLE',
    'CONSEGNA A DOMICILIO UFFICIALE SU GLOVO',
  ];

  return (
    <div className="min-h-screen arch-grid-bg transition-colors duration-300">
      {/* Fixed Editorial Header - Stays pinned at top on all screens */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#FCE4EC] dark:border-[#281E23] bg-white/95 dark:bg-[#0D090B]/95 backdrop-blur-md">

        <nav
          aria-label="Navigazione Principale"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3"
        >
          {/* Brand Identity */}
          <a href="#" className="group flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <img
              src={`${import.meta.env.BASE_URL}teaamo-logo.png`}
              alt="Logo TeaAmo Palermo"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#FD5E86] shrink-0 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="min-w-0">
              <span className="text-xl sm:text-2xl font-serif tracking-tight block leading-none text-[#1C0D12] dark:text-white">
                TeaAmo<span className="text-[#FD5E86] italic">.</span>
              </span>
              <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.2em] text-[#7A5A66] dark:text-[#A3939B] truncate">
                SWEET, COFFEE &amp; BOBA LAB
              </span>
            </div>
          </a>

          {/* Navigation Index (desktop) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 font-mono text-xs uppercase tracking-widest text-[#1C0D12] dark:text-[#F5EFEA]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="editorial-link hover:text-[#FD5E86] transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions: Direct Official Delivery Showcase CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={TEAAMO_LINKS.glovo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-[#FD5E86] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#1C0D12] transition-all cursor-pointer shadow-xs"
            >
              <span>Ordina su Glovo</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>

            {/* Animated Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label={isMobileNavOpen ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione'}
              className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center border border-[#FCE4EC] dark:border-[#281E23] hover:border-[#FD5E86] bg-[#FFF0F5] dark:bg-[#0D090B] transition-colors cursor-pointer group focus:outline-hidden focus:ring-2 focus:ring-[#FD5E86]/40"
            >
              <div className="w-5 h-3.5 relative flex flex-col justify-between items-center pointer-events-none">
                {/* Top line -> 45deg diagonal */}
                <span
                  className={`w-5 h-[1.75px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${
                    isMobileNavOpen
                      ? 'rotate-45 translate-y-[6px] bg-[#FD5E86]'
                      : 'bg-[#1C0D12] dark:bg-[#F5EFEA] group-hover:bg-[#FD5E86]'
                  }`}
                />
                {/* Middle line -> collapse & fade */}
                <span
                  className={`w-5 h-[1.75px] rounded-full transition-all duration-200 ease-out origin-left ${
                    isMobileNavOpen
                      ? 'opacity-0 scale-x-0'
                      : 'bg-[#1C0D12] dark:bg-[#F5EFEA] group-hover:bg-[#FD5E86]'
                  }`}
                />
                {/* Bottom line -> -45deg diagonal */}
                <span
                  className={`w-5 h-[1.75px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${
                    isMobileNavOpen
                      ? '-rotate-45 -translate-y-[6px] bg-[#FD5E86]'
                      : 'bg-[#1C0D12] dark:bg-[#F5EFEA] group-hover:bg-[#FD5E86]'
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
          className={`lg:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] border-t border-[#FCE4EC] dark:border-[#281E23] bg-white/98 dark:bg-[#0D090B]/98 backdrop-blur-md ${
            isMobileNavOpen
              ? 'max-h-[640px] opacity-100 shadow-xl'
              : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
            {/* Staggered Navigation Links */}
            <div className="space-y-1.5 font-mono text-xs uppercase tracking-wider">
              {navLinks.map((link, idx) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  style={{
                    transitionDelay: isMobileNavOpen ? `${idx * 45 + 70}ms` : '0ms',
                  }}
                  className={`group flex items-center justify-between p-3.5 border border-[#FCE4EC] dark:border-[#281E23] hover:border-[#FD5E86] hover:bg-[#FFF5F8] dark:hover:bg-[#1A1216] transition-all duration-300 transform ${
                    isMobileNavOpen
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-3'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold block group-hover:text-[#FD5E86] transition-colors truncate text-[#1C0D12] dark:text-white">
                      {link.label}
                    </span>
                    <span className="text-[10px] text-[#7A5A66] dark:text-[#A3939B] lowercase font-sans block truncate mt-0.5">
                      {link.desc}
                    </span>
                  </div>
                  <ArrowUpRight
                    className="w-4 h-4 text-[#7A5A66] dark:text-[#A3939B] group-hover:text-[#FD5E86] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 ml-2"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>

            {/* Quick-Action Channels */}
            <div
              style={{
                transitionDelay: isMobileNavOpen ? `${navLinks.length * 45 + 90}ms` : '0ms',
              }}
              className={`pt-3 border-t border-[#FCE4EC] dark:border-[#281E23] grid grid-cols-3 gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-all duration-300 transform ${
                isMobileNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <a
                href={TEAAMO_LINKS.glovo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-center gap-1 py-3 px-2 bg-[#FD5E86] text-white hover:bg-[#1C0D12] transition-colors text-center font-medium shadow-xs"
              >
                <span>Glovo</span>
                <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
              </a>

              <a
                href={TEAAMO_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-center gap-1 py-3 px-2 border border-[#FD5E86] text-[#FD5E86] hover:bg-[#FFF5F8] dark:hover:bg-white/5 transition-colors text-center font-medium"
              >
                <span>TikTok</span>
                <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
              </a>

              <a
                href={TEAAMO_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-center gap-1 py-3 px-2 border border-[#FD5E86] text-[#FD5E86] hover:bg-[#FFF5F8] dark:hover:bg-white/5 transition-colors text-center font-medium"
              >
                <span>Instagram</span>
                <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ARCHITECTURAL HERO SECTION WITH REAL-TIME R3F 3D VIEWPORT */}
      <main className="pt-16 sm:pt-20">
        <section className="border-b border-[#FCE4EC] dark:border-[#281E23] bg-white dark:bg-[#0D090B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 border-x border-[#FCE4EC] dark:border-[#281E23]">
              {/* Left 7 Cols: Editorial Typography & Architectural Specs */}
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-between lg:border-r border-b lg:border-b-0 border-[#FCE4EC] dark:border-[#281E23] bg-white dark:bg-[#0D090B]">
                <div className="space-y-6 sm:space-y-8">
                  <RevealOnScroll delayMs={40}>
                    <div className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] text-[#FD5E86]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FD5E86] live-dot" />
                      <span>VIALE STRASBURGO 378 • PALERMO</span>
                    </div>
                  </RevealOnScroll>

                  <RevealOnScroll delayMs={80}>
                    <h1 className="text-4xl sm:text-6xl lg:text-[4.4rem] xl:text-[5.1rem] font-serif font-normal tracking-tight leading-[0.98] text-[#1C0D12] dark:text-white">
                      L&apos;arte dello{' '}
                      <span className="italic text-[#FD5E86]">Smash Burger</span>,
                      Bubble Tea &amp;{' '}
                      <span className="italic text-[#FD5E86]">Sweet.</span>
                    </h1>
                  </RevealOnScroll>

                  <RevealOnScroll delayMs={160}>
                    <p className="text-sm sm:text-base lg:text-lg text-[#7A5A66] dark:text-[#A3939B] max-w-xl leading-relaxed">
                      Dalle autentiche infusioni di tè con perle di tapioca calda ai Bubble Waffle con gelato artigianale, fino agli irresistibili smash burger notturni della linea SpacePolly (Giove, Plutone, Marte). Aperto a Palermo tutti i giorni dalle 12:30 alle 03:30 di notte.
                    </p>
                  </RevealOnScroll>

                  {/* Primary Editorial CTAs */}
                  <RevealOnScroll
                    delayMs={220}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1"
                  >
                    <MagneticWrap strength={0.18}>
                      <a
                        href="#menu"
                        className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 px-6 py-4 bg-[#FD5E86] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#1C0D12] transition-colors shadow-xs"
                      >
                        <span>Esplora Menu &amp; Modelli 3D</span>
                        <ArrowUpRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
                      </a>
                    </MagneticWrap>

                    <MagneticWrap strength={0.15}>
                      <a
                        href={TEAAMO_LINKS.glovo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-6 py-4 border border-[#FD5E86] text-[#FD5E86] font-mono text-xs uppercase tracking-widest hover:bg-[#FFF5F8] dark:hover:bg-white/5 transition-colors text-center"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#FD5E86]" aria-hidden="true" />
                        <span>Vedi Store Ufficiale Glovo</span>
                      </a>
                    </MagneticWrap>
                  </RevealOnScroll>
                </div>

                {/* Bottom Architectural Metrics Grid */}
                <RevealOnScroll
                  delayMs={280}
                  className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 sm:pt-12 mt-8 sm:mt-12 border-t border-[#FCE4EC] dark:border-[#281E23]"
                >
                  <div>
                    <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest text-[#7A5A66] dark:text-[#A3939B] block">
                      ORARIO 7/7
                    </span>
                    <span className="font-serif text-lg sm:text-2xl lg:text-3xl mt-1 block text-[#1C0D12] dark:text-white">
                      12:30 – 03:30
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest text-[#7A5A66] dark:text-[#A3939B] block">
                      GOOGLE RATING
                    </span>
                    <span className="font-serif text-lg sm:text-2xl lg:text-3xl mt-1 block text-[#1C0D12] dark:text-white">
                      4.2 / 5.0 ★
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest text-[#7A5A66] dark:text-[#A3939B] block">
                      DELIVERY GLOVO
                    </span>
                    <span className="font-serif text-lg sm:text-2xl lg:text-3xl mt-1 block text-[#FD5E86]">
                      Attivo a PMO
                    </span>
                  </div>
                </RevealOnScroll>
              </div>

              {/* Right 5 Cols: Interactive 3D WebGL Showcase Stage */}
              <div className="lg:col-span-5 bg-[#FFF5F8] dark:bg-[#140E11] flex flex-col justify-between relative overflow-hidden">
                {/* Subtle Pink Ambient Glow */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(253,94,134,0.12),transparent_70%)]" />
                <span className="absolute top-2 left-2 font-mono text-[10px] text-[#FD5E86]/40 select-none pointer-events-none z-10">+</span>
                <span className="absolute top-2 right-2 font-mono text-[10px] text-[#FD5E86]/40 select-none pointer-events-none z-10">+</span>
                {/* 3D Model Category Switcher Header */}
                <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-[#FCE4EC] dark:border-[#281E23] font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-center">
                  {HERO_MODELS_LIST.map((m, idx) => {
                    const isSelected = heroModelType === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setHeroModelType(m.id);
                          if (m.id !== 'cup') {
                            setAutoCycleHero(false);
                          }
                        }}
                        className={`py-3 px-1 sm:px-1.5 border-r border-b sm:border-b-0 border-[#FCE4EC] dark:border-[#281E23] last:border-r-0 transition-colors cursor-pointer truncate ${
                          isSelected
                            ? 'bg-[#FD5E86] text-white font-semibold shadow-xs'
                            : 'hover:bg-[#FFD8E1]/40 text-[#1C0D12] dark:text-[#F5EFEA]'
                        }`}
                        title={m.title}
                      >
                        0{idx + 1}. {m.label}
                      </button>
                    );
                  })}
                </div>

                {/* Live Three.js / R3F Viewport */}
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
                  className="h-[340px] sm:h-[400px] lg:h-[430px]"
                />

                {/* Bottom Flavor Preset Bar inside 3D Hero Stage */}
                <div className="p-5 sm:p-6 border-t border-[#FCE4EC] dark:border-[#281E23] bg-white dark:bg-[#0D090B] space-y-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#FD5E86] block truncate">
                        {heroModelType === 'cup'
                          ? selectedHeroFlavor.badge
                          : activeHeroModel.badge}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif italic truncate transition-all duration-300 text-[#1C0D12] dark:text-white">
                        {heroModelType === 'cup'
                          ? selectedHeroFlavor.name
                          : activeHeroModel.title}
                      </h2>
                      <p className="font-mono text-[11px] text-[#7A5A66] dark:text-[#A3939B] truncate mt-0.5">
                        {activeHeroModel.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-mono text-lg sm:text-xl font-semibold text-[#FD5E86]">
                        {heroModelType === 'cup'
                          ? selectedHeroFlavor.price
                          : activeHeroModel.price}
                      </span>
                      <a
                        href={
                          heroModelType === 'cup'
                            ? selectedHeroFlavor.glovoUrl || activeHeroModel.glovoUrl || TEAAMO_LINKS.glovo
                            : activeHeroModel.glovoUrl || TEAAMO_LINKS.glovo
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ordina su Glovo"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FD5E86] text-white hover:bg-[#1C0D12] transition-colors font-mono text-[10px] uppercase tracking-wider shadow-xs"
                      >
                        <span>Glovo</span>
                        <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  {/* Swatch Selector for 3D Cup & Fruit Tea */}
                  {(heroModelType === 'cup' || heroModelType === 'fruittea') && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#FCE4EC] dark:border-[#281E23]">
                      <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#7A5A66] dark:text-[#A3939B]">
                        PALETTE INFUSIONE {autoCycleHero && heroModelType === 'cup' ? '(AUTO-CYCLE)' : ''}:
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
                              className={`w-6 h-6 rounded-full border transition-all duration-300 cursor-pointer ${
                                active
                                  ? 'scale-125 border-[#FD5E86] ring-2 ring-[#FD5E86]/40'
                                  : 'border-black/20 opacity-75 hover:opacity-100 hover:scale-110'
                              }`}
                              style={{ backgroundColor: flav.liquidTopColor }}
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

        {/* VIBRANT BRAND PINK MONOSPACE TICKER */}
        <div className="border-b border-[#FCE4EC] dark:border-[#281E23] py-3.5 bg-[#FD5E86] text-white overflow-hidden font-mono text-xs uppercase tracking-[0.2em] shadow-xs">
          <div className="flex whitespace-nowrap animate-marquee marquee-track">
            {[...marqueeItems, ...marqueeItems].map((text, index) => (
              <div key={index} className="inline-flex items-center gap-6 mx-6">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 01 / MENU INDEX & 3D PRODUCT INSPECTOR WITH REAL GLOVO PHOTOS */}
        <MenuShowcase />

        {/* 02 / 3D BOBA FORMULATION SIMULATOR */}
        <BobaLabBuilder />

        {/* 03 / OFFICIAL TIKTOK FEED BOARD (@TEAAMOBUBBLETEA) */}
        <TikTokFeedBoard />

        {/* 04, 05, 06 / DELIVERY HUB, INSTAGRAM ARCHIVE & LOCATION DOSSIER */}
        <SocialAndReviews isOpenNow={isOpenNow} />
      </main>

      {/* ARCHITECTURAL FOOTER */}
      <footer className="border-t border-[#FCE4EC] dark:border-[#281E23] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 font-mono text-xs bg-[#FFF5F8] dark:bg-[#0D090B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={`${import.meta.env.BASE_URL}teaamo-logo.png`}
              alt="TeaAmo Logo"
              className="w-9 h-9 rounded-full border border-[#FD5E86] shrink-0"
            />
            <div>
              <p className="font-serif text-lg normal-case text-[#1C0D12] dark:text-white">
                TeaAmo Bubble Tea — Sweet &amp; Coffee
              </p>
              <p className="text-[#7A5A66] dark:text-[#A3939B] text-[11px]">
                VIALE STRASBURGO, 378 — 90146 PALERMO (PA) • TEL. {TEAAMO_LINKS.phoneDisplay}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 sm:gap-6 uppercase tracking-widest">
            <a
              href={TEAAMO_LINKS.glovo}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-link hover:text-[#FD5E86] font-semibold text-[#FD5E86]"
            >
              Glovo Store
            </a>
            <a
              href={TEAAMO_LINKS.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-link hover:text-[#FD5E86] text-[#FD5E86] font-medium"
            >
              TikTok
            </a>
            <a
              href={TEAAMO_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-link hover:text-[#FD5E86] text-[#1C0D12] dark:text-white"
            >
              Instagram
            </a>
            <a
              href={TEAAMO_LINKS.linktree}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-link hover:text-[#FD5E86] text-[#1C0D12] dark:text-white"
            >
              Linktree
            </a>
            <a
              href={TEAAMO_LINKS.googleShare}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-link hover:text-[#FD5E86] text-[#1C0D12] dark:text-white"
            >
              Google Maps
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
