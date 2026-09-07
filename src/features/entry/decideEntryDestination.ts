import { ChallengeLookupEnum, ChallengeLookupStatus } from './_hooks/useExistingChallenge';

export const EntryDestinationEnum = {
  WAITING: 'WAITING',
  ONBOARDING: 'ONBOARDING',
  CHALLENGE: 'CHALLENGE',
  UNREADABLE: 'UNREADABLE',
} as const;

export type EntryDestination = (typeof EntryDestinationEnum)[keyof typeof EntryDestinationEnum];

/**
 * Where a launch lands.
 *
 * A challenge that could not be read is not the same as no challenge. The record may be intact and
 * simply unavailable this launch, so the user is shown a retry rather than an invitation to start
 * again over the top of it.
 */
export const decideEntryDestination = (status: ChallengeLookupStatus): EntryDestination => {
  if (status === ChallengeLookupEnum.LOADING) {
    return EntryDestinationEnum.WAITING;
  }

  if (status === ChallengeLookupEnum.FOUND) {
    return EntryDestinationEnum.CHALLENGE;
  }

  if (status === ChallengeLookupEnum.UNREADABLE) {
    return EntryDestinationEnum.UNREADABLE;
  }

  return EntryDestinationEnum.ONBOARDING;
};
