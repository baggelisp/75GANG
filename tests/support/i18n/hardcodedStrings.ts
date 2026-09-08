import * as ts from 'typescript';

import { forEachNode, parseModule } from '../architecture/parseModule';

export type HardcodedString = {
  readonly filePath: string;
  readonly text: string;
};

/**
 * Text that is not copy: a single word with no spaces is almost always an identifier, an icon
 * name or a token, while a sentence rendered to the user is not.
 */
const decideLooksLikeCopy = (text: string): boolean => {
  const trimmed = text.trim();

  if (trimmed.length < MINIMUM_COPY_LENGTH) {
    return false;
  }

  if (!trimmed.includes(' ')) {
    return false;
  }

  return /[a-zA-Z]/.test(trimmed);
};

const MINIMUM_COPY_LENGTH = 3;

const readJsxText = (node: ts.Node): string | null => {
  if (ts.isJsxText(node)) {
    return node.text;
  }

  if (!ts.isJsxExpression(node)) {
    return null;
  }

  if (node.expression && ts.isStringLiteralLike(node.expression)) {
    return node.expression.text;
  }

  return null;
};

/**
 * Finds user-facing text written directly into a component instead of coming through the
 * translation layer. Only JSX children and a few text-bearing props are inspected, so a style
 * value or an accessibility role is never mistaken for copy.
 */
export const findHardcodedStrings = (filePath: string, source: string): HardcodedString[] => {
  const found: HardcodedString[] = [];

  forEachNode(parseModule(filePath, source), (node) => {
    if (!ts.isJsxElement(node) && !ts.isJsxFragment(node)) {
      return;
    }

    node.children.forEach((child) => {
      const text = readJsxText(child);

      if (text !== null && decideLooksLikeCopy(text)) {
        found.push({ filePath, text: text.trim() });
      }
    });
  });

  return found;
};
