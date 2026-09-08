/**
 * The two native doors a backup goes through: out to the share sheet, and in from the document
 * picker. Both are device-only, which is exactly why they sit behind a port — every test runs
 * against a double, and the feature logic is exercised without either.
 */
export type BackupTransport = {
  /** Hands a file already written by the FileStore to the native share sheet. */
  share(uri: string, fileName: string): Promise<boolean>;
  /** Opens the document picker, filtered to JSON. Null means the user cancelled. */
  pickJsonUri(): Promise<string | null>;
};
