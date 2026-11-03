import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Box,
  CakeSlice,
  CupSoda,
  IceCreamCone,
  Info,
  Leaf,
  MilkOff,
  NutOff,
  RotateCcw,
  Sandwich,
  ShieldCheck,
  Sparkles,
  WheatOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MENU_ITEMS, MenuItem, TEAAMO_LINKS, DIETARY_FILTERS, DietaryOption } from '../data/teaamoData';
import { ModelType, StudioViewport3D } from './three/LazyStudioViewport3D';
import { RevealOnScroll, AnimatedPrice } from './ui/AnimatedPrimitives';
import { BottomSheet } from './ui/BottomSheet';

type CategoryFilter = 'all' | 'spacepolly' | 'sweet' | 'bubble-tea' | 'frozen';

const CATEGORIES: { id: CategoryFilter; label: string; icon: LucideIcon; dot: string }[] = [
  { id: 'all', label: 'Tutto il menu', icon: Sparkles, dot: '#1D0B33' },
  { id: 'bubble-tea', label: 'Bubble tea', icon: CupSoda, dot: '#A98BFF' },
  { id: 'spacepolly', label: 'SpacePolly burger', icon: Sandwich, dot: '#FF2E7E' },
  { id: 'sweet', label: 'Waffle, crêpes & pancake', icon: CakeSlice, dot: '#FFC94A' },
  { id: 'frozen', label: 'Gelato & frozen', icon: IceCreamCone, dot: '#7CCBFF' },
];

const DIET_STYLE: Record<Exclude<DietaryOption, 'all'>, { icon: LucideIcon; label: string; cls: string }> = {
  vegan: { icon: Leaf, label: 'Vegan', cls: 'bg-[#E6F7D9] text-[#2F6B12]' },
  'lactose-free': { icon: MilkOff, label: 'Senza lattosio', cls: 'bg-[#DFF1FF] text-[#155A8A]' },
  'gluten-free': { icon: WheatOff, label: 'Senza glutine', cls: 'bg-[#FFF1CC] text-[#7A5200]' },
  'nut-free': { icon: NutOff, label: 'No frutta a guscio', cls: 'bg-[#FFE3EC] text-[#A30F4C]' },
};

const getModelType = (item: MenuItem): ModelType => {
  if (item.category === 'spacepolly') {
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
    if (item.id.includes('pancake') || lower.includes('pancake')) return 'pancake';
    return 'waffle';
  }
  if (item.category === 'frozen') return 'coppetta';
  // Milk teas get the creamy cup, everything else the crystal fruit tea
  if (item.id === 'bt-taro' || item.id === 'bt-classic-milk' || item.name.toLowerCase().includes('milk')) return 'cup';
  return 'fruittea';
};

const Price: React.FC<{ item: MenuItem }> = ({ item }) =>
  item.promoPrice ? (
    <span className="flex items-baseline gap-1.5 shrink-0">
      <span className="text-xs line-through text-ink-soft">€{item.price.toFixed(2)}</span>
      <span className="rounded-full bg-pop-deep text-white px-3 py-1 font-display font-extrabold text-sm">€{item.promoPrice.toFixed(2)}</span>
    </span>
  ) : (
    <span className="shrink-0 rounded-full bg-blush px-3 py-1 font-display font-extrabold text-sm text-ink">€{item.price.toFixed(2)}</span>
  );

