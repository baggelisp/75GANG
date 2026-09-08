import AntDesign from '@expo/vector-icons/AntDesign';
import { StyleSheet, View } from 'react-native';

import { radii } from '@/theme/radii';
import { colors } from '@/theme/tokens';

export type BadgeMarkProps = {
  isEarned: boolean;
};

const MARK_SIZE = 28;
const ICON_SIZE = 15;

/** The check mark is what survives greyscale; the colour underneath it is the second signal. */
export const BadgeMark = ({ isEarned }: BadgeMarkProps) => {
  if (!isEarned) {
    return <View style={styles.locked} />;
  }

  return (
    <View style={styles.earned}>
      <AntDesign name="check" size={ICON_SIZE} color={colors.ink} />
    </View>
  );
};

const styles = StyleSheet.create({
  earned: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.coral,
  },
  locked: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outline,
  },
});
