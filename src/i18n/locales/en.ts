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
    dayOf: 'Day {day} of {total}',
    percentComplete: '{percent}% complete',
    ringsLabel:
      'Habits {habitsDone} of {habitsTotal}, workouts {workoutsDone} of {workoutsTotal}, water {water} of {waterTarget} litres',
    sectionRules: 'The 11 rules',
    habitsFraction: '{done} / {total}',
  },
  habits: {
    [HabitIdEnum.NO_ALCOHOL]: {
      name: 'No alcohol & no cigarettes',
      description: 'Neither, all day.',
    },
    [HabitIdEnum.DIET]: {
      name: 'Healthy diet',
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
