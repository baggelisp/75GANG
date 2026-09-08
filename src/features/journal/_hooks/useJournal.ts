import { useCallback, useEffect, useState } from 'react';

import {
  buildJournalEntry,
  decideDraftIsWorthSaving,
  EMPTY_DRAFT,
  JournalDraft,
  toDraft,
} from '@/domain/journal';
import { JournalEntriesByDate } from '@/domain/types';
import { useRepositories } from '@/storage/repositoryContext';
import { toLocalIsoDate } from '@/utils/DateUtility';

export const JournalStatusEnum = {
  LOADING: 'LOADING',
  READY: 'READY',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type JournalStatus = (typeof JournalStatusEnum)[keyof typeof JournalStatusEnum];

export type JournalView = {
  status: JournalStatus;
  today: string;
  draft: JournalDraft;
  history: JournalEntriesByDate;
  isSaved: boolean;
  saveFailed: boolean;
};

/**
 * Today's reflection and every one before it.
 *
 * An entry with nothing in it is never written: the screen simply has nothing to save, rather than
 * putting a blank record in the history and the export for every day the user opened it.
 */
export const useJournal = () => {
  const repositories = useRepositories();
  const [view, setView] = useState<JournalView>({
    status: JournalStatusEnum.LOADING,
    today: toLocalIsoDate(repositories.clock.now()),
    draft: EMPTY_DRAFT,
    history: {},
    isSaved: false,
    saveFailed: false,
  });

  const load = useCallback(async () => {
    const today = toLocalIsoDate(repositories.clock.now());
    const result = await repositories.journal.readAll();

    if (!result.ok) {
      setView((current) => ({ ...current, status: JournalStatusEnum.UNAVAILABLE }));

      return;
    }

    const history = result.value ?? {};

    setView({
      status: JournalStatusEnum.READY,
      today,
      draft: toDraft(history[today] ?? null),
      history,
      isSaved: history[today] !== undefined,
      saveFailed: false,
    });
  }, [repositories]);

  useEffect(() => {
    load();
  }, [load]);

  const changeField = (field: keyof JournalDraft, text: string) => {
    setView((current) => ({
      ...current,
      draft: { ...current.draft, [field]: text },
      isSaved: false,
    }));
  };

  const save = async (): Promise<boolean> => {
    if (!decideDraftIsWorthSaving(view.draft)) {
      return false;
    }

    const now = repositories.clock.now();
    const date = toLocalIsoDate(now);
    const entry = buildJournalEntry(view.draft, now.toISOString());
    const written = await repositories.journal.save(date, entry).catch(() => ({ ok: false }));

    if (!written.ok) {
      setView((current) => ({ ...current, saveFailed: true, isSaved: false }));

      return false;
    }

    setView((current) => ({
      ...current,
      history: { ...current.history, [date]: entry },
      isSaved: true,
      saveFailed: false,
    }));

    return true;
  };

  return { ...view, changeField, save, refresh: load };
};
