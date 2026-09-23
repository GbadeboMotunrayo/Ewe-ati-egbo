// Ewe ati Egbo design tokens — source of truth: ../../docs/brand-guidelines.md
// Earthy, botanical, premium — not clinical, not pharmacy-white.

export const colors = {
  // Core palette
  primary: '#1F6B3B', // Deep Green — brand, CTAs, verified states
  primaryDark: '#154D2A',
  ochre: '#C6862B', // Earth Ochre — accent, roots & barks
  sand: '#E0A458', // Warm Sand
  bark: '#3A2A1E', // Bark Brown — primary text
  cream: '#F7F3EC', // Cream — backgrounds

  background: '#F7F3EC',
  surface: '#FFFFFF',
  text: '#3A2A1E',
  textSecondary: '#675A4C',
  border: '#E8DFD1',
  white: '#FFFFFF',

  // Compliance / status traffic-light (maps to docs/compliance.md §3)
  green: '#1F6B3B',
  amber: '#C6862B',
  red: '#C1442E',

  success: '#1F6B3B',
  warning: '#C6862B',
  error: '#C1442E',

  // Tints for pill/badge backgrounds
  greenTint: '#E3F0E7',
  amberTint: '#F7ECD8',
  redTint: '#F7E1DC',
} as const;

export const fonts = {
  heading: 'Poppins_700Bold',
  headingMedium: 'Poppins_600SemiBold',
  body: 'Poppins_400Regular',
  bodyMedium: 'Poppins_500Medium',
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// Product classes (docs/compliance.md §2) — drives labelling in the UI.
export const productClass = {
  A: { label: 'Herb / Botanical', color: colors.green, tint: colors.greenTint },
  B: { label: 'Food Supplement', color: colors.amber, tint: colors.amberTint },
  C: { label: 'Cosmetic', color: colors.ochre, tint: colors.amberTint },
  D: { label: 'Herbal Medicine', color: colors.red, tint: colors.redTint },
} as const;

// Type scale — one place to tune the reading rhythm.
export const type = {
  display: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34 },
  h1: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28 },
  h2: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 24 },
  h3: { fontFamily: fonts.headingMedium, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  small: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
} as const;

// Soft, warm elevation (brown-tinted, not grey) so cards float without looking clinical.
export const shadow = {
  sm: { shadowColor: '#3A2A1E', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  md: { shadowColor: '#3A2A1E', shadowOpacity: 0.09, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  lg: { shadowColor: '#3A2A1E', shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
} as const;

// Motion — springs feel physical; durations stay short so the app never feels slow.
export const motion = {
  press: { damping: 18, stiffness: 320, mass: 0.6 },
  pop: { damping: 10, stiffness: 260, mass: 0.7 },
  fast: 160,
  base: 240,
  slow: 380,
  stagger: 45,
} as const;

// Breakpoints (dp). Phone < 600 ≤ tablet < 1024 ≤ desktop (web).
export const breakpoints = { tablet: 600, desktop: 1024, wide: 1400 } as const;
