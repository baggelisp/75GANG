import { ChallengeMode } from '@/domain/modes';
import { Translate, useTranslation } from '@/i18n';

import { PendingAction, PendingActionEnum } from '../_hooks/useChallengeControls';
import { ConfirmDialog } from './ConfirmDialog';

export type ChallengeConfirmDialogProps = {
  pending: PendingAction;
  isRunning: boolean;
  currentDay: number;
  mode: ChallengeMode | null;
  onConfirm: () => void;
  onCancel: () => void;
};

type ConfirmCopy = {
  title: string;
  body: string;
  confirmLabel: string;
};

/** The wording for whichever destructive action was asked for. */
export const ChallengeConfirmDialog = ({
  pending,
  isRunning,
  currentDay,
  mode,
  onConfirm,
  onCancel,
}: ChallengeConfirmDialogProps) => {
  const { t } = useTranslation();
  const copy = resolveCopy(pending, currentDay, mode, t);

  return (
    <ConfirmDialog
      isVisible={pending !== PendingActionEnum.NONE}
      title={copy.title}
      body={copy.body}
      confirmLabel={copy.confirmLabel}
      isConfirming={isRunning}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

const resolveCopy = (
  pending: PendingAction,
  currentDay: number,
  mode: ChallengeMode | null,
  t: Translate,
): ConfirmCopy => {
  if (pending === PendingActionEnum.RESTART) {
    return {
      title: t('settings.confirmRestartTitle'),
      body: t('settings.confirmRestartBody', {
        day: currentDay,
        mode: describeMode(mode, t),
      }),
      confirmLabel: t('settings.confirmRestart'),
    };
  }

  return {
    title: t('settings.confirmResetTitle'),
    body: t('settings.confirmResetBody', { day: currentDay }),
    confirmLabel: t('settings.confirmReset'),
  };
};

const describeMode = (mode: ChallengeMode | null, t: Translate): string => {
  if (mode === null) {
    return '';
  }

  return t(`modes.${mode}.name`);
};
