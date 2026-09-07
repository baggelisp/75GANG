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
