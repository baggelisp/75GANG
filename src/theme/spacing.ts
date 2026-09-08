/**
 * The spacing scale, measured from `Docs/mockups/home-screen.html`. It covers every padding and
 * gap the mockup uses, so no component needs a raw number.
 */
export const spacing = {
  hair: 3,
  xxs: 4,
  xs: 6,
  sm: 8,
  ms: 9,
  md: 10,
  lg: 11,
  xl: 12,
  xxl: 15,
  xxxl: 16,
  huge: 17,
  giant: 20,
  massive: 24,
} as const;

export type SpacingToken = keyof typeof spacing;
