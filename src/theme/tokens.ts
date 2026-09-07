/**
 * The only module in the repository allowed to contain a colour literal.
 *
 * Feature 01 seeds it with the three values the placeholder screen needs, using the names from
 * `.claude/rules/design-system.md`. Feature 02 completes the palette from that same table and
 * adds the lint guard that enforces this file's monopoly on colour literals — that guard must
 * whitelist `app.json`, which repeats the background colour for the native splash and adaptive
 * icon and cannot read a TypeScript module.
 */
export const colors = {
  bg: '#1A191C',
  text: '#F4F3F6',
  textSecondary: '#9A98A1',
} as const;
