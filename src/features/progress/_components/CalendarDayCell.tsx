import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DayState, DayStateEnum } from '@/domain/progressGrid';
import { radii } from '@/theme/radii';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type CalendarDayCellProps = {
  dayOfMonth: string;
  dayNumber: number;
  state: DayState;
  accessibilityLabel: string;
  isTappable: boolean;
  onPress: (dayNumber: number) => void;
};

const CELL_SIZE = 34;
const RING_WIDTH = 2;
const MINIMUM_TAP_TARGET = 44;

/**
 * One day of the challenge, in its place on the calendar.
 *
 * It carries the day of the month rather than being a bare dot: a dot says only "a day", while
 * the number lets someone find the Saturday they remember missing. State is never colour alone —
 * a perfect day is filled and its number is `ink`, a missed one is a hollow warm grey, and today
 * carries a ring.
 */
export const CalendarDayCell = ({
  dayOfMonth,
  dayNumber,
  state,
  accessibilityLabel,
  isTappable,
  onPress,
}: CalendarDayCellProps) => {
  const press = () => {
    onPress(dayNumber);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !isTappable }}
      disabled={!isTappable}
      onPress={press}
      style={styles.target}
    >
      <View style={[styles.cell, cellStyles[state]]}>
        <Text style={[styles.day, dayStyles[state]]}>{dayOfMonth}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  /**
   * The circle is smaller than the tap target on purpose: seven columns leave the room, and a
   * 34pt row is below the 44pt minimum however tidy it looks.
   */
  target: {
    minWidth: MINIMUM_TAP_TARGET,
    minHeight: MINIMUM_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    borderWidth: RING_WIDTH,
  },
  day: {
    ...typography.ruleMeta,
  },
});

const cellStyles = StyleSheet.create({
  [DayStateEnum.PERFECT]: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  [DayStateEnum.MISSED]: {
    backgroundColor: colors.raised,
    borderColor: colors.raised,
  },
  [DayStateEnum.TODAY]: {
    backgroundColor: colors.butter,
    borderColor: colors.butter,
  },
  [DayStateEnum.TO_COME]: {
    backgroundColor: colors.bg,
    borderColor: colors.hairline,
  },
});

const dayStyles = StyleSheet.create({
  [DayStateEnum.PERFECT]: {
    color: colors.ink,
  },
  [DayStateEnum.MISSED]: {
    color: colors.textSecondary,
  },
  [DayStateEnum.TODAY]: {
    color: colors.ink,
  },
  [DayStateEnum.TO_COME]: {
    color: colors.textTertiary,
  },
});
