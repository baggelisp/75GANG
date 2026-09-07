import { render, screen } from '@testing-library/react-native';

import { AccentTile } from '@/components/AccentTile';
import { ACCENTS, colors } from '@/theme/tokens';

const LABEL = 'Streak';
const VALUE = '12';
const FOOTNOTE = 'Best 12 days';

const readColor = (element: ReturnType<typeof screen.getByText>): unknown =>
  StyleSheetFlatten(element.props.style).color;

const StyleSheetFlatten = (style: unknown): { color?: unknown } => {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(StyleSheetFlatten));
  }

  if (style && typeof style === 'object') {
    return style as { color?: unknown };
  }

  return {};
};

describe('AccentTile', () => {
  it.each(ACCENTS)('renders every piece of content in ink on the %s accent', (accent) => {
    render(<AccentTile accent={accent} label={LABEL} value={VALUE} footnote={FOOTNOTE} />);

    expect(readColor(screen.getByText(LABEL))).toBe(colors.ink);
    expect(readColor(screen.getByText(VALUE))).toBe(colors.ink);
    expect(readColor(screen.getByText(FOOTNOTE))).toBe(colors.ink);
  });

  it.each(ACCENTS)('never renders content in the surface text colour on %s', (accent) => {
    render(<AccentTile accent={accent} label={LABEL} value={VALUE} />);

    expect(readColor(screen.getByText(VALUE))).not.toBe(colors.text);
  });

  it('omits the footnote when there is nothing to say', () => {
    render(<AccentTile accent="coral" label={LABEL} value={VALUE} />);

    expect(screen.queryByText(FOOTNOTE)).toBeNull();
  });
});
