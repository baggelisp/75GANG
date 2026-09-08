/** Progress photos. The day record stores the path this returns, never the image itself. */
export type FileStore = {
  write(relativePath: string, sourceUri: string): Promise<string>;
  /** Writes text to a file the app owns — the backup JSON, which has no source file to copy. */
  writeText(relativePath: string, contents: string): Promise<string>;
  /** Reads any absolute uri as text, including one the document picker handed back. */
  readTextAt(uri: string): Promise<string>;
  exists(relativePath: string): Promise<boolean>;
  remove(relativePath: string): Promise<void>;
  removeDirectory(relativeDirectory: string): Promise<void>;
  resolveUri(relativePath: string): string;
};
