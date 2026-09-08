import { CHALLENGE_LENGTH_DAYS } from '@/domain/challenge';
import { ChallengeMode } from '@/domain/modes';
import { ChallengeStatusEnum, IsoDate } from '@/domain/types';
import { PHOTO_DIRECTORY } from '@/storage/photoPaths';
import { Repositories } from '@/storage/repositories/buildRepositories';

/**
 * Clears the challenge, the day records, the journal and the photos.
 *
 * The profile and the settings survive on purpose: the spec says so, and someone starting again
 * should not have to give their name and set their reminders a second time. The backups directory
 * survives too — it exists to outlive exactly this.
 */
export const resetChallenge = async (repositories: Repositories): Promise<void> => {
  await repositories.challenge.clear();
  await repositories.days.clear();
  await repositories.journal.clear();
  await repositories.files.removeDirectory(PHOTO_DIRECTORY).catch(() => undefined);
};

/**
 * Starts a fresh challenge from a new date.
 *
 * The new challenge is written **first**, and the old days, journal and photos are cleared only
 * once that write succeeded. Clearing first would mean a failed write left the user with nothing
 * at all — no challenge, no history, and no way back. This order costs nothing and makes a
 * failure a no-op.
 */
export const restartChallenge = async (
  repositories: Repositories,
  startDate: IsoDate,
  mode: ChallengeMode,
): Promise<boolean> => {
  const written = await repositories.challenge.write({
    startDate,
    mode,
    totalDays: CHALLENGE_LENGTH_DAYS,
    currentStreak: 0,
    longestStreak: 0,
    status: ChallengeStatusEnum.ACTIVE,
  });

  if (!written.ok) {
    return false;
  }

  await repositories.days.clear();
  await repositories.journal.clear();
  await repositories.files.removeDirectory(PHOTO_DIRECTORY).catch(() => undefined);

  return true;
};
