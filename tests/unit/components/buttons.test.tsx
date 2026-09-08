import { fireEvent, render, screen } from '@testing-library/react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';

const LABEL = 'Start challenge';
const ACCESSIBILITY_LABEL = 'Start the 75 day challenge';
const MINIMUM_TAP_TARGET = 44;

describe('PrimaryButton', () => {
  it('calls back when pressed', () => {
    const onPress = jest.fn();
    render(
      <PrimaryButton label={LABEL} accessibilityLabel={ACCESSIBILITY_LABEL} onPress={onPress} />,
    );

    fireEvent.press(screen.getByLabelText(ACCESSIBILITY_LABEL));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call back while disabled', () => {
    const onPress = jest.fn();
    render(
      <PrimaryButton
        label={LABEL}
        accessibilityLabel={ACCESSIBILITY_LABEL}
        onPress={onPress}
        isDisabled
      />,
    );

    fireEvent.press(screen.getByLabelText(ACCESSIBILITY_LABEL));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('reports its disabled state to assistive technology', () => {
    render(
      <PrimaryButton
        label={LABEL}
        accessibilityLabel={ACCESSIBILITY_LABEL}
        onPress={jest.fn()}
        isDisabled
      />,
    );

    expect(screen.getByLabelText(ACCESSIBILITY_LABEL).props.accessibilityState.disabled).toBe(true);
  });

  it('is at least 44 points tall so it is a legal tap target', () => {
    render(
      <PrimaryButton label={LABEL} accessibilityLabel={ACCESSIBILITY_LABEL} onPress={jest.fn()} />,
    );

    const style = screen.getByLabelText(ACCESSIBILITY_LABEL).props.style;
    const flattened = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;

    expect(flattened.minHeight).toBeGreaterThanOrEqual(MINIMUM_TAP_TARGET);
  });
});

describe('SecondaryButton', () => {
  it('calls back when pressed', () => {
    const onPress = jest.fn();
    render(
      <SecondaryButton label={LABEL} accessibilityLabel={ACCESSIBILITY_LABEL} onPress={onPress} />,
    );

    fireEvent.press(screen.getByLabelText(ACCESSIBILITY_LABEL));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes the button role to assistive technology', () => {
    render(
      <SecondaryButton
        label={LABEL}
        accessibilityLabel={ACCESSIBILITY_LABEL}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByRole('button')).toBeTruthy();
  });
});
