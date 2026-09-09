import { readFileSync } from 'fs';
import { join } from 'path';
import { sync as glob } from 'glob';

const PROJECT_ROOT = join(__dirname, '..', '..');

/**
 * Screens that legitimately do not scroll, each for a reason that is not "it happens to fit".
 *
 * "It fits on my phone" is never one: `StartChallengeScreen` fitted until the date stepper became
 * a calendar, and then the start button sat below the fold with no way to reach it.
 */
const NEED_NO_SCROLL: readonly string[] = [
  // Renders a <Redirect>, never any content.
  'src/features/entry/EntryScreen.tsx',
  // A pager that owns its own horizontal scrolling.
  'src/features/onboarding/OnboardingScreen.tsx',
  // One line of text, and it is replaced by the real screen in a later feature.
  'src/features/shared/ComingSoonScreen.tsx',
];

const listScreens = (): readonly string[] =>
  glob('src/features/*/[A-Z]*Screen.tsx', { cwd: PROJECT_ROOT }).sort();

const readSource = (path: string): string => readFileSync(join(PROJECT_ROOT, path), 'utf8');

describe('every screen', () => {
  it('is found by the guard, so a new feature cannot slip past it', () => {
    expect(listScreens().length).toBeGreaterThan(5);
  });

  it('either scrolls or is named as an exception', () => {
    const stuck = listScreens().filter((path) => {
      if (NEED_NO_SCROLL.includes(path)) {
        return false;
      }

      const source = readSource(path);

      // A screen that delegates its whole body to one component scrolls through that component.
      return !source.includes('ScrollView') && !source.includes('FlatList');
    });

    expect(stuck).toEqual([]);
  });

  it.each(NEED_NO_SCROLL)('%s is still there to be excused', (path) => {
    expect(() => readSource(path)).not.toThrow();
  });
});
