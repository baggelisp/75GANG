import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { StartErrorEnum, useStartChallenge } from '@/features/onboarding/_hooks/useStartChallenge';
import { Repositories } from '@/storage/repositories/buildRepositories';
import { buildRepositories } from '@/storage/repositories/buildRepositories';
import { RepositoryProvider } from '@/storage/repositoryContext';
import { StorageKeyEnum } from '@/storage/storageKeys';

import { createInMemoryFileStore } from '../../../support/storage/inMemoryFileStore';
import {
  createInMemoryKeyValueStore,
  InMemoryKeyValueStore,
} from '../../../support/storage/inMemoryKeyValueStore';

const TODAY = '2026-09-07';
const NOW = new Date('2026-09-07T09:00:00.000Z');

type Harness = {
  store: InMemoryKeyValueStore;
  repositories: Repositories;
  start: (name: string, startDate: string) => Promise<void>;
  readError: () => string | null;
};

const renderHook = (): Harness => {
  const store = createInMemoryKeyValueStore();
  const repositories = buildRepositories({
    store,
    files: createInMemoryFileStore(),
    clock: { now: () => NOW },
  });

  const captured: { start: Harness['start'] | null; error: string | null } = {
    start: null,
    error: null,
  };

  const Probe = () => {
    const { startChallenge, error } = useStartChallenge();

    captured.start = async (name, startDate) => {
      await startChallenge({ name, startDate, today: TODAY });
    };
    captured.error = error;

    return <Text>probe</Text>;
  };

  render(
    <RepositoryProvider repositories={repositories}>
      <Probe />
    </RepositoryProvider>,
  );

  return {
    store,
    repositories,
    start: async (name, startDate) => {
      await act(async () => {
        await captured.start?.(name, startDate);
      });
    },
    readError: () => captured.error,
  };
};

describe('starting a challenge', () => {
  it('writes both the profile and the challenge before it reports success', async () => {
    const harness = renderHook();

    await harness.start('Vangelis', TODAY);

    const written = harness.store.snapshot();

    expect(written[StorageKeyEnum.PROFILE]).toBeDefined();
    expect(written[StorageKeyEnum.CHALLENGE]).toBeDefined();
  });

  it('stores the start date the user chose, so day one is their day one', async () => {
    const harness = renderHook();

    await harness.start('Vangelis', '2026-09-01');

    const challenge = await harness.repositories.challenge.read();

    expect(challenge.ok && challenge.value?.startDate).toBe('2026-09-01');
  });

  it('starts the challenge at a streak of zero', async () => {
    const harness = renderHook();

    await harness.start('Vangelis', TODAY);

    const challenge = await harness.repositories.challenge.read();

    expect(challenge.ok && challenge.value?.currentStreak).toBe(0);
    expect(challenge.ok && challenge.value?.longestStreak).toBe(0);
  });

  it('treats the name as genuinely optional, storing null rather than an empty string', async () => {
    const harness = renderHook();

    await harness.start('   ', TODAY);

    const profile = await harness.repositories.profile.read();

    expect(profile.ok && profile.value?.name).toBeNull();
  });

  it('trims a name before storing it', async () => {
    const harness = renderHook();

    await harness.start('  Vangelis  ', TODAY);

    const profile = await harness.repositories.profile.read();

    expect(profile.ok && profile.value?.name).toBe('Vangelis');
  });

  it('rejects a start date in the future and writes nothing at all', async () => {
    const harness = renderHook();

    await harness.start('Vangelis', '2026-09-10');

    await waitFor(() => {
      expect(harness.readError()).toBe(StartErrorEnum.START_DATE_IN_FUTURE);
    });
    expect(harness.store.snapshot()).toEqual({});
  });

  it('accepts a start date in the past, for someone already mid-challenge', async () => {
    const harness = renderHook();

    await harness.start('Vangelis', '2026-08-27');

    const challenge = await harness.repositories.challenge.read();

    expect(challenge.ok && challenge.value?.startDate).toBe('2026-08-27');
  });
});
