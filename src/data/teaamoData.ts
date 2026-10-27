export interface HeroPresetFlavor {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  price: string;
  liquidTopColor: string;
  liquidBottomColor: string;
  creamColor: string;
  bobaColor: string;
  bobaSecondaryColor: string;
  accentHex: string;
  calories: string;
  description: string;
  imageUrl?: string;
  glovoUrl?: string;
}

export interface BobaIngredient {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  secondaryColor?: string;
  priceDelta: number;
  tag?: string;
}

export type DietaryOption = 'all' | 'vegan' | 'lactose-free' | 'gluten-free' | 'nut-free';

export interface DietaryFilterItem {
  id: DietaryOption;
  label: string;
  shortLabel: string;
  iconKey: DietaryOption;
  badgeClass: string;
  description: string;
}

export const DIETARY_FILTERS: DietaryFilterItem[] = [
  {
    id: 'all',
    label: 'Tutti gli Stili',
    shortLabel: 'TUTTI',
    iconKey: 'all',
    badgeClass: 'border-[#FD5E86] text-[#FD5E86]',
    description: 'Mostra l\'intero catalogo prodotti',
  },
  {
    id: 'vegan',
    label: '100% Vegan Friendly',
    shortLabel: 'VEGAN',
    iconKey: 'vegan',
    badgeClass: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
    description: 'Tè alla frutta & sciroppi vegetali con perle agar',
  },
  {
    id: 'lactose-free',
    label: 'Senza Lattosio',
    shortLabel: 'DAIRY-FREE',
    iconKey: 'lactose-free',
    badgeClass: 'border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20',
    description: 'Zero derivati del latte o con base cocco/vegetale',
  },
  {
    id: 'gluten-free',
    label: 'Senza Glutine',
    shortLabel: 'GLUTEN-FREE',
    iconKey: 'gluten-free',
    badgeClass: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20',
    description: 'Tapioca 100% naturale da manioca & coppette',
  },
  {
    id: 'nut-free',
    label: 'Senza Frutta a Guscio',
    shortLabel: 'NUT-FREE',
    iconKey: 'nut-free',
    badgeClass: 'border-rose-400 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20',
    description: 'Privo di nocciole, pistacchi e arachidi',
  },
];

export interface MenuItem {
  id: string;
  name: string;
  category: 'bubble-tea' | 'sweet' | 'spacepolly' | 'frozen';
  price: number;
  promoPrice?: number;
  badge?: string;
  isNightSpecial?: boolean;
  description: string;
  ingredients: string[];
  dietary?: ('vegan' | 'lactose-free' | 'gluten-free' | 'nut-free')[];
  allergens?: string[];
  colorAccent: string;
  imageUrl?: string;
  glovoUrl?: string;
  cupConfig?: {
    liquidTop: string;
    liquidBottom: string;
    boba: string;
    cream: string;
  };
}

export const GLOVO_STORE_SECTIONS = {
  store: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo',
  spacepolly: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-smashburger-spacepolly-s.5928543826',
  sweetGelato: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-crepes-bubblewaffle-pancake-gelato-s.6315760044',
  sweetSpecial: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-crepes-pancake-waffle-special-con-snack-s.5927622311',
  bubbleTea: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-bubble-tea-s.5927622312',
  pokemon: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-pokemon-bubble-tea-limited-edition-s.5927622306',
  frozen: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-frozenyogurt-e-fiordilatte-s.5927622305',
  gelato: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-gelato-e-granita-artigianale-s.6184017023',
};

export const TEAAMO_LINKS = {
  googleShare: 'https://share.google/mQuebwYXC9WtTkPSz',
  googleMapsDirect: 'https://www.google.com/maps/search/?api=1&query=TeaAmo+Bubble+Tea+Viale+Strasburgo+378+Palermo',
  instagram: 'https://www.instagram.com/teaamo_bubbletea/',
  tiktok: 'https://www.tiktok.com/@teaamobubbletea',
  linktree: 'https://linktr.ee/TeaAmoBubbleTeaPA?utm_source=ig&utm_medium=social&utm_content=link_in_bio',
  glovo: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo',
  phone: '+393517032607',
  phoneDisplay: '+39 351 703 2607',
  address: 'Viale Strasburgo, 378 — 90146 Palermo (PA)',
  hours: 'Tutti i giorni: 12:30 – 03:30 di notte',
};

