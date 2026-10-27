import React, { useState } from 'react';
import { ArrowUpRight, Eye } from 'lucide-react';
import { MENU_ITEMS, MenuItem, TEAAMO_LINKS } from '../data/teaamoData';
import { ModelType, StudioViewport3D } from './three/TeaAmo3DModels';
import {
  RevealOnScroll,
  AnimatedPrice,
  handleSpotlightMove,
} from './ui/AnimatedPrimitives';

interface MenuShowcaseProps {
  className?: string;
}

type CategoryFilter = 'all' | 'spacepolly' | 'sweet' | 'bubble-tea' | 'frozen';

export const MenuShowcase: React.FC<MenuShowcaseProps> = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [inspectedItem, setInspectedItem] = useState<MenuItem>(MENU_ITEMS[0]);

  const categories: { id: CategoryFilter; label: string; code: string }[] = [
    { id: 'all', label: 'Indice Completo Glovo', code: 'ALL' },
    { id: 'spacepolly', label: 'SpacePolly SmashBurger', code: 'SPC' },
    { id: 'sweet', label: 'BubbleWaffle, Crêpes & Pancake', code: 'SWT' },
    { id: 'bubble-tea', label: 'Bubble Tea & Pokémon Ed.', code: 'TEA' },
    { id: 'frozen', label: 'Gelato Artigianale & Frappè', code: 'FRZ' },
  ];

  const filteredItems =
    activeCategory === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === activeCategory);

  const handleCategoryChange = (catId: CategoryFilter) => {
    setActiveCategory(catId);
    const firstMatch =
      catId === 'all'
        ? MENU_ITEMS[0]
        : MENU_ITEMS.find((i) => i.category === catId) || MENU_ITEMS[0];
    setInspectedItem(firstMatch);
  };

  const getModelType = (item: MenuItem): ModelType => {
    if (item.category === 'spacepolly') {
      if (item.id === 'sp-giove') return 'burger-giove';
      if (item.id === 'sp-plutone') return 'burger-plutone';
      if (item.id === 'sp-marte') return 'burger-marte';
      if (item.id === 'sp-urano') return 'burger-urano';
      return 'burger-giove';
    }
    if (item.category === 'sweet') {
      const lower = item.name.toLowerCase();
      if (item.id.includes('crepe') || lower.includes('crêpe') || lower.includes('crepe') || lower.includes('fiesta') || lower.includes('kitkat')) {
        return 'crepe';
      }
      if (item.id.includes('pancake') || lower.includes('pancake')) {
        return 'pancake';
      }
      return 'waffle';
    }
    if (item.category === 'frozen') {
      return 'coppetta';
    }
    // Bubble tea: distinguish fruit tea with sliced fruit vs classic milk tea
    if (item.id === 'bt-taro' || item.id === 'bt-classic-milk' || item.name.toLowerCase().includes('milk')) {
      return 'cup';
    }
    return 'fruittea';
  };

  const resolvedModelType = getModelType(inspectedItem);

  const resolvedCupConfig = inspectedItem.cupConfig
    ? {
        liquidTopColor: inspectedItem.cupConfig.liquidTop,
        liquidBottomColor: inspectedItem.cupConfig.liquidBottom,
        bobaColor: inspectedItem.cupConfig.boba,
        bobaSecondaryColor: '#FFD8E1',
        creamColor: inspectedItem.cupConfig.cream,
        hasPinkCream: true,
        showIce: true,
      }
    : {
        liquidTopColor: '#FF85A2',
        liquidBottomColor: '#FD5E86',
        bobaColor: '#881337',
        bobaSecondaryColor: '#FFF5F8',
        creamColor: '#FFFFFF',
        hasPinkCream: true,
        showIce: false,
      };

  return (
    <section
      id="menu"
      className="border-b border-[#FCE4EC] dark:border-[#281E23] py-14 sm:py-24 bg-white dark:bg-[#0D090B]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-10 border-b border-[#FCE4EC] dark:border-[#281E23] gap-4 sm:gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#FD5E86] mb-2.5">
              01 / CATALOGO VETRINA &amp; ISPETTORE 3D GLOVO
            </p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-none text-[#1C0D12] dark:text-[#F5EFEA]">
              SpacePolly, Bubble Tea &amp;{' '}
              <span className="italic text-[#FD5E86]">Sweet Patisserie</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#7A5A66] dark:text-[#A3939B] max-w-md leading-relaxed">
            Consulta le foto reali del locale e dei prodotti presenti su Glovo Palermo. Clicca su ciascun elemento per caricarne l&apos;ispezione 3D interattiva a 360° con vista esplosa.
          </p>
        </RevealOnScroll>

        {/* Category Filter Bar */}
        <RevealOnScroll delayMs={60}>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-x border-b border-[#FCE4EC] dark:border-[#281E23]"
            role="tablist"
            aria-label="Filtra categorie menu"
          >
            {categories.map((cat, idx) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`py-3.5 px-4 text-left border-b lg:border-b-0 border-r border-[#FCE4EC] dark:border-[#281E23] transition-all duration-300 cursor-pointer ${
                    idx === categories.length - 1 ? 'col-span-2 sm:col-span-1 lg:border-r-0' : ''
                  } ${
                    isActive
                      ? 'bg-[#FD5E86] text-white shadow-xs font-semibold'
                      : 'bg-white hover:bg-[#FFF5F8] text-[#1C0D12] dark:bg-transparent dark:hover:bg-white/5 dark:text-[#F5EFEA]'
                  }`}
                >
                  <span className={`font-mono text-[10px] uppercase tracking-widest block ${isActive ? 'text-white/80' : 'text-[#7A5A66]'}`}>
                    [{cat.code}]
                  </span>
                  <span className="font-medium text-xs sm:text-sm mt-0.5 block truncate">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* Split Layout: Left Menu with Real Photos, Right Sticky 3D Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-x border-b border-[#FCE4EC] dark:border-[#281E23] items-start">
          {/* Left 7 Cols: Showcase Menu List */}
          <div className="order-2 lg:order-1 lg:col-span-7 divide-y divide-[#FCE4EC] dark:divide-[#281E23] lg:border-r border-[#FCE4EC] dark:border-[#281E23] bg-white dark:bg-[#0D090B]">
            {filteredItems.map((item, idx) => {
              const isInspected = inspectedItem.id === item.id;
              return (
                <RevealOnScroll key={item.id} delayMs={(idx % 6) * 45}>
                  <article
                    onMouseMove={handleSpotlightMove}
                    onClick={() => setInspectedItem(item)}
                    className={`spotlight-card relative p-5 sm:p-6 lg:p-7 transition-all duration-300 cursor-pointer ${
                      isInspected
                        ? 'bg-[#FFF5F8] dark:bg-[#1A1216]'
                        : 'bg-white hover:bg-[#FFF9FB] dark:bg-transparent dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Animated Left Accent Indicator */}
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-1 transition-transform duration-300 origin-top ${
                        item.category === 'spacepolly' ? 'bg-[#F59E0B]' : 'bg-[#FD5E86]'
                      } ${isInspected ? 'scale-y-100' : 'scale-y-0'}`}
                    />

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 justify-between">
                      {/* Left: Thumbnail from Glovo */}
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        {item.imageUrl ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-black/5 shrink-0 border border-[#FCE4EC] dark:border-[#281E23] shadow-xs">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md bg-[#FFF0F5] flex items-center justify-center font-mono text-[10px] uppercase text-[#FD5E86] shrink-0 border border-[#FCE4EC]">
                            3D Model
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="font-mono text-xs text-[#FD5E86]">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <h3 className="text-lg sm:text-xl font-serif text-[#1C0D12] dark:text-white">
                              {item.name}
                            </h3>
                            {item.badge && (
                              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-[#FD5E86] text-[#FD5E86]">
                                {item.badge}
                              </span>
                            )}
                            {item.category === 'spacepolly' && (
                              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-[#F59E0B] text-[#D97706] dark:text-[#FBBF24]">
                                250°C Smash
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-[#7A5A66] dark:text-[#A3939B] mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {item.ingredients.map((ing) => (
                              <span
                                key={ing}
                                className="font-mono text-[10px] px-1.5 py-0.5 border border-[#FCE4EC] dark:border-[#281E23] bg-[#FFF5F8] dark:bg-transparent text-[#7A5A66] dark:text-[#A3939B]"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#FCE4EC]/60">
                        <div className="text-left sm:text-right font-mono">
                          {item.promoPrice ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs line-through text-[#7A5A66] dark:text-[#A3939B]">
                                €{item.price.toFixed(2)}
                              </span>
                              <span className="text-base sm:text-lg font-semibold text-[#FD5E86]">
                                €{item.promoPrice.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-base sm:text-lg font-semibold text-[#1C0D12] dark:text-white">
                              €{item.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedItem(item);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                              isInspected
                                ? 'bg-[#FD5E86] text-white shadow-xs'
                                : 'border border-[#FCE4EC] hover:border-[#FD5E86] text-[#1C0D12] bg-white'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>3D</span>
                          </button>

                          <a
                            href={item.glovoUrl || TEAAMO_LINKS.glovo}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Ordina ${item.name} su Glovo`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFF0F5] border border-[#FCE4EC] hover:border-[#FD5E86] hover:text-[#FD5E86] text-[#1C0D12] font-mono text-[11px] uppercase transition-colors"
                          >
                            <span>Glovo</span>
                            <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>

          {/* Right 5 Cols: Sticky 3D WebGL Product Inspector */}
          <div className="order-1 lg:order-2 lg:col-span-5 bg-[#FFF5F8] dark:bg-[#140E11] border-b lg:border-b-0 border-[#FCE4EC] dark:border-[#281E23] lg:sticky lg:top-20 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle Pink Ambient Underglow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(253,94,134,0.1),transparent_70%)]" />
            <span className="absolute top-2 left-2 font-mono text-[10px] text-[#FD5E86]/40 select-none pointer-events-none z-10">+</span>
            <span className="absolute top-2 right-2 font-mono text-[10px] text-[#FD5E86]/40 select-none pointer-events-none z-10">+</span>
            <div className="p-4 sm:p-5 border-b border-[#FCE4EC] dark:border-[#281E23] flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-[#FD5E86] truncate flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FD5E86] live-dot shrink-0" />
                ISPETTORE 3D // {resolvedModelType.toUpperCase()}
              </span>
              <span className="font-mono text-[11px] text-[#7A5A66] dark:text-[#A3939B] shrink-0">
                STRASBURGO 378
              </span>
            </div>

            <StudioViewport3D
              modelType={resolvedModelType}
              cupConfig={resolvedCupConfig}
              accentColor={inspectedItem.colorAccent}
              interactiveHint={`MODELLO 3D: ${inspectedItem.name.toUpperCase()}`}
              className="h-[310px] sm:h-[360px] lg:h-[360px] xl:h-[400px]"
            />

            <div className="p-5 sm:p-6 border-t border-[#FCE4EC] dark:border-[#281E23] bg-white dark:bg-[#0D090B] space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#7A5A66] dark:text-[#A3939B]">
                  PRODOTTO IN ISPEZIONE 3D
                </span>
                {inspectedItem.imageUrl && (
                  <span className="font-mono text-[10px] uppercase text-[#FD5E86] tracking-wider">
                    ● Foto Glovo Sincronizzata
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xl sm:text-2xl font-serif italic text-[#1C0D12] dark:text-white">
                    {inspectedItem.name}
                  </h4>
                  <p className="text-xs text-[#7A5A66] dark:text-[#A3939B] mt-1 leading-relaxed">
                    {inspectedItem.description}
                  </p>
                </div>
                <AnimatedPrice
                  value={inspectedItem.promoPrice || inspectedItem.price}
                  className="font-mono text-lg sm:text-xl font-semibold text-[#FD5E86] shrink-0"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#FCE4EC] dark:border-[#281E23]">
                <span className="font-mono text-[11px] text-[#7A5A66] dark:text-[#A3939B]">
                  Disponibile per asporto &amp; delivery
                </span>
                <a
                  href={inspectedItem.glovoUrl || TEAAMO_LINKS.glovo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ordina ${inspectedItem.name} su Glovo`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FD5E86] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#1C0D12] transition-colors shadow-xs"
                >
                  <span>Ordina su Glovo</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
