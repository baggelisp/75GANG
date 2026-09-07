import { useLocalSearchParams } from 'expo-router';

import { HabitDetailScreen } from '@/features/habit-detail/HabitDetailScreen';

const HabitDetailRoute = () => {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();

  return <HabitDetailScreen habitId={habitId} />;
};

export default HabitDetailRoute;
