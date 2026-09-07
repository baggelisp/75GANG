import { posix } from 'path';

const ALIAS_PREFIX = '@/';
const ALIAS_ROOT = 'src';

export type ImportTarget = {
  /** The specifier exactly as written. */
  readonly specifier: string;
  /** Project-relative path for an in-repo import, or null for an external package. */
  readonly resolvedPath: string | null;
};

const decideIsRelative = (specifier: string): boolean => specifier.startsWith('.');

const resolveRelative = (importingFilePath: string, specifier: string): string =>
  posix.normalize(posix.join(posix.dirname(importingFilePath), specifier));

export const resolveImportTarget = (importingFilePath: string, specifier: string): ImportTarget => {
  const normalisedFilePath = importingFilePath.replace(/\\/g, '/');

  if (specifier.startsWith(ALIAS_PREFIX)) {
    return {
      specifier,
      resolvedPath: `${ALIAS_ROOT}/${specifier.slice(ALIAS_PREFIX.length)}`,
    };
  }

  if (decideIsRelative(specifier)) {
    return { specifier, resolvedPath: resolveRelative(normalisedFilePath, specifier) };
  }

  return { specifier, resolvedPath: null };
};
