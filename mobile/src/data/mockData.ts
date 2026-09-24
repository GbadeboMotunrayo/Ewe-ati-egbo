// Demo-mode data — the app renders entirely from this until Supabase env vars are set.
// Shapes mirror supabase/migrations + docs/data-model.md.

export type ProductClass = 'A' | 'B' | 'C' | 'D';
export type VerificationStatus = 'pending' | 'verified' | 'trusted' | 'suspended';
export type FulfilmentType = 'platform_cargo' | 'agent' | 'uk_direct';
export type ShipmentStatus =
  | 'created'
  | 'at_origin_hub'
  | 'in_transit'
  | 'customs'
  | 'at_uk_hub'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception';

export interface Seller {
  id: string;
  name: string;
  location: string; // "Lagos, NG" or "London, UK"
  verification: VerificationStatus;
  rating: number;
  orders: number;
  bio: string;
}

export interface Corridor {
  id: string;
  slug: string;
  label: string; // "Lagos → London"
  transitMinDays: number;
  transitMaxDays: number;
  pricePence: number; // indicative delivery price to customer
}

export interface Product {
  id: string;
  title: string;
  commonName: string; // "Bitter leaf"
  botanicalName: string; // "Vernonia amygdalina"
  vernacular: string[]; // ["Ewuro", "Onugbu", ...] — powers multilingual search
  productClass: ProductClass;
  category: string;
  tradition: string;
  form: string;
  netQuantity: string;
  pricePence: number;
  origin: string;
  sellerId: string;
  fulfilment: FulfilmentType;
  corridorId?: string; // for cross-border
  claimStatus: 'approved' | 'pending' | 'blocked';
  ingredientStatus: 'green' | 'amber' | 'red';
  description: string;
  directions: string;
  storage: string;
  warnings: string;
  rating: number;
  reviewCount: number;
  emoji: string; // fallback
  image: string; // product photography (Unsplash, validated)
}

const U = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

// Shared imagery used across app + hero (botanical, validated subjects).
export const IMAGES = {
  herbs: U('1596040033229-a9821ebd058d'),
  greens: U('1543362906-acfc16c67564'),
  broccoli: U('1615485290382-441e4d049cb5'),
  turmericTea: U('1622480916113-9000ac49b79d'),
  smoothie: U('1610970881699-44a5587cabec'),
  plant: U('1512428813834-c702c7702b78'),
  produce: U('1466637574441-749b8f19452f', 900),
  mango: U('1601493700631-2b16ec4b4716'),
};

export interface ShipmentLeg {
  status: ShipmentStatus;
  label: string;
  done: boolean;
}

export interface Order {
  id: string;
  ref: string;
  placedAt: string;
  totalPence: number;
  productTitle: string;
  sellerName: string;
  corridorLabel: string;
  fulfilment: FulfilmentType;
  legs: ShipmentLeg[];
}

export const sellers: Seller[] = [
  {
    id: 's1',
    name: 'Adom Botanicals',
    location: 'Lagos, NG',
    verification: 'trusted',
    rating: 4.8,
    orders: 1240,
    bio: 'Traditional West African botanicals, dried and packed at source.',
  },
  {
    id: 's2',
    name: 'Roots & Wellness',
    location: 'London, UK',
    verification: 'verified',
    rating: 4.6,
    orders: 312,
    bio: 'UK-based specialist in herbal powders and natural skincare.',
  },
  {
    id: 's3',
    name: 'Accra Naturals',
    location: 'Accra, GH',
    verification: 'verified',
    rating: 4.7,
    orders: 540,
    bio: 'Ghanaian producers of prekese, black soap and shea products.',
  },
];

export const corridors: Corridor[] = [
  { id: 'c1', slug: 'lagos-london', label: 'Lagos → London', transitMinDays: 5, transitMaxDays: 9, pricePence: 1200 },
  { id: 'c2', slug: 'accra-london', label: 'Accra → London', transitMinDays: 6, transitMaxDays: 10, pricePence: 1300 },
];

