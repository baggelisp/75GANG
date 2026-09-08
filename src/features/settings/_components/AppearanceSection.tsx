import { useTranslation } from '@/i18n';

import { SettingsSection } from './SettingsSection';
import { SettingsToggleRow } from './SettingsToggleRow';

export type AppearanceSectionProps = {
  isDark: boolean;
};

/** A locked switch still needs a handler; it can never fire, because the row is disabled. */
const ignoreToggle = () => undefined;

/**
 * The theme, shown and not offered.
 *
 * Dark is the only theme this version has. Hiding the row would leave the user wondering; a live
 * switch that changes nothing would be a lie. It shows its real position and says why.
 */
export const AppearanceSection = ({ isDark }: AppearanceSectionProps) => {
  const { t } = useTranslation();

  return (
    <SettingsSection title={t('settings.sectionAppearance')}>
      <SettingsToggleRow
        label={t('settings.darkModeLabel')}
        hint={t('settings.darkModeHint')}
        isOn={isDark}
        isLocked
        onToggle={ignoreToggle}
      />
    </SettingsSection>
  );
};
