import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useTranslation } from '@/i18n';
import { ChallengeMode, ChallengeModeEnum } from '@/domain/modes';
import { useRepositories } from '@/storage/repositoryContext';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { addDays, formatLongDate, toLocalIsoDate } from '@/utils/DateUtility';

import { ModePicker } from './_components/ModePicker';
import { StartDateCalendar } from './_components/StartDateCalendar';
import { StartErrorMessage } from './_components/StartErrorMessage';
import {
  EARLIEST_START_OFFSET_DAYS,
  StartError,
  StartErrorEnum,
  useStartChallenge,
} from './_hooks/useStartChallenge';

const ERROR_KEYS: Readonly<Record<StartError, string>> = {
  [StartErrorEnum.START_DATE_IN_FUTURE]: 'start.errorFuture',
  [StartErrorEnum.START_DATE_TOO_FAR_BACK]: 'start.errorTooFarBack',
  [StartErrorEnum.START_DATE_INVALID]: 'start.errorInvalid',
  [StartErrorEnum.CHALLENGE_ALREADY_EXISTS]: 'start.errorExists',
  [StartErrorEnum.COULD_NOT_SAVE]: 'start.errorSave',
};

const decideErrorKey = (error: StartError | null): string | null => {
  if (error === null) {
    return null;
  }

  return ERROR_KEYS[error];
};

export const StartChallengeScreen = () => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const repositories = useRepositories();
  const today = toLocalIsoDate(repositories.clock.now());
  const earliestStart = addDays(today, -EARLIEST_START_OFFSET_DAYS);

  const [name, setName] = useState('');
  const [mode, setMode] = useState<ChallengeMode>(ChallengeModeEnum.HARD);
  const [startDate, setStartDate] = useState(today);
  const { startChallenge, error, isSaving } = useStartChallenge();

  const handleStart = async () => {
    const result = await startChallenge({ name, startDate, mode, today });

    if (!result.ok) {
      return;
    }

    router.replace('/');
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('start.title')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('start.nameLabel')}</Text>
            <TextInput
              accessibilityLabel={t('start.nameLabel')}
              placeholder={t('start.namePlaceholder')}
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <Text style={styles.hint}>{t('start.nameHint')}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('modes.label')}</Text>
            <ModePicker selected={mode} onSelect={setMode} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('start.startDateLabel')}</Text>
            <StartDateCalendar
              selected={startDate}
              today={today}
              earliest={earliestStart}
              onSelect={setStartDate}
            />
            <Text style={styles.hint}>
              {t('start.selectedDate', { date: formatLongDate(startDate, locale) })}
            </Text>
          </View>

          <StartErrorMessage errorKey={decideErrorKey(error)} />

          <PrimaryButton
            label={t('start.startButton')}
            accessibilityLabel={t('start.startAccessibility')}
            onPress={handleStart}
            isDisabled={isSaving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  /**
   * A scrolling column, not a centred one. The date is picked on a calendar now, and the screen
   * is taller than a phone: centring inside a fixed height simply cut the button off with no way
   * to reach it.
   */
  content: {
    gap: spacing.massive,
    paddingTop: spacing.giant,
    paddingBottom: spacing.massive,
  },
  title: {
    ...typography.greeting,
    color: colors.text,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
  },
  input: {
    ...typography.ruleName,
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: radii.ruleRow,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
  },
  hint: {
    ...typography.ruleMeta,
    color: colors.textTertiary,
  },
});
