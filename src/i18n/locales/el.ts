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
    dayKicker: '{date} · Ημέρα {day} από {total}',
    dayOf: 'Ημέρα {day} από {total}',
    dayKickerOutsideChallenge: '{date}',
    unavailableTitle: 'Το σήμερα δεν φορτώθηκε',
    unavailableBody:
      'Η πρόοδός σου είναι ασφαλής στο κινητό. Δοκίμασε ξανά σε λίγο ή άνοιξε πάλι την εφαρμογή.',
    percentComplete: '{percent}% ολοκληρωμένο',
    cardTitle: 'Σήμερα',
    habits: 'Συνήθειες',
    workouts: 'Προπονήσεις',
    water: 'Νερό',
    done: 'έτοιμα',
    sessions: 'προπονήσεις',
    litres: 'L',
    streak: 'Σερί',
    bestStreak: 'Καλύτερο {days} μέρες',
    todayScore: 'Σήμερα',
    rulesDone: 'Κανόνες έτοιμοι',
    challengeTitle: 'Πρόκληση',
    daysToGo: 'μένουν {days}',
    perfectDays: 'Τέλειες μέρες',
    daysRemaining: 'Μέρες που μένουν',
    ringsLabel:
      'Συνήθειες {habitsDone} από {habitsTotal}, προπονήσεις {workoutsDone} από {workoutsTotal}, νερό {water} από {waterTarget} λίτρα',
    sectionRules: 'Οι κανόνες',
    habitsFraction: '{done} / {total}',
    progressSessions: '{done} / {total} έτοιμες',
    progressWindows: 'Κινητό {phone} λ, content {content} λ',
    progressWeighInDone: '{weight} kg, φωτογραφία αποθηκεύτηκε',
    progressWeighInPending: 'Χρειάζεται βάρος και φωτογραφία',
    progress: {
      litres: '{current} / {target} L',
      pages: '{current} / {target} σελίδες',
      minutes: '{current} / {target} λ',
    },
    tabToday: 'Σήμερα',
    tabProgress: 'Πρόοδος',
    tabJournal: 'Ημερολόγιο',
    tabProfile: 'Προφίλ',
    comingSoon: 'Αυτή η οθόνη έρχεται σε επόμενη έκδοση.',
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
  entry: {
    unreadableTitle: 'Η πρόκλησή σου δεν άνοιξε',
    unreadableBody:
      'Η πρόοδός σου είναι αποθηκευμένη στο κινητό. Δοκίμασε ξανά σε λίγο ή άνοιξε πάλι την εφαρμογή.',
    retry: 'Δοκίμασε ξανά',
  },
  onboarding: {
    welcomeKicker: 'Καλώς ήρθες',
    welcomeTitle: '75 μέρες. 11 κανόνες.',
    welcomeBody: 'Μία πρόκληση, έντεκα κανόνες κάθε μέρα, χωρίς ρεπό.',
    howKicker: 'Πώς δουλεύει',
    howTitle: 'Κάθε κανόνας, κάθε μέρα',
    howBody:
      'Τσέκαρε κάθε κανόνα μόλις τον ολοκληρώσεις. Και οι έντεκα σε μία μέρα είναι τέλεια μέρα.',
    rulesKicker: 'Οι κανόνες',
    rulesTitle: 'Οι 11 κανόνες',
    privacyKicker: 'Τα δεδομένα σου',
    privacyTitle: 'Μένουν στο κινητό σου',
    privacyBody: 'Χωρίς λογαριασμό, χωρίς εγγραφή, χωρίς server. Όλα μένουν σε αυτή τη συσκευή.',
    skip: 'Παράλειψη',
    next: 'Επόμενο',
    done: 'Ξεκίνα',
  },
  modes: {
    label: 'Διάλεξε την πρόκλησή σου',
    ruleCount: '{count} κανόνες',
    easy: {
      name: 'Εύκολο',
      summary: 'Οι βασικές συνήθειες. Χτίσε τη ρουτίνα πριν ανεβάσεις τον πήχη.',
    },
    medium: {
      name: 'Μεσαίο',
      summary:
        'Προσθέτει διατροφή, εστιασμένη δουλειά και ουσιαστική επαφή, με πιο σκληρούς στόχους.',
    },
    hard: {
      name: 'Δύσκολο',
      summary:
        'Το πλήρες 75 Hard Gang Way. Δύο προπονήσεις, πρωινή αποτοξίνωση, καθημερινό ζύγισμα.',
    },
  },
  start: {
    title: 'Ξεκίνα την πρόκλησή σου',
    nameLabel: 'Το όνομά σου',
    namePlaceholder: 'Προαιρετικό',
    nameHint: 'Χρησιμοποιείται μόνο για τον χαιρετισμό. Δεν φεύγει από το κινητό.',
    startDateLabel: 'Ημερομηνία έναρξης',
    today: 'Σήμερα',
    earlier: 'Νωρίτερα',
    later: 'Αργότερα',
    alreadyStartedHint: 'Έχεις ήδη ξεκινήσει; Πήγαινε την ημερομηνία πίσω.',
    startButton: 'Ξεκίνα την ημέρα 1',
    startAccessibility: 'Ξεκίνα την πρόκληση των 75 ημερών',
    errorFuture: 'Η πρόκληση δεν μπορεί να ξεκινήσει στο μέλλον. Διάλεξε σήμερα ή νωρίτερα.',
    errorTooFarBack:
      'Μια πρόκληση 75 ημερών που ξεκίνησε τότε θα είχε ήδη τελειώσει. Διάλεξε πιο πρόσφατη μέρα.',
    errorExists: 'Έχεις ήδη ενεργή πρόκληση. Κάνε reset από το προφίλ πριν ξεκινήσεις νέα.',
    errorInvalid: 'Αυτή δεν είναι πραγματική ημερομηνία. Διάλεξε άλλη μέρα.',
    errorSave: 'Η πρόκληση δεν αποθηκεύτηκε. Δοκίμασε ξανά.',
  },
  common: {
    start: 'Έναρξη',
    cancel: 'Άκυρο',
    save: 'Αποθήκευση',
    done: 'Έτοιμο',
    running: 'Σε εξέλιξη',
  },
};
