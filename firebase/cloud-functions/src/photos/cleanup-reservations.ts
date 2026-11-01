import {
  Timestamp,
  type QuerySnapshot,
} from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { adminDb } from '../firebase-admin.js';
import {
  getPublicPhotoId,
  MAX_PHOTO_SLOTS,
} from './photo-contract.js';
import { deletePhotoFiles } from './photo-storage.js';
import {
  isStalledProcessing,
  PROCESSING_STALL_TIMEOUT_MS,
} from './processing-decision.js';

const CLEANUP_BATCH_SIZE = 100;

interface PhotoSlotDocument {
  documentPath: string;
  ownerId: string;
  slot: number;
}

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

function isStalledProcessingRecord(
  value: unknown,
  nowMs: number,
): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return isStalledProcessing(
    'status' in value ? value.status : null,
    'updatedAt' in value && value.updatedAt instanceof Timestamp
      ? value.updatedAt.toMillis()
      : null,
    nowMs,
  );
}

async function removeExpiredReservation(
  { documentPath, ownerId, slot }: PhotoSlotDocument,
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

/**
 * Fails photos whose processing run died without retrying, so the slot
 * can be deleted or reused instead of staying in processing forever.
 */
async function failStalledProcessing(
  { documentPath, ownerId, slot }: PhotoSlotDocument,
  nowMs: number,
): Promise<boolean> {
  const documentRef = adminDb.doc(documentPath);
  const publicRef = adminDb.doc(
    `publicPhotos/${getPublicPhotoId(ownerId, slot)}`,
  );

  return adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(documentRef);

    if (
      !snapshot.exists
      || !isStalledProcessingRecord(snapshot.data(), nowMs)
    ) {
      return false;
    }

    transaction.update(documentRef, {
      status: 'failed',
      errorCode: 'processing-stalled',
      updatedAt: Timestamp.now(),
      reservationExpiresAt: null,
    });
    transaction.delete(publicRef);
    return true;
  });
}

async function cleanUpSlots(
  snapshot: QuerySnapshot,
  cleanUp: (document: PhotoSlotDocument) => Promise<boolean>,
): Promise<{ changedCount: number; failedCount: number }> {
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
        logger.warn('Skipped malformed photo path', {
          documentPath: document.ref.path,
        });
        return false;
      }

      return cleanUp({
        documentPath: document.ref.path,
        ownerId,
        slot,
      });
    }),
  );

  return {
    changedCount: results.filter(
      (result) => result.status === 'fulfilled'
        && result.value,
    ).length,
    failedCount: results.filter(
      (result) => result.status === 'rejected',
    ).length,
  };
}

/** Frees expired reservations and fails stalled processing runs. */
export const cleanupExpiredPhotoReservations = onSchedule(
  {
    schedule: 'every 6 hours',
    region: 'us-central1',
    timeoutSeconds: 120,
    memory: '256MiB',
  },
  async () => {
    const now = Timestamp.now();
    const nowMs = now.toMillis();

    const expiredSnapshot = await adminDb
      .collectionGroup('photos')
      .where('status', '==', 'reserved')
      .where('reservationExpiresAt', '<=', now)
      .limit(CLEANUP_BATCH_SIZE)
      .get();
    const expired = await cleanUpSlots(
      expiredSnapshot,
      (document) => removeExpiredReservation(document, nowMs),
    );

    logger.info('Expired photo reservation cleanup completed', {
      scannedCount: expiredSnapshot.size,
      removedCount: expired.changedCount,
      failedCount: expired.failedCount,
    });

    const stalledSnapshot = await adminDb
      .collectionGroup('photos')
      .where('status', '==', 'processing')
      .where(
        'updatedAt',
        '<=',
        Timestamp.fromMillis(nowMs - PROCESSING_STALL_TIMEOUT_MS),
      )
      .limit(CLEANUP_BATCH_SIZE)
      .get();
    const stalled = await cleanUpSlots(
      stalledSnapshot,
      (document) => failStalledProcessing(document, nowMs),
    );

    logger.info('Stalled photo processing cleanup completed', {
      scannedCount: stalledSnapshot.size,
      markedFailedCount: stalled.changedCount,
      failedCount: stalled.failedCount,
    });
  },
);
