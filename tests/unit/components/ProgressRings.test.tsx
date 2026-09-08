import { render, screen } from '@testing-library/react-native';

import { ProgressRings } from '@/components/charts/ProgressRings';

const RINGS_LABEL = 'Habits 6 of 11, workouts 1 of 2, water 2.5 of 3 litres';

const renderRings = () =>
  render(
    <ProgressRings
      habitsCompleted={6}
      habitsTarget={11}
      workoutsCompleted={1}
      workoutsTarget={2}
      waterLitres={2.5}
      waterTargetLitres={3}
      accessibilityLabel={RINGS_LABEL}
    />,
  );

describe('ProgressRings', () => {
  it('carries one combined accessibility label describing all three values', () => {
    renderRings();

    expect(screen.getByLabelText(RINGS_LABEL)).toBeTruthy();
  });

  it('draws a track and an arc for each of the three rings', () => {
    const { UNSAFE_root } = renderRings();
    const circles = UNSAFE_root.findAllByType('RNSVGCircle' as never);

    expect(circles).toHaveLength(6);
  });

  it('draws tracks only on day one, never an accent dot where there is no progress', () => {
    const { UNSAFE_root } = render(
      <ProgressRings
        habitsCompleted={0}
        habitsTarget={11}
        workoutsCompleted={0}
        workoutsTarget={2}
        waterLitres={0}
        waterTargetLitres={3}
        accessibilityLabel="Nothing completed yet"
      />,
    );

    expect(UNSAFE_root.findAllByType('RNSVGCircle' as never)).toHaveLength(3);
  });
});
