/**
 * Wearable accessory art, matched to shop item ids. Each item is drawn in a
 * 100-unit box; `origin` is the point in that box that lands on the pet's
 * anchor (headwear touches at its brim, eyewear/neckwear at their center), and
 * `scale` fine-tunes size relative to the anchor width.
 *
 * Strokes are ~4 here because accessories render scaled down to roughly half —
 * that keeps their outlines visually equal to the pets' 2-unit strokes.
 */
import React from 'react';
import { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { INK } from './common';

export interface AccessoryArtDef {
  Art: React.FC;
  /** Point in the art box that lands exactly on the pet's anchor. */
  origin: { x: number; y: number };
  /** Rendered width relative to the anchor width (1 = exactly anchor.w). */
  scale?: number;
  /** Square viewBox that frames the art for shop previews. */
  preview: string;
}

function CapArt() {
  return (
    <>
      <Path d="M16 88 Q16 46 50 46 Q84 46 84 88 Z" fill="#D9534F" stroke={INK} strokeWidth={4} />
      <Path d="M50 46 L50 88 M30 52 Q28 70 28 88 M70 52 Q72 70 72 88" stroke="#B03A37" strokeWidth={2} fill="none" />
      <Circle cx={50} cy={46} r={4} fill="#B03A37" stroke={INK} strokeWidth={2} />
      <Path d="M12 88 Q50 78 88 88 Q50 102 12 88 Z" fill="#B03A37" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </>
  );
}

function BowArt() {
  return (
    <>
      <Path d="M46 64 Q18 44 14 66 Q12 84 42 76 Z" fill="#E86A92" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M54 64 Q82 44 86 66 Q88 84 58 76 Z" fill="#E86A92" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Circle cx={50} cy={70} r={10} fill="#D14E78" stroke={INK} strokeWidth={4} />
    </>
  );
}

function GradCapArt() {
  return (
    <>
      <Path d="M30 62 Q30 84 50 84 Q70 84 70 62 Z" fill="#3E3428" stroke={INK} strokeWidth={4} />
      <Path d="M50 38 L96 58 L50 78 L4 58 Z" fill="#4A3E30" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Circle cx={50} cy={58} r={3.5} fill="#E8B33C" />
      <Path d="M50 58 Q72 62 74 78" stroke="#E8B33C" strokeWidth={3} fill="none" />
      <Circle cx={74} cy={82} r={5} fill="#E8B33C" stroke={INK} strokeWidth={2.5} />
    </>
  );
}

function TopHatArt() {
  return (
    <>
      <Rect x={28} y={22} width={44} height={62} rx={6} fill="#31281F" stroke={INK} strokeWidth={4} />
      <Rect x={28} y={62} width={44} height={12} fill="#E8B33C" stroke={INK} strokeWidth={3} />
      <Ellipse cx={50} cy={86} rx={42} ry={8} fill="#31281F" stroke={INK} strokeWidth={4} />
    </>
  );
}

function CrownArt() {
  return (
    <>
      <Path
        d="M18 88 L14 52 L34 66 L50 42 L66 66 L86 52 L82 88 Z"
        fill="#E8B33C"
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Circle cx={50} cy={42} r={4.5} fill="#D9534F" stroke={INK} strokeWidth={2.5} />
      <Circle cx={14} cy={52} r={4} fill="#5FA0C4" stroke={INK} strokeWidth={2.5} />
      <Circle cx={86} cy={52} r={4} fill="#5FA0C4" stroke={INK} strokeWidth={2.5} />
      <Circle cx={32} cy={78} r={3.5} fill="#8E6FAE" />
      <Circle cx={68} cy={78} r={3.5} fill="#8E6FAE" />
    </>
  );
}

function GlassesArt() {
  return (
    <>
      <Path d="M16 48 L6 42 M84 48 L94 42" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <Circle cx={32} cy={50} r={16} fill="#FFFFFF" fillOpacity={0.35} stroke={INK} strokeWidth={4} />
      <Circle cx={68} cy={50} r={16} fill="#FFFFFF" fillOpacity={0.35} stroke={INK} strokeWidth={4} />
      <Path d="M48 50 Q50 44 52 50" stroke={INK} strokeWidth={4} fill="none" />
    </>
  );
}

function ShadesArt() {
  return (
    <>
      <Path d="M10 44 L90 44" stroke={INK} strokeWidth={4} />
      <Rect x={14} y={40} width={30} height={24} rx={9} fill="#31281F" stroke={INK} strokeWidth={3.5} />
      <Rect x={56} y={40} width={30} height={24} rx={9} fill="#31281F" stroke={INK} strokeWidth={3.5} />
      <Path d="M20 48 Q24 44 28 46" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.7} fill="none" strokeLinecap="round" />
      <Path d="M62 48 Q66 44 70 46" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.7} fill="none" strokeLinecap="round" />
    </>
  );
}

