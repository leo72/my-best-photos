import { randomUUID } from 'node:crypto';

import { Timestamp } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { adminDb } from '../firebase-admin.js';
import {
  getPrivatePhotoPath,
  getPublicPhotoId,
  MAX_PHOTO_SLOTS,
  RESERVATION_TTL_MS,
  type ReservePhotoInput,
  type ReservePhotoResult,
} from './photo-contract.js';
import { deletePhotoFiles } from './photo-storage.js';
import {
  InvalidPhotoInputError,
  parseReservePhotoInput,
} from './validation.js';
import {
  findAvailableSlot,
  type SlotState,
} from './slot-allocation.js';

export class NoPhotoSlotAvailableError extends Error {
  public constructor() {
    super('All photo slots are occupied');
    this.name = 'NoPhotoSlotAvailableError';
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toSlotState(value: unknown): SlotState | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    status: value.status,
    reservationExpiresAtMs:
      value.reservationExpiresAt instanceof Timestamp
        ? value.reservationExpiresAt.toMillis()
        : null,
  };
}

export async function reservePhotoSlot(
  ownerId: string,
  input: ReservePhotoInput,
): Promise<ReservePhotoResult> {
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(
    now.toMillis() + RESERVATION_TTL_MS,
  );
  const reservationId = randomUUID();
  const photoRefs = Array.from(
    { length: MAX_PHOTO_SLOTS },
    (_, index) => adminDb.doc(
      getPrivatePhotoPath(ownerId, index + 1),
    ),
  );

  const slot = await adminDb.runTransaction(
    async (transaction) => {
      const snapshots = await transaction.getAll(...photoRefs);
      const selectedSlot = findAvailableSlot(
        snapshots.map((snapshot) =>
          snapshot.exists
            ? toSlotState(snapshot.data())
            : null,
        ),
        now.toMillis(),
      );

      if (selectedSlot === null) {
        throw new NoPhotoSlotAvailableError();
      }

      const selectedRef = photoRefs[selectedSlot - 1];

      if (!selectedRef) {
        throw new Error('Selected photo reference is missing');
      }

      transaction.set(selectedRef, {
        ownerId,
        slot: selectedSlot,
        reservationId,
        status: 'reserved',
        originalFileName: input.originalFileName,
        originalContentType: input.originalContentType,
        originalSize: input.originalSize,
        width: null,
        height: null,
        errorCode: null,
        createdAt: now,
        updatedAt: now,
        reservationExpiresAt: expiresAt,
      });

      transaction.delete(
        adminDb.doc(
          `publicPhotos/${getPublicPhotoId(
            ownerId,
            selectedSlot,
          )}`,
        ),
      );

      return selectedSlot;
    },
  );

  try {
    await deletePhotoFiles(ownerId, slot);
  } catch (error) {
    const selectedRef = adminDb.doc(
      getPrivatePhotoPath(ownerId, slot),
    );

    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(selectedRef);
      const data: unknown = snapshot.data();

      if (
        snapshot.exists
        && isRecord(data)
        && data.reservationId === reservationId
        && data.status === 'reserved'
      ) {
        transaction.delete(selectedRef);
      }
    });

    throw error;
  }

  logger.info('Photo upload slot reserved', {
    ownerId,
    slot,
  });

  return {
    photoId: getPublicPhotoId(ownerId, slot),
    slot,
    reservationId,
  };
}

export const reservePhotoUpload = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<ReservePhotoResult> => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Authentication is required',
      );
    }

    try {
      const input = parseReservePhotoInput(request.data);
      return await reservePhotoSlot(request.auth.uid, input);
    } catch (error) {
      if (error instanceof InvalidPhotoInputError) {
        throw new HttpsError('invalid-argument', error.message);
      }

      if (error instanceof NoPhotoSlotAvailableError) {
        throw new HttpsError(
          'resource-exhausted',
          error.message,
        );
      }

      logger.error('Failed to reserve photo upload slot', {
        ownerId: request.auth.uid,
        errorName:
          error instanceof Error ? error.name : 'UnknownError',
      });

      throw new HttpsError(
        'internal',
        'Could not reserve a photo upload slot',
      );
    }
  },
);
