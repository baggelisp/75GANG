import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export type CalendarSlotProps = {
  children: ReactNode;
};

/**
 * One of the seven columns in a week.
 *
 * Every slot takes the same seventh of the row whether or not it holds a day, which is what keeps
 * a Tuesday under the Tuesday heading in every month.
 */
export const CalendarSlot = ({ children }: CalendarSlotProps) => {
  return <View style={styles.slot}>{children}</View>;
};

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
