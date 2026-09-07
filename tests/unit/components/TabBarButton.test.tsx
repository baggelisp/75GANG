import { fireEvent, render, screen } from '@testing-library/react-native';

import { TabBarButton } from '@/components/TabBarButton';
import { colors } from '@/theme/tokens';

const flatten = (style: unknown): Record<string, unknown> => {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.filter(Boolean).map(flatten));
  }

  if (style && typeof style === 'object') {
    return style as Record<string, unknown>;
  }

  return {};
};

describe('TabBarButton', () => {
  it('fills the active tab with coral, the accent that means active', () => {
    render(<TabBarButton label="Today" isFocused onPress={jest.fn()} />);

    expect(flatten(screen.getByLabelText('Today').props.style).backgroundColor).toBe(colors.coral);
  });

  it('renders the active label in ink, never white on a filled accent', () => {
    render(<TabBarButton label="Today" isFocused onPress={jest.fn()} />);

    expect(flatten(screen.getByText('Today').props.style).color).toBe(colors.ink);
  });

  it('leaves an inactive tab unfilled', () => {
    render(<TabBarButton label="Progress" onPress={jest.fn()} />);

    expect(flatten(screen.getByLabelText('Progress').props.style).backgroundColor).toBeUndefined();
  });

  it('reports which tab is selected to assistive technology', () => {
    render(<TabBarButton label="Today" isFocused onPress={jest.fn()} />);

    expect(screen.getByLabelText('Today').props.accessibilityState.selected).toBe(true);
  });

  it('is at least 44 points tall so it is a legal tap target', () => {
    render(<TabBarButton label="Today" onPress={jest.fn()} />);

    expect(flatten(screen.getByLabelText('Today').props.style).minHeight).toBeGreaterThanOrEqual(
      44,
    );
  });

  it('calls back when pressed', () => {
    const onPress = jest.fn();
    render(<TabBarButton label="Journal" onPress={onPress} />);

    fireEvent.press(screen.getByLabelText('Journal'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
