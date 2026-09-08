import { IsoTimestamp, JournalEntry } from './types';

export type JournalDraft = {
  readonly content: string;
  readonly whatWentWell: string;
  readonly whatWasDifficult: string;
  readonly tomorrowGoal: string;
};

export const EMPTY_DRAFT: JournalDraft = {
  content: '',
  whatWentWell: '',
  whatWasDifficult: '',
  tomorrowGoal: '',
};

/**
 * Whether a draft is worth keeping.
 *
 * An entry with nothing in any field is not a reflection, and storing it would put a blank record
 * in the history and in the export for every day the user merely opened the screen.
 */
export const decideDraftIsWorthSaving = (draft: JournalDraft): boolean =>
  [draft.content, draft.whatWentWell, draft.whatWasDifficult, draft.tomorrowGoal].some(
    (field) => field.trim().length > 0,
  );

/** Trimmed on the way in, so trailing whitespace never counts as an answer. */
export const buildJournalEntry = (draft: JournalDraft, createdAt: IsoTimestamp): JournalEntry => ({
  content: draft.content.trim(),
  whatWentWell: draft.whatWentWell.trim(),
  whatWasDifficult: draft.whatWasDifficult.trim(),
  tomorrowGoal: draft.tomorrowGoal.trim(),
  createdAt,
});

export const toDraft = (entry: JournalEntry | null): JournalDraft => {
  if (entry === null) {
    return EMPTY_DRAFT;
  }

  return {
    content: entry.content,
    whatWentWell: entry.whatWentWell,
    whatWasDifficult: entry.whatWasDifficult,
    tomorrowGoal: entry.tomorrowGoal,
  };
};

/** A one-line summary for the history list, from whichever field the user actually filled in. */
export const summariseEntry = (entry: JournalEntry): string => {
  const fields = [entry.content, entry.whatWentWell, entry.whatWasDifficult, entry.tomorrowGoal];

  return fields.find((field) => field.trim().length > 0) ?? '';
};
