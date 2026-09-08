import { Pressable, StyleSheet, View } from 'react-native';

import { radii } from '@/theme/radii';
import { colors } from '@/theme/tokens';

export type ToggleSwitchProps = {
  isOn: boolean;
  isDisabled: boolean;
  accessibilityLabel: string;
  onToggle: () => void;
};

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const KNOB_SIZE = 22;
const KNOB_INSET = 3;
const DISABLED_OPACITY = 0.5;

/**
 * Our own switch rather than React Native's.
 *
 * The platform one paints its own accent — a teal thumb on web, a system blue or green on device —
 * and no combination of `trackColor` and `thumbColor` reliably suppresses it. That is a fourth
 * colour in an app whose whole palette is three, and it showed up in the first screenshot of the
 * settings screen. Two coloured views and a Pressable cost nothing and stay in the palette.
 */
export const ToggleSwitch = ({
  isOn,
  isDisabled,
  accessibilityLabel,
  onToggle,
}: ToggleSwitchProps) => {
  const trackStyle = isOn ? styles.on : styles.off;
  const knobStyle = isOn ? styles.knobOn : styles.knobOff;
  const disabledStyle = isDisabled ? styles.disabled : null;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: isOn, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onToggle}
      style={[styles.track, trackStyle, disabledStyle]}
    >
      <View style={[styles.knob, knobStyle]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  on: {
    backgroundColor: colors.coral,
  },
  off: {
    backgroundColor: colors.raised,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: radii.pill,
  },
  knobOn: {
    backgroundColor: colors.ink,
    marginLeft: TRACK_WIDTH - KNOB_SIZE - KNOB_INSET,
  },
  knobOff: {
    backgroundColor: colors.textSecondary,
    marginLeft: KNOB_INSET,
  },
});
