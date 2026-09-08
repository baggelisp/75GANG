import { createInMemoryNotificationScheduler } from '../../support/storage/inMemoryNotificationScheduler';
import { ChallengeModeEnum } from '@/domain/modes';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { expectValue } from '../../support/storage/expectResult';
import { createInMemoryBackupTransport } from '../../support/storage/inMemoryBackupTransport';
import { createInMemoryFileStore } from '../../support/storage/inMemoryFileStore';
import { createInMemoryKeyValueStore } from '../../support/storage/inMemoryKeyValueStore';

const A_PRE_MODES_CHALLENGE = JSON.stringify({
  startDate: '2026-07-10',
  totalDays: 75,
  currentStreak: 41,
  longestStreak: 41,
  status: 'active',
});

const buildOver = (seed: string) => {
  const store = createInMemoryKeyValueStore();
  store.seed(StorageKeyEnum.CHALLENGE, seed);

  return buildRepositories({
    store,
    files: createInMemoryFileStore(),
    transport: createInMemoryBackupTransport(),
    notifications: createInMemoryNotificationScheduler(),
    clock: { now: () => new Date('2026-09-07T09:00:00.000Z') },
  });
};

/**
 * A challenge written before modes existed has no mode. Rejecting it would strand the user: the
 * entry gate would send them to onboarding and the overwrite guard would refuse every attempt to
 * start, leaving an app that can neither be opened nor restarted.
 */
describe('a challenge stored before modes existed', () => {
  it('is still readable', () => {
    const repositories = buildOver(A_PRE_MODES_CHALLENGE);

    return repositories.challenge.read().then((result) => {
      expect(expectValue(result)).not.toBeNull();
    });
  });

  it('is read as Hard, the only challenge that existed when it was written', async () => {
    const repositories = buildOver(A_PRE_MODES_CHALLENGE);

    const challenge = expectValue(await repositories.challenge.read());

    expect(challenge?.mode).toBe(ChallengeModeEnum.HARD);
  });

  it('keeps the streak it had, rather than starting again', async () => {
    const repositories = buildOver(A_PRE_MODES_CHALLENGE);

    const challenge = expectValue(await repositories.challenge.read());

    expect(challenge?.currentStreak).toBe(41);
    expect(challenge?.startDate).toBe('2026-07-10');
  });

  it('still rejects a record whose mode is present but not a real challenge', async () => {
    const repositories = buildOver(
      JSON.stringify({
        startDate: '2026-07-10',
        mode: 'impossible',
        totalDays: 75,
        currentStreak: 41,
        longestStreak: 41,
        status: 'active',
      }),
    );

    expect((await repositories.challenge.read()).ok).toBe(false);
  });
});
