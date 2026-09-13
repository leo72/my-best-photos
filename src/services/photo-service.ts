import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';

import type { Photo } from '../types/photo';

export async function createTestPhoto(): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User must be authenticated');
  }

  await addDoc(collection(db, 'photos'), {
    ownerId: user.uid,
    title: 'My first photo',
    storagePath: 'test/photo.jpg',
    createdAt: serverTimestamp(),
  });
}

export async function getPhotos(): Promise<Photo[]> {
  const snapshot = await getDocs(collection(db, 'photos'));

  return snapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,
      ownerId: data.ownerId,
      title: data.title,
      storagePath: data.storagePath,
      createdAt: data.createdAt?.toDate() ?? null,
    };
  });
}