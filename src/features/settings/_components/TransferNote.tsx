import { ImportRejection, ImportRejectionEnum } from '@/domain/export/validateImport';

import { TransferNotice, TransferNoticeEnum } from '../_hooks/useDataTransfer';
import { SettingsNote } from './SettingsNote';

export type TransferNoteProps = {
  notice: TransferNotice;
  rejection: ImportRejection | null;
};

const NOTICE_KEYS: Readonly<Record<TransferNotice, string | null>> = {
  [TransferNoticeEnum.NONE]: null,
  [TransferNoticeEnum.EXPORTED]: 'settings.exported',
  [TransferNoticeEnum.EXPORT_FAILED]: 'settings.exportFailed',
  [TransferNoticeEnum.SHARING_UNAVAILABLE]: 'settings.sharingUnavailable',
  [TransferNoticeEnum.IMPORT_FAILED]: 'settings.importFailed',
  [TransferNoticeEnum.READ_FAILED]: 'settings.readFailed',
};

/** A rejection says which of the four rules the file broke, never just "invalid file". */
const REJECTION_KEYS: Readonly<Record<ImportRejection, string>> = {
  [ImportRejectionEnum.NOT_JSON]: 'settings.rejectNotJson',
  [ImportRejectionEnum.NOT_A_BACKUP]: 'settings.rejectNotBackup',
  [ImportRejectionEnum.SCHEMA_TOO_NEW]: 'settings.rejectSchemaTooNew',
  [ImportRejectionEnum.CHALLENGE_INVALID]: 'settings.rejectChallengeInvalid',
};

const SUCCESSES: readonly TransferNotice[] = [TransferNoticeEnum.EXPORTED];

export const TransferNote = ({ notice, rejection }: TransferNoteProps) => {
  if (rejection !== null) {
    return <SettingsNote savedKey={null} failedKey={REJECTION_KEYS[rejection]} />;
  }

  const key = NOTICE_KEYS[notice];

  if (key === null) {
    return null;
  }

  if (SUCCESSES.includes(notice)) {
    return <SettingsNote savedKey={key} failedKey={null} />;
  }

  return <SettingsNote savedKey={null} failedKey={key} />;
};
