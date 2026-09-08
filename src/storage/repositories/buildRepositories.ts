import { BackupTransport } from '@/storage/ports/backupTransport';
import { Clock } from '@/storage/ports/clock';
import { FileStore } from '@/storage/ports/fileStore';
import { KeyValueStore } from '@/storage/ports/keyValueStore';
import { NotificationScheduler } from '@/storage/ports/notificationScheduler';

import { BackupRepository, createBackupRepository } from './backupRepository';
import { ChallengeRepository, createChallengeRepository } from './challengeRepository';
import { createDayRepository, DayRepository } from './dayRepository';
import { createJournalRepository, JournalRepository } from './journalRepository';
import { createProfileRepository, ProfileRepository } from './profileRepository';
import { createSettingsRepository, SettingsRepository } from './settingsRepository';

export type Repositories = {
  profile: ProfileRepository;
  challenge: ChallengeRepository;
  days: DayRepository;
  journal: JournalRepository;
  settings: SettingsRepository;
  backups: BackupRepository;
  files: FileStore;
  transport: BackupTransport;
  notifications: NotificationScheduler;
  clock: Clock;
};

export type BuildRepositoriesConfig = {
  store: KeyValueStore;
  files: FileStore;
  transport: BackupTransport;
  notifications: NotificationScheduler;
  clock: Clock;
};

/**
 * Wires the repository set over whatever adapters it is handed, importing only ports. Tests hand
 * it an in-memory store; `bootstrap.ts` hands it the real ones. Keeping this separate from the
 * composition root is what lets a unit test build the whole persistence layer without loading
 * AsyncStorage.
 */
export const buildRepositories = ({
  store,
  files,
  transport,
  notifications,
  clock,
}: BuildRepositoriesConfig): Repositories => ({
  profile: createProfileRepository(store),
  challenge: createChallengeRepository(store),
  days: createDayRepository(store),
  journal: createJournalRepository(store),
  settings: createSettingsRepository(store),
  backups: createBackupRepository(store),
  files,
  transport,
  notifications,
  clock,
});
