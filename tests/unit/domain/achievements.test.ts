import {
  AchievementInput,
  BadgeIdEnum,
  collectAchievements,
  findAchievement,
} from '@/domain/achievements';

const NOTHING: AchievementInput = { currentDay: 0, perfectDays: 0, longestStreak: 0 };

const earned = (input: Partial<AchievementInput>): readonly string[] =>
  collectAchievements({ ...NOTHING, ...input })
    .filter((badge) => badge.isEarned)
    .map((badge) => badge.id);

describe('the five badges', () => {
  it('are always all present, so an unearned one can be shown as something to aim at', () => {
    expect(collectAchievements(NOTHING).map((badge) => badge.id)).toEqual([
      BadgeIdEnum.SEVEN_DAY_WARRIOR,
      BadgeIdEnum.PERFECT_WEEK,
      BadgeIdEnum.THIRTY_DAY_DISCIPLINE,
      BadgeIdEnum.HALFWAY_THERE,
      BadgeIdEnum.SEVENTY_FIVE_COMPLETE,
    ]);
  });

  it('are all unearned before anything has happened', () => {
    expect(earned({})).toEqual([]);
  });
});

describe('7 Day Warrior — seven consecutive days', () => {
  it('is earned at exactly seven in a row', () => {
    expect(earned({ longestStreak: 7 })).toContain(BadgeIdEnum.SEVEN_DAY_WARRIOR);
  });

  it('is not earned at six in a row', () => {
    expect(earned({ longestStreak: 6 })).not.toContain(BadgeIdEnum.SEVEN_DAY_WARRIOR);
  });

  it('is not earned by seven perfect days that were not consecutive', () => {
    expect(earned({ perfectDays: 7, longestStreak: 3 })).not.toContain(
      BadgeIdEnum.SEVEN_DAY_WARRIOR,
    );
  });
});

describe('Perfect Week — all the habits on seven days', () => {
  it('is earned at exactly seven perfect days, consecutive or not', () => {
    expect(earned({ perfectDays: 7, longestStreak: 2 })).toContain(BadgeIdEnum.PERFECT_WEEK);
  });

  it('is not earned at six perfect days', () => {
    expect(earned({ perfectDays: 6, longestStreak: 6 })).not.toContain(BadgeIdEnum.PERFECT_WEEK);
  });

  it('is not earned by seven days that were merely lived through', () => {
    expect(earned({ currentDay: 7, perfectDays: 0 })).not.toContain(BadgeIdEnum.PERFECT_WEEK);
  });
});

describe('30 Day Discipline — reaching day thirty', () => {
  it('is earned on day thirty', () => {
    expect(earned({ currentDay: 30 })).toContain(BadgeIdEnum.THIRTY_DAY_DISCIPLINE);
  });

  it('is not earned on day twenty-nine', () => {
    expect(earned({ currentDay: 29 })).not.toContain(BadgeIdEnum.THIRTY_DAY_DISCIPLINE);
  });
});

describe('Halfway There — reaching day thirty-eight', () => {
  it('is earned on day thirty-eight', () => {
    expect(earned({ currentDay: 38 })).toContain(BadgeIdEnum.HALFWAY_THERE);
  });

  it('is not earned on day thirty-seven', () => {
    expect(earned({ currentDay: 37 })).not.toContain(BadgeIdEnum.HALFWAY_THERE);
  });
});

describe('75 Hard Complete — all seventy-five days', () => {
  it('is earned at seventy-five in a row', () => {
    expect(earned({ currentDay: 75, longestStreak: 75, perfectDays: 75 })).toContain(
      BadgeIdEnum.SEVENTY_FIVE_COMPLETE,
    );
  });

  it('is not earned at seventy-four in a row', () => {
    expect(earned({ currentDay: 75, longestStreak: 74, perfectDays: 74 })).not.toContain(
      BadgeIdEnum.SEVENTY_FIVE_COMPLETE,
    );
  });

  it('is not earned by reaching day seventy-five with days missed along the way', () => {
    expect(earned({ currentDay: 75, longestStreak: 40, perfectDays: 70 })).not.toContain(
      BadgeIdEnum.SEVENTY_FIVE_COMPLETE,
    );
  });
});

describe('after a reset', () => {
  it('every badge is unearned again, because they are derived and never stored', () => {
    expect(earned({ currentDay: 75, longestStreak: 75, perfectDays: 75 })).toHaveLength(5);
    expect(earned({})).toEqual([]);
  });
});

describe('a sentinel day number', () => {
  it.each([0, -1])('earns nothing at day %i', (currentDay) => {
    expect(earned({ currentDay })).toEqual([]);
  });
});

describe('looking one badge up', () => {
  it('finds it', () => {
    expect(findAchievement(collectAchievements(NOTHING), BadgeIdEnum.HALFWAY_THERE)?.id).toBe(
      BadgeIdEnum.HALFWAY_THERE,
    );
  });

  it('returns null for a badge that does not exist', () => {
    expect(findAchievement(collectAchievements(NOTHING), 'not-a-badge')).toBeNull();
  });
});
