import { render, screen } from '@testing-library/react-native';

import { countHabitsForMode, resolveHabitsForMode } from '@/domain/habits';
import { ChallengeModeEnum } from '@/domain/modes';
import { ModeSlide } from '@/features/onboarding/_components/ModeSlide';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useFocusEffect: () => undefined,
  Redirect: () => null,
}));

describe('a challenge slide', () => {
  it.each([
    [ChallengeModeEnum.EASY, 'Easy'],
    [ChallengeModeEnum.MEDIUM, 'Medium'],
    [ChallengeModeEnum.HARD, 'Hard'],
  ])('names the %s challenge', (mode, name) => {
    render(<ModeSlide mode={mode} />);

    expect(screen.getByText(name)).toBeTruthy();
  });

  it.each([
    [ChallengeModeEnum.EASY, '6 rules'],
    [ChallengeModeEnum.MEDIUM, '9 rules'],
    [ChallengeModeEnum.HARD, '11 rules'],
  ])('says how many rules %s has', (mode, label) => {
    render(<ModeSlide mode={mode} />);

    expect(screen.getByText(label)).toBeTruthy();
  });

  it.each([ChallengeModeEnum.EASY, ChallengeModeEnum.MEDIUM, ChallengeModeEnum.HARD])(
    'lists every rule of the %s challenge and no others',
    (mode) => {
      render(<ModeSlide mode={mode} />);

      const listed = screen.getAllByLabelText(/^Rule \d+:/);

      expect(listed).toHaveLength(countHabitsForMode(mode));
    },
  );
});

describe('the targets a challenge slide promises', () => {
  it('shows Easy its own lighter numbers, not the ones from Hard', () => {
    render(<ModeSlide mode={ChallengeModeEnum.EASY} />);

    expect(screen.getByText('Drink 2 litres of water')).toBeTruthy();
    expect(screen.queryByText('Drink 3 litres of water')).toBeNull();
  });

  it('shows Hard the rules of Docs/rules.jpeg', () => {
    render(<ModeSlide mode={ChallengeModeEnum.HARD} />);

    expect(screen.getByText('Drink 3 litres of water')).toBeTruthy();
    expect(screen.getByText('2 workouts, 45 minutes each')).toBeTruthy();
  });

  it('leaves out the rules a challenge does not carry', () => {
    const easyIds = resolveHabitsForMode(ChallengeModeEnum.EASY).map((habit) => habit.id);
    expect(easyIds).not.toContain('weigh-in');

    render(<ModeSlide mode={ChallengeModeEnum.EASY} />);

    expect(screen.queryByText('Weigh-in & mirror photo')).toBeNull();
  });
});

describe('how the rules are numbered', () => {
  it('counts from one within the challenge, not by place in the eleven', () => {
    render(<ModeSlide mode={ChallengeModeEnum.EASY} />);

    // Easy carries rules 1, 3, 4, 6, 8 and 10 of the eleven. On its own slide they are 1 to 6.
    expect(screen.getByLabelText('Rule 2: Drink 2 litres of water')).toBeTruthy();
    expect(screen.getByLabelText(/^Rule 6:/)).toBeTruthy();
    expect(screen.queryByLabelText(/^Rule 7:/)).toBeNull();
  });

  it('is unchanged for Hard, which carries all eleven in order', () => {
    render(<ModeSlide mode={ChallengeModeEnum.HARD} />);

    expect(screen.getByLabelText('Rule 3: Drink 3 litres of water')).toBeTruthy();
    expect(screen.getByLabelText(/^Rule 11:/)).toBeTruthy();
  });
});
