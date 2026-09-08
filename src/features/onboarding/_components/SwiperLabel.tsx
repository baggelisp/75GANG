import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type SwiperLabelProps = {
  label: string;
};

/**
 * The swiper's skip, next and done controls take an element as well as a string. Passing an
 * element is what brings those three buttons back under our type scale and palette — as strings
 * the library renders them in its own hardcoded white and platform font.
 */
export const SwiperLabel = ({ label }: SwiperLabelProps) => {
  return <Text style={styles.label}>{label}</Text>;
};

const styles = StyleSheet.create({
  label: {
    ...typography.sectionLabel,
    color: colors.text,
  },
});
