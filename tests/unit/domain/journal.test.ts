import {
  buildJournalEntry,
  decideDraftIsWorthSaving,
  EMPTY_DRAFT,
  JournalDraft,
  summariseEntry,
  toDraft,
} from '@/domain/journal';
import { JournalEntry } from '@/domain/types';

const NOW = '2026-09-08T22:00:00.000Z';

const draftWith = (fields: Partial<JournalDraft>): JournalDraft => ({ ...EMPTY_DRAFT, ...fields });

describe('decideDraftIsWorthSaving', () => {
  it('refuses an entry with nothing in it', () => {
    expect(decideDraftIsWorthSaving(EMPTY_DRAFT)).toBe(false);
  });

  it('refuses an entry that is only whitespace', () => {
    expect(decideDraftIsWorthSaving(draftWith({ content: '   \n  ' }))).toBe(false);
  });

  it.each(['content', 'whatWentWell', 'whatWasDifficult', 'tomorrowGoal'] as const)(
    'keeps an entry where only %s was filled in',
    (field) => {
      expect(decideDraftIsWorthSaving(draftWith({ [field]: 'something' }))).toBe(true);
    },
  );
});

describe('buildJournalEntry', () => {
  it('trims every field, so trailing whitespace is not an answer', () => {
    const entry = buildJournalEntry(
      draftWith({ content: '  hard day  ', whatWentWell: '\nwater\n' }),
      NOW,
    );

    expect(entry.content).toBe('hard day');
    expect(entry.whatWentWell).toBe('water');
  });

  it('stamps when it was written', () => {
    expect(buildJournalEntry(draftWith({ content: 'x' }), NOW).createdAt).toBe(NOW);
  });

  it('keeps a very long entry rather than truncating what someone wrote', () => {
    const long = 'a'.repeat(20000);

    expect(buildJournalEntry(draftWith({ content: long }), NOW).content).toHaveLength(20000);
  });
});

describe('toDraft', () => {
  it('starts empty when there is no entry yet', () => {
    expect(toDraft(null)).toEqual(EMPTY_DRAFT);
  });

  it('fills the draft from an entry so it can be edited rather than rewritten', () => {
    const entry: JournalEntry = {
      content: 'hard day',
      whatWentWell: 'water',
      whatWasDifficult: 'the phone',
      tomorrowGoal: 'read earlier',
      createdAt: NOW,
    };

    expect(toDraft(entry)).toEqual({
      content: 'hard day',
      whatWentWell: 'water',
      whatWasDifficult: 'the phone',
      tomorrowGoal: 'read earlier',
    });
  });
});

describe('summariseEntry', () => {
  it('uses the first field the user actually filled in', () => {
    const entry: JournalEntry = {
      content: '',
      whatWentWell: 'hit the water target',
      whatWasDifficult: '',
      tomorrowGoal: '',
      createdAt: NOW,
    };

    expect(summariseEntry(entry)).toBe('hit the water target');
  });

  it('is empty when somehow every field is', () => {
    const entry: JournalEntry = { ...toDraft(null), createdAt: NOW };

    expect(summariseEntry(entry)).toBe('');
  });
});
