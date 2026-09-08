import { useEffect, useState } from 'react';

import { HabitRecord } from '@/domain/types';
import { roundWeight, WEIGHT_STEP_KG } from '@/domain/weighIn';
import { useRepositories } from '@/storage/repositoryContext';
import { buildPhotoPath } from '@/storage/photoPaths';
import { toLocalIsoDate } from '@/utils/DateUtility';

import { PhotoOutcome, usePhotoCapture } from './usePhotoCapture';

export type WeighInActions = {
  weightText: string;
  photoUri: string | null;
  photoOutcome: PhotoOutcome;
  changeWeight: (text: string) => void;
  stepDown: () => void;
  stepUp: () => void;
  takePhoto: () => void;
  choosePhoto: () => void;
  dismissPhotoOutcome: () => void;
};

type WeighInSource = {
  record: HabitRecord | null;
  recordWeight: (kilograms: number) => Promise<boolean>;
  stepWeight: (delta: number) => Promise<boolean>;
  recordPhoto: (path: string) => Promise<boolean>;
};

const readWeightText = (record: HabitRecord | null): string => {
  if (typeof record?.weightKg !== 'number') {
    return '';
  }

  return `${record.weightKg}`;
};

/**
 * The weigh-in, and the photo that has to go with it.
 *
 * The picked image is copied into the app's own documents directory and only its relative path is
 * recorded — the image never enters a day record, and never leaves the device.
 */
export const useWeighIn = (source: WeighInSource): WeighInActions => {
  const repositories = useRepositories();
  const capture = usePhotoCapture();
  const [weightText, setWeightText] = useState(() => readWeightText(source.record));
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const storedPhoto = source.record?.photo ?? null;

  useEffect(() => {
    setWeightText(readWeightText(source.record));
  }, [source.record]);

  useEffect(() => {
    let isCurrent = true;

    const resolve = async () => {
      if (storedPhoto === null || storedPhoto.length === 0) {
        setPhotoUri(null);

        return;
      }

      // A path whose file has gone shows the placeholder rather than a broken image or a throw.
      const exists = await repositories.files.exists(storedPhoto).catch(() => false);

      if (!isCurrent) {
        return;
      }

      setPhotoUri(exists ? repositories.files.resolveUri(storedPhoto) : null);
    };

    resolve();

    return () => {
      isCurrent = false;
    };
  }, [repositories, storedPhoto]);

  const changeWeight = (text: string) => {
    setWeightText(text);

    const parsed = Number.parseFloat(text.replace(',', '.'));

    if (Number.isNaN(parsed)) {
      return;
    }

    void source.recordWeight(roundWeight(parsed));
  };

  const savePhoto = async (picked: { uri: string } | null) => {
    if (picked === null) {
      return;
    }

    const path = buildPhotoPath(toLocalIsoDate(repositories.clock.now()));
    const written = await repositories.files.write(path, picked.uri).catch(() => null);

    if (written === null) {
      return;
    }

    await source.recordPhoto(written);
  };

  return {
    weightText,
    photoUri,
    photoOutcome: capture.outcome,
    changeWeight,
    stepDown: () => {
      void source.stepWeight(-WEIGHT_STEP_KG);
    },
    stepUp: () => {
      void source.stepWeight(WEIGHT_STEP_KG);
    },
    takePhoto: () => {
      void capture.takePhoto().then(savePhoto);
    },
    choosePhoto: () => {
      void capture.choosePhoto().then(savePhoto);
    },
    dismissPhotoOutcome: capture.dismissOutcome,
  };
};
