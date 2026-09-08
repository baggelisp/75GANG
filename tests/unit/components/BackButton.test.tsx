import AntDesign from '@expo/vector-icons/AntDesign';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { BackButton } from '@/components/BackButton';
import { colors } from '@/theme/tokens';

const LABEL = 'Back';
const ACCESSIBILITY_LABEL = 'Go back to Today';

describe('BackButton', () => {
  it('shows the label', () => {
    render(
      <BackButton label={LABEL} accessibilityLabel={ACCESSIBILITY_LABEL} onPress={jest.fn()} />,
    );

    expect(screen.getByText(LABEL)).toBeTruthy();
  });

  /**
   * The arrow says which direction before anyone reads the word.
   *
   * Asserted on the icon component rather than its glyph: the icon font is not loaded in the test
   * environment, so there is no character to query by.
   */
  it('always draws the left arrow beside the label', () => {
    const { UNSAFE_root } = render(
      <BackButton label={LABEL} accessibilityLabel={ACCESSIBILITY_LABEL} onPress={jest.fn()} />,
    );

    const icons = UNSAFE_root.findAllByType(AntDesign);

    expect(icons).toHaveLength(1);
    expect(icons[0]?.props.name).toBe('arrow-left');
  });

  it('draws the arrow in the label colour rather than a literal', () => {
    const { UNSAFE_root } = render(
      <BackButton label={LABEL} accessibilityLabel={ACCESSIBILITY_LABEL} onPress={jest.fn()} />,
    );

    expect(UNSAFE_root.findAllByType(AntDesign)[0]?.props.color).toBe(colors.text);
  });

  it('calls back when pressed', () => {
    const onPress = jest.fn();
    render(<BackButton label={LABEL} accessibilityLabel={ACCESSIBILITY_LABEL} onPress={onPress} />);

    fireEvent.press(screen.getByLabelText(ACCESSIBILITY_LABEL));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is at least 44 points tall so it is a legal tap target', () => {
    render(
      <BackButton label={LABEL} accessibilityLabel={ACCESSIBILITY_LABEL} onPress={jest.fn()} />,
    );

    const style = screen.getByLabelText(ACCESSIBILITY_LABEL).props.style;
    const flattened = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;

    expect(flattened.minHeight).toBeGreaterThanOrEqual(44);
  });
});
