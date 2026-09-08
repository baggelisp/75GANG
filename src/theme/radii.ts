/** Corner radii from `.claude/rules/design-system.md` — "Shape". */
export const radii = {
  card: 24,
  tile: 24,
  ruleRow: 14,
  checkbox: 7,
  pill: 99,
} as const;

export type RadiusToken = keyof typeof radii;
