import { join } from 'path';

import { collectProjectModules } from '../support/architecture/collectProjectModules';
import { findViolationsInModule } from '../support/architecture/findViolations';
import { LayerEnum, resolveLayer } from '../support/architecture/layers';
import { readArchitectureFixture } from '../support/architecture/readFixture';
import { ArchitectureViolationEnum } from '../support/architecture/violationReasons';

const PROJECT_ROOT = join(__dirname, '..', '..');
const DOMAIN_FILE_PATH = 'src/domain/completion.ts';

describe('resolveLayer', () => {
  it.each([
    ['src/domain/streaks.ts', LayerEnum.DOMAIN],
    ['src/storage/ports/keyValueStore.ts', LayerEnum.STORAGE_PORTS],
    ['src/storage/adapters/systemClock.ts', LayerEnum.STORAGE_ADAPTERS],
    ['src/storage/repositories/dayRepository.ts', LayerEnum.STORAGE_REPOSITORIES],
    ['src/storage/bootstrap.ts', LayerEnum.STORAGE_ROOT],
    ['src/features/today/TodayScreen.tsx', LayerEnum.FEATURES],
    ['app/(tabs)/index.tsx', LayerEnum.ROUTES],
    ['src/theme/tokens.ts', LayerEnum.UNGOVERNED],
  ])('places %s in the %s layer', (filePath, expectedLayer) => {
    expect(resolveLayer(filePath)).toBe(expectedLayer);
  });
});

describe('findViolationsInModule for the pure domain', () => {
  it('rejects a domain module importing expo-file-system', () => {
    const module = readArchitectureFixture(
      'domainImportingFileSystem.ts.fixture',
      DOMAIN_FILE_PATH,
    );

    const violations = findViolationsInModule(module);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(ArchitectureViolationEnum.FORBIDDEN_IMPORT);
  });

  it('rejects a domain module importing a storage repository', () => {
    const module = readArchitectureFixture('domainImportingStorage.ts.fixture', DOMAIN_FILE_PATH);

    const violations = findViolationsInModule(module);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(ArchitectureViolationEnum.FORBIDDEN_IMPORT);
  });

  it('rejects a domain module that reads the clock instead of taking now', () => {
    const module = readArchitectureFixture('domainCallingDateNow.ts.fixture', DOMAIN_FILE_PATH);

    const violations = findViolationsInModule(module);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(ArchitectureViolationEnum.FORBIDDEN_CLOCK_ACCESS);
  });

  it('rejects a domain module whose forbidden import is wrapped across lines by Prettier', () => {
    const module = readArchitectureFixture(
      'domainImportingFileSystemWrapped.ts.fixture',
      DOMAIN_FILE_PATH,
    );

    const violations = findViolationsInModule(module);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(ArchitectureViolationEnum.FORBIDDEN_IMPORT);
  });

  it.each([
    ['a repository', "import { dayRepository } from '../storage/repositories/dayRepository';"],
    ['a feature', "import { TodayScreen } from '../features/today/TodayScreen';"],
    ['an adapter', "import { clock } from '../storage/adapters/systemClock';"],
  ])('rejects a domain module escaping to %s through a relative path', (_description, source) => {
    const violations = findViolationsInModule({ filePath: DOMAIN_FILE_PATH, source });

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(ArchitectureViolationEnum.FORBIDDEN_IMPORT);
  });

  it('accepts a pure domain module that imports only the domain', () => {
    const module = readArchitectureFixture('legalDomainModule.ts.fixture', DOMAIN_FILE_PATH);

    expect(findViolationsInModule(module)).toEqual([]);
  });

  it('accepts a domain module importing a sibling through a relative path', () => {
    const violations = findViolationsInModule({
      filePath: DOMAIN_FILE_PATH,
      source: "import { HABITS } from './habits';",
    });

    expect(violations).toEqual([]);
  });

  it('does not mistake the words Date.now() in a comment for a clock read', () => {
    const module = readArchitectureFixture(
      'domainMentioningDateInAComment.ts.fixture',
      DOMAIN_FILE_PATH,
    );

    expect(findViolationsInModule(module)).toEqual([]);
  });
});

