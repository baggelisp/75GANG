import { readFileSync } from 'fs';
import { join } from 'path';

import { ModuleUnderTest } from './findViolations';

const FIXTURE_DIRECTORY = join(__dirname, '..', '..', 'fixtures', 'architecture');

export const readArchitectureFixture = (
  fixtureName: string,
  pretendFilePath: string,
): ModuleUnderTest => ({
  filePath: pretendFilePath,
  source: readFileSync(join(FIXTURE_DIRECTORY, fixtureName), 'utf8'),
});