export const HERO_FLAVORS: HeroPresetFlavor[] = [
  {
    id: 'strawberry-teaamo',
    name: 'Strawberry Coconut Love',
    tagline: 'Latte, Fragola, Cocco & Perle Fragola',
    badge: 'Signature Glovo',
    price: '5,40 €',
    liquidTopColor: '#FF7EB3',
    liquidBottomColor: '#E11D48',
    creamColor: '#FF85A2',
    bobaColor: '#9F1239',
    bobaSecondaryColor: '#FDE4EA',
    accentHex: '#E11D48',
    calories: '240 kcal',
    description: 'La celebre ricetta originale di TeaAmo Palermo su Glovo: latte, fragola e cocco vellutato con popping boba alla fragola e topping panna.',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/e9c3c07763a7321f477ada617da2f41c73a0f44067a8642227467c1d6c9d6115?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-bubble-tea-s.5927622312',
  },
  {
    id: 'taro-velvet',
    name: 'Milk Tea Taro Originale',
    tagline: 'Vero Taro Viola & Tapioca Caramellata',
    badge: 'Best Seller Glovo',
    price: '5,40 €',
    liquidTopColor: '#C084FC',
    liquidBottomColor: '#6D28D9',
    creamColor: '#F3E8FF',
    bobaColor: '#3B0764',
    bobaSecondaryColor: '#DDD6FE',
    accentHex: '#7C3AED',
    calories: '260 kcal',
    description: 'Il Taro Milk Tea autentico: latte cremoso e radice tuberosa dai toni viola, con morbide perle di tapioca nera preparate ogni giorno.',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/7b912de34bace8afcafe9cb36d0adabc2dfb40bbe095d0faef35d58b7bc8170b?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-bubble-tea-s.5927622312',
  },
  {
    id: 'pokemon-special',
    name: 'Bulbasaur Special Edition',
    tagline: 'Tè Verde, Latte & Mela Verde',
    badge: 'Edizione Pokémon',
    price: '5,30 €',
    liquidTopColor: '#68D391',
    liquidBottomColor: '#276749',
    creamColor: '#E6FFFA',
    bobaColor: '#22543D',
    bobaSecondaryColor: '#9AE6B4',
    accentHex: '#38A169',
    calories: '195 kcal',
    description: 'L\'iconico drink a tema Pokémon di TeaAmo Palermo presente su Glovo: infuso di tè verde con latte fresco e succosa mela verde con perle esplosive.',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/8750b581ce4e3f43d5c8804b10202cc978c44304aa600365aa1a248764572d3b?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-pokemon-bubble-tea-limited-edition-s.5927622306',
  },
  {
    id: 'classic-milk-tea',
    name: 'Classic Milk Tea',
    tagline: 'Tè Nero, Latte & Tapioca',
    badge: 'Tradizione Boba',
    price: '4,80 €',
    liquidTopColor: '#F6E05E',
    liquidBottomColor: '#975A16',
    creamColor: '#FEFCBF',
    bobaColor: '#271206',
    bobaSecondaryColor: '#D69E2E',
    accentHex: '#B7791F',
    calories: '210 kcal',
    description: 'La ricetta taiwanese classica servita da TeaAmo a Palermo: infusione di tè nero, latte denso e perle di tapioca calde e gommose.',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/d8b5d4ee3e68985ccd688e9e8889629eea488da2bcf7ab9ccf512b380b4a8078?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-bubble-tea-s.5927622312',
  },
  {
    id: 'blue-tropical',
    name: 'Blu Tropical & Kiwi',
    tagline: 'Tè Nero, Blu Tropical & Perle Kiwi',
    badge: 'Esotico & Fresco',
    price: '4,99 €',
    liquidTopColor: '#63B3ED',
    liquidBottomColor: '#2B6CB0',
    creamColor: '#EBF8FF',
    bobaColor: '#285E61',
    bobaSecondaryColor: '#90CDF4',
    accentHex: '#3182CE',
    calories: '185 kcal',
    description: 'Tè nero aromatizzato al tropical blue, perle al kiwi e perle blu tropical che scoppiano sul palato con freschezza oceanica.',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/45c61f24aeeba1b69a9995c457dcba9f1c7df9ee199cee8944919217ea65a19d?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: 'https://glovoapp.com/it/it/palermo/stores/teaamo-bubble-tea-pmo/#sublist-bubble-tea-s.5927622312',
  },
];

export const BOBA_BASES: BobaIngredient[] = [
  {
    id: 'milk-tea',
    name: 'Classic Milk Tea Cremoso',
    subtitle: 'Vellutato, dolce e avvolgente con latte fresco',
    color: '#FDE4EA',
    priceDelta: 0,
    tag: 'Più Scelto',
  },
  {
    id: 'black-tea',
    name: 'Tè Nero Premium',
    subtitle: 'Infuso aromatico e corposo secondo tradizione',
    color: '#975A16',
    priceDelta: 0,
    tag: 'Classico',
  },
  {
    id: 'green-tea',
    name: 'Tè Verde Gelsomino',
    subtitle: 'Floreale, profumato e dissetante',
    color: '#48BB78',
    priceDelta: 0,
  },
  {
    id: 'coconut-milk',
    name: 'Latte di Cocco Tropico',
    subtitle: 'Morbido, esotico e naturalmente privo di lattosio',
    color: '#EDF2F7',
    priceDelta: 0.3,
    tag: 'Vegan Friendly',
  },
];

