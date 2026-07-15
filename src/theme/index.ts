/**
 * PetTracker design language — "warm field journal".
 * Cream paper surfaces, deep ink text, persimmon accent, Fraunces display type.
 * Deliberately NOT a default blue/gray mobile theme.
 */
export const colors = {
  bg: '#FAF3E7',
  surface: '#FFFDF8',
  surfaceAlt: '#F3EAD9',
  line: '#EAE0CC',
  lineStrong: '#D9CBB0',

  ink: '#2B2118',
  sub: '#7C6F5F',
  faint: '#A99C89',

  accent: '#E4572E',
  accentDark: '#C64722',
  accentSoft: '#FBE4DA',

  sage: '#6B8F6B',
  sageSoft: '#E4EDE0',

  gold: '#D99A2B',
  goldSoft: '#F7EBD0',

  sky: '#4E7DA6',
  skySoft: '#E1EBF2',

  danger: '#C0392B',
  dangerSoft: '#F7E0DC',

  white: '#FFFFFF',
  overlay: 'rgba(43, 33, 24, 0.45)',
} as const;

export const fonts = {
  display: 'Fraunces_700Bold',
  displaySemi: 'Fraunces_600SemiBold',
  // Body text uses the platform default for maximum legibility at small sizes.
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  full: 999,
} as const;

export const space = (n: number) => n * 4;

export const shadow = {
  card: {
    shadowColor: '#8A6D3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  float: {
    shadowColor: '#5B4326',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;
