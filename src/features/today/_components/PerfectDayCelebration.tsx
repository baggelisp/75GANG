import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type PerfectDayCelebrationProps = {
  isShowing: boolean;
  prefersReducedMotion: boolean;
  day: number;
  totalHabits: number;
  onDismiss: () => void;
};

const ICON_SIZE = 20;
const FADE_MILLISECONDS = 220;
const RISE_DISTANCE = 12;
const HIDDEN = 0;
const SHOWN = 1;

/**
 * The one real animation in the app: the day just became perfect.
 *
 * It floats over the screen rather than pushing it about, and the backdrop lets touches straight
 * through — someone who wants to carry on tapping never has to wait for it. With reduce motion on
 * it appears and leaves outright, saying exactly the same thing.
 */
export const PerfectDayCelebration = ({
  isShowing,
  prefersReducedMotion,
  day,
  totalHabits,
  onDismiss,
}: PerfectDayCelebrationProps) => {
  const { t } = useTranslation();
  const progress = useRef(new Animated.Value(HIDDEN)).current;
  const bannerStyle = useMemo(
    () => ({
      opacity: progress,
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [HIDDEN, SHOWN],
            outputRange: [RISE_DISTANCE, HIDDEN],
          }),
        },
      ],
    }),
    [progress],
  );

  useEffect(() => {
    const target = isShowing ? SHOWN : HIDDEN;

    if (prefersReducedMotion) {
      progress.setValue(target);

      return;
    }

    Animated.timing(progress, {
      toValue: target,
      duration: FADE_MILLISECONDS,
      useNativeDriver: true,
    }).start();
  }, [isShowing, prefersReducedMotion, progress]);

  if (!isShowing) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <Animated.View style={[styles.banner, bannerStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('today.perfectDayDismiss')}
          onPress={onDismiss}
          style={styles.content}
        >
          <View style={styles.mark}>
            <AntDesign name="check" size={ICON_SIZE} color={colors.ink} />
          </View>
          <View style={styles.text}>
            <Text style={styles.title}>{t('today.perfectDayTitle')}</Text>
            <Text style={styles.body}>
              {t('today.perfectDayBody', { total: totalHabits, day })}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const MARK_SIZE = 40;

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    padding: spacing.giant,
  },
  banner: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxxl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.huge,
  },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.coral,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.sectionLabel,
    color: colors.text,
  },
  body: {
    ...typography.ruleMeta,
    color: colors.textSecondary,
  },
});
