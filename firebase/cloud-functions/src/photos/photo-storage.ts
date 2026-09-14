import { adminBucket } from '../firebase-admin.js';
import { getPhotoStorageBasePath } from './photo-contract.js';

export async function deletePhotoFiles(
  ownerId: string,
  slot: number,
): Promise<void> {
  const basePath = getPhotoStorageBasePath(ownerId, slot);
  const paths = [
    `${basePath}/original`,
    `${basePath}/optimized.webp`,
    `${basePath}/thumbnail.webp`,
  ];

  await Promise.all(
    paths.map(async (path) => {
      await adminBucket.file(path).delete({
        ignoreNotFound: true,
      });
    }),
  );
}
