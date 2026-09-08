import { posix } from 'path';

import { ImportTarget } from './resolveImportTarget';
import { Layer, LayerEnum } from './layers';

/**
 * The single module a route is permitted to import from `src/storage`. `architecture.md` puts the
 * composition root in `app/_layout.tsx`, so the route layer needs exactly this one door and no
 * other.
 */
export const COMPOSITION_ROOT_PATH = 'src/storage/bootstrap';

export type ImportRule = {
  readonly describe: string;
  readonly isViolated: (target: ImportTarget, importingFilePath: string) => boolean;
};

const startsWithAny = (path: string, prefixes: readonly string[]): boolean =>
  prefixes.some((prefix) => path.startsWith(prefix));

const denyPaths = (describe: string, prefixes: readonly string[]): ImportRule => ({
  describe,
  isViolated: ({ resolvedPath }) => {
    if (resolvedPath === null) {
      return false;
    }

    return startsWithAny(resolvedPath, prefixes);
  },
});

const denyPackages = (describe: string, prefixes: readonly string[]): ImportRule => ({
  describe,
  isViolated: ({ specifier, resolvedPath }) => {
    if (resolvedPath !== null) {
      return false;
    }

    return startsWithAny(specifier, prefixes);
  },
});

const allowOnlyPaths = (describe: string, prefixes: readonly string[]): ImportRule => ({
  describe,
  isViolated: ({ resolvedPath }) => {
    if (resolvedPath === null) {
      return true;
    }

    return !startsWithAny(resolvedPath, prefixes);
  },
});

const ROUTE_MAY_ONLY_REACH_THE_COMPOSITION_ROOT: ImportRule = {
  describe: `a route may import storage only through ${COMPOSITION_ROOT_PATH}`,
  isViolated: ({ resolvedPath }) => {
    if (resolvedPath === null) {
      return false;
    }

    if (!resolvedPath.startsWith('src/storage/')) {
      return false;
    }

    return resolvedPath !== COMPOSITION_ROOT_PATH;
  },
};

const ADAPTER_MAY_NOT_IMPORT_ANOTHER_ADAPTER: ImportRule = {
  describe: 'an adapter may not import another adapter',
  isViolated: ({ resolvedPath }, importingFilePath) => {
    if (resolvedPath === null) {
      return false;
    }

    if (!resolvedPath.startsWith('src/storage/adapters/')) {
      return false;
    }

    const importingWithoutExtension = importingFilePath.replace(/\.tsx?$/, '');

    return resolvedPath !== importingWithoutExtension;
  },
};

const DOMAIN_MAY_ONLY_IMPORT_ITSELF = allowOnlyPaths('src/domain may import only src/domain', [
  'src/domain/',
]);

const PORTS_MAY_ONLY_IMPORT_DOMAIN_OR_PORTS = allowOnlyPaths(
  'src/storage/ports may import only src/domain types and its sibling ports',
  ['src/domain/', 'src/storage/ports/'],
);

/**
 * A shared component is leaf UI: it may reach for React, React Native and a rendering library,
 * plus the domain and the theme, but never for persistence or a feature.
 */
const COMPONENTS_MAY_NOT_REACH_STORAGE_OR_FEATURES: readonly ImportRule[] = [
  denyPaths('a shared component may not import storage', ['src/storage/']),
  denyPaths('a shared component may not import a feature', ['src/features/']),
  denyPackages('a shared component may not import device storage directly', [
    '@react-native-async-storage/',
    'expo-file-system',
  ]),
];

const RULES_BY_LAYER: Readonly<Record<Layer, readonly ImportRule[]>> = {
  [LayerEnum.DOMAIN]: [DOMAIN_MAY_ONLY_IMPORT_ITSELF],
  [LayerEnum.STORAGE_PORTS]: [PORTS_MAY_ONLY_IMPORT_DOMAIN_OR_PORTS],
  [LayerEnum.STORAGE_ADAPTERS]: [
    ADAPTER_MAY_NOT_IMPORT_ANOTHER_ADAPTER,
    denyPaths('an adapter may not import a feature', ['src/features/']),
    denyPaths('an adapter may not import a repository', ['src/storage/repositories/']),
  ],
  [LayerEnum.STORAGE_REPOSITORIES]: [
    denyPaths('a repository may not import an adapter', ['src/storage/adapters/']),
    denyPaths('a repository may not import a feature', ['src/features/']),
  ],
  [LayerEnum.STORAGE_ROOT]: [denyPaths('storage may not import a feature', ['src/features/'])],
  [LayerEnum.COMPONENTS]: COMPONENTS_MAY_NOT_REACH_STORAGE_OR_FEATURES,
  [LayerEnum.FEATURES]: [
    denyPaths('a feature may not import an adapter', ['src/storage/adapters/']),
    denyPackages('a feature may not import device storage directly', [
      '@react-native-async-storage/',
      'expo-file-system',
    ]),
  ],
  [LayerEnum.ROUTES]: [
    ROUTE_MAY_ONLY_REACH_THE_COMPOSITION_ROOT,
    denyPaths('a route may not import the domain directly', ['src/domain/']),
  ],
  [LayerEnum.UNGOVERNED]: [],
};

export const resolveRulesForLayer = (layer: Layer): readonly ImportRule[] => RULES_BY_LAYER[layer];

export const normaliseProjectPath = (filePath: string): string => posix.normalize(filePath);
