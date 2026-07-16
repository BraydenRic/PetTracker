/**
 * Shared drawing vocabulary for the vector pets, so every species reads as the
 * same illustration style: warm ink outlines, dot eyes with a catch-light,
 * rosy cheeks.
 */
import React from 'react';
import { Circle, Ellipse, Path } from 'react-native-svg';

/** Warm ink used for every outline — softer than pure theme ink so fills glow. */
export const INK = '#4B3826';

/** Stroke width for main silhouettes (pets are drawn in a 100×100 box). */
export const SW = 2;

/** One eye: ink dot with a white catch-light in the upper corner. */
export function Eye({ cx, cy, r = 3.2 }: { cx: number; cy: number; r?: number }) {
  return (
    <>
      <Circle cx={cx} cy={cy} r={r} fill={INK} />
      <Circle cx={cx + r * 0.35} cy={cy - r * 0.35} r={r * 0.32} fill="#FFFFFF" />
    </>
  );
}

/** Rosy cheek pair, mirrored around x=50. */
export function Cheeks({
  y,
  gap,
  rx = 4.5,
  ry = 2.8,
}: {
  y: number;
  gap: number;
  rx?: number;
  ry?: number;
}) {
  return (
    <>
      <Ellipse cx={50 - gap} cy={y} rx={rx} ry={ry} fill="#F0A28E" opacity={0.55} />
      <Ellipse cx={50 + gap} cy={y} rx={rx} ry={ry} fill="#F0A28E" opacity={0.55} />
    </>
  );
}

/** Simple upward smile centered on x. */
export function Smile({ x = 50, y, w = 10 }: { x?: number; y: number; w?: number }) {
  return (
    <Path
      d={`M${x - w / 2} ${y} Q${x} ${y + w * 0.55} ${x + w / 2} ${y}`}
      stroke={INK}
      strokeWidth={1.6}
      fill="none"
      strokeLinecap="round"
    />
  );
}
