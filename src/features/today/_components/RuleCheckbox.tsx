import { StyleSheet, View } from 'react-native';

import { radii } from '@/theme/radii';
import { colors } from '@/theme/tokens';

import { RuleCheckMark } from './RuleCheckMark';

export type RuleCheckboxProps = {
  isDone: boolean;
};

const BOX_SIZE = 21;
const BOX_BORDER = 1.5;

/** A done rule shows a coral box carrying an `ink` check mark. */
export const RuleCheckbox = ({ isDone }: RuleCheckboxProps) => {
  const boxStyle = isDone ? styles.done : styles.pending;

  return (
    <View style={[styles.box, boxStyle]}>
      <RuleCheckMark isDone={isDone} />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: radii.checkbox,
    borderWidth: BOX_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pending: {
    borderColor: colors.outline,
    backgroundColor: colors.card,
  },
  done: {
    borderColor: colors.coral,
    backgroundColor: colors.coral,
  },
});
