import { ACCENTS, AccentEnum, colors, resolveAccentColor } from '@/theme/tokens';

describe('tokens', () => {
  it('exposes exactly three accents, with no green or blue among them', () => {
    expect(ACCENTS).toEqual(['coral', 'butter', 'lavender']);
  });

  it.each([
    [AccentEnum.CORAL, '#EE9080'],
    [AccentEnum.BUTTER, '#F1DD79'],
    [AccentEnum.LAVENDER, '#A6ADED'],
  ])('resolves the %s accent to %s', (accent, expected) => {
    expect(resolveAccentColor(accent)).toBe(expected);
  });

  it('keeps ink distinct from the surface text tones, since ink is for accent fills only', () => {
    expect(colors.ink).not.toBe(colors.text);
    expect(colors.ink).not.toBe(colors.textSecondary);
  });
});
