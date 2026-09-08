import { useLocalSearchParams } from 'expo-router';

import { DayDetailScreen } from '@/features/day-detail/DayDetailScreen';

const DayDetailRoute = () => {
  const { date } = useLocalSearchParams<{ date: string }>();

  return <DayDetailScreen date={date} />;
};

export default DayDetailRoute;
