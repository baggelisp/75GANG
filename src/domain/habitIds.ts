/** The eleven habit ids from `Docs/75-hard-gang-way-mvp.md` — "Habit IDs". */
export const HabitIdEnum = {
  NO_ALCOHOL: 'no-alcohol',
  DIET: 'diet',
  WATER: 'water',
  WORKOUTS: 'workouts',
  SKILL: 'skill',
  READING: 'reading',
  MORNING_DETOX: 'morning-detox',
  NO_DEVICES_BED: 'no-devices-bed',
  WEIGH_IN: 'weigh-in',
  SPIRITUALITY: 'spirituality',
  CONNECTION: 'connection',
} as const;

export type HabitId = (typeof HabitIdEnum)[keyof typeof HabitIdEnum];

export const HABIT_IDS: readonly HabitId[] = Object.values(HabitIdEnum);

export const TOTAL_HABITS = HABIT_IDS.length;
