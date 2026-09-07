import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

import { ModuleUnderTest } from './findViolations';

const GOVERNED_ROOTS: readonly string[] = ['src', 'app'];

/** Roots scanned for device-library imports, which are banned in tests as well as in src. */
export const DEVICE_LIBRARY_ROOTS: readonly string[] = ['src', 'app', 'tests'];
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

export const collectModulesUnder = (
  projectRoot: string,
  roots: readonly string[],
): ModuleUnderTest[] =>
  roots.flatMap((root) => walkDirectory(projectRoot, join(projectRoot, root)));

export const collectProjectModules = (projectRoot: string): ModuleUnderTest[] =>
  collectModulesUnder(projectRoot, GOVERNED_ROOTS);
