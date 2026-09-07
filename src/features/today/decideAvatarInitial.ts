/** The single letter shown in the avatar, or nothing at all when the name was never given. */
export const decideAvatarInitial = (name: string | null): string | null => {
  if (name === null) {
    return null;
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.slice(0, 1).toUpperCase();
};
