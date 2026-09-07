import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useTranslation } from '@/i18n';
import { useRepositories } from '@/storage/repositoryContext';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { addDays, formatLongDate, toLocalIsoDate } from '@/utils/DateUtility';

import { StartDateStepper } from './_components/StartDateStepper';
import { StartErrorMessage } from './_components/StartErrorMessage';
import {
  EARLIEST_START_OFFSET_DAYS,
  StartError,
  StartErrorEnum,
  useStartChallenge,
} from './_hooks/useStartChallenge';

const ONE_DAY = 1;

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
  const [startDate, setStartDate] = useState(today);
  const { startChallenge, error, isSaving } = useStartChallenge();

  const canGoEarlier = startDate > earliestStart;
  const isToday = startDate === today;

  const moveEarlier = () => {
    if (!canGoEarlier) {
      return;
    }

    setStartDate(addDays(startDate, -ONE_DAY));
  };

  const moveLater = () => {
    if (isToday) {
      return;
    }

    setStartDate(addDays(startDate, ONE_DAY));
  };

  const handleStart = async () => {
    const result = await startChallenge({ name, startDate, today });

    if (!result.ok) {
      return;
    }

    router.replace('/');
  };

  return (
    <Screen>
      <View style={styles.content}>
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
          <Text style={styles.label}>{t('start.startDateLabel')}</Text>
          <StartDateStepper
            formattedDate={formatLongDate(startDate, locale)}
            isToday={isToday}
            canGoEarlier={canGoEarlier}
            onEarlier={moveEarlier}
            onLater={moveLater}
          />
        </View>

        <StartErrorMessage errorKey={decideErrorKey(error)} />

        <PrimaryButton
          label={t('start.startButton')}
          accessibilityLabel={t('start.startAccessibility')}
          onPress={handleStart}
          isDisabled={isSaving}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.massive,
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
