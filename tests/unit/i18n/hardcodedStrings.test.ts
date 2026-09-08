import { join } from 'path';

import { collectProjectModules } from '../../support/architecture/collectProjectModules';
import { findHardcodedStrings } from '../../support/i18n/hardcodedStrings';

const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const A_COMPONENT = 'src/features/today/TodayScreen.tsx';

describe('findHardcodedStrings', () => {
  it('rejects a sentence written straight into JSX', () => {
    const source = 'const C = () => <Text>You have completed 7 of 11 habits</Text>;';

    expect(findHardcodedStrings(A_COMPONENT, source)).toHaveLength(1);
  });

  it('rejects a sentence passed as a JSX string expression', () => {
    const source = "const C = () => <Text>{'Finish strong today'}</Text>;";

    expect(findHardcodedStrings(A_COMPONENT, source)).toHaveLength(1);
  });

  it('accepts text that came through the translation layer', () => {
    const source = "const C = () => <Text>{t('today.sectionRules')}</Text>;";

    expect(findHardcodedStrings(A_COMPONENT, source)).toEqual([]);
  });

  it('ignores a style value, which is not copy', () => {
    const source = "const styles = { row: { justifyContent: 'space between' } };";

    expect(findHardcodedStrings(A_COMPONENT, source)).toEqual([]);
  });

  it('ignores a single word, which is almost always an identifier rather than a sentence', () => {
    const source = 'const C = () => <Text>{icon}</Text>;';

    expect(findHardcodedStrings(A_COMPONENT, source)).toEqual([]);
  });
});

describe('the project as it stands', () => {
  it('has no user-facing string written outside the translation layer', () => {
    const offenders = collectProjectModules(PROJECT_ROOT).flatMap((module) =>
      findHardcodedStrings(module.filePath, module.source),
    );

    expect(offenders).toEqual([]);
  });
});
