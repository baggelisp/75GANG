/**
 * Where an export is written before it is handed to the share sheet.
 *
 * Its own directory, so a reset can delete the progress photos without also deleting the backups
 * the user made to survive exactly that.
 */
export const BACKUP_DIRECTORY = 'backups';

export const buildBackupPath = (fileName: string): string => `${BACKUP_DIRECTORY}/${fileName}`;