export const BOBA_FLAVORS: BobaIngredient[] = [
  {
    id: 'strawberry',
    name: 'Fragola & Cocco',
    subtitle: 'Il profilo rosa iconico di TeaAmo',
    color: '#FF7EB3',
    secondaryColor: '#E11D48',
    priceDelta: 0.4,
    tag: 'Icona Rosa',
  },
  {
    id: 'taro',
    name: 'Taro Viola Asiatico',
    subtitle: 'Note di vaniglia e biscottatura naturale',
    color: '#C084FC',
    secondaryColor: '#6D28D9',
    priceDelta: 0.4,
    tag: 'Best Seller',
  },
  {
    id: 'mela-verde',
    name: 'Mela Verde (Bulbasaur)',
    subtitle: 'Fresco, fruttato e leggermente acidulo',
    color: '#68D391',
    secondaryColor: '#276749',
    priceDelta: 0.3,
    tag: 'Pokémon',
  },
  {
    id: 'mango-tropical',
    name: 'Mango & Ananas',
    subtitle: 'Gusto tropicale ricco e solare',
    color: '#F6E05E',
    secondaryColor: '#DD6B20',
    priceDelta: 0.4,
  },
  {
    id: 'blue-tropical',
    name: 'Blu Tropical Curacao',
    subtitle: 'Cromia blu oceano brillante ed esotica',
    color: '#63B3ED',
    secondaryColor: '#2B6CB0',
    priceDelta: 0.4,
  },
  {
    id: 'caramello',
    name: 'Black Caramel',
    subtitle: 'Caramello tostato e zucchero di canna',
    color: '#D69E2E',
    secondaryColor: '#744210',
    priceDelta: 0.4,
  },
];

export const BOBA_TOPPINGS: BobaIngredient[] = [
  {
    id: 'tapioca-nera',
    name: 'Perle di Tapioca Calda',
    subtitle: 'Morbide e gommose al caramello bruno, fatte in sede',
    color: '#271206',
    priceDelta: 0,
    tag: 'Incluso',
  },
  {
    id: 'popping-fragola',
    name: 'Popping Boba Fragola',
    subtitle: 'Sfere traslucide che esplodono al morso',
    color: '#E11D48',
    priceDelta: 0.5,
    tag: 'Esplosive',
  },
  {
    id: 'popping-mela-verde',
    name: 'Popping Boba Mela Verde',
    subtitle: 'Gusto croccante e succoso',
    color: '#48BB78',
    priceDelta: 0.5,
  },
  {
    id: 'popping-mango',
    name: 'Popping Boba Mango',
    subtitle: 'Guscio sottile e cuore tropicale',
    color: '#ECC94B',
    priceDelta: 0.5,
  },
  {
    id: 'popping-kiwi',
    name: 'Popping Boba Kiwi',
    subtitle: 'Equilibrio perfetto tra dolce e acidulo',
    color: '#38A169',
    priceDelta: 0.5,
  },
  {
    id: 'pink-cream',
    name: 'Nuvola di Panna Rosa TeaAmo',
    subtitle: 'Con cuoricino 3D decorativo come nel logo',
    color: '#FF85A2',
    priceDelta: 0.7,
    tag: 'Must Try',
  },
];

