import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/spacing';

export type CalendarWeekProps = {
  children: ReactNode;
};

/** One row of seven equal columns. Every slot is filled, empty ones included, so days stay aligned. */
export const CalendarWeek = ({ children }: CalendarWeekProps) => {
  return <View style={styles.week}>{children}</View>;
};

const styles = StyleSheet.create({
  week: {
    flexDirection: 'row',
    marginBottom: spacing.xxs,
  },
});
