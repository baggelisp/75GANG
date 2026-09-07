/** The five keys from `Docs/75-hard-gang-way-mvp.md` — "Storage Keys". The whole schema. */
export const StorageKeyEnum = {
  PROFILE: '@75gang/profile',
  CHALLENGE: '@75gang/challenge',
  DAYS: '@75gang/days',
  JOURNAL: '@75gang/journal',
  SETTINGS: '@75gang/settings',
} as const;

export type StorageKey = (typeof StorageKeyEnum)[keyof typeof StorageKeyEnum];
