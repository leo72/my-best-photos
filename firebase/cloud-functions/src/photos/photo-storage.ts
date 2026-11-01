import { adminBucket } from '../firebase-admin.js';
import { getPhotoStorageBasePath } from './photo-contract.js';

/** Deletes the original and every derivative generation in a slot. */
export async function deletePhotoFiles(
  ownerId: string,
  slot: number,
): Promise<void> {
  const [files] = await adminBucket.getFiles({
    prefix: `${getPhotoStorageBasePath(ownerId, slot)}/`,
  });

  await Promise.all(
    files.map(async (file) => {
      await file.delete({
        ignoreNotFound: true,
      });
    }),
  );
}
