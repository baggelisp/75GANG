import * as ts from 'typescript';

import { forEachNode, parseModule } from './parseModule';

const DYNAMIC_IMPORT_CALLEES: readonly string[] = ['require'];

const readStringLiteral = (node: ts.Node | undefined): string | null => {
  if (!node) {
    return null;
  }

  if (!ts.isStringLiteralLike(node)) {
    return null;
  }

  return node.text;
};

const readCallSpecifier = (node: ts.CallExpression): string | null => {
  const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
  const isRequireCall =
    ts.isIdentifier(node.expression) && DYNAMIC_IMPORT_CALLEES.includes(node.expression.text);

  if (!isDynamicImport && !isRequireCall) {
    return null;
  }

  return readStringLiteral(node.arguments[0]);
};

const readSpecifier = (node: ts.Node): string | null => {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
    return readStringLiteral(node.moduleSpecifier);
  }

  if (ts.isCallExpression(node)) {
    return readCallSpecifier(node);
  }

  return null;
};

/**
 * Parses the module with the TypeScript compiler rather than matching text, so a specifier is
 * found whatever shape Prettier leaves the import in, and a specifier written inside a comment
 * or a string is never mistaken for one.
 */
export const extractImportSpecifiers = (filePath: string, source: string): string[] => {
  const found: string[] = [];

  forEachNode(parseModule(filePath, source), (node) => {
    const specifier = readSpecifier(node);

    if (specifier) {
      found.push(specifier);
    }
  });

  return Array.from(new Set(found));
};
