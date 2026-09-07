import { join } from 'path';

import {
  collectModulesUnder,
  DEVICE_LIBRARY_ROOTS,
} from '../../support/architecture/collectProjectModules';
import { extractImportSpecifiers } from '../../support/architecture/extractImportSpecifiers';

const PROJECT_ROOT = join(__dirname, '..', '..', '..');

const findImportersOf = (packagePrefix: string): string[] =>
  collectModulesUnder(PROJECT_ROOT, DEVICE_LIBRARY_ROOTS)
    .filter((module) =>
      extractImportSpecifiers(module.filePath, module.source).some((specifier) =>
        specifier.startsWith(packagePrefix),
      ),
    )
    .map((module) => module.filePath)
    .sort();

describe('device libraries have exactly one importer, in src and in tests alike', () => {
  it.each([
    [
      '@react-native-async-storage/async-storage',
      'src/storage/adapters/asyncStorageKeyValueStore.ts',
    ],
    ['expo-file-system', 'src/storage/adapters/expoFileStore.ts'],
  ])('only %s is imported by %s', (packagePrefix, expectedImporter) => {
    expect(findImportersOf(packagePrefix)).toEqual([expectedImporter]);
  });

  it('keeps the swap to MMKV a one-adapter change, as the spec anticipates', () => {
    expect(findImportersOf('@react-native-async-storage/')).toHaveLength(1);
  });
});