function ScarfArt() {
  return (
    <>
      <Path d="M58 58 L56 86 Q64 92 70 84 L68 57 Z" fill="#C64F3B" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <Path d="M59 86 L59 92 M63.5 87.5 L63.5 93 M68 85 L68 91" stroke="#E8B33C" strokeWidth={2.5} strokeLinecap="round" />
      <Rect x={12} y={38} width={76} height={22} rx={11} fill="#C64F3B" stroke={INK} strokeWidth={4} />
      <Path d="M28 40 L26 58 M44 40 L42 58 M60 40 L58 58 M76 40 L74 58" stroke="#E8B33C" strokeWidth={3.5} strokeLinecap="round" />
    </>
  );
}

function BellArt() {
  return (
    <>
      <Rect x={10} y={40} width={80} height={16} rx={8} fill="#8A5A3B" stroke={INK} strokeWidth={4} />
      <Circle cx={50} cy={63} r={11} fill="#E8B33C" stroke={INK} strokeWidth={3.5} />
      <Circle cx={50} cy={61} r={2} fill={INK} />
      <Path d="M50 63 L50 70" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </>
  );
}

function MedalArt() {
  return (
    <>
      <Path
        d="M34 30 L50 58 L66 30 L57 24 L50 38 L43 24 Z"
        fill="#C64F3B"
        stroke={INK}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      <Circle cx={50} cy={68} r={14} fill="#E8B33C" stroke={INK} strokeWidth={3.5} />
      <Path
        d="M50 60 L52.4 65 L58 65.6 L54 69.4 L55 75 L50 72.2 L45 75 L46 69.4 L42 65.6 L47.6 65 Z"
        fill="#C88A1F"
      />
    </>
  );
}

/** Keyed by shop item id (see src/config/shop.ts). Companions stay in the
 * backdrop scene as emoji, so they're not here. */
export const ACCESSORY_ART: Record<string, AccessoryArtDef> = {
  cap: { Art: CapArt, origin: { x: 50, y: 90 }, scale: 1.05, preview: '8 28 84 84' },
  bow: { Art: BowArt, origin: { x: 50, y: 80 }, scale: 0.8, preview: '10 24 80 80' },
  grad_cap: { Art: GradCapArt, origin: { x: 50, y: 82 }, scale: 1.15, preview: '0 10 100 100' },
  top_hat: { Art: TopHatArt, origin: { x: 50, y: 88 }, scale: 0.95, preview: '5 11 90 90' },
  crown: { Art: CrownArt, origin: { x: 50, y: 88 }, scale: 0.75, preview: '6 20 88 88' },
  glasses: { Art: GlassesArt, origin: { x: 50, y: 50 }, preview: '2 4 96 96' },
  shades: { Art: ShadesArt, origin: { x: 50, y: 50 }, preview: '2 4 96 96' },
  scarf: { Art: ScarfArt, origin: { x: 50, y: 49 }, scale: 1.1, preview: '6 18 88 88' },
  bell: { Art: BellArt, origin: { x: 50, y: 48 }, scale: 1.05, preview: '5 10 90 90' },
  medal: { Art: MedalArt, origin: { x: 50, y: 46 }, scale: 0.9, preview: '17 19 66 66' },
};
