import { StyleSheet, Text, View } from 'react-native';

import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { Accent, AccentEnum, colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type AccentTileProps = {
  accent: Accent;
  label: string;
  value: string;
  footnote?: string;
};

/**
 * A filled accent tile: label, big value, optional footnote.
 *
 * It renders its own text rather than taking children, because content on any of the three accents
 * must be `ink` — white measures roughly 1.5:1 on all of them. Leaving that to the caller is how
 * the design system's most common violation gets in.
 */
export const AccentTile = ({ accent, label, value, footnote }: AccentTileProps) => {
  return (
    <View style={[styles.tile, fillStyles[accent]]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <AccentTileFootnote footnote={footnote} />
    </View>
  );
};

type AccentTileFootnoteProps = {
  footnote?: string;
};

const AccentTileFootnote = ({ footnote }: AccentTileFootnoteProps) => {
  if (!footnote) {
    return null;
  }

  return <Text style={styles.footnote}>{footnote}</Text>;
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.tile,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    gap: spacing.xs,
  },
  label: {
    ...typography.kicker,
    color: colors.ink,
  },
  value: {
    ...typography.tileValue,
    color: colors.ink,
  },
  footnote: {
    ...typography.microLabel,
    color: colors.ink,
  },
});

const fillStyles = StyleSheet.create({
  [AccentEnum.CORAL]: { backgroundColor: colors.coral },
  [AccentEnum.BUTTER]: { backgroundColor: colors.butter },
  [AccentEnum.LAVENDER]: { backgroundColor: colors.lavender },
});
