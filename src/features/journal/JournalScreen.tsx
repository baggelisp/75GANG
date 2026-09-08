import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { decideDraftIsWorthSaving } from '@/domain/journal';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { formatLongDate } from '@/utils/DateUtility';

import { JournalField } from './_components/JournalField';
import { JournalHistory } from './_components/JournalHistory';
import { JournalLoading } from './_components/JournalLoading';
import { JournalSavedNote } from './_components/JournalSavedNote';
import { JournalStatusEnum, useJournal } from './_hooks/useJournal';

/** One reflection a day, saved without leaving the screen. */
export const JournalScreen = () => {
  const { t, locale } = useTranslation();
  const journal = useJournal();

  if (journal.status === JournalStatusEnum.LOADING) {
    return <JournalLoading />;
  }

  const canSave = decideDraftIsWorthSaving(journal.draft);

  const changeContent = (text: string) => journal.changeField('content', text);
  const changeWentWell = (text: string) => journal.changeField('whatWentWell', text);
  const changeDifficult = (text: string) => journal.changeField('whatWasDifficult', text);
  const changeTomorrow = (text: string) => journal.changeField('tomorrowGoal', text);

  const save = () => {
    void journal.save();
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <Text style={styles.kicker}>{t('journal.kicker')}</Text>
            <Text style={styles.title}>{formatLongDate(journal.today, locale)}</Text>
          </View>

          <JournalField
            label={t('journal.contentLabel')}
            placeholder={t('journal.contentPlaceholder')}
            value={journal.draft.content}
            onChangeText={changeContent}
          />
          <JournalField
            label={t('journal.wentWellLabel')}
            placeholder={t('journal.wentWellPlaceholder')}
            value={journal.draft.whatWentWell}
            onChangeText={changeWentWell}
          />
          <JournalField
            label={t('journal.difficultLabel')}
            placeholder={t('journal.difficultPlaceholder')}
            value={journal.draft.whatWasDifficult}
            onChangeText={changeDifficult}
          />
          <JournalField
            label={t('journal.tomorrowLabel')}
            placeholder={t('journal.tomorrowPlaceholder')}
            value={journal.draft.tomorrowGoal}
            onChangeText={changeTomorrow}
          />

          <PrimaryButton
            label={t('journal.save')}
            accessibilityLabel={t('journal.save')}
            onPress={save}
            isDisabled={!canSave}
          />

          <JournalSavedNote isSaved={journal.isSaved} didFail={journal.saveFailed} />

          <JournalHistory history={journal.history} today={journal.today} locale={locale} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  content: {
    gap: spacing.giant,
    paddingTop: spacing.giant,
    paddingBottom: spacing.massive,
  },
  heading: {
    gap: spacing.xs,
  },
  kicker: {
    ...typography.kicker,
    color: colors.textSecondary,
  },
  title: {
    ...typography.greeting,
    color: colors.text,
  },
});
