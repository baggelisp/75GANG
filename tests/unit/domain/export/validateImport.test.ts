import { APP_ID, SCHEMA_VERSION } from '@/domain/export/schema';
import { ImportRejectionEnum, validateImport } from '@/domain/export/validateImport';
import { ChallengeModeEnum } from '@/domain/modes';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { ChallengeStatusEnum } from '@/domain/types';

const CHALLENGE = {
  startDate: '2026-07-10',
  mode: ChallengeModeEnum.HARD,
  totalDays: 75,
  currentStreak: 6,
  longestStreak: 9,
  status: ChallengeStatusEnum.ACTIVE,
};

const A_DAY = {
  habits: { water: { completed: true } },
  completedHabits: 1,
  totalHabits: 11,
  completionPercentage: 9,
  perfectDay: false,
  updatedAt: '2026-07-10T20:00:00.000Z',
};

const AN_ENTRY = {
  content: 'a hard day',
  whatWentWell: 'water',
  whatWasDifficult: 'the workouts',
  tomorrowGoal: 'sleep earlier',
  createdAt: '2026-07-10T21:00:00.000Z',
};

const buildFile = (overrides: Record<string, unknown> = {}): string =>
  JSON.stringify({
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: '2026-09-08T22:30:00.000Z',
    profile: { name: 'Vangelis', createdAt: '2026-07-01T08:00:00.000Z' },
    challenge: CHALLENGE,
    days: { '2026-07-10': A_DAY },
    journal: { '2026-07-10': AN_ENTRY },
    settings: DEFAULT_SETTINGS,
    ...overrides,
  });

const expectRejection = (raw: string, reason: string) => {
  const result = validateImport(raw);

  expect(result.ok).toBe(false);
  expect(result.ok ? null : result.reason).toBe(reason);
};

describe('a good backup file', () => {
  it('is accepted', () => {
    expect(validateImport(buildFile()).ok).toBe(true);
  });

  it('carries every one of the five keys through unchanged', () => {
    const result = validateImport(buildFile());

    expect(result.ok && result.value).toEqual({
      profile: { name: 'Vangelis', createdAt: '2026-07-01T08:00:00.000Z' },
      challenge: CHALLENGE,
      days: { '2026-07-10': A_DAY },
      journal: { '2026-07-10': AN_ENTRY },
      settings: DEFAULT_SETTINGS,
    });
  });

  it('is accepted when it is older than this build', () => {
    expect(validateImport(buildFile({ schemaVersion: SCHEMA_VERSION - 1 })).ok).toBe(true);
  });

  it('keeps working when it carries fields this build has never heard of', () => {
    const result = validateImport(buildFile({ achievements: ['halfway'], mood: 7 }));

    expect(result.ok).toBe(true);
    expect(result.ok && Object.keys(result.value).sort()).toEqual([
      'challenge',
      'days',
      'journal',
      'profile',
      'settings',
    ]);
  });

  it('accepts a challenge exported before challenges had a mode, as Hard', () => {
    const preModes = { ...CHALLENGE, mode: undefined };
    const result = validateImport(buildFile({ challenge: preModes }));

    expect(result.ok && result.value.challenge.mode).toBe(ChallengeModeEnum.HARD);
  });
});

describe('a file that is not valid JSON', () => {
  it.each(['', 'not json at all', '{"app":', '[1, 2, 3'])('is rejected: %s', (raw) => {
    expectRejection(raw, ImportRejectionEnum.NOT_JSON);
  });
});

describe('a file that is not a 75 G-ANG backup', () => {
  it('is rejected when the app field is something else', () => {
    expectRejection(buildFile({ app: 'someotherapp' }), ImportRejectionEnum.NOT_A_BACKUP);
  });

  it('is rejected when the app field is missing', () => {
    expectRejection(buildFile({ app: undefined }), ImportRejectionEnum.NOT_A_BACKUP);
  });

  it('is rejected when it is valid JSON but not an object', () => {
    expectRejection('[1, 2, 3]', ImportRejectionEnum.NOT_A_BACKUP);
    expectRejection('"75gang"', ImportRejectionEnum.NOT_A_BACKUP);
    expectRejection('null', ImportRejectionEnum.NOT_A_BACKUP);
  });

  it('is rejected when it carries no schema version to check', () => {
    expectRejection(buildFile({ schemaVersion: undefined }), ImportRejectionEnum.NOT_A_BACKUP);
    expectRejection(buildFile({ schemaVersion: 'one' }), ImportRejectionEnum.NOT_A_BACKUP);
  });
});

describe('a file from a newer version of the app', () => {
  it('is rejected rather than half understood', () => {
    expectRejection(
      buildFile({ schemaVersion: SCHEMA_VERSION + 1 }),
      ImportRejectionEnum.SCHEMA_TOO_NEW,
    );
  });
});

describe('a file whose challenge cannot be trusted', () => {
  it('is rejected when the challenge is missing', () => {
    expectRejection(buildFile({ challenge: undefined }), ImportRejectionEnum.CHALLENGE_INVALID);
  });

  it('is rejected when the challenge is null', () => {
    expectRejection(buildFile({ challenge: null }), ImportRejectionEnum.CHALLENGE_INVALID);
  });

  it('is rejected when the start date is missing', () => {
    expectRejection(
      buildFile({ challenge: { ...CHALLENGE, startDate: undefined } }),
      ImportRejectionEnum.CHALLENGE_INVALID,
    );
  });

  it.each(['2026-02-30', 'yesterday', '10/07/2026', '2026-7-10', ''])(
    'is rejected when the start date is %s',
    (startDate) => {
      expectRejection(
        buildFile({ challenge: { ...CHALLENGE, startDate } }),
        ImportRejectionEnum.CHALLENGE_INVALID,
      );
    },
  );
});

describe('the parts of a file that are merely damaged', () => {
  it('drops a single unreadable day rather than rejecting the whole backup', () => {
    const result = validateImport(
      buildFile({ days: { '2026-07-10': A_DAY, '2026-07-11': { habits: 'broken' } } }),
    );

    expect(result.ok && Object.keys(result.value.days)).toEqual(['2026-07-10']);
  });

  it('drops a journal entry that is not an entry', () => {
    const result = validateImport(
      buildFile({ journal: { '2026-07-10': AN_ENTRY, '2026-07-11': 42 } }),
    );

    expect(result.ok && Object.keys(result.value.journal)).toEqual(['2026-07-10']);
  });

  it('drops a profile it cannot read rather than importing a broken one', () => {
    const result = validateImport(buildFile({ profile: { name: 7 } }));

    expect(result.ok && result.value.profile).toBeNull();
  });

  it('drops settings it cannot read, so the defaults apply instead', () => {
    const result = validateImport(buildFile({ settings: { darkMode: 'yes' } }));

    expect(result.ok && result.value.settings).toBeNull();
  });
});
