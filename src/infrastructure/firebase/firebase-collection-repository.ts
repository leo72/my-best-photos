import {
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { firebaseDb } from './client';
import { decodeCollectionProfile } from './collection-decoder';
import { getCollectionPath } from '../../features/collection/collection';
import type { CollectionRepository } from '../../features/collection/collection-ports';

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
