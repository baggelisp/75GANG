import AntDesign from '@expo/vector-icons/AntDesign';

import { colors } from '@/theme/tokens';

export type RuleCheckMarkProps = {
  isDone: boolean;
};

const MARK_SIZE = 13;

/**
 * The mark is what makes completion readable without colour — it survives greyscale and colour
 * blindness, which a coral fill alone does not.
 */
export const RuleCheckMark = ({ isDone }: RuleCheckMarkProps) => {
  if (!isDone) {
    return null;
  }

  return <AntDesign name="check" size={MARK_SIZE} color={colors.ink} />;
};
