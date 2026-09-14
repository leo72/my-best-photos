import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const FIREBASE_STORAGE_BUCKET_SUFFIX = '.firebasestorage.app';

export function getPhotoStorageBucket(): string {
  const configured = process.env.STORAGE_BUCKET?.trim();

  if (configured) {
    return configured;
  }

  const projectId =
    process.env.GCLOUD_PROJECT?.trim() || 'my-best-photos-v1';

  return `${projectId}${FIREBASE_STORAGE_BUCKET_SUFFIX}`;
}

if (getApps().length === 0) {
  initializeApp();
}

export const adminDb = getFirestore();
export const adminBucket = getStorage().bucket(getPhotoStorageBucket());
