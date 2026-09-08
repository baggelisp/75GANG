import { OnboardingBarButton } from './OnboardingBarButton';

export type OnboardingSkipButtonProps = {
  isLastPage: boolean;
  label: string;
  onSkip: () => void;
};

/** Nothing to skip on the last page, where the button becomes Done. */
export const OnboardingSkipButton = ({ isLastPage, label, onSkip }: OnboardingSkipButtonProps) => {
  if (isLastPage) {
    return null;
  }

  return <OnboardingBarButton label={label} align="left" onPress={onSkip} />;
};
