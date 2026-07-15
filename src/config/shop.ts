/**
 * Shop catalog. Accessories layer emoji on the pet avatar; backdrops swap the
 * gradient scene behind it. Purchases are account-wide, equipping is per-pet.
 */

export type AccessorySlot = 'headwear' | 'eyewear' | 'neckwear' | 'companion';

export interface AccessoryItem {
  id: string;
  kind: 'accessory';
  slot: AccessorySlot;
  name: string;
  emoji: string;
  price: number;
}

export interface BackdropItem {
  id: string;
  kind: 'backdrop';
  name: string;
  /** Top → bottom gradient. */
  colors: [string, string];
  /** Decorative emoji scattered in the scene. */
  decor: string;
  price: number;
}

export type ShopItem = AccessoryItem | BackdropItem;

export const SHOP_ITEMS: ShopItem[] = [
  // Headwear
  { id: 'cap', kind: 'accessory', slot: 'headwear', name: 'Ball Cap', emoji: '🧢', price: 120 },
  { id: 'bow', kind: 'accessory', slot: 'headwear', name: 'Bow', emoji: '🎀', price: 160 },
  { id: 'grad_cap', kind: 'accessory', slot: 'headwear', name: 'Scholar Cap', emoji: '🎓', price: 220 },
  { id: 'top_hat', kind: 'accessory', slot: 'headwear', name: 'Top Hat', emoji: '🎩', price: 320 },
  { id: 'crown', kind: 'accessory', slot: 'headwear', name: 'Crown', emoji: '👑', price: 900 },

  // Eyewear
  { id: 'glasses', kind: 'accessory', slot: 'eyewear', name: 'Reading Glasses', emoji: '👓', price: 100 },
  { id: 'shades', kind: 'accessory', slot: 'eyewear', name: 'Cool Shades', emoji: '🕶️', price: 240 },

  // Neckwear
  { id: 'scarf', kind: 'accessory', slot: 'neckwear', name: 'Cozy Scarf', emoji: '🧣', price: 140 },
  { id: 'bell', kind: 'accessory', slot: 'neckwear', name: 'Jingle Bell', emoji: '🔔', price: 180 },
  { id: 'medal', kind: 'accessory', slot: 'neckwear', name: 'Good Pet Medal', emoji: '🏅', price: 350 },

  // Companions
  { id: 'bone', kind: 'accessory', slot: 'companion', name: 'Favorite Bone', emoji: '🦴', price: 70 },
  { id: 'ball', kind: 'accessory', slot: 'companion', name: 'Tennis Ball', emoji: '🎾', price: 90 },
  { id: 'teddy', kind: 'accessory', slot: 'companion', name: 'Teddy Friend', emoji: '🧸', price: 200 },
  { id: 'butterfly', kind: 'accessory', slot: 'companion', name: 'Butterfly Pal', emoji: '🦋', price: 260 },

  // Backdrops
  { id: 'bd_meadow', kind: 'backdrop', name: 'Spring Meadow', colors: ['#DDEEC8', '#9CC48E'], decor: '🌿', price: 400 },
  { id: 'bd_sunset', kind: 'backdrop', name: 'Golden Hour', colors: ['#FFD9A0', '#F58F5E'], decor: '🌅', price: 500 },
  { id: 'bd_ocean', kind: 'backdrop', name: 'Tide Pool', colors: ['#BEE6F2', '#6FB2D2'], decor: '🐚', price: 500 },
  { id: 'bd_blossom', kind: 'backdrop', name: 'Cherry Blossom', colors: ['#FDE2EC', '#F2A9C4'], decor: '🌸', price: 600 },
  { id: 'bd_night', kind: 'backdrop', name: 'Starry Night', colors: ['#4A4370', '#221C33'], decor: '✨', price: 700 },
];

export const shopItem = (id: string): ShopItem | undefined =>
  SHOP_ITEMS.find((i) => i.id === id);

export const ACCESSORY_SLOTS: { slot: AccessorySlot; label: string }[] = [
  { slot: 'headwear', label: 'Headwear' },
  { slot: 'eyewear', label: 'Eyewear' },
  { slot: 'neckwear', label: 'Neckwear' },
  { slot: 'companion', label: 'Companions' },
];

/** The default (free) scene every pet starts with. */
export const DEFAULT_BACKDROP: BackdropItem = {
  id: 'bd_default',
  kind: 'backdrop',
  name: 'Warm Den',
  colors: ['#F7EBD0', '#EAD9B5'],
  decor: '🐾',
  price: 0,
};
