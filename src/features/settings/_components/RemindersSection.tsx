import { Settings } from '@/domain/types';
import { useTranslation } from '@/i18n';

import { Reminder, ReminderEnum } from '../_hooks/useSettings';
import { ReminderRow } from './ReminderRow';
import { SettingsNote } from './SettingsNote';
import { SettingsSection } from './SettingsSection';
import { SettingsToggleRow } from './SettingsToggleRow';

export type RemindersSectionProps = {
  settings: Settings;
  isPermissionDenied: boolean;
  onToggle: () => void;
  onStep: (reminder: Reminder, steps: number) => void;
};

const ONE_STEP = 1;

/** Times are editable whether or not reminders are on, but they read as inert while they are off. */
export const RemindersSection = ({
  settings,
  isPermissionDenied,
  onToggle,
  onStep,
}: RemindersSectionProps) => {
  const { t } = useTranslation();
  const isOff = !settings.notificationsEnabled;

  const stepMorningEarlier = () => onStep(ReminderEnum.MORNING, -ONE_STEP);
  const stepMorningLater = () => onStep(ReminderEnum.MORNING, ONE_STEP);
  const stepEveningEarlier = () => onStep(ReminderEnum.EVENING, -ONE_STEP);
  const stepEveningLater = () => onStep(ReminderEnum.EVENING, ONE_STEP);

  return (
    <SettingsSection title={t('settings.sectionReminders')}>
      <SettingsToggleRow
        label={t('settings.notificationsLabel')}
        hint={t('settings.notificationsHint')}
        isOn={settings.notificationsEnabled}
        isLocked={false}
        onToggle={onToggle}
      />
      <ReminderRow
        label={t('settings.morningLabel')}
        time={settings.morningReminder}
        isDisabled={isOff}
        isFirst={false}
        onEarlier={stepMorningEarlier}
        onLater={stepMorningLater}
      />
      <ReminderRow
        label={t('settings.eveningLabel')}
        time={settings.eveningReminder}
        isDisabled={isOff}
        isFirst={false}
        onEarlier={stepEveningEarlier}
        onLater={stepEveningLater}
      />
      <SettingsNote
        savedKey={null}
        failedKey={isPermissionDenied ? 'settings.permissionDenied' : null}
      />
    </SettingsSection>
  );
};
