import { useTranslation } from '@/i18n';

import { SettingsActionRow } from './SettingsActionRow';
import { SettingsSection } from './SettingsSection';

export type DataSectionProps = {
  isBusy: boolean;
  onExport: () => void;
  onImport: () => void;
};

/**
 * Export and import, the only way data leaves or enters this app.
 *
 * Export is not destructive and reads as an ordinary row. Import replaces everything and reads as
 * what it is.
 */
export const DataSection = ({ isBusy, onExport, onImport }: DataSectionProps) => {
  const { t } = useTranslation();

  return (
    <SettingsSection title={t('settings.sectionData')}>
      <SettingsActionRow
        label={t('settings.exportLabel')}
        hint={t('settings.exportHint')}
        isFirst
        isDisabled={isBusy}
        isDestructive={false}
        onPress={onExport}
      />
      <SettingsActionRow
        label={t('settings.importLabel')}
        hint={t('settings.importHint')}
        isFirst={false}
        isDisabled={isBusy}
        isDestructive
        onPress={onImport}
      />
    </SettingsSection>
  );
};