export const MENU_ITEMS: MenuItem[] = [
  // SPACEPOLLY & SMASHBURGER (PRODOTTI VERIFICATI GLOVO STORE 448442)
  {
    id: 'sp-giove',
    name: 'Giove • SpacePolly SmashBurger',
    category: 'spacepolly',
    price: 11.9,
    badge: 'Icona Notte Glovo',
    isNightSpecial: true,
    description: 'Il burger più amato di TeaAmo su Glovo: SpacePolly bun, doppio smash burger artigianale, cheddar filante, bacon croccante, cipolla crispy e salsa algerienne.',
    ingredients: ['SpacePolly Bun', 'Doppio Smash Burger', 'Cheddar & Bacon', 'Cipolla Croccante', 'Salsa Algerienne'],
    dietary: ['nut-free'],
    allergens: ['Glutine', 'Lattosio'],
    colorAccent: '#E11D48',
    imageUrl: '/teaamo-palermo/images/burgers/giove.jpg',
    glovoUrl: GLOVO_STORE_SECTIONS.spacepolly,
  },
  {
    id: 'sp-plutone',
    name: 'Plutone • SpacePolly Double',
    category: 'spacepolly',
    price: 11.9,
    badge: 'Doppio Smash',
    isNightSpecial: true,
    description: 'Doppio smash burger cotto su piastra rovente, cetriolini a fette, lattuga croccante, senape e ketchup in perfetto stile americano.',
    ingredients: ['SpacePolly Bun', 'Doppio Smash Burger', 'Cetriolini Sottaceto', 'Lattuga Fresca', 'Senape & Ketchup'],
    dietary: ['nut-free'],
    allergens: ['Glutine', 'Senape'],
    colorAccent: '#7C3AED',
    imageUrl: '/teaamo-palermo/images/burgers/plutone.jpg',
    glovoUrl: GLOVO_STORE_SECTIONS.spacepolly,
  },
  {
    id: 'sp-marte',
    name: 'Marte • SpacePolly BBQ',
    category: 'spacepolly',
    price: 9.9,
    badge: 'Cipolla Caramellata',
    isNightSpecial: true,
    description: 'SpacePolly con burger saporito, cipolla caramellata in salsa barbecue affumicata e lattuga tenera.',
    ingredients: ['SpacePolly Bun', 'Smash Burger', 'Cipolla Caramellata', 'Salsa BBQ', 'Lattuga'],
    dietary: ['nut-free'],
    allergens: ['Glutine'],
    colorAccent: '#DD6B20',
    imageUrl: '/teaamo-palermo/images/burgers/marte.jpg',
    glovoUrl: GLOVO_STORE_SECTIONS.spacepolly,
  },
  {
    id: 'sp-mercurio',
    name: 'Mercurio • SpacePolly Bacon & Cheese',
    category: 'spacepolly',
    price: 9.9,
    badge: 'Bacon & Cheddar',
    isNightSpecial: true,
    description: 'SpacePolly burger con lattuga fresca, formaggio cheddar fuso, bacon dorato e salsa burger speciale.',
    ingredients: ['SpacePolly Bun', 'Burger Selezionato', 'Cheddar Fuso', 'Bacon Dorato', 'Salsa Burger'],
    dietary: ['nut-free'],
    allergens: ['Glutine', 'Lattosio'],
    colorAccent: '#D69E2E',
    imageUrl: 'https://glovo.dhmedia.io/image/global-menu-service/GV_IT/vendor/448442/product/e2038f52-a3b4-4347-bda5-d0fd852c04d0.jpg?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.spacepolly,
  },
  {
    id: 'sp-urano',
    name: 'Urano • SpacePolly Chicken Crispy',
    category: 'spacepolly',
    price: 9.9,
    badge: 'Pollo Croccante',
    isNightSpecial: true,
    description: 'SpacePolly burger di pollo dorato e croccante, lattuga, pomodoro fresco e salsa burger artigianale.',
    ingredients: ['Burger di Pollo', 'Lattuga', 'Pomodoro Fresco', 'Salsa Burger Speciale'],
    dietary: ['nut-free'],
    allergens: ['Glutine', 'Uova'],
    colorAccent: '#38A169',
    imageUrl: 'https://glovo.dhmedia.io/image/global-menu-service/GV_IT/vendor/448442/product/56ec0782-18a6-4bb7-be70-20b175f392db.jpg?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.spacepolly,
  },
  {
    id: 'sp-luna',
    name: 'Luna • SpacePolly Classic',
    category: 'spacepolly',
    price: 8.9,
    badge: 'Classico Leggero',
    isNightSpecial: true,
    description: 'SpacePolly burger con lattuga fresca, pomodoro e maionese delicata.',
    ingredients: ['Burger Selezionato', 'Lattuga', 'Pomodoro', 'Maionese'],
    dietary: ['nut-free'],
    allergens: ['Glutine', 'Uova'],
    colorAccent: '#4A5568',
    imageUrl: 'https://glovo.dhmedia.io/image/global-menu-service/GV_IT/vendor/448442/product/ab76c044-b0a8-4109-93ff-91f233c7386a.jpg?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.spacepolly,
  },

  // SWEET: BUBBLE WAFFLE, CREPES, PANCAKES (FOTO REALI GLOVO)
  {
    id: 'sw-bubblewaffle-gelato',
    name: 'BubbleWaffle Gelato Artigianale',
    category: 'sweet',
    price: 10.9,
    promoPrice: 9.81,
    badge: '-10% Glovo Promo',
    description: 'Cialda BubbleWaffle ad alveare calda e fragrante, farcita con il nostro gelato artigianale di produzione propria in tantissimi gusti.',
    ingredients: ['Cialda Calda ad Alveare', 'Gelato Artigianale TeaAmo', 'Topping & Wafer'],
    allergens: ['Glutine', 'Lattosio', 'Uova'],
    colorAccent: '#B7791F',
    imageUrl: 'https://glovo.dhmedia.io/image/global-menu-service/GV_IT/vendor/448442/product/40f7a602-b838-4f17-aa40-cd19bb1dcf92.jpg?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetGelato,
  },
  {
    id: 'sw-crepes-pandistelle',
    name: 'Crêpes Pan Di Stelle Magica',
    category: 'sweet',
    price: 7.9,
    badge: 'Best Seller Sweet',
    description: 'Crêpes o pancake con impasto al cacao, cioccolato bianco Galak, ricca crema Pan di Stelle e il magico biscotto stellato sopra.',
    ingredients: ['Impasto al Cacao', 'Cioccolato Galak', 'Crema Pan di Stelle', 'Biscotto Magico'],
    allergens: ['Glutine', 'Lattosio', 'Frutta a guscio (nocciola)', 'Uova'],
    colorAccent: '#744210',
    imageUrl: 'https://glovo.dhmedia.io/image/global-menu-service/GV_IT/vendor/448442/PRODUCT/3c81ea2b-a421-4a21-b629-a7fa4d325482.jpg?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetSpecial,
  },
  {
    id: 'sw-crepes-gelato',
    name: 'Crêpes Gelato Artigianale',
    category: 'sweet',
    price: 9.9,
    promoPrice: 8.91,
    badge: '-10% Promo',
    description: 'Crêpe dorata preparata al momento con farcitura di gelato artigianale fresco TeaAmo e colata di cioccolato.',
    ingredients: ['Crêpe Soffice', 'Gelato Artigianale', 'Colata di Cioccolato'],
    allergens: ['Glutine', 'Lattosio', 'Uova'],
    colorAccent: '#E53E3E',
    imageUrl: 'https://glovo.dhmedia.io/image/global-menu-service/GV_IT/vendor/448442/product/4e973bee-3b48-4ecc-aaf0-f2ac810c66bd.jpg?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetGelato,
  },
  {
    id: 'sw-pancake-gelato',
    name: 'Pancake Gelato Artigianale',
    category: 'sweet',
    price: 9.9,
    badge: 'Torre Golosa',
    description: 'Pancake caldi e soffici cotti su piastra rovente, guarniti con palline di gelato artigianale e sciroppo.',
    ingredients: ['Pancake Caldi', 'Gelato Artigianale', 'Creme & Granelle'],
    allergens: ['Glutine', 'Lattosio', 'Uova'],
    colorAccent: '#D69E2E',
    imageUrl: 'https://glovo.dhmedia.io/image/global-menu-service/GV_IT/vendor/448442/product/577107e2-706a-4cfb-bcd4-49b5eded2c89.jpg?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetGelato,
  },
  {
    id: 'sw-fiesta-ferrero',
    name: 'Waffle / Crêpe Fiesta Ferrero',
    category: 'sweet',
    price: 7.9,
    badge: 'Esclusiva',
    description: 'Farcitura golosa con Nutella, granella di arachidi tostate e morbida merendina Fiesta Ferrero all\'arancia.',
    ingredients: ['Nutella', 'Granella di Arachidi', 'Fiesta Ferrero'],
    allergens: ['Arachidi', 'Lattosio', 'Glutine', 'Uova'],
    colorAccent: '#DD6B20',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/15afc019fd961c8a3104a13ca0d3957571d639da6a3bb74195ba90503488234c?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetSpecial,
  },
  {
    id: 'sw-kitkat-bianco',
    name: 'Waffle / Crêpe KitKat Bianco',
    category: 'sweet',
    price: 7.9,
    badge: 'White Choco',
    description: 'Nutella bianca vellutata, Nutella classica, riso soffiato al cioccolato bianco e barretta White KitKat croccante.',
    ingredients: ['Nutella Bianca', 'Nutella', 'Riso Cioco Bianco', 'KitKat White'],
    allergens: ['Glutine', 'Lattosio', 'Soia'],
    colorAccent: '#D69E2E',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/4692122fb45fefbb1dcb7f1ca596cd9a4160586a9e31dbbe943d9e5588190d0f?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetSpecial,
  },
  {
    id: 'sw-pistacchioso',
    name: 'Pistacchioso Special',
    category: 'sweet',
    price: 5.9,
    badge: 'Pistacchio Puro',
    description: 'Crocco pistacchio siciliano, doppio cioccolato al latte, pistacchio pralinato e riso soffiato bianco.',
    ingredients: ['Crema Pistacchio', 'Cioccolato al Latte', 'Pistacchio Pralinato', 'Riso Soffiato'],
    allergens: ['Frutta a guscio (pistacchio)', 'Lattosio', 'Glutine'],
    colorAccent: '#38A169',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/bc6e851b549abea4205ba26439e232db528d53a3e637e0269c9697bd991af186?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetSpecial,
  },

  // BUBBLE TEA & FRUIT DRINKS (FOTO REALI GLOVO)
  {
    id: 'bt-taro',
    name: 'Milk Tea Taro Autentico',
    category: 'bubble-tea',
    price: 5.4,
    badge: 'Best Seller',
    description: 'Il Taro Milk Tea autentico di TeaAmo Palermo: bevanda cremosa a base di latte e taro viola con perle di tapioca morbide.',
    ingredients: ['Latte Cremoso', 'Taro Viola Naturale', 'Tapioca Cotta'],
    dietary: ['gluten-free', 'nut-free'],
    allergens: ['Lattosio (disponibile con latte vegetale/soia)'],
    colorAccent: '#805AD5',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/7b912de34bace8afcafe9cb36d0adabc2dfb40bbe095d0faef35d58b7bc8170b?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.bubbleTea,
    cupConfig: {
      liquidTop: '#C084FC',
      liquidBottom: '#6D28D9',
      boba: '#3B0764',
      cream: '#F3E8FF',
    },
  },
  {
    id: 'bt-bulbasaur',
    name: 'Bulbasaur PokéEdition',
    category: 'bubble-tea',
    price: 5.3,
    badge: 'Ed. Pokémon',
    description: 'Tè verde al gelsomino, mela verde limpida e popping boba alla frutta che scoppiano in bocca.',
    ingredients: ['Tè Verde Gelsomino', 'Sciroppo Mela Verde Naturale', 'Popping Boba Frutta'],
    dietary: ['vegan', 'lactose-free', 'gluten-free', 'nut-free'],
    allergens: ['Nessuno (100% vegetale, senza glutine, senza lattosio)'],
    colorAccent: '#38A169',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/8750b581ce4e3f43d5c8804b10202cc978c44304aa600365aa1a248764572d3b?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.pokemon,
    cupConfig: {
      liquidTop: '#68D391',
      liquidBottom: '#276749',
      boba: '#22543D',
      cream: '#E6FFFA',
    },
  },
  {
    id: 'bt-strawberry-coconut',
    name: 'Strawberry Coconut',
    category: 'bubble-tea',
    price: 5.4,
    badge: 'Signature',
    description: 'Latte di cocco vellutato, fragola e sfere popping alla fragola rinfrescanti.',
    ingredients: ['Latte di Cocco', 'Purea di Fragola', 'Perle Popping Fragola'],
    dietary: ['lactose-free', 'gluten-free', 'nut-free'],
    allergens: ['Nessun lattosio animale (base latte di cocco vegetale)'],
    colorAccent: '#E53E3E',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/e9c3c07763a7321f477ada617da2f41c73a0f44067a8642227467c1d6c9d6115?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.bubbleTea,
    cupConfig: {
      liquidTop: '#FF7EB3',
      liquidBottom: '#E11D48',
      boba: '#9F1239',
      cream: '#FF85A2',
    },
  },
  {
    id: 'bt-classic-milk',
    name: 'Classic Milk Tea',
    category: 'bubble-tea',
    price: 4.8,
    badge: 'Tradizionale',
    description: 'Tè nero ricco taiwanese, latte corposo e perle di tapioca nera al caramello bruno.',
    ingredients: ['Tè Nero Oolong/Assam', 'Latte', 'Tapioca Morbida di Manioca'],
    dietary: ['gluten-free', 'nut-free'],
    allergens: ['Lattosio (disponibile con latte vegetale/soia)'],
    colorAccent: '#B7791F',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/d8b5d4ee3e68985ccd688e9e8889629eea488da2bcf7ab9ccf512b380b4a8078?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.bubbleTea,
    cupConfig: {
      liquidTop: '#F6E05E',
      liquidBottom: '#975A16',
      boba: '#271206',
      cream: '#FEFCBF',
    },
  },
  {
    id: 'bt-blu-tropical',
    name: 'Blu Tropical & Kiwi',
    category: 'bubble-tea',
    price: 4.99,
    badge: 'Dissetante',
    description: 'Tè nero aromatizzato al blu tropical con perle di kiwi e perle blu tropical che scoppiano in bocca.',
    ingredients: ['Tè Nero', 'Sciroppo Blu Tropical', 'Perle Kiwi', 'Perle Blu'],
    dietary: ['vegan', 'lactose-free', 'gluten-free', 'nut-free'],
    allergens: ['Nessuno (100% vegetale, senza glutine, senza lattosio)'],
    colorAccent: '#3182CE',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/45c61f24aeeba1b69a9995c457dcba9f1c7df9ee199cee8944919217ea65a19d?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.bubbleTea,
    cupConfig: {
      liquidTop: '#63B3ED',
      liquidBottom: '#2B6CB0',
      boba: '#285E61',
      cream: '#EBF8FF',
    },
  },
  {
    id: 'bt-red-passion',
    name: 'Red Passion & Ciliegia',
    category: 'bubble-tea',
    price: 5.4,
    badge: 'Frutta Fresca',
    description: 'Tè al limone dissetante con popping boba alla ciliegia.',
    ingredients: ['Tè al Limone', 'Popping Ciliegia', 'Ghiaccio'],
    dietary: ['vegan', 'lactose-free', 'gluten-free', 'nut-free'],
    allergens: ['Nessuno (100% vegetale, senza glutine, senza lattosio)'],
    colorAccent: '#C53030',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/8a9333b726520b526dbbc5703c749b4fa48076b05276fdc1f445d78b8b4f08d3?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.bubbleTea,
    cupConfig: {
      liquidTop: '#FEB2B2',
      liquidBottom: '#9B2C2C',
      boba: '#742A2A',
      cream: '#FFF5F5',
    },
  },

  // FROZEN YOGURT, GELATO & FRAPPÈ (FOTO REALI GLOVO)
  {
    id: 'fr-yogurt-maxi',
    name: 'Yogurt Fresco e Fiordilatte Maxi',
    category: 'frozen',
    price: 5.5,
    badge: 'Maxi Coppetta',
    description: 'Gelato allo yogurt mantecato o fiordilatte preparato al momento in coppetta (senza cialda), arricchito con creme e frutta.',
    ingredients: ['Yogurt Mantecato', 'Fiordilatte', 'Creme & Granelle a Scelta'],
    dietary: ['gluten-free'],
    allergens: ['Lattosio (latte fresco e yogurt)'],
    colorAccent: '#D53F8C',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/9236638ed56e74cfb07cce3c878d95868b81a7bd88256ec9a283ff9d20c03b54?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.frozen,
  },
  {
    id: 'fr-gelato-artigianale',
    name: 'Coppetta Gelato Artigianale',
    category: 'frozen',
    price: 3.9,
    badge: 'Produzione Propria',
    description: 'Il gelato artigianale preparato ogni giorno a mano con ingredienti freschi e naturali nel laboratorio TeaAmo di Viale Strasburgo.',
    ingredients: ['Ingredienti Naturali', 'Produzione Quotidiana', 'Gusti di Stagione'],
    dietary: ['gluten-free'],
    allergens: ['Lattosio (gusti crema); gusti frutta 100% Vegan & Dairy-Free'],
    colorAccent: '#319795',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/044ec884bb807cb12ee8c1ca7e6140df3f8ea2f18eb0e6ccc6a37fb34945c310?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.gelato,
  },
  {
    id: 'fr-shakeamo',
    name: 'SHAKEAMO Frappè Denso',
    category: 'frozen',
    price: 4.5,
    badge: 'Cremoso & Freddo',
    description: 'Frappè artigianale preparato con gelato yogurt o fiordilatte e creme golose. Denso, cremoso e freddo.',
    ingredients: ['Gelato Mantecato', 'Latte', 'Creme Speciali'],
    dietary: ['gluten-free'],
    allergens: ['Lattosio'],
    colorAccent: '#805AD5',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/58231dc0abfdd564551639d543dbcad45a05de8297339344521ece82f37abbf7?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6MzIwLCJoZWlnaHQiOjMyMH19XQ==',
    glovoUrl: GLOVO_STORE_SECTIONS.frozen,
  },
];

