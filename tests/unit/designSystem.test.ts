import { join } from 'path';

import { collectProjectModules } from '../support/architecture/collectProjectModules';
import { findStyleViolations, StyleViolationEnum } from '../support/designSystem/styleViolations';

const PROJECT_ROOT = join(__dirname, '..', '..');
const A_COMPONENT = 'src/components/Card.tsx';

describe('findStyleViolations', () => {
  it('rejects a hex colour literal outside tokens.ts', () => {
    const source = "const styles = { card: { backgroundColor: '#252429' } };";

    const violations = findStyleViolations(A_COMPONENT, source);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(StyleViolationEnum.COLOUR_LITERAL_OUTSIDE_TOKENS);
  });

  it('rejects an rgba() literal outside tokens.ts, since alpha variants get a name too', () => {
    const source = "const styles = { row: { borderColor: 'rgba(255, 255, 255, 0.07)' } };";

    const violations = findStyleViolations(A_COMPONENT, source);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(StyleViolationEnum.COLOUR_LITERAL_OUTSIDE_TOKENS);
  });

  it('allows colour literals inside tokens.ts, which is the one file licensed to hold them', () => {
    const source = "export const colors = { bg: '#1A191C' };";

    expect(findStyleViolations('src/theme/tokens.ts', source)).toEqual([]);
  });

  it.each(['shadowOpacity', 'shadowRadius', 'shadowColor', 'elevation'])(
    'rejects %s anywhere, because depth comes from the card grey alone',
    (property) => {
      const source = `const styles = { card: { ${property}: 4 } };`;

      const violations = findStyleViolations(A_COMPONENT, source);

      expect(violations).toHaveLength(1);
      expect(violations[0]?.reason).toBe(StyleViolationEnum.SHADOW_OR_ELEVATION);
    },
  );

  it('rejects a hardcoded font size outside typography.ts', () => {
    const source = 'const styles = { title: { fontSize: 32 } };';

    const violations = findStyleViolations(A_COMPONENT, source);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(StyleViolationEnum.HARDCODED_TYPE_STYLE);
  });

  it('rejects a hardcoded letter spacing outside typography.ts', () => {
    const source = 'const styles = { title: { letterSpacing: -1.8 } };';

    const violations = findStyleViolations(A_COMPONENT, source);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(StyleViolationEnum.HARDCODED_TYPE_STYLE);
  });

  it('allows type roles inside typography.ts, where the scale is defined', () => {
    const source = 'export const typography = { hero: { fontSize: 40, letterSpacing: -1.8 } };';

    expect(findStyleViolations('src/theme/typography.ts', source)).toEqual([]);
  });

  it.each([
    ['white, the value the design system calls the most common violation', "'white'"],
    ['a named CSS colour', "'limegreen'"],
    ['an hsl() literal', "'hsl(120, 100%, 50%)'"],
  ])('rejects %s in a colour property', (_description, value) => {
    const source = `const styles = { tile: { color: ${value} } };`;

    const violations = findStyleViolations(A_COMPONENT, source);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(StyleViolationEnum.COLOUR_LITERAL_OUTSIDE_TOKENS);
  });

  it.each(['none', 'transparent'])(
    'allows %s, which is a keyword rather than a colour',
    (value) => {
      const source = `const C = () => <Circle fill="${value}" />;`;

      expect(findStyleViolations(A_COMPONENT, source)).toEqual([]);
    },
  );

  it('rejects a font size written as a JSX prop, as react-native-svg text takes it', () => {
    const source = 'const C = () => <SvgText fontSize={19} />;';

    const violations = findStyleViolations(A_COMPONENT, source);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(StyleViolationEnum.HARDCODED_TYPE_STYLE);
  });

  it('rejects a hardcoded fontWeight, which is a string rather than a number', () => {
    const source = "const styles = { title: { fontWeight: '800' } };";

    const violations = findStyleViolations(A_COMPONENT, source);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(StyleViolationEnum.HARDCODED_TYPE_STYLE);
  });

  it('allows a colour read from the token module', () => {
    const source = 'const styles = { tile: { backgroundColor: colors.coral } };';

    expect(findStyleViolations(A_COMPONENT, source)).toEqual([]);
  });

  it('does not mistake a hex colour written in a comment for a real one', () => {
    const source = [
      '// The ground is #1A191C, defined in tokens.ts.',
      'export const noop = 1;',
    ].join('\n');

    expect(findStyleViolations(A_COMPONENT, source)).toEqual([]);
  });

  it('allows a font size that reads from the typography scale', () => {
    const source = 'const styles = { title: { fontSize: typography.hero.fontSize } };';

    expect(findStyleViolations(A_COMPONENT, source)).toEqual([]);
  });
});

describe('the project as it stands', () => {
  it('has no design system violations under src/ and app/', () => {
    const violations = collectProjectModules(PROJECT_ROOT).flatMap((module) =>
      findStyleViolations(module.filePath, module.source),
    );

    expect(violations).toEqual([]);
  });
});
