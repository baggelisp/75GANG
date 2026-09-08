import { render, screen } from '@testing-library/react-native';

import { Avatar, AVATAR_SIZE_LARGE, AVATAR_SIZE_SMALL } from '@/components/Avatar';

describe('with a name', () => {
  it('shows the first letter, in capitals', () => {
    render(<Avatar name="vangelis" size={AVATAR_SIZE_SMALL} hasStatusDot={false} />);

    expect(screen.getByText('V')).toBeTruthy();
  });

  it('ignores the whitespace someone typed around it', () => {
    render(<Avatar name="  bill " size={AVATAR_SIZE_SMALL} hasStatusDot={false} />);

    expect(screen.getByText('B')).toBeTruthy();
  });
});

describe('without a name', () => {
  const A_SINGLE_LETTER = /^[A-Z]$/;

  it('shows no initial, and falls back to the person icon instead', () => {
    render(<Avatar name={null} size={AVATAR_SIZE_LARGE} hasStatusDot={false} />);

    expect(screen.queryByText(A_SINGLE_LETTER)).toBeNull();
  });

  it('treats a name of only spaces as no name at all', () => {
    render(<Avatar name="   " size={AVATAR_SIZE_LARGE} hasStatusDot={false} />);

    expect(screen.queryByText(A_SINGLE_LETTER)).toBeNull();
  });
});
