import { SecondaryButton } from '@/components/SecondaryButton';

export type CounterUndoButtonProps = {
  label: string;
  accessibilityLabel: string;
  amount: number;
  onStep: (amount: number) => void;
};

/**
 * Removes one fixed step — 250 ml or a page — so a mis-tap is recoverable.
 *
 * Deliberately not an undo of whatever was last tapped: the button says the amount it removes, and
 * a control whose label and behaviour disagree is worse than no undo at all.
 */
export const CounterUndoButton = ({
  label,
  accessibilityLabel,
  amount,
  onStep,
}: CounterUndoButtonProps) => {
  const press = () => {
    onStep(amount);
  };

  return <SecondaryButton label={label} accessibilityLabel={accessibilityLabel} onPress={press} />;
};
