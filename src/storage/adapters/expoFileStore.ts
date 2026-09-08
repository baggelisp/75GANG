import * as FileSystem from 'expo-file-system/legacy';

import { FileStore } from '@/storage/ports/fileStore';

const resolveRoot = (): string => {
  const root = FileSystem.documentDirectory;

  if (root === null) {
    // Coercing this to '' would hand a bare relative path to copyAsync and delete the wrong thing.
    throw new Error('No document directory is available on this platform');
  }

  return root;
};

/**
 * The only module that imports expo-file-system. Progress photos are copied into the app's own
 * documents directory and referenced by relative path — the image never enters a day record and
 * never leaves the device.
 */
export const createExpoFileStore = (): FileStore => {
  const resolveUri = (relativePath: string): string => `${resolveRoot()}${relativePath}`;

  const ensureDirectory = async (relativePath: string): Promise<void> => {
    const directory = relativePath.split('/').slice(0, -1).join('/');

    if (directory.length === 0) {
      return;
    }

    await FileSystem.makeDirectoryAsync(resolveUri(directory), { intermediates: true });
  };

  const write = async (relativePath: string, sourceUri: string): Promise<string> => {
    await ensureDirectory(relativePath);
    await FileSystem.copyAsync({ from: sourceUri, to: resolveUri(relativePath) });

    return relativePath;
  };

  const writeText = async (relativePath: string, contents: string): Promise<string> => {
    await ensureDirectory(relativePath);
    await FileSystem.writeAsStringAsync(resolveUri(relativePath), contents);

    return relativePath;
  };

  const readTextAt = (uri: string): Promise<string> => FileSystem.readAsStringAsync(uri);

  const exists = async (relativePath: string): Promise<boolean> => {
    const info = await FileSystem.getInfoAsync(resolveUri(relativePath));

    return info.exists;
  };

  const remove = async (relativePath: string): Promise<void> => {
    await FileSystem.deleteAsync(resolveUri(relativePath), { idempotent: true });
  };

  const removeDirectory = async (relativeDirectory: string): Promise<void> => {
    await FileSystem.deleteAsync(resolveUri(relativeDirectory), { idempotent: true });
  };

  return { write, writeText, readTextAt, exists, remove, removeDirectory, resolveUri };
};
