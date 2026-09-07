import * as ts from 'typescript';

const decideScriptKind = (filePath: string): ts.ScriptKind => {
  if (filePath.endsWith('.tsx')) {
    return ts.ScriptKind.TSX;
  }

  return ts.ScriptKind.TS;
};

export const parseModule = (filePath: string, source: string): ts.SourceFile =>
  ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, decideScriptKind(filePath));

export const forEachNode = (node: ts.Node, visit: (candidate: ts.Node) => void): void => {
  visit(node);
  node.forEachChild((child) => forEachNode(child, visit));
};
