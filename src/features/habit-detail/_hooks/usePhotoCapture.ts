import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export const PhotoOutcomeEnum = {
  IDLE: 'IDLE',
  CANCELLED: 'CANCELLED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  FAILED: 'FAILED',
} as const;

export type PhotoOutcome = (typeof PhotoOutcomeEnum)[keyof typeof PhotoOutcomeEnum];

export type PickedPhoto = { uri: string } | null;

/**
 * Taking or choosing a progress photo.
 *
 * Every way this can end without a picture — the user backing out, the permission being refused,
 * the picker failing — is reported as its own outcome rather than as nothing happening, so the
 * screen can say which one it was instead of appearing to ignore the tap.
 */
export const usePhotoCapture = () => {
  const [outcome, setOutcome] = useState<PhotoOutcome>(PhotoOutcomeEnum.IDLE);

  const runPicker = async (
    requestPermission: () => Promise<ImagePicker.PermissionResponse>,
    launch: () => Promise<ImagePicker.ImagePickerResult>,
  ): Promise<PickedPhoto> => {
    const permission = await requestPermission().catch(() => null);

    if (permission === null || !permission.granted) {
      setOutcome(PhotoOutcomeEnum.PERMISSION_DENIED);

      return null;
    }

    const result = await launch().catch(() => null);

    if (result === null) {
      setOutcome(PhotoOutcomeEnum.FAILED);

      return null;
    }

    if (result.canceled) {
      setOutcome(PhotoOutcomeEnum.CANCELLED);

      return null;
    }

    const asset = result.assets[0];

    if (asset === undefined) {
      setOutcome(PhotoOutcomeEnum.FAILED);

      return null;
    }

    setOutcome(PhotoOutcomeEnum.IDLE);

    return { uri: asset.uri };
  };

  const takePhoto = (): Promise<PickedPhoto> =>
    runPicker(ImagePicker.requestCameraPermissionsAsync, () =>
      ImagePicker.launchCameraAsync({ quality: 0.7 }),
    );

  const choosePhoto = (): Promise<PickedPhoto> =>
    runPicker(ImagePicker.requestMediaLibraryPermissionsAsync, () =>
      ImagePicker.launchImageLibraryAsync({ quality: 0.7 }),
    );

  const dismissOutcome = () => {
    setOutcome(PhotoOutcomeEnum.IDLE);
  };

  return { takePhoto, choosePhoto, outcome, dismissOutcome };
};
