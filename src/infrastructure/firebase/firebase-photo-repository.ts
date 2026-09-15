import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type Query,
} from 'firebase/firestore';

import { firebaseDb } from './client';
import { decodeOwnerPhoto } from './private-photo-decoder';
import { decodePublicPhoto } from './public-photo-decoder';

import {
  MAX_PHOTO_SLOTS,
  type OwnerPhoto,
  type PublicPhoto,
} from '../../features/photos/photo';
import type { PhotoRepository } from '../../features/photos/photo-ports';

export function createFirebasePhotoRepository(): PhotoRepository {
  return {
    subscribeToPublicPhotos(onPhotos, onError): () => void {
      const photosQuery = query(
        collection(firebaseDb, 'publicPhotos'),
        where('status', '==', 'ready'),
        orderBy('updatedAt', 'desc'),
        limit(50),
      );

      return subscribeDecodedPublicPhotos(
        photosQuery,
        onPhotos,
        onError,
      );
    },

    subscribeToOwnerPublicPhotos(
      ownerId,
      onPhotos,
      onError,
    ): () => void {
      const photosQuery = query(
        collection(firebaseDb, 'publicPhotos'),
        where('ownerId', '==', ownerId),
        where('status', '==', 'ready'),
        orderBy('updatedAt', 'desc'),
        limit(MAX_PHOTO_SLOTS),
      );

      return subscribeDecodedPublicPhotos(
        photosQuery,
        onPhotos,
        onError,
      );
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

function subscribeDecodedPublicPhotos(
  photosQuery: Query,
  onPhotos: (photos: PublicPhoto[]) => void,
  onError: (error: unknown) => void,
): () => void {
  return onSnapshot(
    photosQuery,
    (snapshot) => {
      const photos: PublicPhoto[] = [];

      for (const document of snapshot.docs) {
        const photo = decodePublicPhoto(
          document.id,
          document.data(),
        );

        if (photo) {
          photos.push(photo);
        } else {
          console.warn('Skipped invalid public photo', {
            photoId: document.id,
          });
        }
      }

      onPhotos(photos);
    },
    onError,
  );
}