export const INSTAGRAM_MOMENTS = [
  {
    id: 'ig-1',
    title: 'SpacePolly Giove & Bubble Tea',
    tag: '@TEAAMO_BUBBLETEA',
    description: 'Il binomio serale preferito a Palermo: smash burger caldo con cipolla croccante e Bubble Tea Taro ghiacciato fino alle 03:30.',
    subtitle: 'Viale Strasburgo 378 • Night Shift',
    imageUrl: '/teaamo-palermo/images/burgers/giove.jpg',
  },
  {
    id: 'ig-2',
    title: 'BubbleWaffle & Crepes Pan di Stelle',
    tag: 'SWEET CORNER',
    description: 'La cialda ad alveare cotta al momento e le crêpes con impasto al cacao e biscotto stellato.',
    subtitle: 'Produzione Artigianale Quotidiana',
    imageUrl: '/teaamo-palermo/videos/tiktok_7688302222492372256_cover.jpg',
  },
  {
    id: 'ig-3',
    title: 'Edizioni Speciali Pokémon',
    tag: 'COMMUNITY PALERMO',
    description: 'Le limited edition ispirate al mondo Pokémon con cup collezionabili e perle scoppiettanti.',
    subtitle: 'Palermo • Tè Verde & Frutta',
    imageUrl: 'https://glovo.dhmedia.io/image/menus-glovo/products/8750b581ce4e3f43d5c8804b10202cc978c44304aa600365aa1a248764572d3b?t=W3sicmVzaXplIjp7Im1vZGUiOiJmaXQiLCJ3aWR0aCI6NjQwLCJoZWlnaHQiOjY0MH19XQ==',
  },
];

