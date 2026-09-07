import { IsoDate } from '@/domain/types';

/** Progress photos live beside the storage keys but are files, not records. */
export const PHOTO_DIRECTORY = 'photos';

export const buildPhotoPath = (date: IsoDate): string => `${PHOTO_DIRECTORY}/${date}.jpg`;
