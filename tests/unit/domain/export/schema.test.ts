import {
  APP_ID,
  buildBackupFileName,
  buildExportEnvelope,
  SCHEMA_VERSION,
} from '@/domain/export/schema';
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

const buildFull = () =>
  buildExportEnvelope({
    profile: { name: 'Vangelis', createdAt: '2026-07-01T08:00:00.000Z' },
    challenge: CHALLENGE,
    days: { '2026-07-10': A_DAY },
    journal: { '2026-07-10': AN_ENTRY },
    settings: DEFAULT_SETTINGS,
    exportedAt: '2026-09-08T22:30:00.000Z',
  });

describe('the export envelope', () => {
  it('is stamped with the app and the schema version, so an import can recognise it', () => {
    const envelope = buildFull();

    expect(envelope.app).toBe(APP_ID);
    expect(envelope.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('records when it was exported', () => {
    expect(buildFull().exportedAt).toBe('2026-09-08T22:30:00.000Z');
  });

  it('carries exactly the five storage keys and the three header fields, and nothing else', () => {
    expect(Object.keys(buildFull()).sort()).toEqual([
      'app',
      'challenge',
      'days',
      'exportedAt',
      'journal',
      'profile',
      'schemaVersion',
      'settings',
    ]);
  });

  it('keeps the day records exactly as they are stored', () => {
    expect(buildFull().days).toEqual({ '2026-07-10': A_DAY });
  });

  it('carries a null for a key that has never been written, rather than dropping it', () => {
    const envelope = buildExportEnvelope({
      profile: null,
      challenge: null,
      days: null,
      journal: null,
      settings: null,
      exportedAt: '2026-09-08T22:30:00.000Z',
    });

    expect(envelope.profile).toBeNull();
    expect(envelope.challenge).toBeNull();
    expect(envelope.days).toEqual({});
    expect(envelope.journal).toEqual({});
    expect(envelope.settings).toBeNull();
  });
});

describe('the backup filename', () => {
  it('is the date the export was taken', () => {
    expect(buildBackupFileName('2026-09-08')).toBe('75gang-backup-2026-09-08.json');
  });
});
