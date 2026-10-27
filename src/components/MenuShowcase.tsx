import React, { useState } from 'react';
import {
  ArrowUpRight,
  Eye,
  ShieldCheck,
  Info,
  Sparkles,
  Filter,
  Leaf,
  MilkOff,
  WheatOff,
  NutOff,
  RotateCcw,
} from 'lucide-react';
import {
  MENU_ITEMS,
  MenuItem,
  TEAAMO_LINKS,
  DIETARY_FILTERS,
  DietaryOption,
} from '../data/teaamoData';
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
  const [activeDietary, setActiveDietary] = useState<DietaryOption>('all');
  const [inspectedItem, setInspectedItem] = useState<MenuItem>(MENU_ITEMS[0]);

  const categories: { id: CategoryFilter; label: string; code: string }[] = [
    { id: 'all', label: 'Indice Completo Glovo', code: 'ALL' },
    { id: 'spacepolly', label: 'SpacePolly SmashBurger', code: 'SPC' },
    { id: 'sweet', label: 'BubbleWaffle, Crêpes & Pancake', code: 'SWT' },
    { id: 'bubble-tea', label: 'Bubble Tea & Pokémon Ed.', code: 'TEA' },
    { id: 'frozen', label: 'Gelato Artigianale & Frappè', code: 'FRZ' },
  ];

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    const matchesDietary =
      activeDietary === 'all' ||
      (item.dietary && item.dietary.includes(activeDietary as any));
    return matchesCategory && matchesDietary;
  });

  const handleCategoryChange = (catId: CategoryFilter) => {
    setActiveCategory(catId);
    const firstMatch =
      catId === 'all'
        ? MENU_ITEMS[0]
        : MENU_ITEMS.find((i) => i.category === catId) || MENU_ITEMS[0];
    setInspectedItem(firstMatch);
  };

  const handleDietaryChange = (dietaryId: DietaryOption) => {
    setActiveDietary(dietaryId);
    const matching = MENU_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      const matchesDietary =
        dietaryId === 'all' ||
        (item.dietary && item.dietary.includes(dietaryId as any));
      return matchesCategory && matchesDietary;
    });
    if (matching.length > 0) {
      setInspectedItem(matching[0]);
    }
  };

  const resetFilters = () => {
    setActiveCategory('all');
    setActiveDietary('all');
    setInspectedItem(MENU_ITEMS[0]);
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
      if (
        item.id.includes('crepe') ||
        lower.includes('crêpe') ||
        lower.includes('crepe') ||
        lower.includes('fiesta') ||
        lower.includes('kitkat')
      ) {
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
    if (
      item.id === 'bt-taro' ||
      item.id === 'bt-classic-milk' ||
      item.name.toLowerCase().includes('milk')
    ) {
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
          <div className="max-w-md space-y-2">
            <p className="text-sm sm:text-base text-[#7A5A66] dark:text-[#A3939B] leading-relaxed">
              Consulta le foto reali del locale e dei prodotti presenti su Glovo Palermo. Filtra per categoria o preferenza alimentare (Vegan, Senza Lattosio, Senza Glutine) e ispeziona ogni elemento in 3D.
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#FD5E86]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Ingredienti trasparenti e gestione allergeni verificata</span>
            </div>
          </div>
        </RevealOnScroll>

        {/* Primary Category Filter Bar */}
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

        {/* Secondary Dietary & Allergen Filter Strip */}
        <RevealOnScroll delayMs={100}>
          <div className="border-x border-b border-[#FCE4EC] dark:border-[#281E23] bg-[#FFF9FB] dark:bg-[#120B0E] p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#7A5A66] dark:text-[#A3939B] shrink-0">
                <Filter className="w-3.5 h-3.5 text-[#FD5E86]" aria-hidden="true" />
                <span>FILTRA PER DIETA &amp; ALLERGENI:</span>
              </div>

              {/* Dietary Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {DIETARY_FILTERS.map((df) => {
                  const isActive = activeDietary === df.id;
                  return (
                    <button
                      key={df.id}
                      type="button"
                      onClick={() => handleDietaryChange(df.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors duration-150 cursor-pointer border ${
                        isActive
                          ? 'bg-[#1C0D12] dark:bg-white text-white dark:text-[#1C0D12] border-[#1C0D12] dark:border-white shadow-xs font-semibold'
                          : 'bg-white dark:bg-transparent border-[#FCE4EC] dark:border-[#281E23] text-[#7A5A66] dark:text-[#A3939B] hover:border-[#FD5E86] hover:text-[#FD5E86]'
                      }`}
                      title={df.description}
                    >
                      {df.iconKey === 'all' && (
                        <Sparkles className="w-3.5 h-3.5 text-[#FD5E86]" aria-hidden="true" />
                      )}
                      {df.iconKey === 'vegan' && (
                        <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      )}
                      {df.iconKey === 'lactose-free' && (
                        <MilkOff className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                      )}
                      {df.iconKey === 'gluten-free' && (
                        <WheatOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      )}
                      {df.iconKey === 'nut-free' && (
                        <NutOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                      )}
                      <span>{df.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Counter & Clear Indicator */}
            <div className="mt-2.5 pt-2 border-t border-[#FCE4EC]/60 dark:border-[#281E23]/60 flex items-center justify-between font-mono text-[11px] text-[#7A5A66] dark:text-[#A3939B]">
              <span className="flex items-center gap-1.5">
                <span>Mostrando:</span>
                <strong className="text-[#FD5E86]">{filteredItems.length}</strong>
                <span>di {MENU_ITEMS.length} prodotti</span>
                {activeDietary !== 'all' && (
                  <span className="text-xs text-[#FD5E86] font-semibold">
                    • Filtro attivo: {DIETARY_FILTERS.find((d) => d.id === activeDietary)?.label}
                  </span>
                )}
              </span>

              {(activeCategory !== 'all' || activeDietary !== 'all') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#FD5E86] hover:underline cursor-pointer font-mono"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>Reimposta filtri</span>
                </button>
              )}
            </div>
          </div>
        </RevealOnScroll>

        {/* Split Layout: Left Menu with Real Photos, Right Sticky 3D Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-x border-b border-[#FCE4EC] dark:border-[#281E23] items-start">
          {/* Left 7 Cols: Showcase Menu List */}
          <div className="order-2 lg:order-1 lg:col-span-7 divide-y divide-[#FCE4EC] dark:divide-[#281E23] lg:border-r border-[#FCE4EC] dark:border-[#281E23] bg-white dark:bg-[#0D090B]">
            {filteredItems.length === 0 ? (
              <div className="p-10 text-center space-y-4">
                <Info className="w-8 h-8 mx-auto text-[#FD5E86]" aria-hidden="true" />
                <h3 className="text-xl font-serif text-[#1C0D12] dark:text-white">
                  Nessun prodotto corrisponde a questo filtro
                </h3>
                <p className="text-sm text-[#7A5A66] dark:text-[#A3939B] max-w-sm mx-auto">
                  Non ci sono prodotti che soddisfano contemporaneamente la categoria &quot;{categories.find((c) => c.id === activeCategory)?.label}&quot; e la preferenza &quot;{DIETARY_FILTERS.find((d) => d.id === activeDietary)?.label}&quot;.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FD5E86] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#1C0D12] transition-colors"
                >
                  <span>Reimposta Tutti i Filtri</span>
                </button>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
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

                            {/* Dietary Badges */}
                            {item.dietary && item.dietary.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {item.dietary.includes('vegan') && (
                                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-1">
                                    <Leaf className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                                    <span>Vegan</span>
                                  </span>
                                )}
                                {item.dietary.includes('lactose-free') && (
                                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-sky-500/50 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 flex items-center gap-1">
                                    <MilkOff className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                                    <span>Senza Lattosio</span>
                                  </span>
                                )}
                                {item.dietary.includes('gluten-free') && (
                                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-amber-500/50 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 flex items-center gap-1">
                                    <WheatOff className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                                    <span>Gluten-Free</span>
                                  </span>
                                )}
                                {item.dietary.includes('nut-free') && (
                                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-rose-400/50 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 flex items-center gap-1">
                                    <NutOff className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                                    <span>No Frutta a Guscio</span>
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Ingredients List */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.ingredients.map((ing) => (
                                <span
                                  key={ing}
                                  className="font-mono text-[10px] px-1.5 py-0.5 border border-[#FCE4EC] dark:border-[#281E23] bg-[#FFF5F8] dark:bg-transparent text-[#7A5A66] dark:text-[#A3939B]"
                                >
                                  {ing}
                                </span>
                              ))}
                            </div>

                            {/* Transparent Allergen Notice */}
                            {item.allergens && (
                              <p className="font-mono text-[10px] text-[#A3828F] dark:text-[#7D6B74] mt-1.5">
                                <span className="font-medium text-[#7A5A66] dark:text-[#A3939B]">Allergeni:</span>{' '}
                                {item.allergens.join(', ')}
                              </p>
                            )}
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
              })
            )}
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

              {/* Dietary Profile of Inspected Product */}
              <div className="pt-2 border-t border-[#FCE4EC] dark:border-[#281E23] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#7A5A66] dark:text-[#A3939B]">
                    Profilo Dietetico:
                  </span>
                  {inspectedItem.dietary && inspectedItem.dietary.length > 0 ? (
                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      {inspectedItem.dietary.map((d) => (
                        <span key={d} className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#FD5E86]/40 text-[#FD5E86] bg-[#FFF5F8] dark:bg-[#1A1216]">
                          {d === 'vegan' && (
                            <>
                              <Leaf className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                              <span>Vegan</span>
                            </>
                          )}
                          {d === 'lactose-free' && (
                            <>
                              <MilkOff className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                              <span>Lactose-Free</span>
                            </>
                          )}
                          {d === 'gluten-free' && (
                            <>
                              <WheatOff className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                              <span>Gluten-Free</span>
                            </>
                          )}
                          {d === 'nut-free' && (
                            <>
                              <NutOff className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                              <span>Nut-Free</span>
                            </>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-mono text-[10px] text-[#7A5A66] dark:text-[#A3939B]">
                      Ricetta classica artigianale
                    </span>
                  )}
                </div>

                {/* Allergen Breakdown */}
                {inspectedItem.allergens && (
                  <div className="p-2 bg-[#FFF5F8] dark:bg-white/5 border border-[#FCE4EC] dark:border-[#281E23] flex items-start gap-1.5 text-[11px] font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FD5E86] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <span className="font-semibold text-[#1C0D12] dark:text-white block">
                        Allergeni Presenti:
                      </span>
                      <span className="text-[#7A5A66] dark:text-[#A3939B]">
                        {inspectedItem.allergens.join(', ')}
                      </span>
                    </div>
                  </div>
                )}
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
