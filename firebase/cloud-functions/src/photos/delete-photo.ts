import { HttpsError, onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

import { adminDb } from '../firebase-admin.js';
import { requireVerifiedUserId } from '../require-verified-user.js';
import {
  getPrivatePhotoPath,
  getPublicPhotoId,
  MAX_PHOTO_SLOTS,
} from './photo-contract.js';
import { deletePhotoFiles } from './photo-storage.js';
import { canDeleteOwnerPhotoStatus } from './delete-photo-decision.js';

interface DeletePhotoInput {
  slot: number;
}

function parseDeletePhotoInput(value: unknown): DeletePhotoInput {
  if (typeof value !== 'object' || value === null) {
    throw new HttpsError(
      'invalid-argument',
      'Delete data is required',
    );
  }

  if (
    !('slot' in value)
    || typeof value.slot !== 'number'
    || !Number.isInteger(value.slot)
    || value.slot < 1
    || value.slot > MAX_PHOTO_SLOTS
  ) {
    throw new HttpsError(
      'invalid-argument',
      'Invalid photo slot',
    );
  }

  return {
    slot: value.slot,
  };
}

export const deletePhoto = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<void> => {
    const ownerId = requireVerifiedUserId(request.auth);
    const input = parseDeletePhotoInput(request.data);
    const privateRef = adminDb.doc(
      getPrivatePhotoPath(ownerId, input.slot),
    );
    const publicRef = adminDb.doc(
      `publicPhotos/${getPublicPhotoId(ownerId, input.slot)}`,
    );

    const deletion = await adminDb.runTransaction(
      async (transaction) => {
        const snapshot = await transaction.get(privateRef);
        const data: unknown = snapshot.data();

        if (!snapshot.exists) {
          transaction.delete(publicRef);
          return 'missing';
        }

        if (
          typeof data !== 'object'
          || data === null
          || !('status' in data)
          || !canDeleteOwnerPhotoStatus(data.status)
        ) {
          return 'blocked';
        }

        transaction.delete(privateRef);
        transaction.delete(publicRef);
        return 'deleted';
      },
    );

    if (deletion === 'blocked') {
      throw new HttpsError(
        'failed-precondition',
        'Photo cannot be deleted while it is still processing',
      );
    }

    await deletePhotoFiles(ownerId, input.slot);

    logger.info('Photo deleted', {
      ownerId,
      slot: input.slot,
      deletion,
    });
  },
);
