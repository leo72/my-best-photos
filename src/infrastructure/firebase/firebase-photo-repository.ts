import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

import { firebaseDb } from './client';
import { decodePublicPhoto } from './public-photo-decoder';

import type { PublicPhoto } from '../../features/photos/photo';
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
    },
  };
}
