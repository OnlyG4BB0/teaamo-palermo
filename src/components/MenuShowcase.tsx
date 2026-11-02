import React, { useRef, useState } from 'react';
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
  const inspectorRef = useRef<HTMLDivElement>(null);

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
    // On phones the 3D inspector sits above the list: bring it into view
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  return (
    <section id="menu" className="relative py-20 sm:py-28 bg-milk overflow-hidden" aria-labelledby="menu-title">
      <span className="blob w-[520px] h-[520px] -left-56 top-40 bg-blush" aria-hidden="true" />
      <span className="blob w-[460px] h-[460px] -right-48 bottom-20 bg-taro-soft" style={{ animationDelay: '-7s' }} aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft">
              <span className="w-2 h-2 rounded-full bg-pop" aria-hidden="true" />
              Il menu
            </span>
            <h2 id="menu-title" className="mt-5 font-display font-extrabold tracking-[-0.05em] leading-[0.9] text-ink text-[clamp(2.6rem,6.5vw,5.5rem)]">
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

        {/* Filters */}
        <RevealOnScroll delayMs={60} className="mt-10 space-y-4">
          <div role="tablist" aria-label="Categorie del menu" className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
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
                  className={`btn-squish shrink-0 inline-flex items-center gap-2.5 rounded-full pl-2 pr-5 py-2 font-display font-bold text-[15px] whitespace-nowrap ${
                    isActive ? 'bg-ink text-white shadow-soft' : 'bg-white text-ink shadow-[0_1px_0_rgba(29,11,51,0.06)] hover:shadow-soft'
                  }`}
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : `${cat.dot}22`, color: isActive ? '#fff' : cat.dot }}
                  >
                    <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                  </span>
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-soft mr-1">Esigenze:</span>
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
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-300 ${
                    isActive ? 'bg-ink text-white' : `${style?.cls ?? 'bg-white text-ink'} hover:brightness-95`
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {style?.label ?? 'Tutti'}
                </button>
              );
            })}
            <span className="ml-auto text-sm text-ink-soft">
              <strong className="text-ink">{filteredItems.length}</strong> di {MENU_ITEMS.length} prodotti
            </span>
            {(activeCategory !== 'all' || activeDietary !== 'all') && (
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 text-sm font-bold text-pop-ink hover:underline">
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Azzera
              </button>
            )}
          </div>
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Product cards */}
          <div className="order-2 lg:order-1 lg:col-span-7">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {filteredItems.map((item, idx) => {
                  const isInspected = inspectedItem.id === item.id;
                  return (
                    <RevealOnScroll key={item.id} delayMs={(idx % 4) * 60} direction="scale">
                      <article
                        id={`menu-item-${item.id}`}
                        onClick={() => setInspectedItem(item)}
                        className={`group h-full flex flex-col rounded-4xl bg-white p-2.5 shadow-soft card-lift cursor-pointer transition-shadow ${
                          isInspected ? 'ring-[3px] ring-ink' : 'ring-1 ring-ink/5'
                        }`}
                      >
                        <div
                          className="relative aspect-[4/3] rounded-3xl overflow-hidden"
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
                              <Box className="w-12 h-12 text-ink/30" aria-hidden="true" />
                            </div>
                          )}
                          {item.badge && (
                            <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink shadow-soft">
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
                        <div className="flex-1 flex flex-col px-2.5 pt-4 pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-display font-bold text-lg leading-tight text-ink">{item.name}</h3>
                            <Price item={item} />
                          </div>
                          <p className="mt-1.5 text-sm text-ink-soft line-clamp-2 leading-relaxed">{item.description}</p>
                          <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                            <div className="flex gap-1">
                              {item.dietary?.map((d) => {
                                const s = DIET_STYLE[d];
                                const Icon = s.icon;
                                return (
                                  <span key={d} title={s.label} className={`w-8 h-8 rounded-full flex items-center justify-center ${s.cls}`}>
                                    <Icon className="w-4 h-4" aria-hidden="true" />
                                    <span className="sr-only">{s.label}</span>
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
                                className={`btn-squish inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold ${
                                  isInspected ? 'bg-ink text-white' : 'bg-milk text-ink'
                                }`}
                              >
                                <Box className="w-4 h-4" aria-hidden="true" />
                                3D
                              </button>
                              <a
                                href={item.glovoUrl || TEAAMO_LINKS.glovo}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Ordina ${item.name} su Glovo`}
                                className="btn-squish inline-flex items-center gap-1 rounded-full bg-pop-deep text-white px-3.5 py-2 text-sm font-bold"
                              >
                                Ordina
                                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
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

          {/* Sticky 3D inspector */}
          <div ref={inspectorRef} className="order-1 lg:order-2 lg:col-span-5 lg:sticky lg:top-24 scroll-mt-24">
            <div className="rounded-5xl overflow-hidden bg-white shadow-soft">
              <div
                className="relative transition-[background] duration-700"
                style={{ background: `radial-gradient(circle at 50% 42%, #ffffff 0%, ${accent}2e 58%, ${accent}14 100%)` }}
              >
                <StudioViewport3D
                  modelType={resolvedModelType}
                  cupConfig={resolvedCupConfig}
                  accentColor={accent}
                  interactiveHint={inspectedItem.name}
                  className="h-[340px] sm:h-[400px] xl:h-[430px]"
                />
              </div>
              <div className="p-6 sm:p-7">
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
                          const s = DIET_STYLE[d];
                          const Icon = s.icon;
                          return (
                            <span key={d} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>
                              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                              {s.label}
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
                  className="btn-squish mt-6 flex items-center justify-center gap-2 rounded-full bg-pop-deep text-white px-6 py-4 font-display font-bold text-lg shadow-pop"
                >
                  Ordina su Glovo
                  <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
