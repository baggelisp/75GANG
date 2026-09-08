import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { summariseEntry } from '@/domain/journal';
import { JournalEntriesByDate } from '@/domain/types';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { formatLongDate } from '@/utils/DateUtility';

import { JournalHistoryRow } from './JournalHistoryRow';

export type JournalHistoryProps = {
  history: JournalEntriesByDate;
  today: string;
  locale: string;
};

/** Every entry before today, newest first. */
export const JournalHistory = ({ history, today, locale }: JournalHistoryProps) => {
  const { t } = useTranslation();
  const past = Object.keys(history)
    .filter((date) => date !== today)
    .sort((first, second) => second.localeCompare(first));

  if (past.length === 0) {
    return (
      <Card>
        <Text style={styles.title}>{t('journal.historyTitle')}</Text>
        <Text style={styles.empty}>{t('journal.historyEmpty')}</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.title}>{t('journal.historyTitle')}</Text>
      <View style={styles.rows}>
        {past.map((date, index) => (
          <JournalHistoryRow
            key={date}
            date={formatLongDate(date, locale)}
            summary={summariseEntry(history[date]!)}
            isFirst={index === 0}
          />
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.sectionLabel,
    color: colors.text,
  },
  rows: {
    marginTop: spacing.sm,
  },
  empty: {
    ...typography.ruleName,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