export const categories = ['Herbs', 'Teas', 'Botanicals', 'Supplements', 'Natural beauty', 'Oils', 'Roots & barks'];
export const traditions = ['West African', 'East African', 'Caribbean', 'South Asian', 'Middle Eastern', 'Chinese'];

export const products: Product[] = [
  {
    id: 'p1',
    title: 'Organic Dried Prekese',
    commonName: 'Prekese / Aidan Fruit',
    botanicalName: 'Tetrapleura tetraptera',
    vernacular: ['Prekese', 'Aidan', 'Aridan', 'Osakirisa'],
    productClass: 'A',
    category: 'Botanicals',
    tradition: 'West African',
    form: 'Whole dried fruit',
    netQuantity: '100 g',
    pricePence: 1299,
    origin: 'Ghana',
    sellerId: 's3',
    fulfilment: 'platform_cargo',
    corridorId: 'c2',
    claimStatus: 'approved',
    ingredientStatus: 'green',
    description:
      'Prekese is an aromatic fruit traditionally used in West African cuisine and botanical practices.',
    directions: 'Add to soups and broths for aroma. Rinse before use.',
    storage: 'Store in a cool, dry place.',
    warnings: 'For culinary/traditional use. Consult a professional if pregnant or on medication.',
    rating: 4.8,
    reviewCount: 127,
    emoji: '🫘',
    image: IMAGES.herbs,
  },
  {
    id: 'p2',
    title: 'Bitter Leaf (Dried)',
    commonName: 'Bitter leaf',
    botanicalName: 'Vernonia amygdalina',
    vernacular: ['Ewuro', 'Onugbu', 'Shiwaka', 'Etidot'],
    productClass: 'A',
    category: 'Herbs',
    tradition: 'West African',
    form: 'Dried, cut',
    netQuantity: '80 g',
    pricePence: 999,
    origin: 'Nigeria',
    sellerId: 's1',
    fulfilment: 'platform_cargo',
    corridorId: 'c1',
    claimStatus: 'approved',
    ingredientStatus: 'green',
    description: 'Dried bitter leaf, a staple of West African cooking (e.g. bitterleaf soup).',
    directions: 'Wash thoroughly to reduce bitterness before cooking.',
    storage: 'Store in an airtight container away from light.',
    warnings: 'For culinary/traditional use.',
    rating: 4.7,
    reviewCount: 89,
    emoji: '🌿',
    image: IMAGES.greens,
  },
  {
    id: 'p3',
    title: 'Moringa Leaf Powder',
    commonName: 'Moringa',
    botanicalName: 'Moringa oleifera',
    vernacular: ['Ewe igbale', 'Zogale', 'Drumstick tree'],
    productClass: 'B',
    category: 'Supplements',
    tradition: 'West African',
    form: 'Powder',
    netQuantity: '150 g',
    pricePence: 850,
    origin: 'Nigeria',
    sellerId: 's1',
    fulfilment: 'platform_cargo',
    corridorId: 'c1',
    claimStatus: 'approved',
    ingredientStatus: 'green',
    description: 'Finely milled moringa leaf powder. A nutrient-dense food supplement.',
    directions: 'Add 1 tsp to smoothies, water or food.',
    storage: 'Store in a cool, dry place, sealed.',
    warnings: 'Food supplement. Do not exceed recommended use. Not a substitute for a varied diet.',
    rating: 4.9,
    reviewCount: 204,
    emoji: '🍵',
    image: IMAGES.smoothie,
  },
  {
    id: 'p4',
    title: 'Raw African Black Soap',
    commonName: 'Black soap / Ose dudu',
    botanicalName: 'Plantain ash, cocoa pod, shea',
    vernacular: ['Ose dudu', 'Alata samina', 'Anago soap'],
    productClass: 'C',
    category: 'Natural beauty',
    tradition: 'West African',
    form: 'Solid bar',
    netQuantity: '200 g',
    pricePence: 699,
    origin: 'Ghana',
    sellerId: 's2',
    fulfilment: 'uk_direct',
    claimStatus: 'approved',
    ingredientStatus: 'green',
    description: 'Handmade raw black soap for cleansing skin and hair.',
    directions: 'Lather with water and rinse. Keep dry between uses.',
    storage: 'Keep in a dry dish; the bar softens if left wet.',
    warnings: 'Cosmetic use only. Patch-test first; avoid contact with eyes.',
    rating: 4.5,
    reviewCount: 61,
    emoji: '🧼',
    image: IMAGES.plant,
  },
];

