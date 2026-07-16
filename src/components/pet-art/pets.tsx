/**
 * Hand-drawn vector pets. Every species is a front-facing portrait in a
 * 100×100 box, built from the shared style in common.tsx, and exports anchor
 * points (head top / eye line / neck) that accessories snap onto — that's
 * what makes a cap actually sit on a head instead of floating above it.
 *
 * Each species also ships coat palettes ("breeds"): the art reads its colors
 * from the coat's `c` map, so a chocolate lab is the golden retriever's shapes
 * with different paint. The FIRST coat is the default for legacy pets.
 */
import React from 'react';
import { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import type { SpeciesKey } from '@/config/game';
import { Cheeks, Eye, INK, Smile, SW } from './common';

export interface Anchor {
  x: number;
  y: number;
  /** Rendered accessory width in viewBox units at this anchor. */
  w: number;
}

export interface PetAnchors {
  /** Where headwear sits — y is the top line of the head. */
  head: Anchor;
  /** Eye line, sized so glasses lenses land on the eyes. */
  eyes: Anchor;
  /** Where neckwear wraps. */
  neck: Anchor;
}

/** A coat is a named palette; keys are whatever the species' art asks for. */
export interface CoatDef {
  id: string;
  label: string;
  c: Record<string, string>;
}

type ArtProps = { c: Record<string, string> };

export interface PetArtDef {
  Art: React.FC<ArtProps>;
  anchors: PetAnchors;
  coats: CoatDef[];
}

export const coatFor = (def: PetArtDef, coatId?: string | null): CoatDef =>
  def.coats.find((k) => k.id === coatId) ?? def.coats[0];

// ---------- Dog ----------

function DogArt({ c }: ArtProps) {
  return (
    <>
      <Ellipse cx={50} cy={84} rx={21} ry={14} fill={c.torso} stroke={INK} strokeWidth={SW} />
      <Ellipse cx={50} cy={88} rx={11} ry={8} fill={c.muzzle} />
      <Ellipse cx={41} cy={96} rx={6} ry={3.6} fill={c.torso} stroke={INK} strokeWidth={1.5} />
      <Ellipse cx={59} cy={96} rx={6} ry={3.6} fill={c.torso} stroke={INK} strokeWidth={1.5} />
      {/* floppy ears behind the head */}
      <Path d="M31 32 Q20 38 24 56 Q26 64 33 60 Q38 56 37 42 Z" fill={c.ear} stroke={INK} strokeWidth={SW} />
      <Path d="M69 32 Q80 38 76 56 Q74 64 67 60 Q62 56 63 42 Z" fill={c.ear} stroke={INK} strokeWidth={SW} />
      <Circle cx={50} cy={45} r={23} fill={c.head} stroke={INK} strokeWidth={SW} />
      <Ellipse cx={50} cy={55} rx={12.5} ry={9.5} fill={c.muzzle} />
      <Ellipse cx={50} cy={50.5} rx={4.2} ry={3.2} fill={INK} />
      <Path d="M50 53 L50 57" stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M44 58 Q50 62 56 58" stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Path d="M46.5 60.5 Q50 66 53.5 60.5 Z" fill="#E8827C" />
      <Eye cx={41} cy={41} />
      <Eye cx={59} cy={41} />
      <Cheeks y={48} gap={17} />
    </>
  );
}

const DOG_COATS: CoatDef[] = [
  { id: 'golden', label: 'Golden', c: { head: '#E5AC69', torso: '#DFA663', ear: '#B97F46', muzzle: '#F5E3C4' } },
  { id: 'chocolate', label: 'Chocolate', c: { head: '#9A6B44', torso: '#8F6240', ear: '#6E4A2C', muzzle: '#E2C49C' } },
  { id: 'midnight', label: 'Midnight', c: { head: '#6B625D', torso: '#635B56', ear: '#4A433F', muzzle: '#D8CCBD' } },
];

// ---------- Cat ----------

function CatArt({ c }: ArtProps) {
  return (
    <>
      <Ellipse cx={50} cy={85} rx={19} ry={13} fill={c.body} stroke={INK} strokeWidth={SW} />
      {/* tail flicked up beside the body */}
      <Path d="M68 84 Q84 82 82 68" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Path d="M68 84 Q84 82 82 68" stroke={c.body} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <Path d="M31 34 L27 13 L45 25 Z" fill={c.body} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <Path d="M69 34 L73 13 L55 25 Z" fill={c.body} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <Path d="M33 29 L31 18 L42 25 Z" fill="#EFB9B0" />
      <Path d="M67 29 L69 18 L58 25 Z" fill="#EFB9B0" />
      <Circle cx={50} cy={47} r={22} fill={c.head} stroke={INK} strokeWidth={SW} />
      {/* forehead stripes */}
      <Path d="M46 27 L46 32.5" stroke={c.stripe} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M50 26 L50 32" stroke={c.stripe} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M54 27 L54 32.5" stroke={c.stripe} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M47.5 51 L52.5 51 L50 54 Z" fill="#E58B80" />
      <Path d="M50 54 Q47 58 44 55.5" stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <Path d="M50 54 Q53 58 56 55.5" stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <Path d="M30 50 L20 48 M30 54 L21 55.5" stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M70 50 L80 48 M70 54 L79 55.5" stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      <Eye cx={42} cy={45} />
      <Eye cx={58} cy={45} />
      <Cheeks y={52} gap={15} />
    </>
  );
}

const CAT_COATS: CoatDef[] = [
  { id: 'gray_tabby', label: 'Gray Tabby', c: { head: '#C0B3A6', body: '#B4A79B', stripe: '#8F7F71' } },
  { id: 'ginger', label: 'Ginger', c: { head: '#E0A05C', body: '#D69551', stripe: '#B26E33' } },
  { id: 'tuxedo', label: 'Tuxedo', c: { head: '#4E4844', body: '#46403C', stripe: '#6E6660' } },
];

// ---------- Bird ----------

function BirdArt({ c }: ArtProps) {
  return (
    <>
      <Path d="M42 87 L36 99 M50 88 L50 100 M58 87 L64 99" stroke={c.tail} strokeWidth={4} strokeLinecap="round" />
      <Ellipse cx={50} cy={58} rx={26} ry={31} fill={c.body} stroke={INK} strokeWidth={SW} />
      <Ellipse cx={50} cy={70} rx={15} ry={16} fill={c.belly} />
      <Path d="M25 52 Q18 70 32 82 Q35 68 30 52 Z" fill={c.wing} stroke={INK} strokeWidth={1.6} />
      <Path d="M75 52 Q82 70 68 82 Q65 68 70 52 Z" fill={c.wing} stroke={INK} strokeWidth={1.6} />
      {/* crest feathers */}
      <Path d="M49 28 Q45 18 39 18 Q45 22 46 29 Z" fill="#E8933A" stroke={INK} strokeWidth={1.4} />
      <Path d="M52 27 Q54 16 60 15 Q55 21 55 28 Z" fill="#E8933A" stroke={INK} strokeWidth={1.4} />
      <Path d="M43 50 Q50 44 57 50 Q50 60 43 50 Z" fill="#E8933A" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <Eye cx={40} cy={44} />
      <Eye cx={60} cy={44} />
      <Cheeks y={51} gap={19} rx={4} ry={2.4} />
    </>
  );
}

const BIRD_COATS: CoatDef[] = [
  { id: 'meadow', label: 'Meadow', c: { body: '#7CB86B', wing: '#5FA254', belly: '#DDEBC4', tail: '#4F8F49' } },
  { id: 'sky', label: 'Sky', c: { body: '#6FA3C9', wing: '#517FA6', belly: '#D8E8F0', tail: '#46789E' } },
  { id: 'sunset', label: 'Sunset', c: { body: '#D96A55', wing: '#B34D3C', belly: '#F5D9C4', tail: '#A6462F' } },
];

// ---------- Rabbit ----------

function RabbitArt({ c }: ArtProps) {
  return (
    <>
      <Path d="M38 34 Q30 8 40 5 Q48 8 46 32 Z" fill={c.body} stroke={INK} strokeWidth={SW} />
      <Path d="M62 34 Q70 8 60 5 Q52 8 54 32 Z" fill={c.body} stroke={INK} strokeWidth={SW} />
      <Path d="M39.5 28 Q35 12 40 9.5 Q44 12 43 28 Z" fill={c.innerEar} />
      <Path d="M60.5 28 Q65 12 60 9.5 Q56 12 57 28 Z" fill={c.innerEar} />
      <Ellipse cx={50} cy={85} rx={19} ry={13} fill={c.body} stroke={INK} strokeWidth={SW} />
      <Circle cx={50} cy={49} r={21.5} fill={c.head} stroke={INK} strokeWidth={SW} />
      <Path d="M47.5 52 L52.5 52 L50 55 Z" fill="#E58B80" />
      {/* buck teeth */}
      <Rect x={46.5} y={56} width={3.5} height={4.5} rx={1} fill="#FFFFFF" stroke={INK} strokeWidth={1} />
      <Rect x={50} y={56} width={3.5} height={4.5} rx={1} fill="#FFFFFF" stroke={INK} strokeWidth={1} />
      <Eye cx={42} cy={47} />
      <Eye cx={58} cy={47} />
      <Cheeks y={53} gap={15} />
    </>
  );
}

const RABBIT_COATS: CoatDef[] = [
  { id: 'cream', label: 'Cream', c: { head: '#F2E6D5', body: '#EBDCC8', innerEar: '#F2C4BE' } },
  { id: 'smoke', label: 'Smoke', c: { head: '#D2CBC3', body: '#C9C2BA', innerEar: '#E8C9C4' } },
  { id: 'snow', label: 'Snow', c: { head: '#F7F3EA', body: '#F0EBE0', innerEar: '#F4CFC9' } },
];

// ---------- Hamster ----------

function HamsterArt({ c }: ArtProps) {
  return (
    <>
      <Circle cx={34} cy={30} r={7.5} fill={c.ear} stroke={INK} strokeWidth={SW} />
      <Circle cx={66} cy={30} r={7.5} fill={c.ear} stroke={INK} strokeWidth={SW} />
      <Circle cx={34} cy={30.5} r={4} fill="#F2C4BE" />
      <Circle cx={66} cy={30.5} r={4} fill="#F2C4BE" />
      <Ellipse cx={50} cy={58} rx={28} ry={30} fill={c.body} stroke={INK} strokeWidth={SW} />
      <Ellipse cx={50} cy={70} rx={17} ry={16} fill={c.belly} />
      {/* paws holding a sunflower seed */}
      <Ellipse cx={50} cy={77} rx={3} ry={4.2} fill="#8F6B3F" stroke={INK} strokeWidth={1} />
      <Ellipse cx={44} cy={78} rx={5} ry={3.6} fill={c.body} stroke={INK} strokeWidth={1.3} />
      <Ellipse cx={56} cy={78} rx={5} ry={3.6} fill={c.body} stroke={INK} strokeWidth={1.3} />
      <Path d="M47.5 50 L52.5 50 L50 53 Z" fill="#E58B80" />
      <Path d="M50 53 Q47 56.5 44.5 54.5" stroke={INK} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <Path d="M50 53 Q53 56.5 55.5 54.5" stroke={INK} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <Eye cx={41} cy={45} />
      <Eye cx={59} cy={45} />
      <Cheeks y={52} gap={17} rx={5.5} ry={3.4} />
    </>
  );
}

const HAMSTER_COATS: CoatDef[] = [
  { id: 'golden', label: 'Golden', c: { body: '#EAB268', ear: '#E3A75B', belly: '#F7E8CE' } },
  { id: 'cinnamon', label: 'Cinnamon', c: { body: '#D68E4E', ear: '#CB8547', belly: '#F2DCC0' } },
  { id: 'ash', label: 'Ash', c: { body: '#C9BFB2', ear: '#C0B5A7', belly: '#F0EAE0' } },
];

// ---------- Fish ----------

function FishArt({ c }: ArtProps) {
  return (
    <>
      <Circle cx={78} cy={22} r={3} fill="none" stroke="#7FB4CF" strokeWidth={1.4} />
      <Circle cx={84} cy={13} r={2} fill="none" stroke="#7FB4CF" strokeWidth={1.2} />
      {/* tail flicking out to the side */}
      <Path d="M70 60 Q90 68 88 84 Q76 80 68 70 Z" fill={c.fin} stroke={INK} strokeWidth={1.8} />
      <Path d="M25 56 Q12 60 14 70 Q24 68 29 62 Z" fill={c.finLight} stroke={INK} strokeWidth={1.6} />
      <Circle cx={50} cy={54} r={25} fill={c.body} stroke={INK} strokeWidth={SW} />
      <Path d="M28 62 Q50 78 72 62 Q66 78 50 79 Q34 78 28 62 Z" fill={c.belly} />
      {/* dorsal fin */}
      <Path d="M50 29 Q46 18 38 17 Q44 24 45.5 30 Z" fill={c.fin} stroke={INK} strokeWidth={1.6} />
      {/* scales hint */}
      <Path d="M36 39 Q40 43 44 39 M56 39 Q60 43 64 39" stroke={c.detail} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <Ellipse cx={50} cy={59} rx={4} ry={2.6} fill={c.detail} stroke={INK} strokeWidth={1.2} />
      <Eye cx={42} cy={49} />
      <Eye cx={58} cy={49} />
      <Cheeks y={55} gap={15} rx={4} ry={2.4} />
    </>
  );
}

const FISH_COATS: CoatDef[] = [
  { id: 'coral', label: 'Coral', c: { body: '#EF8354', fin: '#F0926B', finLight: '#F5AF8C', belly: '#F7C29F', detail: '#D96A4B' } },
  { id: 'lagoon', label: 'Lagoon', c: { body: '#5F9FC9', fin: '#6FA9CF', finLight: '#8FBDDB', belly: '#C4DEEE', detail: '#40749B' } },
  { id: 'goldfish', label: 'Goldfish', c: { body: '#E8B33C', fin: '#DFA32F', finLight: '#EFC468', belly: '#F7E3B0', detail: '#C08A1F' } },
];

// ---------- Turtle ----------

function TurtleArt({ c }: ArtProps) {
  return (
    <>
      <Ellipse cx={26} cy={84} rx={6} ry={4.5} fill={c.leg} stroke={INK} strokeWidth={1.5} />
      <Ellipse cx={74} cy={84} rx={6} ry={4.5} fill={c.leg} stroke={INK} strokeWidth={1.5} />
      <Circle cx={50} cy={34} r={15} fill={c.head} stroke={INK} strokeWidth={SW} />
      <Smile y={40} w={10} />
      <Eye cx={44.5} cy={32} r={2.7} />
      <Eye cx={55.5} cy={32} r={2.7} />
      <Cheeks y={37} gap={10} rx={3.2} ry={2} />
      {/* shell overlaps the neck */}
      <Path d="M24 78 Q24 46 50 46 Q76 46 76 78 Z" fill={c.shell} stroke={INK} strokeWidth={SW} />
      <Path d="M50 50 L50 74 M37 54 L43 72 M63 54 L57 72 M28 66 L72 66" stroke={c.pattern} strokeWidth={1.6} strokeLinecap="round" />
      <Ellipse cx={50} cy={78} rx={28} ry={6.5} fill={c.rim} stroke={INK} strokeWidth={1.8} />
    </>
  );
}

const TURTLE_COATS: CoatDef[] = [
  { id: 'classic', label: 'Classic', c: { head: '#9CC47B', leg: '#8FBC6E', shell: '#A9744F', rim: '#8F5F3E', pattern: '#7E5233' } },
  { id: 'olive', label: 'Olive', c: { head: '#A8B368', leg: '#9CA75E', shell: '#8A8250', rim: '#6F693F', pattern: '#5F5A36' } },
  { id: 'lagoon', label: 'Lagoon', c: { head: '#7FC2A8', leg: '#74B79D', shell: '#5E8E85', rim: '#4A756D', pattern: '#3E6159' } },
];

// ---------- Lizard ----------

function LizardArt({ c }: ArtProps) {
  return (
    <>
      {/* curled tail */}
      <Path d="M68 82 Q92 86 90 72 Q88 64 80 66" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d="M68 82 Q92 86 90 72 Q88 64 80 66" stroke={c.body} strokeWidth={4.2} fill="none" strokeLinecap="round" />
      <Ellipse cx={50} cy={80} rx={20} ry={13} fill={c.body} stroke={INK} strokeWidth={SW} />
      <Ellipse cx={50} cy={84} rx={11} ry={7} fill={c.belly} />
      <Ellipse cx={34} cy={91} rx={5.5} ry={3.2} fill={c.body} stroke={INK} strokeWidth={1.4} />
      <Ellipse cx={66} cy={91} rx={5.5} ry={3.2} fill={c.body} stroke={INK} strokeWidth={1.4} />
      {/* gecko eye bumps */}
      <Circle cx={38} cy={31} r={8} fill={c.body} stroke={INK} strokeWidth={SW} />
      <Circle cx={62} cy={31} r={8} fill={c.body} stroke={INK} strokeWidth={SW} />
      <Ellipse cx={50} cy={44} rx={23} ry={18} fill={c.head} stroke={INK} strokeWidth={SW} />
      <Circle cx={40} cy={53} r={2} fill={c.spot} />
      <Circle cx={60} cy={53} r={2} fill={c.spot} />
      <Circle cx={50} cy={58} r={1.6} fill={c.spot} />
      <Eye cx={38} cy={31} r={4} />
      <Eye cx={62} cy={31} r={4} />
      <Circle cx={46} cy={42} r={1} fill={INK} />
      <Circle cx={54} cy={42} r={1} fill={INK} />
      <Path d="M38 49 Q50 57 62 49" stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </>
  );
}

const LIZARD_COATS: CoatDef[] = [
  { id: 'leaf', label: 'Leaf', c: { head: '#84CA70', body: '#77C063', belly: '#CDE4A9', spot: '#5FA24E' } },
  { id: 'teal', label: 'Teal', c: { head: '#63B8A8', body: '#58AC9C', belly: '#C4E4DC', spot: '#3E8A7C' } },
  { id: 'ember', label: 'Ember', c: { head: '#E09455', body: '#D3894C', belly: '#F2D4B0', spot: '#B26833' } },
];

// ---------- Horse ----------

function HorseArt({ c }: ArtProps) {
  return (
    <>
      <Path d="M37 20 L33 6 L45 14 Z" fill={c.body} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M63 20 L67 6 L55 14 Z" fill={c.body} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      <Ellipse cx={50} cy={86} rx={20} ry={13} fill={c.body} stroke={INK} strokeWidth={SW} />
      {/* long face */}
      <Path
        d="M33 30 Q33 12 50 12 Q67 12 67 30 L64 52 Q62 66 50 66 Q38 66 36 52 Z"
        fill={c.head}
        stroke={INK}
        strokeWidth={SW}
      />
      {/* mane */}
      <Path d="M42 12 Q50 6 58 12 Q60 22 57 30 Q54 20 50 18 Q46 20 43 30 Q40 22 42 12 Z" fill={c.mane} stroke={INK} strokeWidth={1.5} />
      <Ellipse cx={50} cy={58} rx={12} ry={8.5} fill={c.muzzle} />
      <Circle cx={45.5} cy={58} r={1.6} fill={INK} />
      <Circle cx={54.5} cy={58} r={1.6} fill={INK} />
      <Path d="M45 62.5 Q50 65.5 55 62.5" stroke={INK} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Eye cx={41} cy={40} />
      <Eye cx={59} cy={40} />
      <Cheeks y={47} gap={16} rx={4} ry={2.4} />
    </>
  );
}

const HORSE_COATS: CoatDef[] = [
  { id: 'bay', label: 'Bay', c: { head: '#B58057', body: '#A9744F', mane: '#6B4630', muzzle: '#E4C29A' } },
  { id: 'black', label: 'Black Beauty', c: { head: '#575350', body: '#4B4744', mane: '#2F2C2A', muzzle: '#B8AC9E' } },
  { id: 'palomino', label: 'Palomino', c: { head: '#E0B878', body: '#D4AC6C', mane: '#F2E3C4', muzzle: '#F0DDB8' } },
];

// ---------- Snake ----------

function SnakeArt({ c }: ArtProps) {
  return (
    <>
      {/* neck rises out of the coil */}
      <Path d="M42 62 Q42 48 44 40 L56 40 Q58 48 58 62 Z" fill={c.neck} stroke={INK} strokeWidth={1.8} />
      <Ellipse cx={50} cy={36} rx={15} ry={13} fill={c.head} stroke={INK} strokeWidth={SW} />
      <Path d="M45 43 Q50 46 55 43" stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <Path d="M50 45.5 L50 51 M50 51 L47.5 54 M50 51 L52.5 54" stroke="#D9534F" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <Eye cx={44} cy={34} r={2.8} />
      <Eye cx={56} cy={34} r={2.8} />
      <Cheeks y={39} gap={11} rx={3.2} ry={2} />
      {/* coils stacked over the neck */}
      <Ellipse cx={50} cy={68} rx={20} ry={10} fill={c.neck} stroke={INK} strokeWidth={SW} />
      <Path d="M74 80 Q86 78 84 70" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />
      <Path d="M74 80 Q86 78 84 70" stroke={c.coil} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Ellipse cx={50} cy={82} rx={26} ry={11} fill={c.coil} stroke={INK} strokeWidth={SW} />
      <Path d="M36 66 Q50 72 64 66" stroke={c.belly} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M32 80 Q50 88 68 80" stroke={c.belly} strokeWidth={3} fill="none" strokeLinecap="round" />
    </>
  );
}

const SNAKE_COATS: CoatDef[] = [
  { id: 'garden', label: 'Garden', c: { head: '#88C273', neck: '#7CB868', coil: '#6FA85C', belly: '#CDE4A9' } },
  { id: 'sand', label: 'Sand Boa', c: { head: '#D8B067', neck: '#CBA35C', coil: '#BD9550', belly: '#F2E0B8' } },
  { id: 'plum', label: 'Plum', c: { head: '#9B7FB5', neck: '#8E72A8', coil: '#81659B', belly: '#DCCEE8' } },
];

// ---------- Registry ----------

export const PET_ART: Record<SpeciesKey, PetArtDef> = {
  dog: {
    Art: DogArt,
    coats: DOG_COATS,
    anchors: {
      head: { x: 50, y: 24, w: 46 },
      eyes: { x: 50, y: 41, w: 48 },
      neck: { x: 50, y: 66, w: 38 },
    },
  },
  cat: {
    Art: CatArt,
    coats: CAT_COATS,
    anchors: {
      head: { x: 50, y: 27, w: 42 },
      eyes: { x: 50, y: 45, w: 44 },
      neck: { x: 50, y: 69, w: 34 },
    },
  },
  bird: {
    Art: BirdArt,
    coats: BIRD_COATS,
    anchors: {
      head: { x: 50, y: 30, w: 44 },
      eyes: { x: 50, y: 44, w: 54 },
      neck: { x: 50, y: 61, w: 36 },
    },
  },
  rabbit: {
    Art: RabbitArt,
    coats: RABBIT_COATS,
    anchors: {
      head: { x: 50, y: 30, w: 40 },
      eyes: { x: 50, y: 47, w: 44 },
      neck: { x: 50, y: 70, w: 34 },
    },
  },
  hamster: {
    Art: HamsterArt,
    coats: HAMSTER_COATS,
    anchors: {
      head: { x: 50, y: 29, w: 48 },
      eyes: { x: 50, y: 45, w: 50 },
      neck: { x: 50, y: 74, w: 40 },
    },
  },
  fish: {
    Art: FishArt,
    coats: FISH_COATS,
    anchors: {
      head: { x: 50, y: 31, w: 44 },
      eyes: { x: 50, y: 49, w: 44 },
      neck: { x: 50, y: 68, w: 34 },
    },
  },
  turtle: {
    Art: TurtleArt,
    coats: TURTLE_COATS,
    anchors: {
      head: { x: 50, y: 20, w: 30 },
      eyes: { x: 50, y: 32, w: 30 },
      neck: { x: 50, y: 46, w: 26 },
    },
  },
  lizard: {
    Art: LizardArt,
    coats: LIZARD_COATS,
    anchors: {
      head: { x: 50, y: 24, w: 46 },
      eyes: { x: 50, y: 31, w: 64 },
      neck: { x: 50, y: 64, w: 34 },
    },
  },
  horse: {
    Art: HorseArt,
    coats: HORSE_COATS,
    anchors: {
      head: { x: 50, y: 14, w: 38 },
      eyes: { x: 50, y: 40, w: 50 },
      neck: { x: 50, y: 70, w: 36 },
    },
  },
  snake: {
    Art: SnakeArt,
    coats: SNAKE_COATS,
    anchors: {
      head: { x: 50, y: 24, w: 32 },
      eyes: { x: 50, y: 34, w: 33 },
      neck: { x: 50, y: 50, w: 26 },
    },
  },
};
