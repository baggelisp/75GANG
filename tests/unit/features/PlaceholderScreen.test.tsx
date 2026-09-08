import { render, screen } from '@testing-library/react-native';

import { PlaceholderScreen } from '@/features/placeholder/PlaceholderScreen';

describe('PlaceholderScreen', () => {
  it('shows the app name and the tagline so the boot target is visibly the right app', () => {
    render(<PlaceholderScreen />);

    expect(screen.getByText('75 G-ANG')).toBeTruthy();
    expect(screen.getByText('75 Days. 11 Rules. A Better You.')).toBeTruthy();
  });
});
