import { ImportPayload } from '@/domain/export/validateImport';
import { Locale, Translate, useTranslation } from '@/i18n';
import { formatLongDate } from '@/utils/DateUtility';

import { ConfirmDialog } from './ConfirmDialog';

export type ImportConfirmDialogProps = {
  pending: ImportPayload | null;
  isBusy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * The gate in front of an import.
 *
 * It describes the backup rather than asking "are you sure": the challenge in the file and the
 * day it began are what tell someone whether this is the file they meant to choose.
 */
export const ImportConfirmDialog = ({
  pending,
  isBusy,
  onConfirm,
  onCancel,
}: ImportConfirmDialogProps) => {
  const { t, locale } = useTranslation();

  return (
    <ConfirmDialog
      isVisible={pending !== null}
      title={t('settings.confirmImportTitle')}
      body={describeBackup(pending, t, locale)}
      confirmLabel={t('settings.confirmImport')}
      isConfirming={isBusy}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

const describeBackup = (pending: ImportPayload | null, t: Translate, locale: Locale): string => {
  if (pending === null) {
    return '';
  }

  return t('settings.confirmImportBody', {
    mode: t(`modes.${pending.challenge.mode}.name`),
    date: formatLongDate(pending.challenge.startDate, locale),
  });
};
