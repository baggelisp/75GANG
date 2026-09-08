import AntDesign from '@expo/vector-icons/AntDesign';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type ProgressPhotoProps = {
  uri: string | null;
};

const PHOTO_HEIGHT = 220;
const PLACEHOLDER_ICON_SIZE = 28;

/**
 * The day's progress photo, or a placeholder.
 *
 * A path whose file has gone — a restored export, a cleared cache — shows the placeholder rather
 * than throwing or blocking the record. The weight beside it is still worth keeping.
 */
export const ProgressPhoto = ({ uri }: ProgressPhotoProps) => {
  const { t } = useTranslation();

  if (uri === null) {
    return (
      <View style={styles.placeholder}>
        <AntDesign name="camera" size={PLACEHOLDER_ICON_SIZE} color={colors.textTertiary} />
        <Text style={styles.placeholderLabel}>{t('weighIn.noPhoto')}</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={t('weighIn.photoLabel')}
      source={{ uri }}
      style={styles.photo}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  photo: {
    height: PHOTO_HEIGHT,
    borderRadius: radii.card,
    backgroundColor: colors.raised,
  },
  placeholder: {
    height: PHOTO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.raised,
  },
  placeholderLabel: {
    ...typography.microLabel,
    color: colors.textTertiary,
  },
});
