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
  textSecondary: '#7A6A5A',
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
