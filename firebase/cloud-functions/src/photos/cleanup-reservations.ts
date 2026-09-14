import { Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { adminDb } from '../firebase-admin.js';
import { MAX_PHOTO_SLOTS } from './photo-contract.js';
import { deletePhotoFiles } from './photo-storage.js';

function isExpiredReservation(
  value: unknown,
  nowMs: number,
): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('status' in value) || value.status !== 'reserved') {
    return false;
  }

  return 'reservationExpiresAt' in value
    && value.reservationExpiresAt instanceof Timestamp
    && value.reservationExpiresAt.toMillis() <= nowMs;
}

async function removeExpiredReservation(
  documentPath: string,
  ownerId: string,
  slot: number,
  nowMs: number,
): Promise<boolean> {
  const documentRef = adminDb.doc(documentPath);
  const wasRemoved = await adminDb.runTransaction(
    async (transaction) => {
      const snapshot = await transaction.get(documentRef);

      if (
        !snapshot.exists
        || !isExpiredReservation(snapshot.data(), nowMs)
      ) {
        return false;
      }

      transaction.delete(documentRef);
      return true;
    },
  );

  if (wasRemoved) {
    await deletePhotoFiles(ownerId, slot);
  }

  return wasRemoved;
}

export const cleanupExpiredPhotoReservations = onSchedule(
  {
    schedule: 'every 15 minutes',
    region: 'us-central1',
    timeoutSeconds: 120,
    memory: '256MiB',
  },
  async () => {
    const now = Timestamp.now();
    const snapshot = await adminDb
      .collectionGroup('photos')
      .where('status', '==', 'reserved')
      .where('reservationExpiresAt', '<=', now)
      .limit(100)
      .get();

    const results = await Promise.allSettled(
      snapshot.docs.map(async (document) => {
        const ownerId = document.ref.parent.parent?.id;
        const slot = Number(document.id);

        if (
          !ownerId
          || !Number.isInteger(slot)
          || slot < 1
          || slot > MAX_PHOTO_SLOTS
        ) {
          logger.warn('Skipped malformed reservation path', {
            documentPath: document.ref.path,
          });
          return false;
        }

        return removeExpiredReservation(
          document.ref.path,
          ownerId,
          slot,
          now.toMillis(),
        );
      }),
    );

    const removedCount = results.filter(
      (result) => result.status === 'fulfilled'
        && result.value,
    ).length;
    const failedCount = results.filter(
      (result) => result.status === 'rejected',
    ).length;

    logger.info('Expired photo reservation cleanup completed', {
      scannedCount: snapshot.size,
      removedCount,
      failedCount,
    });
  },
);
