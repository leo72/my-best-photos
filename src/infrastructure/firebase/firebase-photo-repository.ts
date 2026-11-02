import {
  collection,
  doc,
  onSnapshot,
} from 'firebase/firestore';

import { firebaseDb } from './client';
import { decodeOwnerPhoto } from './private-photo-decoder';
import { decodePublicPhoto } from './public-photo-decoder';

import {
  getPublicPhotoId,
  MAX_PHOTO_SLOTS,
  type OwnerPhoto,
  type PublicPhoto,
} from '../../features/photos/photo';
import type { PhotoRepository } from '../../features/photos/photo-ports';

export function createFirebasePhotoRepository(): PhotoRepository {
  return {
    subscribeToOwnerPublicPhotos(
      ownerId,
      onPhotos,
      onError,
    ): () => void {
      return subscribePublicPhotoSlots(ownerId, onPhotos, onError);
    },

    subscribeToOwnerPhotos(
      ownerId,
      onPhotos,
      onError,
    ): () => void {
      return onSnapshot(
        collection(firebaseDb, `users/${ownerId}/photos`),
        (snapshot) => {
          const photos: OwnerPhoto[] = [];

          for (const document of snapshot.docs) {
            const photo = decodeOwnerPhoto(
              document.id,
              document.data(),
            );

            if (photo) {
              photos.push(photo);
            } else {
              console.warn('Skipped invalid owner photo', {
                photoId: document.id,
              });
            }
          }

          onPhotos(photos);
        },
        onError,
      );
    },
  };
}

/**
 * Security rules forbid listing public photos, so each slot is watched
 * by id. Publishes once every slot has reported, newest first.
 */
function subscribePublicPhotoSlots(
  ownerId: string,
  onPhotos: (photos: PublicPhoto[]) => void,
  onError: (error: unknown) => void,
): () => void {
  const photosBySlot = new Map<number, PublicPhoto | null>();
  let hasFailed = false;

  const unsubscribes = Array.from(
    { length: MAX_PHOTO_SLOTS },
    (_, index) => {
      const slot = index + 1;
      const photoId = getPublicPhotoId(ownerId, slot);

      return onSnapshot(
        doc(firebaseDb, 'publicPhotos', photoId),
        (snapshot) => {
          if (hasFailed) {
            return;
          }

          const photo = snapshot.exists()
            ? decodePublicPhoto(photoId, snapshot.data())
            : null;

          if (snapshot.exists() && !photo) {
            console.warn('Skipped invalid public photo', {
              photoId,
            });
          }

          photosBySlot.set(slot, photo);

          if (photosBySlot.size < MAX_PHOTO_SLOTS) {
            return;
          }

          onPhotos(
            [...photosBySlot.values()]
              .filter((entry): entry is PublicPhoto => entry !== null)
              .sort((left, right) =>
                (right.updatedAt?.getTime() ?? 0)
                - (left.updatedAt?.getTime() ?? 0),
              ),
          );
        },
        (error) => {
          if (hasFailed) {
            return;
          }

          hasFailed = true;
          onError(error);
        },
      );
    },
  );

  return () => {
    for (const unsubscribe of unsubscribes) {
      unsubscribe();
    }
  };
}
