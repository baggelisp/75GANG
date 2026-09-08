/** Progress photos. The day record stores the path this returns, never the image itself. */
export type FileStore = {
  write(relativePath: string, sourceUri: string): Promise<string>;
  exists(relativePath: string): Promise<boolean>;
  remove(relativePath: string): Promise<void>;
  removeDirectory(relativeDirectory: string): Promise<void>;
  resolveUri(relativePath: string): string;
};
