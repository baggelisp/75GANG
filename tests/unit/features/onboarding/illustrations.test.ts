import {
  findIllustration,
  OnboardingSlideEnum,
} from '@/features/onboarding/_illustrations/findIllustration';

const SLIDES = Object.values(OnboardingSlideEnum);

describe('onboarding illustrations', () => {
  it('has one for every slide, so a slide cannot ship without a picture', () => {
    // Three narrative slides. The challenge slides carry their rules instead of a picture.
    expect(SLIDES).toHaveLength(3);

    SLIDES.forEach((slide) => {
      expect(findIllustration(slide).length).toBeGreaterThan(0);
    });
  });

  it.each(SLIDES)('gives %s a real svg document', (slide) => {
    const xml = findIllustration(slide);

    expect(xml.startsWith('<svg')).toBe(true);
    expect(xml).toContain('viewBox');
  });

  it.each(SLIDES)('leaves %s free of a fixed width, so it scales to the screen', (slide) => {
    const openingTag = findIllustration(slide).slice(0, findIllustration(slide).indexOf('>'));

    expect(openingTag).not.toMatch(/\swidth="/);
    expect(openingTag).not.toMatch(/\sheight="/);
  });

  it('gives each slide a different illustration', () => {
    const unique = new Set(SLIDES.map((slide) => findIllustration(slide)));

    expect(unique.size).toBe(SLIDES.length);
  });
});
