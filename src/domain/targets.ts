/** How a habit is measured. New tracking behaviour is a new target type, never an id check. */
export const TargetTypeEnum = {
  BOOLEAN: 'boolean',
  LITRES: 'litres',
  PAGES: 'pages',
  MINUTES: 'minutes',
  SESSIONS: 'sessions',
  WINDOWS: 'windows',
  MEASUREMENT: 'measurement',
} as const;

export type TargetType = (typeof TargetTypeEnum)[keyof typeof TargetTypeEnum];

/** Rule 4: two workouts, each of at least this many minutes. */
export const WORKOUT_SESSIONS_REQUIRED = 2;
export const WORKOUT_MINUTES_REQUIRED = 45;

/** Rule 7: on waking, one hour with no phone and three hours with no content. */
export const PHONE_FREE_MINUTES_REQUIRED = 60;
export const NO_CONTENT_MINUTES_REQUIRED = 180;

export const WATER_TARGET_LITRES = 3;
export const READING_TARGET_PAGES = 15;
export const SKILL_TARGET_MINUTES = 45;
export const SPIRITUALITY_TARGET_MINUTES = 15;
export const CONNECTION_TARGET_MINUTES = 15;

/** Easy — the base habits, at targets someone can actually start from. */
export const EASY_WATER_TARGET_LITRES = 2;
export const EASY_WORKOUT_SESSIONS_REQUIRED = 1;
export const EASY_WORKOUT_MINUTES_REQUIRED = 30;
export const EASY_READING_TARGET_PAGES = 5;
export const EASY_SPIRITUALITY_TARGET_MINUTES = 10;

/** Medium — Easy plus diet, focused work and connection, at tougher targets. */
export const MEDIUM_WATER_TARGET_LITRES = 2.5;
export const MEDIUM_WORKOUT_SESSIONS_REQUIRED = 1;
export const MEDIUM_READING_TARGET_PAGES = 10;
export const MEDIUM_SKILL_TARGET_MINUTES = 30;
