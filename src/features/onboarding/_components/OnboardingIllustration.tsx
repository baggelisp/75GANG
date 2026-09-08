import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { spacing } from '@/theme/spacing';

export type OnboardingIllustrationProps = {
  xml: string;
  accessibilityLabel: string;
};

const ILLUSTRATION_WIDTH = 240;
const ILLUSTRATION_HEIGHT = 180;

/**
 * An unDraw illustration on a slide.
 *
 * Rendered from an inlined SVG string, so it scales to any screen and needs no asset fetch. The
 * label is what a screen reader reads instead of the picture — an unlabelled decorative image is
 * worse than none.
 */
export const OnboardingIllustration = ({
  xml,
  accessibilityLabel,
}: OnboardingIllustrationProps) => {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={styles.illustration}
    >
      <SvgXml xml={xml} width={ILLUSTRATION_WIDTH} height={ILLUSTRATION_HEIGHT} />
    </View>
  );
};

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.giant,
  },
});