export const GOOGLE_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Chiara R.',
    badge: 'Recensione Verificata Google',
    rating: 5,
    text: 'Il miglior Bubble Tea di Palermo! La tapioca è sempre cotta benissimo e calda al punto giusto. Adoro anche i waffle enormi con il Kinder Bueno.',
    favoriteOrder: 'Taro Milk Tea + BubbleWaffle Bueno',
  },
  {
    id: 'rev-2',
    author: 'Marco T.',
    badge: 'Local Guide Google',
    rating: 5,
    text: 'Aperto fino alle 3 e mezza di notte in Viale Strasburgo! Lo SpacePolly Giove con le salse speciali è una salvezza nelle notti palermitane.',
    favoriteOrder: 'SpacePolly Giove & Bulbasaur Tea',
  },
  {
    id: 'rev-3',
    author: 'Federica M.',
    badge: 'Cliente Abituale',
    rating: 5,
    text: 'Personale gentilissimo e locale curato nei dettagli. I topping scoppiettanti alla fragola e mango sono favolosi. Consigliatissimo!',
    favoriteOrder: 'Strawberry Coconut Love & Crepes',
  },
];

export interface TikTokVideo {
  id: string;
  tiktokId: string;
  tiktokUrl: string;
  videoUrl: string;
  coverUrl: string;
  title: string;
  views: string;
  likes: string;
  music: string;
  tag: string;
  badge?: string;
}

