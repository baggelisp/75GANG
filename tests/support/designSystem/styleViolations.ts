import * as ts from 'typescript';

import { forEachNode, parseModule } from '../architecture/parseModule';

export const StyleViolationEnum = {
  COLOUR_LITERAL_OUTSIDE_TOKENS: 'COLOUR_LITERAL_OUTSIDE_TOKENS',
  SHADOW_OR_ELEVATION: 'SHADOW_OR_ELEVATION',
  HARDCODED_TYPE_STYLE: 'HARDCODED_TYPE_STYLE',
  HAND_DRAWN_ICON: 'HAND_DRAWN_ICON',
} as const;

export type StyleViolationReason = (typeof StyleViolationEnum)[keyof typeof StyleViolationEnum];

export type StyleViolation = {
  readonly filePath: string;
  readonly reason: StyleViolationReason;
  readonly detail: string;
};

/** The one module licensed to hold colour literals. */
export const TOKENS_PATH = 'src/theme/tokens.ts';

/** The one module licensed to set a type style. */
export const TYPOGRAPHY_PATH = 'src/theme/typography.ts';

/**
 * Modules allowed to draw with react-native-svg.
 *
 * These are drawings — the progress rings, and the onboarding illustrations — not icons. An icon
 * hand-drawn as a path drifts from the icon set, so icons come from `@expo/vector-icons`.
 */
const DRAWING_PATHS: readonly string[] = [
  'src/components/charts/',
  'src/features/onboarding/_components/OnboardingIllustration.tsx',
];

/**
 * Matches a colour written as a value — hex, rgb/rgba, hsl/hsla. Named CSS colours are caught by
 * the property-name check instead, because `'white'` is indistinguishable from any other word.
 *
 * Unanchored on purpose. It used to require the colour at the start of the string, which meant an
 * SVG pasted in as a string — `'<svg …fill="#ed9da0"…'` — carried a whole off-palette set straight
 * past the guard, and the onboarding illustrations did exactly that for four screens.
 */
const COLOUR_SYNTAX = /#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(/;

/**
 * Properties whose value is a colour. A string literal here is a violation whatever it says, which
 * is what catches `'white'` on an accent tile — the violation the design system calls the most
 * common one.
 */
const COLOUR_PROPERTIES = /(^|[a-z])[Cc]olor$|^(stroke|fill)$/;

/** Values that are legal in a colour slot without being colours. */
const NON_COLOUR_KEYWORDS: readonly string[] = ['none', 'transparent', 'inherit', 'currentColor'];

const SHADOW_PROPERTIES: readonly string[] = [
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'elevation',
  'boxShadow',
];

const TYPE_PROPERTIES: readonly string[] = [
  'fontSize',
  'letterSpacing',
  'fontWeight',
  'lineHeight',
];

const normalise = (filePath: string): string => filePath.replace(/\\/g, '/');

/**
 * Every node whose text a person could hide a colour in — a plain string, and each literal chunk
 * of a template string. A template's chunks are separate nodes, so an interpolated
 * `${colors.coral}` is invisible here and correctly passes.
 */
const isColourBearingText = (node: ts.Node): node is ts.StringLiteralLike | ts.TemplateHead =>
  ts.isStringLiteralLike(node) ||
  ts.isTemplateHead(node) ||
  ts.isTemplateMiddle(node) ||
  ts.isTemplateTail(node);

const readPropertyName = (node: ts.PropertyAssignment | ts.JsxAttribute): string | null => {
  if (ts.isJsxAttribute(node)) {
    return ts.isIdentifier(node.name) ? node.name.text : null;
  }

  if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
    return node.name.text;
  }

  return null;
};

const readLiteralValue = (node: ts.PropertyAssignment | ts.JsxAttribute): ts.Node | undefined => {
  if (ts.isPropertyAssignment(node)) {
    return node.initializer;
  }

  if (!node.initializer) {
    return undefined;
  }

  if (ts.isJsxExpression(node.initializer)) {
    return node.initializer.expression;
  }

  return node.initializer;
};

/**
 * A type style written as a literal, in either form: `fontSize: 19` or `fontWeight: '800'`.
 * A value read from the typography scale is a property access, not a literal, and passes.
 */
const decideIsHardcodedTypeValue = (node: ts.Node | undefined): boolean => {
  if (!node) {
    return false;
  }

  if (ts.isNumericLiteral(node) || ts.isStringLiteralLike(node)) {
    return true;
  }

  return ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand);
};

const decideIsForbiddenColourValue = (node: ts.Node | undefined): boolean => {
  if (!node) {
    return false;
  }

  if (!ts.isStringLiteralLike(node)) {
    return false;
  }

  if (NON_COLOUR_KEYWORDS.includes(node.text)) {
    return false;
  }

  // A hex, rgb() or hsl() value is already reported by the literal check, which visits every
  // string in the module. Reporting it here as well would double-count the same mistake.
  return !COLOUR_SYNTAX.test(node.text);
};

export const findStyleViolations = (filePath: string, source: string): StyleViolation[] => {
  const path = normalise(filePath);
  const violations: StyleViolation[] = [];
  const mayDraw = DRAWING_PATHS.some((allowed) => path.startsWith(allowed));

  if (!mayDraw && /from 'react-native-svg'/.test(source)) {
    violations.push({
      filePath: path,
      reason: StyleViolationEnum.HAND_DRAWN_ICON,
      detail: 'icons come from @expo/vector-icons; react-native-svg is for drawings',
    });
  }
  const isTokensFile = path === TOKENS_PATH;
  const isTypographyFile = path === TYPOGRAPHY_PATH;

  forEachNode(parseModule(path, source), (node) => {
    if (isColourBearingText(node) && !isTokensFile && COLOUR_SYNTAX.test(node.text)) {
      violations.push({
        filePath: path,
        reason: StyleViolationEnum.COLOUR_LITERAL_OUTSIDE_TOKENS,
        detail: `"${node.text}" — colours come from ${TOKENS_PATH}`,
      });

      return;
    }

    if (!ts.isPropertyAssignment(node) && !ts.isJsxAttribute(node)) {
      return;
    }

    const propertyName = readPropertyName(node);

    if (propertyName === null) {
      return;
    }

    const value = readLiteralValue(node);

    if (SHADOW_PROPERTIES.includes(propertyName)) {
      violations.push({
        filePath: path,
        reason: StyleViolationEnum.SHADOW_OR_ELEVATION,
        detail: `"${propertyName}" — depth comes from the card grey alone`,
      });

      return;
    }

    if (
      !isTokensFile &&
      COLOUR_PROPERTIES.test(propertyName) &&
      decideIsForbiddenColourValue(value)
    ) {
      violations.push({
        filePath: path,
        reason: StyleViolationEnum.COLOUR_LITERAL_OUTSIDE_TOKENS,
        detail: `"${propertyName}" is set to a literal — colours come from ${TOKENS_PATH}`,
      });

      return;
    }

    if (
      !isTypographyFile &&
      TYPE_PROPERTIES.includes(propertyName) &&
      decideIsHardcodedTypeValue(value)
    ) {
      violations.push({
        filePath: path,
        reason: StyleViolationEnum.HARDCODED_TYPE_STYLE,
        detail: `"${propertyName}" — type roles live in ${TYPOGRAPHY_PATH}`,
      });
    }
  });

  return violations;
};
