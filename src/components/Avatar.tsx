import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { radii } from '@/theme/radii';
import { colors } from '@/theme/tokens';

import { AvatarMark } from './AvatarMark';
import { AvatarStatusDot } from './AvatarStatusDot';

export type AvatarProps = {
  /** Null when no name was given — the name is optional at onboarding. */
  name: string | null;
  size: number;
  hasStatusDot: boolean;
};

export const AVATAR_SIZE_SMALL = 40;
export const AVATAR_SIZE_LARGE = 56;

/**
 * Whoever is doing the challenge, on Today and on Profile.
 *
 * A warm grey circle rather than a coral one: coral means done or active, and an avatar is
 * neither.
 */
export const Avatar = ({ name, size, hasStatusDot }: AvatarProps) => {
  const circle = useMemo(() => ({ width: size, height: size }), [size]);
  const initial = decideAvatarInitial(name);

  return (
    <View style={[styles.avatar, circle]}>
      <AvatarMark initial={initial} size={size} />
      <AvatarStatusDot isVisible={hasStatusDot} />
    </View>
  );
};

/** The single letter shown in the avatar, or nothing at all when the name was never given. */
const decideAvatarInitial = (name: string | null): string | null => {
  if (name === null) {
    return null;
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.slice(0, 1).toUpperCase();
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.raised,
  },
});