const BASE = import.meta.env.BASE_URL || '/';

export const TIKTOK_VIDEOS: TikTokVideo[] = [
  {
    id: 'tt-7688302222492372256',
    tiktokId: '7688302222492372256',
    tiktokUrl: 'https://www.tiktok.com/@teaamobubbletea/video/7688302222492372256',
    videoUrl: `${BASE}videos/tiktok_7688302222492372256.mp4`,
    coverUrl: `${BASE}videos/tiktok_7688302222492372256_cover.jpg`,
    title: 'La torta di compleanno più assurda di sempre: maxi pancake con 4 creme e Happy Hippo personalizzabile a Palermo!',
    views: '7.327',
    likes: '242',
    music: 'WHITE GIRL WASTED',
    tag: 'MAXI PANCAKE',
    badge: 'NOVITÀ',
  },
  {
    id: 'tt-7684225725745958177',
    tiktokId: '7684225725745958177',
    tiktokUrl: 'https://www.tiktok.com/@teaamobubbletea/video/7684225725745958177',
    videoUrl: `${BASE}videos/tiktok_7684225725745958177.mp4`,
    coverUrl: `${BASE}videos/tiktok_7684225725745958177_cover.jpg`,
    title: 'Promo studenti Back to School: menu completo con Space Polly, patatine, nuggets e bibita!',
    views: '10.920',
    likes: '555',
    music: 'MUCHACHA',
    tag: 'STUDENT PROMO',
    badge: 'SUPER TREND',
  },
  {
    id: 'tt-7681261514111651105',
    tiktokId: '7681261514111651105',
    tiktokUrl: 'https://www.tiktok.com/@teaamobubbletea/video/7681261514111651105',
    videoUrl: `${BASE}videos/tiktok_7681261514111651105.mp4`,
    coverUrl: `${BASE}videos/tiktok_7681261514111651105_cover.jpg`,
    title: 'Fine serata con gli amici a Palermo? Dolce o salato fino alle 3:30 di notte in Viale Strasburgo 378!',
    views: '7.874',
    likes: '194',
    music: 'MUCHACHA',
    tag: 'LATE NIGHT 03:30',
    badge: 'NOTTURNO',
  },
  {
    id: 'tt-7680516664990944545',
    tiktokId: '7680516664990944545',
    tiktokUrl: 'https://www.tiktok.com/@teaamobubbletea/video/7680516664990944545',
    videoUrl: `${BASE}videos/tiktok_7680516664990944545.mp4`,
    coverUrl: `${BASE}videos/tiktok_7680516664990944545_cover.jpg`,
    title: 'I veri Space Polly a Palermo stanno andando a ruba: il panino spaziale sigillato a 250°C!',
    views: '5.185',
    likes: '164',
    music: 'WHITE GIRL WASTED',
    tag: 'SPACE POLLY',
    badge: 'BEST SELLER',
  },
  {
    id: 'tt-7679032061675588897',
    tiktokId: '7679032061675588897',
    tiktokUrl: 'https://www.tiktok.com/@teaamobubbletea/video/7679032061675588897',
    videoUrl: `${BASE}videos/tiktok_7679032061675588897.mp4`,
    coverUrl: `${BASE}videos/tiktok_7679032061675588897_cover.jpg`,
    title: 'Tea Amo Truck per i tuoi eventi a Palermo: bubble waffle, torri di pancake, crepes e Space Polly!',
    views: '5.845',
    likes: '153',
    music: 'MUCHACHA',
    tag: 'TEA AMO TRUCK',
    badge: 'EVENTI & FESTE',
  },
  {
    id: 'tt-7678673969657974048',
    tiktokId: '7678673969657974048',
    tiktokUrl: 'https://www.tiktok.com/@teaamobubbletea/video/7678673969657974048',
    videoUrl: `${BASE}videos/tiktok_7678673969657974048.mp4`,
    coverUrl: `${BASE}videos/tiktok_7678673969657974048_cover.jpg`,
    title: 'Dove mangiare dolci a Mondello? Ci pensa il dottor Polly con bubble waffle, crepes e boba!',
    views: '21.237',
    likes: '636',
    music: 'Talk To You',
    tag: 'MONDELLO & PALERMO',
    badge: 'VIRALE',
  },
  {
    id: 'tt-7667189374613753120',
    tiktokId: '7667189374613753120',
    tiktokUrl: 'https://www.tiktok.com/@teaamobubbletea/video/7667189374613753120',
    videoUrl: `${BASE}videos/tiktok_7667189374613753120.mp4`,
    coverUrl: `${BASE}videos/tiktok_7667189374613753120_cover.jpg`,
    title: 'Siamo aperti fino alle 3:30 del mattino: boba tea freschi e Space Polly caldi nel cuore della notte!',
    views: '36.682',
    likes: '1.230',
    music: 'Suono Originale - teaamobubbletea',
    tag: 'OPEN 03:30 AM',
    badge: 'TOP PLAY',
  },
];
