import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type RuleRowMetaProps = {
  meta: string | null;
};

/** The progress line under a measured rule. A simple tap has nothing to say here. */
export const RuleRowMeta = ({ meta }: RuleRowMetaProps) => {
  if (meta === null) {
    return null;
  }

  return <Text style={styles.meta}>{meta}</Text>;
};

const styles = StyleSheet.create({
  meta: {
    ...typography.ruleMeta,
    color: colors.textTertiary,
  },
});
