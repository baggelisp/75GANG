import { render, screen } from '@testing-library/react-native';

import { ConfirmDialog } from '@/features/settings/_components/ConfirmDialog';

const renderDialog = (isConfirming: boolean) =>
  render(
    <ConfirmDialog
      isVisible
      title="Erase your challenge?"
      body="This deletes everything you have recorded."
      confirmLabel="Erase"
      isConfirming={isConfirming}
      onConfirm={jest.fn()}
      onCancel={jest.fn()}
    />,
  );

describe('while the action is running', () => {
  it('takes both buttons out of reach', () => {
    renderDialog(true);

    expect(screen.getByLabelText('Erase').props.accessibilityState.disabled).toBe(true);
    // Cancel cannot call back a write already in flight, and a live Cancel that quietly does
    // nothing is worse than no Cancel at all.
    expect(screen.getByLabelText('Cancel').props.accessibilityState.disabled).toBe(true);
  });
});

describe('before the action starts', () => {
  it('leaves both buttons live', () => {
    renderDialog(false);

    expect(screen.getByLabelText('Erase').props.accessibilityState.disabled).toBe(false);
    expect(screen.getByLabelText('Cancel').props.accessibilityState.disabled).toBe(false);
  });
});
