import { HabitIdEnum } from '@/domain/habitIds';

/**
 * The English locale. Every user-facing string in the app lives here.
 *
 * Habit names and descriptions are keyed by habit id, so the domain can stay free of copy.
 */
export const en = {
  app: {
    name: '75 G-ANG',
    tagline: '75 Days. 11 Rules. A Better You.',
  },
  today: {
    greeting: 'Hey, {name}',
    greetingAnonymous: 'Hey there',
    dayKicker: '{date} · Day {day} of {total}',
    dayOf: 'Day {day} of {total}',
    dayKickerOutsideChallenge: '{date}',
    writeFailed: 'That tap was not saved. Tap again to retry.',
    writeFailedDismiss: 'Dismiss the save error',
    unavailableTitle: 'Today could not be loaded',
    unavailableBody:
      'Your progress is safe on this phone. Try again in a moment, or reopen the app.',
    percentComplete: '{percent}% complete',
    cardTitle: 'Today',
    habits: 'Habits',
    workouts: 'Workouts',
    water: 'Water',
    done: 'done',
    sessions: 'sessions',
    litres: 'L',
    streak: 'Streak',
    bestStreak: 'Best {days} days',
    todayScore: 'Today',
    rulesDone: 'Rules done',
    challengeTitle: 'Challenge',
    daysToGo: '{days} to go',
    perfectDays: 'Perfect days',
    daysRemaining: 'Days remaining',
    ringsLabel:
      'Habits {habitsDone} of {habitsTotal}, workouts {workoutsDone} of {workoutsTotal}, water {water} of {waterTarget} litres',
    sectionRules: 'The rules',
    habitsFraction: '{done} / {total}',
    progressSessions: '{done} / {total} done',
    progressWindows: 'Phone {phone} min, content {content} min',
    progressWeighInDone: '{weight} kg, photo saved',
    progressWeighInPending: 'Weight and photo needed',
    progress: {
      litres: '{current} / {target} L',
      pages: '{current} / {target} pages',
      minutes: '{current} / {target} min',
    },
    tabToday: 'Today',
    tabProgress: 'Progress',
    tabJournal: 'Journal',
    tabProfile: 'Profile',
    comingSoon: 'This screen arrives in a later update.',
  },
  habits: {
    [HabitIdEnum.NO_ALCOHOL]: {
      name: 'No alcohol & no cigarettes',
      description: 'Neither, all day.',
    },
    [HabitIdEnum.DIET]: {
      name: 'Healthy diet',
      note: 'No cheat meal. Nothing after 22:00.',
      description: 'No cheat meal, no chocolate, no soft drinks. Nothing after 22:00.',
    },
    [HabitIdEnum.WATER]: {
      name: 'Drink 3 litres of water',
      description: 'Minimum 3 litres across the day.',
    },
    [HabitIdEnum.WORKOUTS]: {
      name: '2 workouts, 45 minutes each',
      description: 'Two sessions of at least 45 minutes. One outdoors if you can.',
    },
    [HabitIdEnum.SKILL]: {
      name: '45 minutes on a business or skill',
      description: 'Focused work with no distractions.',
    },
    [HabitIdEnum.READING]: {
      name: 'Read 15 pages',
      description: 'From a book of your choice.',
    },
    [HabitIdEnum.MORNING_DETOX]: {
      name: 'Morning detox',
      description: 'After waking: 1 hour with no phone, 3 hours with no content or social media.',
    },
    [HabitIdEnum.NO_DEVICES_BED]: {
      name: 'No devices in bed',
      note: 'Confirm tonight',
      description: 'No phone, tablet or television at night.',
    },
    [HabitIdEnum.WEIGH_IN]: {
      name: 'Weigh-in & mirror photo',
      description: 'Record your weight and take a progress photo.',
    },
    [HabitIdEnum.SPIRITUALITY]: {
      name: '15 minutes of spirituality',
      description: 'Meditation, prayer or journaling.',
    },
    [HabitIdEnum.CONNECTION]: {
      name: '15 minutes with someone you love',
      description: 'Real contact and real conversation.',
    },
  },
  entry: {
    unreadableTitle: 'Your challenge could not be opened',
    unreadableBody:
      'Your progress is still saved on this phone. Try again in a moment, or reopen the app.',
    retry: 'Try again',
  },
  onboarding: {
    welcomeKicker: 'Welcome',
    welcomeTitle: '75 Days. 11 Rules.',
    welcomeBody: 'One challenge, eleven daily rules, no days off. Miss one and you start again.',
    howKicker: 'How it works',
    howTitle: 'Every rule, every day',
    howBody:
      'Tick each rule as you finish it. All eleven in a day is a perfect day, and perfect days build your streak.',
    rulesKicker: 'The rules',
    rulesTitle: 'The 11 rules',
    privacyKicker: 'Your data',
    privacyTitle: 'Stays on your phone',
    privacyBody:
      'No account, no sign up, no server. Everything lives on this device, and you can export it whenever you want.',
    skip: 'Skip',
    next: 'Next',
    done: 'Get started',
  },
  modes: {
    label: 'Choose your challenge',
    ruleCount: '{count} rules',
    easy: {
      name: 'Easy',
      summary: 'The base habits. Build the routine before you raise the bar.',
    },
    medium: {
      name: 'Medium',
      summary: 'Adds diet, focused work and real conversation, at tougher targets.',
    },
    hard: {
      name: 'Hard',
      summary: 'The full 75 Hard Gang Way. Two workouts, the morning detox, daily weigh-in.',
    },
  },
  start: {
    title: 'Start your challenge',
    nameLabel: 'Your name',
    namePlaceholder: 'Optional',
    nameHint: 'Only used to greet you. It never leaves this phone.',
    startDateLabel: 'Start date',
    today: 'Today',
    earlier: 'Earlier',
    later: 'Later',
    alreadyStartedHint: 'Already a few days in? Move the start date back.',
    startButton: 'Start day 1',
    startAccessibility: 'Start the 75 day challenge',
    errorFuture: 'A challenge cannot start in the future. Pick today or an earlier day.',
    errorTooFarBack:
      'A 75 day challenge that started then would already be over. Pick a later day.',
    errorExists:
      'You already have a challenge running. Reset it from Profile before starting a new one.',
    errorInvalid: 'That is not a real date. Pick another day.',
    errorSave: 'Your challenge could not be saved. Try again.',
  },
  counter: {
    plus250ml: '+250 ml',
    plus500ml: '+500 ml',
    plus1l: '+1 L',
    plus1page: '+1 page',
    plus5pages: '+5 pages',
    minus250ml: 'Undo 250 ml',
    minus1page: 'Undo 1 page',
    undo: 'Undo',
    undoAccessibility: 'Undo the last amount',
    done: 'Target reached',
    back: 'Back',
    writeFailed: 'That amount was not saved. Try again.',
    notBuiltYet: 'This rule is tracked on the Today screen for now.',
    unavailable: 'This rule is not part of your challenge.',
  },
  common: {
    start: 'Start',
    cancel: 'Cancel',
    save: 'Save',
    done: 'Done',
    running: 'Running',
  },
};

/** Structure is fixed, values are plain strings, so another locale can differ. */
export type Translations = typeof en;
