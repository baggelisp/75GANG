import { FileStore } from '@/storage/ports/fileStore';

export type InMemoryFileStore = FileStore & {
  snapshot(): Record<string, string>;
};

/**
 * The FileStore double. Unit tests never touch expo-file-system, so photo behaviour is exercised
 * against this and the real adapter is covered on device.
 */
export const createInMemoryFileStore = (): InMemoryFileStore => {
  const files = new Map<string, string>();

  const write = async (relativePath: string, sourceUri: string): Promise<string> => {
    files.set(relativePath, sourceUri);

    return relativePath;
  };

  const removeDirectory = async (relativeDirectory: string): Promise<void> => {
    const prefix = `${relativeDirectory}/`;

    Array.from(files.keys())
      .filter((path) => path.startsWith(prefix))
      .forEach((path) => files.delete(path));
  };

  return {
    write,
    exists: async (relativePath) => files.has(relativePath),
    remove: async (relativePath) => {
      files.delete(relativePath);
    },
    removeDirectory,
    resolveUri: (relativePath) => `file:///documents/${relativePath}`,
    snapshot: () => Object.fromEntries(files),
  };
};
