import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

import { BackupTransport } from '@/storage/ports/backupTransport';

const JSON_MIME_TYPE = 'application/json';

/**
 * The only module that imports expo-sharing and expo-document-picker.
 *
 * Both are native surfaces with no react-native-web equivalent, so everything above this line is
 * tested against a double and this adapter is verified on a device.
 */
export const createExpoBackupTransport = (): BackupTransport => {
  const share = async (uri: string, fileName: string): Promise<boolean> => {
    if (!(await Sharing.isAvailableAsync())) {
      return false;
    }

    await Sharing.shareAsync(uri, {
      mimeType: JSON_MIME_TYPE,
      dialogTitle: fileName,
      UTI: 'public.json',
    });

    return true;
  };

  const pickJsonUri = async (): Promise<string | null> => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: JSON_MIME_TYPE,
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (picked.canceled) {
      return null;
    }

    return picked.assets[0]?.uri ?? null;
  };

  return { share, pickJsonUri };
};
