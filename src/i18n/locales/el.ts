import { HabitIdEnum } from '@/domain/habitIds';

import { Translations } from './en';

/**
 * The Greek locale. The habit names are the original wording from `Docs/rules.jpeg`, kept verbatim
 * so the rules cannot drift through a round trip into English and back.
 *
 * Everything outside the rules is still a stub and falls back to English at runtime.
 */
export const el: Translations = {
  app: {
    name: '75 G-ANG',
    tagline: '75 Days. 11 Rules. A Better You.',
  },
  today: {
    greeting: 'Γεια σου, {name}',
    greetingAnonymous: 'Γεια σου',
    dayOf: 'Ημέρα {day} από {total}',
    percentComplete: '{percent}% ολοκληρωμένο',
    ringsLabel:
      'Συνήθειες {habitsDone} από {habitsTotal}, προπονήσεις {workoutsDone} από {workoutsTotal}, νερό {water} από {waterTarget} λίτρα',
    sectionRules: 'Οι 11 κανόνες',
    habitsFraction: '{done} / {total}',
  },
  habits: {
    [HabitIdEnum.NO_ALCOHOL]: {
      name: 'Καθόλου αλκοόλ & τσιγάρο',
      description: 'Καθόλου αλκοόλ και καθόλου τσιγάρο.',
    },
    [HabitIdEnum.DIET]: {
      name: 'Υγιεινή διατροφή',
      description:
        'Υγιεινή διατροφή της επιλογής σου χωρίς ούτε ένα cheat meal, σοκολάτα ή αναψυκτικό κλπ (όχι γεύματα μετά τις 22:00).',
    },
    [HabitIdEnum.WATER]: {
      name: 'Κατανάλωση 3 λίτρα νερό',
      description: 'Κατανάλωση minimum 3 λίτρα νερό την ημέρα.',
    },
    [HabitIdEnum.WORKOUTS]: {
      name: '2 προπονήσεις την ημέρα',
      description: '2 προπονήσεις την ημέρα (μία ιδανικά εκτός σπιτιού & minimum 45 η καθεμία).',
    },
    [HabitIdEnum.SKILL]: {
      name: '45 λεπτά business ή νέο skill',
      description: '45 minimum ενασχόληση με κάποιο business ή νέο skill χωρίς περισπασμούς.',
    },
    [HabitIdEnum.READING]: {
      name: 'Διάβασμα 15 σελίδες',
      description: 'Διάβασμα minimum 15 σελίδες την ημέρα από βιβλίο της επιλογής σου.',
    },
    [HabitIdEnum.MORNING_DETOX]: {
      name: 'Πρωινή αποτοξίνωση',
      description:
        'Όταν ξυπνήσεις για 1 ώρα καθόλου κινητό, και για 3 ώρες όχι κατανάλωση content & social media.',
    },
    [HabitIdEnum.NO_DEVICES_BED]: {
      name: 'Καμία συσκευή στο κρεβάτι',
      description: 'Καμία συσκευή (κινητό, iPad, τηλεόραση) στο κρεβάτι το βράδυ.',
    },
    [HabitIdEnum.WEIGH_IN]: {
      name: 'Ζύγισμα & φωτογραφία προόδου',
      description: 'Καθημερινό ζύγισμα & φωτογραφία προόδου στον καθρέφτη.',
    },
    [HabitIdEnum.SPIRITUALITY]: {
      name: '15 λεπτά πνευματικότητας',
      description: 'Minimum 15 πνευματικότητας τη μέρα - meditation ή προσευχή ή journaling.',
    },
    [HabitIdEnum.CONNECTION]: {
      name: '15 λεπτά με αγαπημένο πρόσωπο',
      description: '15 τη μέρα ουσιαστική επαφή & συζήτηση με οποιοδήποτε αγαπημένο σου πρόσωπο.',
    },
  },
  common: {
    start: 'Έναρξη',
    cancel: 'Άκυρο',
    save: 'Αποθήκευση',
    done: 'Έτοιμο',
    running: 'Σε εξέλιξη',
  },
};
