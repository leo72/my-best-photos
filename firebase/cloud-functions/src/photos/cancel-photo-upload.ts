import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { adminBucket, adminDb } from '../firebase-admin.js';
import { requireVerifiedUserId } from '../require-verified-user.js';
import {
  getPrivatePhotoPath,
  getPhotoStorageBasePath,
  MAX_PHOTO_SLOTS,
} from './photo-contract.js';
import { deletePhotoFiles } from './photo-storage.js';

interface CancelPhotoInput {
  slot: number;
  reservationId: string;
}

function parseCancelPhotoInput(value: unknown): CancelPhotoInput {
  if (typeof value !== 'object' || value === null) {
    throw new HttpsError(
      'invalid-argument',
      'Cancellation data is required',
    );
  }

  if (
    !('slot' in value)
    || typeof value.slot !== 'number'
    || !Number.isInteger(value.slot)
    || value.slot < 1
    || value.slot > MAX_PHOTO_SLOTS
    || !('reservationId' in value)
    || typeof value.reservationId !== 'string'
    || value.reservationId.length === 0
  ) {
    throw new HttpsError(
      'invalid-argument',
      'Invalid photo reservation',
    );
  }

  return {
    slot: value.slot,
    reservationId: value.reservationId,
  };
}

export const cancelPhotoUpload = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<void> => {
    const ownerId = requireVerifiedUserId(request.auth);
    const input = parseCancelPhotoInput(request.data);
    const originalPath =
      `${getPhotoStorageBasePath(
        ownerId,
        input.slot,
      )}/original`;
    const [doesOriginalExist] =
      await adminBucket.file(originalPath).exists();

    if (doesOriginalExist) {
      logger.info(
        'Kept reservation for an uploaded original',
        {
          ownerId,
          slot: input.slot,
        },
      );
      return;
    }

    const photoRef = adminDb.doc(
      getPrivatePhotoPath(ownerId, input.slot),
    );
    const wasCancelled = await adminDb.runTransaction(
      async (transaction) => {
        const snapshot = await transaction.get(photoRef);
        const data: unknown = snapshot.data();

        if (
          !snapshot.exists
          || typeof data !== 'object'
          || data === null
          || !('status' in data)
          || !('reservationId' in data)
          || data.status !== 'reserved'
          || data.reservationId !== input.reservationId
        ) {
          return false;
        }

        transaction.delete(photoRef);
        return true;
      },
    );

    if (wasCancelled) {
      await deletePhotoFiles(ownerId, input.slot);
      logger.info('Photo upload reservation cancelled', {
        ownerId,
        slot: input.slot,
      });
    }
  },
);
