import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radii } from '@/theme/radii';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type StartDateDayCellProps = {
  dayOfMonth: string;
  isSelected: boolean;
  isToday: boolean;
  isSelectable: boolean;
  accessibilityLabel: string;
  onPress: () => void;
};

const CELL_SIZE = 36;
const RING_WIDTH = 2;
const MINIMUM_TAP_TARGET = 44;

/**
 * One day in the start-date calendar.
 *
 * Days outside the allowed range are shown rather than hidden — a month with holes in it reads as
 * broken — but they carry no chip and no weight, so what is choosable is the part of the month
 * that looks solid. Dimming the chip instead made the untappable days the ones with substance.
 */
export const StartDateDayCell = ({
  dayOfMonth,
  isSelected,
  isToday,
  isSelectable,
  accessibilityLabel,
  onPress,
}: StartDateDayCellProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isSelected, disabled: !isSelectable }}
      disabled={!isSelectable}
      onPress={onPress}
      style={styles.target}
    >
      <View style={[styles.cell, decideCellStyle(isSelected, isToday, isSelectable)]}>
        <Text style={[styles.day, decideDayStyle(isSelected, isSelectable)]}>{dayOfMonth}</Text>
      </View>
    </Pressable>
  );
};

const decideDayStyle = (isSelected: boolean, isSelectable: boolean) => {
  if (isSelected) {
    return styles.selectedDay;
  }

  if (!isSelectable) {
    return styles.unselectableDay;
  }

  return styles.plainDay;
};

const decideCellStyle = (isSelected: boolean, isToday: boolean, isSelectable: boolean) => {
  if (isSelected) {
    return styles.selected;
  }

  if (!isSelectable) {
    return styles.unselectable;
  }

  if (isToday) {
    return styles.today;
  }

  return styles.plain;
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
  plain: {
    backgroundColor: colors.raised,
    borderColor: colors.raised,
  },
  today: {
    backgroundColor: colors.card,
    borderColor: colors.outline,
  },
  selected: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  unselectable: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  day: {
    ...typography.ruleName,
  },
  plainDay: {
    color: colors.text,
  },
  selectedDay: {
    color: colors.ink,
  },
  unselectableDay: {
    color: colors.textTertiary,
  },
});
