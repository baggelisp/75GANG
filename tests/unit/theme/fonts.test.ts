import { decideShouldHoldRender } from '@/theme/fonts';

describe('decideShouldHoldRender', () => {
  it.each(['ios', 'android'])(
    'holds the render on %s while fonts load, because the splash screen is covering it',
    (platform) => {
      expect(decideShouldHoldRender(false, platform)).toBe(true);
    },
  );

  it.each(['ios', 'android'])('releases the render on %s once fonts are ready', (platform) => {
    expect(decideShouldHoldRender(true, platform)).toBe(false);
  });

  it('never holds the render on web, where holding would export an empty static page', () => {
    expect(decideShouldHoldRender(false, 'web')).toBe(false);
  });
});
