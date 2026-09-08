import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export type RuleCheckMarkProps = {
  isDone: boolean;
};

const MARK_SIZE = 11;
const MARK_STROKE = 3.5;

/**
 * The mark is what makes completion readable without colour — it survives greyscale and colour
 * blindness, which a coral fill alone does not.
 */
export const RuleCheckMark = ({ isDone }: RuleCheckMarkProps) => {
  if (!isDone) {
    return null;
  }

  return (
    <Svg width={MARK_SIZE} height={MARK_SIZE} viewBox="0 0 24 24">
      <Path
        d="M4 12l5 5L20 6"
        fill="none"
        stroke={colors.ink}
        strokeWidth={MARK_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
