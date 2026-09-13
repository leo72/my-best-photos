import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase/firestore';

export async function createTestPhoto(): Promise<void> {
  await addDoc(collection(db, 'photos'), {
    ownerId: 'test-owner',
    title: 'My first photo',
    storagePath: 'test/photo.jpg',
    createdAt: serverTimestamp(),
  });
}
