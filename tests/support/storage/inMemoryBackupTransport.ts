import { BackupTransport } from '@/storage/ports/backupTransport';

export type InMemoryBackupTransport = BackupTransport & {
  /** Every uri handed to the share sheet, in order. */
  shared(): readonly { uri: string; fileName: string }[];
  /** What the next document pick returns. Null stands for the user cancelling. */
  setPickedUri(uri: string | null): void;
  /** Makes the next share or pick throw, standing in for a native failure. */
  failWith(error: Error | null): void;
};

/**
 * The share sheet and the document picker, in memory. Neither native surface exists under
 * react-native-web or in jest, so every test above the port runs against this.
 */
export const createInMemoryBackupTransport = (): InMemoryBackupTransport => {
  const shares: { uri: string; fileName: string }[] = [];
  const state: { pickedUri: string | null; error: Error | null } = {
    pickedUri: null,
    error: null,
  };

  const throwIfFailing = () => {
    if (state.error !== null) {
      throw state.error;
    }
  };

  return {
    share: async (uri, fileName) => {
      throwIfFailing();
      shares.push({ uri, fileName });

      return true;
    },
    pickJsonUri: async () => {
      throwIfFailing();

      return state.pickedUri;
    },
    shared: () => shares,
    setPickedUri: (uri) => {
      state.pickedUri = uri;
    },
    failWith: (error) => {
      state.error = error;
    },
  };
};
