import {
  HOW_IT_WORKS_ILLUSTRATION,
  WELCOME_ILLUSTRATION,
  YOUR_DATA_ILLUSTRATION,
} from './illustrations';

export const OnboardingSlideEnum = {
  WELCOME: 'welcome',
  HOW_IT_WORKS: 'howItWorks',
  YOUR_DATA: 'yourData',
} as const;

export type OnboardingSlideName = (typeof OnboardingSlideEnum)[keyof typeof OnboardingSlideEnum];

const ILLUSTRATION_BY_SLIDE: Readonly<Record<OnboardingSlideName, string>> = {
  [OnboardingSlideEnum.WELCOME]: WELCOME_ILLUSTRATION,
  [OnboardingSlideEnum.HOW_IT_WORKS]: HOW_IT_WORKS_ILLUSTRATION,
  [OnboardingSlideEnum.YOUR_DATA]: YOUR_DATA_ILLUSTRATION,
};

/** Every slide has one, stated exhaustively, so a new slide cannot ship without a picture. */
export const findIllustration = (slide: OnboardingSlideName): string =>
  ILLUSTRATION_BY_SLIDE[slide];
