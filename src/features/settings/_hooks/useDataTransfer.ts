import { useState } from 'react';

import { buildBackupFileName, buildExportEnvelope } from '@/domain/export/schema';
import { ImportPayload, ImportRejection, validateImport } from '@/domain/export/validateImport';
import { buildBackupPath } from '@/storage/backupPaths';
import { Repositories } from '@/storage/repositories/buildRepositories';
import { useRepositories } from '@/storage/repositoryContext';
import { toLocalIsoDate } from '@/utils/DateUtility';

export const TransferNoticeEnum = {
  NONE: 'NONE',
  EXPORTED: 'EXPORTED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  SHARING_UNAVAILABLE: 'SHARING_UNAVAILABLE',
  IMPORT_FAILED: 'IMPORT_FAILED',
  READ_FAILED: 'READ_FAILED',
} as const;

export type TransferNotice = (typeof TransferNoticeEnum)[keyof typeof TransferNoticeEnum];

export type TransferView = {
  notice: TransferNotice;
  rejection: ImportRejection | null;
  pending: ImportPayload | null;
  isBusy: boolean;
};

const IDLE: TransferView = {
  notice: TransferNoticeEnum.NONE,
  rejection: null,
  pending: null,
  isBusy: false,
};

/** Pretty-printed, because a backup is a file a person may well open and read. */
const JSON_INDENT = 2;

/**
 * Export and import.
 *
 * Export is read-only where it matters: it writes the backup into its own directory and hands it
 * to the share sheet, and touches nothing the challenge is made of.
 *
 * Import validates the whole file before a single byte is written, and then still waits for an
 * explicit confirmation — it replaces every stored record, and the user is entitled to see what
 * they are about to lose first.
 *
 * Progress photos are deliberately left where they are. A backup never carries them, so deleting
 * them would lose pictures the file cannot put back. The cost is that photos are keyed by date
 * alone: importing a backup from another device onto one that already has photos can show an
 * imported day a photo that belonged to the challenge it replaced.
 */
export const useDataTransfer = () => {
  const repositories = useRepositories();
  const [view, setView] = useState<TransferView>(IDLE);

  const withBusy = async (task: () => Promise<TransferView>): Promise<TransferView> => {
    setView({ ...IDLE, isBusy: true });

    const next = await task().catch(() => ({
      ...IDLE,
      notice: TransferNoticeEnum.EXPORT_FAILED,
    }));

    setView(next);

    return next;
  };

  const exportBackup = () =>
    withBusy(async () => {
      const envelope = await readEverything(repositories);

      if (envelope === null) {
        return { ...IDLE, notice: TransferNoticeEnum.EXPORT_FAILED };
      }

      const fileName = buildBackupFileName(toLocalIsoDate(repositories.clock.now()));
      const path = buildBackupPath(fileName);

      await repositories.files.writeText(path, JSON.stringify(envelope, null, JSON_INDENT));

      const shared = await repositories.transport.share(
        repositories.files.resolveUri(path),
        fileName,
      );

      if (!shared) {
        return { ...IDLE, notice: TransferNoticeEnum.SHARING_UNAVAILABLE };
      }

      return { ...IDLE, notice: TransferNoticeEnum.EXPORTED };
    });

  const chooseFile = () =>
    withBusy(async () => {
      const uri = await repositories.transport.pickJsonUri();

      if (uri === null) {
        return IDLE;
      }

      const raw = await repositories.files.readTextAt(uri).catch(() => null);

      if (raw === null) {
        return { ...IDLE, notice: TransferNoticeEnum.READ_FAILED };
      }

      const validated = validateImport(raw);

      if (!validated.ok) {
        return { ...IDLE, rejection: validated.reason };
      }

      return { ...IDLE, pending: validated.value };
    });

  const confirmImport = async (): Promise<boolean> => {
    const payload = view.pending;

    if (payload === null) {
      return false;
    }

    setView({ ...view, isBusy: true });

    const replaced = await repositories.backups.replaceAll(payload).catch(() => false);

    if (!replaced) {
      setView({ ...IDLE, notice: TransferNoticeEnum.IMPORT_FAILED });

      return false;
    }

    setView(IDLE);

    return true;
  };

  const cancelImport = () => setView(IDLE);

  return { ...view, exportBackup, chooseFile, confirmImport, cancelImport };
};

/**
 * Every key, or nothing.
 *
 * A read that failed is not the same as a key that was never written, and exporting a `null` for
 * a challenge that is really on the device would hand the user a backup that quietly erases it
 * when they restore.
 */
const readEverything = async (repositories: Repositories) => {
  const [profile, challenge, days, journal, settings] = await Promise.all([
    repositories.profile.read(),
    repositories.challenge.read(),
    repositories.days.readAll(),
    repositories.journal.readAll(),
    repositories.settings.read(),
  ]);

  if (!profile.ok || !challenge.ok || !days.ok || !journal.ok || !settings.ok) {
    return null;
  }

  return buildExportEnvelope({
    profile: profile.value,
    challenge: challenge.value,
    days: days.value,
    journal: journal.value,
    settings: settings.value,
    exportedAt: repositories.clock.now().toISOString(),
  });
};
