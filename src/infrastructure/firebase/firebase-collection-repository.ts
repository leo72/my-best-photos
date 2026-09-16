import {
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

import { firebaseDb } from './client';
import {
  getCollectionPath,
  normalizeCollectionTitle,
  normalizeCollectionType,
  type CollectionProfile,
} from '../../features/collection/collection';
import type { CollectionRepository } from '../../features/collection/collection-ports';

function readDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

export function decodeCollectionProfile(
  ownerId: string,
  value: unknown,
): CollectionProfile | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  if (!('collectionType' in value) || !('title' in value)) {
    return null;
  }

  const collectionType = normalizeCollectionType(
    value.collectionType,
  );
  const title = typeof value.title === 'string'
    ? normalizeCollectionTitle(value.title)
    : '';

  if (!collectionType || title.length === 0) {
    return null;
  }

  return {
    ownerId,
    collectionType,
    title,
    createdAt:
      'createdAt' in value ? readDate(value.createdAt) : null,
    updatedAt:
      'updatedAt' in value ? readDate(value.updatedAt) : null,
  };
}

export function createFirebaseCollectionRepository(): CollectionRepository {
  return {
    subscribeToCollection(ownerId, onProfile, onError): () => void {
      return onSnapshot(
        doc(firebaseDb, getCollectionPath(ownerId)),
        (snapshot) => {
          if (!snapshot.exists()) {
            onProfile(null);
            return;
          }

          const profile = decodeCollectionProfile(
            ownerId,
            snapshot.data(),
          );

          if (profile) {
            onProfile(profile);
          } else {
            console.warn('Skipped invalid collection profile', {
              ownerId,
            });
            onProfile(null);
          }
        },
        onError,
      );
    },

    async saveCollection(ownerId, input): Promise<void> {
      const reference = doc(
        firebaseDb,
        getCollectionPath(ownerId),
      );
      const existing = await getDoc(reference);
      const fields = {
        ownerId,
        collectionType: input.collectionType,
        title: input.title,
        updatedAt: serverTimestamp(),
        year: deleteField(),
      };

      if (existing.exists()) {
        await updateDoc(reference, fields);
        return;
      }

      await setDoc(reference, {
        ownerId,
        collectionType: input.collectionType,
        title: input.title,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    },
  };
}
