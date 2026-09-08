import { ChallengeMode } from '@/domain/modes';
import { useTranslation } from '@/i18n';

import { PendingAction, PendingActionEnum } from '../_hooks/useChallengeControls';
import { SettingsActionRow } from './SettingsActionRow';
import { SettingsSection } from './SettingsSection';

export type StartAgainSectionProps = {
  mode: ChallengeMode | null;
  isRunning: boolean;
  onAsk: (action: PendingAction) => void;
};

/** Renders nothing without a challenge: there is nothing to restart or erase. */
export const StartAgainSection = ({ mode, isRunning, onAsk }: StartAgainSectionProps) => {
  const { t } = useTranslation();

  const askRestart = () => onAsk(PendingActionEnum.RESTART);
  const askReset = () => onAsk(PendingActionEnum.RESET);

  if (mode === null) {
    return null;
  }

  return (
    <SettingsSection title={t('settings.sectionStartAgain')}>
      <SettingsActionRow
        label={t('settings.restartLabel')}
        hint={t('settings.restartHint')}
        isFirst
        isDisabled={isRunning}
        isDestructive
        onPress={askRestart}
      />
      <SettingsActionRow
        label={t('settings.resetLabel')}
        hint={t('settings.resetHint')}
        isFirst={false}
        isDisabled={isRunning}
        isDestructive
        onPress={askReset}
      />
    </SettingsSection>
  );
};