export const orders: Order[] = [
  {
    id: 'o1',
    ref: 'EAE-10041',
    placedAt: '2026-09-12',
    totalPence: 2199, // 999 product + 1200 Lagos→London corridor (matches cart pricing)
    productTitle: 'Bitter Leaf (Dried)',
    sellerName: 'Adom Botanicals',
    corridorLabel: 'Lagos → London',
    fulfilment: 'platform_cargo',
    legs: [
      { status: 'at_origin_hub', label: 'At Lagos hub', done: true },
      { status: 'in_transit', label: 'In transit', done: true },
      { status: 'customs', label: 'UK customs clearance', done: false },
      { status: 'out_for_delivery', label: 'Out for delivery', done: false },
      { status: 'delivered', label: 'Delivered', done: false },
    ],
  },
  {
    id: 'o2',
    ref: 'EAE-10038',
    placedAt: '2026-09-05',
    totalPence: 1098, // 699 product + 399 UK direct delivery
    productTitle: 'Raw African Black Soap',
    sellerName: 'Roots & Wellness',
    corridorLabel: 'UK direct',
    fulfilment: 'uk_direct',
    legs: [
      { status: 'in_transit', label: 'Dispatched (Evri)', done: true },
      { status: 'delivered', label: 'Delivered', done: true },
    ],
  },
];

// helpers ------------------------------------------------------------------
export function sellerById(id: string): Seller | undefined {
  return sellers.find((s) => s.id === id);
}
export function corridorById(id?: string): Corridor | undefined {
  return corridors.find((c) => c.id === id);
}
export function productById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/** Multilingual search: matches title, common, botanical or any vernacular name. */
/** Accent/tone-insensitive text fold, so "ewúro" finds "Ewuro". */
function fold(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export interface ProductFilter {
  query?: string;
  category?: string;
  tradition?: string;
}

export function searchProducts(queryOrFilter: string | ProductFilter): Product[] {
  const f: ProductFilter = typeof queryOrFilter === 'string' ? { query: queryOrFilter } : queryOrFilter;
  const q = fold((f.query ?? '').trim());
  return products.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.tradition && p.tradition !== f.tradition) return false;
    if (!q) return true;
    return [p.title, p.commonName, p.botanicalName, ...p.vernacular].some((n) => fold(n).includes(q));
  });
}

// Delivery pricing ------------------------------------------------------------
export const UK_DIRECT = { label: 'UK direct (Evri/Royal Mail)', pricePence: 399, window: '2–4 days' } as const;

export interface DeliveryQuoteInfo {
  direct: boolean;
  label: string;
  window: string;
  pricePence: number;
  corridorId?: string;
}

/** A priced delivery option for a product — or undefined when it can't be delivered (never £0). */
export function quoteDelivery(product: Product): DeliveryQuoteInfo | undefined {
  if (product.fulfilment === 'uk_direct') {
    return { direct: true, label: UK_DIRECT.label, window: UK_DIRECT.window, pricePence: UK_DIRECT.pricePence };
  }
  const c = corridorById(product.corridorId);
  if (!c) return undefined;
  return { direct: false, label: c.label, window: `${c.transitMinDays}–${c.transitMaxDays} days`, pricePence: c.pricePence, corridorId: c.id };
}
