import { View } from 'react-native';

/**
 * A placeholder for the swiper's image slot.
 *
 * The slot is required and its container is `flex: 0`, which react-native-web resolves to a
 * flex-basis of zero — the box collapses to its padding and anything inside it overflows onto the
 * text below. So the slides compose their own illustration and this stands in the slot.
 */
export const EmptySlideImage = () => {
  return <View />;
};
