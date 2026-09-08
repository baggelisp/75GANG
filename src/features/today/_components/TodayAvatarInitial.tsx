import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type TodayAvatarInitialProps = {
  initial: string | null;
};

/** Empty when the user never gave a name, which is optional by design. */
export const TodayAvatarInitial = ({ initial }: TodayAvatarInitialProps) => {
  if (initial === null) {
    return null;
  }

  return <Text style={styles.initial}>{initial}</Text>;
};

const styles = StyleSheet.create({
  initial: {
    ...typography.sectionLabel,
    color: colors.text,
  },
});
