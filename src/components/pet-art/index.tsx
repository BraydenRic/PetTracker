/**
 * VectorPet — composes a species portrait with whatever is equipped, snapping
 * each accessory to the species' anchor points so outfits genuinely fit.
 */
import React from 'react';
import Svg, { Ellipse, G } from 'react-native-svg';

import type { SpeciesKey } from '@/config/game';
import type { Pet } from '@/lib/models';
import { ACCESSORY_ART } from './accessories';
import { coatFor, PET_ART, type PetAnchors } from './pets';

const SLOT_ANCHOR = {
  headwear: 'head',
  eyewear: 'eyes',
  neckwear: 'neck',
} as const satisfies Record<string, keyof PetAnchors>;

/** Draw order: neckwear tucks under the chin, headwear over it, eyewear on top. */
const WEAR_ORDER = ['neckwear', 'headwear', 'eyewear'] as const;

/**
 * Standalone accessory render for shop cards, so the preview is exactly the
 * art the pet will wear. Returns null when an item has no vector art
 * (companions, backdrops) — callers fall back to the emoji.
 */
export function AccessoryPreview({ itemId, size }: { itemId: string; size: number }) {
  const art = ACCESSORY_ART[itemId];
  if (!art) return null;
  return (
    <Svg width={size} height={size} viewBox={art.preview}>
      <art.Art />
    </Svg>
  );
}

export function VectorPet({
  species,
  coat,
  equipped,
  size,
}: {
  species: SpeciesKey;
  /** Coat (breed palette) id; falls back to the species' first coat. */
  coat?: string | null;
  equipped?: Pet['equipped'];
  size: number;
}) {
  const def = PET_ART[species];

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* soft ground shadow */}
      <Ellipse cx={50} cy={95.5} rx={24} ry={3.5} fill="#2B2118" opacity={0.08} />
      <def.Art c={coatFor(def, coat).c} />
      {WEAR_ORDER.map((slot) => {
        const itemId = equipped?.[slot];
        const art = itemId ? ACCESSORY_ART[itemId] : undefined;
        if (!art) return null;
        const anchor = def.anchors[SLOT_ANCHOR[slot]];
        const s = (anchor.w / 100) * (art.scale ?? 1);
        const tx = anchor.x - art.origin.x * s;
        const ty = anchor.y - art.origin.y * s;
        return (
          <G key={slot} transform={`translate(${tx} ${ty}) scale(${s})`}>
            <art.Art />
          </G>
        );
      })}
    </Svg>
  );
}