describe('findViolationsInModule for the layers above the domain', () => {
  it.each([
    [
      'a route importing storage',
      'app/(tabs)/index.tsx',
      "import { dayRepository } from '@/storage/repositories/dayRepository';",
    ],
    [
      'a route importing the domain directly',
      'app/(tabs)/index.tsx',
      "import { HABITS } from '@/domain/habits';",
    ],
    [
      'a feature importing an adapter',
      'src/features/today/TodayScreen.tsx',
      "import { adapter } from '@/storage/adapters/asyncStorageKeyValueStore';",
    ],
    [
      'a feature importing AsyncStorage directly',
      'src/features/today/TodayScreen.tsx',
      "import AsyncStorage from '@react-native-async-storage/async-storage';",
    ],
    [
      'a repository importing an adapter',
      'src/storage/repositories/dayRepository.ts',
      "import { adapter } from '@/storage/adapters/asyncStorageKeyValueStore';",
    ],
  ])('rejects %s', (_description, filePath, source) => {
    const violations = findViolationsInModule({ filePath, source });

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(ArchitectureViolationEnum.FORBIDDEN_IMPORT);
  });

  it('rejects an adapter importing another adapter', () => {
    const violations = findViolationsInModule({
      filePath: 'src/storage/adapters/expoFileStore.ts',
      source: "import { systemClock } from '@/storage/adapters/systemClock';",
    });

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(ArchitectureViolationEnum.FORBIDDEN_IMPORT);
  });

  it('accepts an adapter importing its own port', () => {
    const violations = findViolationsInModule({
      filePath: 'src/storage/adapters/systemClock.ts',
      source: "import { Clock } from '@/storage/ports/clock';",
    });

    expect(violations).toEqual([]);
  });

  it('accepts the root route importing the composition root', () => {
    const violations = findViolationsInModule({
      filePath: 'app/_layout.tsx',
      source: `import { bootstrap } from '@/${'storage/bootstrap'}';`,
    });

    expect(violations).toEqual([]);
  });

  it('still rejects a route importing storage past the composition root', () => {
    const violations = findViolationsInModule({
      filePath: 'app/_layout.tsx',
      source: "import { store } from '@/storage/adapters/asyncStorageKeyValueStore';",
    });

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(ArchitectureViolationEnum.FORBIDDEN_IMPORT);
  });

  it.each([
    [
      'a feature reaching an adapter through a relative path',
      'src/features/today/TodayScreen.tsx',
      "import { store } from '../../storage/adapters/asyncStorageKeyValueStore';",
    ],
    [
      'a route reaching an adapter through a relative path',
      'app/(tabs)/index.tsx',
      "import { store } from '../../src/storage/adapters/asyncStorageKeyValueStore';",
    ],
    [
      'a repository reaching an adapter through a relative path',
      'src/storage/repositories/dayRepository.ts',
      "import { store } from '../adapters/asyncStorageKeyValueStore';",
    ],
  ])('rejects %s', (_description, filePath, source) => {
    const violations = findViolationsInModule({ filePath, source });

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe(ArchitectureViolationEnum.FORBIDDEN_IMPORT);
  });

  it('accepts a feature importing the domain and a repository', () => {
    const source = [
      "import { HABITS } from '@/domain/habits';",
      "import { dayRepository } from '@/storage/repositories/dayRepository';",
      "import { Card } from '@/components/Card';",
    ].join('\n');

    const violations = findViolationsInModule({
      filePath: 'src/features/today/TodayScreen.tsx',
      source,
    });

    expect(violations).toEqual([]);
  });

  it('accepts a route importing a feature screen', () => {
    const violations = findViolationsInModule({
      filePath: 'app/(tabs)/index.tsx',
      source: "import { TodayScreen } from '@/features/today/TodayScreen';",
    });

    expect(violations).toEqual([]);
  });
});

describe('the project as it stands', () => {
  it('has no architecture violations under src/ and app/', () => {
    const violations = collectProjectModules(PROJECT_ROOT).flatMap(findViolationsInModule);

    expect(violations).toEqual([]);
  });
});
