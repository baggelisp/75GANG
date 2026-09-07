import { Redirect } from 'expo-router';
import { useState } from 'react';

import { PlaceholderScreen } from '@/features/placeholder/PlaceholderScreen';

import { EntryLoading } from './_components/EntryLoading';
import { EntryUnavailable } from './_components/EntryUnavailable';
import { decideEntryDestination, EntryDestinationEnum } from './decideEntryDestination';
import { useExistingChallenge } from './_hooks/useExistingChallenge';

/**
 * Decides where a launch lands. A user with a stored challenge goes straight to their day and
 * never sees onboarding again; anyone else starts at the intro.
 */
export const EntryScreen = () => {
  const [attempt, setAttempt] = useState(0);
  const { status } = useExistingChallenge();
  const destination = decideEntryDestination(status);

  const retry = () => {
    setAttempt(attempt + 1);
  };

  if (destination === EntryDestinationEnum.WAITING) {
    return <EntryLoading />;
  }

  if (destination === EntryDestinationEnum.UNREADABLE) {
    return <EntryUnavailable onRetry={retry} />;
  }

  if (destination === EntryDestinationEnum.ONBOARDING) {
    return <Redirect href="/onboarding" />;
  }

  return <PlaceholderScreen />;
};