export const MenuShowcase: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [activeDietary, setActiveDietary] = useState<DietaryOption>('all');
  const [inspectedItem, setInspectedItem] = useState<MenuItem>(MENU_ITEMS[0]);
  // Phones/tablets show the 3D inspector in a bottom sheet (no idle WebGL canvas in the page)
  const [isDesktop, setIsDesktop] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setSheetOpen(false);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const matches = (item: MenuItem, cat: CategoryFilter, diet: DietaryOption) =>
    (cat === 'all' || item.category === cat) &&
    (diet === 'all' || (item.dietary?.includes(diet as Exclude<DietaryOption, 'all'>) ?? false));

  const filteredItems = MENU_ITEMS.filter((item) => matches(item, activeCategory, activeDietary));

  const handleCategoryChange = (catId: CategoryFilter) => {
    setActiveCategory(catId);
    const first = MENU_ITEMS.find((i) => matches(i, catId, activeDietary));
    if (first) setInspectedItem(first);
  };

  const handleDietaryChange = (dietaryId: DietaryOption) => {
    setActiveDietary(dietaryId);
    const first = MENU_ITEMS.find((i) => matches(i, activeCategory, dietaryId));
    if (first) setInspectedItem(first);
  };

  const resetFilters = () => {
    setActiveCategory('all');
    setActiveDietary('all');
    setInspectedItem(MENU_ITEMS[0]);
  };

  const inspect = (item: MenuItem) => {
    setInspectedItem(item);
    if (!isDesktop) setSheetOpen(true);
  };

  const resolvedModelType = getModelType(inspectedItem);
  const resolvedCupConfig = inspectedItem.cupConfig
    ? {
        liquidTopColor: inspectedItem.cupConfig.liquidTop,
        liquidBottomColor: inspectedItem.cupConfig.liquidBottom,
        bobaColor: inspectedItem.cupConfig.boba,
        bobaSecondaryColor: '#FFD9DE',
        creamColor: inspectedItem.cupConfig.cream,
        hasPinkCream: true,
        showIce: true,
      }
    : {
        liquidTopColor: '#FF85A2',
        liquidBottomColor: '#FF2E7E',
        bobaColor: '#881337',
        bobaSecondaryColor: '#FFF1EC',
        creamColor: '#FFFFFF',
        hasPinkCream: true,
        showIce: false,
      };
  const accent = inspectedItem.colorAccent;
  const category = CATEGORIES.find((c) => c.id === inspectedItem.category);

  const inspectorStage = (
    <div
      className="relative transition-[background] duration-700"
      style={{ background: `radial-gradient(circle at 50% 42%, #ffffff 0%, ${accent}2e 58%, ${accent}14 100%)` }}
    >
      <StudioViewport3D
        modelType={resolvedModelType}
        cupConfig={resolvedCupConfig}
        accentColor={accent}
        interactiveHint={inspectedItem.name}
        className={isDesktop ? 'h-[400px] xl:h-[430px]' : 'h-[300px] sm:h-[360px]'}
      />
    </div>
  );

  const inspectorDetails = (
    <>
      {category && (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
          style={{ backgroundColor: `${category.dot}1f`, color: category.id === 'sweet' ? '#7A5200' : category.dot }}
        >
          <category.icon className="w-3.5 h-3.5" aria-hidden="true" />
          {category.label}
        </span>
      )}
      <div className="mt-3 flex items-start justify-between gap-4">
        <h3 key={inspectedItem.id} className="hero-enter font-display font-extrabold text-2xl sm:text-3xl leading-tight tracking-tight text-ink">
          {inspectedItem.name}
        </h3>
        <AnimatedPrice value={inspectedItem.promoPrice || inspectedItem.price} className="font-display font-extrabold text-2xl sm:text-3xl text-ink shrink-0" />
      </div>
      <p className="mt-2 text-[15px] text-ink-soft leading-relaxed">{inspectedItem.description}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {inspectedItem.ingredients.map((ing) => (
          <span key={ing} className="rounded-full bg-milk px-3 py-1.5 text-sm font-medium text-ink">
            {ing}
          </span>
        ))}
      </div>

      {(inspectedItem.dietary?.length || inspectedItem.allergens) && (
        <div className="mt-5 rounded-3xl bg-blush/60 p-4 space-y-3">
          {inspectedItem.dietary && inspectedItem.dietary.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {inspectedItem.dietary.map((d) => {
                const st = DIET_STYLE[d];
                const Icon = st.icon;
                return (
                  <span key={d} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {st.label}
                  </span>
                );
              })}
            </div>
          )}
          {inspectedItem.allergens && (
            <p className="flex items-start gap-2 text-sm text-ink">
              <ShieldCheck className="w-4 h-4 mt-0.5 text-pop-ink shrink-0" aria-hidden="true" />
              <span>
                <strong>Allergeni:</strong> {inspectedItem.allergens.join(', ')}
              </span>
            </p>
          )}
        </div>
      )}

      <a
        href={inspectedItem.glovoUrl || TEAAMO_LINKS.glovo}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ordina ${inspectedItem.name} su Glovo`}
        className="lg lg-tint lg-press mt-6 flex items-center justify-center gap-2 rounded-full text-white px-6 py-4 font-display font-bold text-lg"
        style={{ '--lg-color': '#E0156A' } as React.CSSProperties}
      >
        Ordina su Glovo
        <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
      </a>
    </>
  );

  return (
    <section id="menu" className="relative py-16 sm:py-28 bg-milk overflow-clip" aria-labelledby="menu-title">
      <span className="blob w-[520px] h-[520px] -left-56 top-40 bg-blush" aria-hidden="true" />
      <span className="blob w-[460px] h-[460px] -right-48 bottom-20 bg-taro-soft" style={{ animationDelay: '-7s' }} aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-end">
          <div className="lg:col-span-7">
            <span className="lg inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-ink">
              <span className="w-2 h-2 rounded-full bg-pop" aria-hidden="true" />
              Il menu
            </span>
            <h2 id="menu-title" className="mt-5 font-display font-extrabold tracking-[-0.05em] leading-[0.9] text-ink text-[clamp(2.5rem,6.5vw,5.5rem)]">
              Scegli. Giralo in 3D.{' '}
              <span className="text-candy">Ordina.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 space-y-3">
            <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
              Tutti i prodotti del nostro store Glovo con foto reali. Filtra per categoria o esigenza alimentare e tocca un prodotto per vederlo in 3D.
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldCheck className="w-4 h-4 text-pop-ink" aria-hidden="true" />
              Ingredienti e allergeni sempre in chiaro
            </p>
          </div>
        </RevealOnScroll>

        {/* Filters: single swipeable rows on phones */}
        <div className="mt-8 sm:mt-10 space-y-3">
          <div role="tablist" aria-label="Categorie del menu" className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1 sm:mx-0 sm:px-0 sm:flex-wrap">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`lg-press shrink-0 inline-flex items-center gap-2.5 rounded-full pl-1.5 pr-4 sm:pl-2 sm:pr-5 py-1.5 sm:py-2 font-display font-bold text-[14px] sm:text-[15px] whitespace-nowrap ${
                    isActive ? 'lg lg-tint text-white' : 'lg text-ink'
                  }`}
                  style={isActive ? ({ '--lg-color': '#1D0B33' } as React.CSSProperties) : undefined}
                >
                  <span
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : `${cat.dot}22`, color: isActive ? '#fff' : cat.dot }}
                  >
                    <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                  </span>
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:items-center">
            {DIETARY_FILTERS.map((df) => {
              const isActive = activeDietary === df.id;
              const style = df.id === 'all' ? null : DIET_STYLE[df.id];
              const Icon = style?.icon ?? Sparkles;
              return (
                <button
                  key={df.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleDietaryChange(df.id)}
                  title={df.description}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 min-h-[44px] text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    isActive ? 'bg-ink text-white' : `${style?.cls ?? 'bg-white text-ink'} hover:brightness-95`
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {style?.label ?? 'Tutte le esigenze'}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-ink-soft">
            <span>
              <strong className="text-ink">{filteredItems.length}</strong> di {MENU_ITEMS.length} prodotti
              <span className="lg:hidden"> · tocca per il 3D</span>
            </span>
            {(activeCategory !== 'all' || activeDietary !== 'all') && (
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-pop-ink">
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Azzera filtri
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Product cards: compact rows on phones, photo cards from sm up */}
          <div className="lg:col-span-7">
            {filteredItems.length === 0 ? (
              <div className="rounded-5xl bg-white p-10 text-center shadow-soft">
                <Info className="w-10 h-10 mx-auto text-pop" aria-hidden="true" />
                <h3 className="mt-4 font-display font-extrabold text-2xl text-ink">Nessun prodotto con questi filtri</h3>
                <p className="mt-2 text-ink-soft max-w-sm mx-auto">Prova un'altra categoria o togli il filtro sulle esigenze alimentari.</p>
                <button type="button" onClick={resetFilters} className="btn-squish mt-6 inline-flex rounded-full bg-ink text-white px-6 py-3 font-display font-bold">
                  Mostra tutto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                {filteredItems.map((item, idx) => {
                  const isInspected = isDesktop && inspectedItem.id === item.id;
                  return (
                    <RevealOnScroll key={item.id} delayMs={(idx % 4) * 50} direction="scale">
                      <article
                        id={`menu-item-${item.id}`}
                        onClick={() => inspect(item)}
                        className={`group h-full flex sm:flex-col gap-3 sm:gap-0 rounded-3xl sm:rounded-4xl bg-white p-2 sm:p-2.5 shadow-soft card-lift cursor-pointer active:scale-[0.98] transition-[transform,box-shadow] ${
                          isInspected ? 'ring-[3px] ring-ink' : 'ring-1 ring-ink/5'
                        }`}
                      >
                        <div
                          className="relative w-[104px] h-[104px] sm:w-auto sm:h-auto sm:aspect-[4/3] shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden"
                          style={{ background: `linear-gradient(140deg, ${item.colorAccent}40, ${item.colorAccent}12)` }}
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Box className="w-10 h-10 text-ink/30" aria-hidden="true" />
                            </div>
                          )}
                          {item.badge && (
                            <span className="hidden sm:inline-block absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink shadow-soft">
                              {item.badge}
                            </span>
                          )}
                          {isInspected && (
                            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-ink text-white px-3 py-1 text-xs font-bold">
                              <Box className="w-3.5 h-3.5" aria-hidden="true" />
                              In 3D
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col py-1 pr-1 sm:px-2.5 sm:pt-4 sm:pb-2">
                          <div className="flex items-start justify-between gap-2 sm:gap-3">
                            <h3 className="font-display font-bold text-[15px] sm:text-lg leading-tight text-ink">{item.name}</h3>
                            <span className="hidden sm:block">
                              <Price item={item} />
                            </span>
                          </div>
                          <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-sm text-ink-soft line-clamp-2 leading-snug sm:leading-relaxed">{item.description}</p>
                          <div className="mt-auto pt-2 sm:pt-4 flex items-center justify-between gap-2">
                            <span className="sm:hidden">
                              <Price item={item} />
                            </span>
                            <div className="hidden sm:flex gap-1">
                              {item.dietary?.map((d) => {
                                const st = DIET_STYLE[d];
                                const Icon = st.icon;
                                return (
                                  <span key={d} title={st.label} className={`w-8 h-8 rounded-full flex items-center justify-center ${st.cls}`}>
                                    <Icon className="w-4 h-4" aria-hidden="true" />
                                    <span className="sr-only">{st.label}</span>
                                  </span>
                                );
                              })}
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  inspect(item);
                                }}
                                aria-label={`Guarda ${item.name} in 3D`}
                                className={`lg-press inline-flex items-center justify-center gap-1.5 rounded-full w-11 h-11 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 text-sm font-bold ${
                                  isInspected ? 'bg-ink text-white' : 'bg-milk text-ink'
                                }`}
                              >
                                <Box className="w-4 h-4" aria-hidden="true" />
                                <span className="hidden sm:inline">3D</span>
                              </button>
                              <a
                                href={item.glovoUrl || TEAAMO_LINKS.glovo}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Ordina ${item.name} su Glovo`}
                                className="lg-press inline-flex items-center justify-center gap-1 rounded-full bg-pop-deep text-white w-11 h-11 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 text-sm font-bold"
                              >
                                <span className="hidden sm:inline">Ordina</span>
                                <ArrowUpRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </article>
                    </RevealOnScroll>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop: sticky 3D inspector beside the list */}
          {isDesktop && (
            <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24">
              <div className="rounded-5xl overflow-hidden bg-white shadow-soft">
                {inspectorStage}
                <div className="p-7">{inspectorDetails}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phones & tablets: the product opens in a liquid glass sheet */}
      {!isDesktop && (
        <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Anteprima 3D" bodyClassName="!px-3">
          <div className="rounded-[1.75rem] overflow-hidden bg-white">{inspectorStage}</div>
          <div className="px-2 pt-5 pb-2">{inspectorDetails}</div>
        </BottomSheet>
      )}
    </section>
  );
};
