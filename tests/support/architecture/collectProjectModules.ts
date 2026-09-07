import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

import { ModuleUnderTest } from './findViolations';

const GOVERNED_ROOTS: readonly string[] = ['src', 'app'];
const MODULE_EXTENSIONS: readonly string[] = ['.ts', '.tsx'];
const DECLARATION_SUFFIX = '.d.ts';

const decideIsModule = (fileName: string): boolean => {
  if (fileName.endsWith(DECLARATION_SUFFIX)) {
    return false;
  }

  return MODULE_EXTENSIONS.some((extension) => fileName.endsWith(extension));
};

const listDirectorySafely = (directory: string): string[] => {
  try {
    return readdirSync(directory);
  } catch {
    return [];
  }
};

const walkDirectory = (projectRoot: string, directory: string): ModuleUnderTest[] =>
  listDirectorySafely(directory).flatMap((entryName) => {
    const entryPath = join(directory, entryName);

    if (statSync(entryPath).isDirectory()) {
      return walkDirectory(projectRoot, entryPath);
    }

    if (!decideIsModule(entryName)) {
      return [];
    }

    return [
      {
        filePath: relative(projectRoot, entryPath),
        source: readFileSync(entryPath, 'utf8'),
      },
    ];
  });

export const collectProjectModules = (projectRoot: string): ModuleUnderTest[] =>
  GOVERNED_ROOTS.flatMap((root) => walkDirectory(projectRoot, join(projectRoot, root)));
