import * as ts from 'typescript';

import { extractImportSpecifiers } from './extractImportSpecifiers';
import { resolveRulesForLayer } from './importRules';
import { LayerEnum, resolveLayer } from './layers';
import { forEachNode, parseModule } from './parseModule';
import { resolveImportTarget } from './resolveImportTarget';
import { ArchitectureViolation, ArchitectureViolationEnum } from './violationReasons';

const decideNodeReadsTheClock = (node: ts.Node): boolean => {
  if (ts.isNewExpression(node)) {
    return ts.isIdentifier(node.expression) && node.expression.text === 'Date';
  }

  if (ts.isPropertyAccessExpression(node)) {
    return (
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'Date' &&
      node.name.text === 'now'
    );
  }

  return false;
};

const findClockViolation = (filePath: string, source: string): ArchitectureViolation | null => {
  if (resolveLayer(filePath) !== LayerEnum.DOMAIN) {
    return null;
  }

  let readsTheClock = false;

  forEachNode(parseModule(filePath, source), (node) => {
    if (decideNodeReadsTheClock(node)) {
      readsTheClock = true;
    }
  });

  if (!readsTheClock) {
    return null;
  }

  return {
    filePath,
    reason: ArchitectureViolationEnum.FORBIDDEN_CLOCK_ACCESS,
    detail: 'the domain must take `now` as an argument instead of reading the clock',
  };
};

const findImportViolations = (filePath: string, source: string): ArchitectureViolation[] => {
  const rules = resolveRulesForLayer(resolveLayer(filePath));

  if (rules.length === 0) {
    return [];
  }

  return extractImportSpecifiers(filePath, source).flatMap((specifier) => {
    const target = resolveImportTarget(filePath, specifier);
    const broken = rules.find((rule) => rule.isViolated(target, filePath));

    if (!broken) {
      return [];
    }

    return [
      {
        filePath,
        reason: ArchitectureViolationEnum.FORBIDDEN_IMPORT,
        detail: `${broken.describe} — found "${specifier}"`,
      },
    ];
  });
};

export type ModuleUnderTest = {
  readonly filePath: string;
  readonly source: string;
};

export const findViolationsInModule = ({
  filePath,
  source,
}: ModuleUnderTest): ArchitectureViolation[] => {
  const clockViolation = findClockViolation(filePath, source);
  const importViolations = findImportViolations(filePath, source);

  if (!clockViolation) {
    return importViolations;
  }

  return [...importViolations, clockViolation];
};
