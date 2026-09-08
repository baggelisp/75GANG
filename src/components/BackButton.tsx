import AntDesign from '@expo/vector-icons/AntDesign';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type BackButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

const MINIMUM_TAP_TARGET = 44;
const ARROW_SIZE = 18;

/**
 * Going back, always with the arrow beside the label.
 *
 * The arrow is not decoration: a word alone reads as an action that could go anywhere, while the
 * arrow says which direction before anyone reads it.
 */
export const BackButton = ({ label, accessibilityLabel, onPress }: BackButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.button}
    >
      <View style={styles.content}>
        <AntDesign name="arrow-left" size={ARROW_SIZE} color={colors.text} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: MINIMUM_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.raised,
    paddingHorizontal: spacing.massive,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.sectionLabel,
    color: colors.text,
  },
});
