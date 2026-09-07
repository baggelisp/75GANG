import { buildPhotoPath, PHOTO_DIRECTORY } from '@/storage/photoPaths';

import { createInMemoryFileStore } from '../../support/storage/inMemoryFileStore';

const A_DATE = '2026-09-07';
const A_CAMERA_URI = 'file:///tmp/camera/IMG_0001.jpg';

describe('the FileStore port contract', () => {
  it('names a photo after the day it belongs to', () => {
    expect(buildPhotoPath(A_DATE)).toBe(`${PHOTO_DIRECTORY}/${A_DATE}.jpg`);
  });

  it('reports a photo as present once it has been written', async () => {
    const files = createInMemoryFileStore();
    const path = buildPhotoPath(A_DATE);

    await files.write(path, A_CAMERA_URI);

    expect(await files.exists(path)).toBe(true);
  });

  it('reports a photo that was never written as absent, so the day shows a placeholder', async () => {
    const files = createInMemoryFileStore();

    expect(await files.exists(buildPhotoPath(A_DATE))).toBe(false);
  });

  it('returns the relative path to store, never the image or an absolute uri', async () => {
    const files = createInMemoryFileStore();

    const stored = await files.write(buildPhotoPath(A_DATE), A_CAMERA_URI);

    expect(stored).toBe(`${PHOTO_DIRECTORY}/${A_DATE}.jpg`);
    expect(stored).not.toContain('file://');
  });

  it('clears the whole photo directory when the challenge is reset', async () => {
    const files = createInMemoryFileStore();
    await files.write(buildPhotoPath('2026-09-06'), A_CAMERA_URI);
    await files.write(buildPhotoPath(A_DATE), A_CAMERA_URI);

    await files.removeDirectory(PHOTO_DIRECTORY);

    expect(files.snapshot()).toEqual({});
  });
});
