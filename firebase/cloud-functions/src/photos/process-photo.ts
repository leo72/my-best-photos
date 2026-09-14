import { Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { onObjectFinalized } from 'firebase-functions/v2/storage';

import {
  adminBucket,
  adminDb,
  getPhotoStorageBucket,
} from '../firebase-admin.js';
import {
  createImageDerivatives,
  InvalidImageDataError,
} from './image-processor.js';
import {
  getPrivatePhotoPath,
  getPublicPhotoId,
  getPhotoStorageBasePath,
  MAX_PHOTO_SIZE_BYTES,
  SUPPORTED_IMAGE_TYPES,
} from './photo-contract.js';
import {
  decidePhotoProcessing,
  type ProcessingDecision,
} from './processing-decision.js';

const ORIGINAL_PATH_PATTERN =
  /^photos\/([^/]+)\/([1-9]|10)\/original$/;

interface OriginalPhotoObject {
  name: string;
  ownerId: string;
  slot: number;
  generation: string;
  contentType: string;
  size: number;
  reservationId: string;
}

function readMetadataValue(
  metadata: Record<string, string> | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];
  return typeof value === 'string' && value.length > 0
    ? value
    : null;
}

function parseOriginalObject(
  object: {
    name?: string;
    generation?: number | string;
    contentType?: string;
    size?: number | string;
    metadata?: Record<string, string>;
  },
): OriginalPhotoObject | null {
  const pathMatch = object.name?.match(ORIGINAL_PATH_PATTERN);

  if (!pathMatch) {
    return null;
  }

  const ownerId = pathMatch[1];
  const slot = Number(pathMatch[2]);
  const reservationId = readMetadataValue(
    object.metadata,
    'reservationId',
  );
  const size = Number(object.size);

  if (
    !ownerId
    || !Number.isInteger(slot)
    || !object.name
    || !object.generation
    || !object.contentType
    || !SUPPORTED_IMAGE_TYPES.has(object.contentType)
    || !Number.isFinite(size)
    || size <= 0
    || size > MAX_PHOTO_SIZE_BYTES
    || !reservationId
  ) {
    throw new Error('InvalidOriginalObject');
  }

  return {
    name: object.name,
    ownerId,
    slot,
    generation: String(object.generation),
    contentType: object.contentType,
    size,
    reservationId,
  };
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getProcessingErrorCode(error: unknown): string {
  if (error instanceof InvalidImageDataError) {
    return error.code;
  }

  if (!(error instanceof Error)) {
    return 'processing-failed';
  }

  const knownCodes = new Set([
    'InvalidOriginalObject',
    'PhotoReservationChanged',
  ]);

  return knownCodes.has(error.message)
    ? error.message
    : 'processing-failed';
}

async function beginProcessing(
  object: OriginalPhotoObject,
): Promise<ProcessingDecision> {
  const photoRef = adminDb.doc(
    getPrivatePhotoPath(object.ownerId, object.slot),
  );

  return adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(photoRef);
    const data: unknown = snapshot.data();
    const decision = decidePhotoProcessing(
      data,
      object.reservationId,
      object.generation,
    );

    if (!snapshot.exists || decision !== 'process') {
      return snapshot.exists ? decision : 'reject';
    }

    transaction.update(photoRef, {
      status: 'processing',
      sourceGeneration: object.generation,
      updatedAt: Timestamp.now(),
      errorCode: null,
    });

    return decision;
  });
}

async function deleteObjectGeneration(
  name: string,
  generation: string,
): Promise<void> {
  try {
    await adminBucket.file(name).delete({
      ifGenerationMatch: generation,
    });
  } catch (error) {
    const errorCode = isRecord(error) ? error.code : null;

    if (errorCode !== 404 && errorCode !== 412) {
      throw error;
    }
  }
}

async function markFailed(
  object: OriginalPhotoObject,
  errorCode: string,
): Promise<void> {
  const privateRef = adminDb.doc(
    getPrivatePhotoPath(object.ownerId, object.slot),
  );
  const publicRef = adminDb.doc(
    `publicPhotos/${getPublicPhotoId(
      object.ownerId,
      object.slot,
    )}`,
  );

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(privateRef);
    const data: unknown = snapshot.data();

    if (
      !snapshot.exists
      || !isRecord(data)
      || data.reservationId !== object.reservationId
      || data.sourceGeneration !== object.generation
    ) {
      return;
    }

    transaction.update(privateRef, {
      status: 'failed',
      errorCode,
      updatedAt: Timestamp.now(),
      reservationExpiresAt: null,
    });
    transaction.delete(publicRef);
  });
}

async function processOriginal(
  object: OriginalPhotoObject,
): Promise<void> {
  const [originalBuffer] = await adminBucket
    .file(object.name)
    .download({
      validation: true,
    });
  const { optimized, thumbnail } =
    await createImageDerivatives(originalBuffer);
  const basePath = getPhotoStorageBasePath(
    object.ownerId,
    object.slot,
  );
  const outputMetadata = {
    contentType: 'image/webp',
    cacheControl: 'public,max-age=31536000,immutable',
    metadata: {
      sourceGeneration: object.generation,
    },
  };

  await Promise.all([
    adminBucket
      .file(`${basePath}/optimized.webp`)
      .save(optimized.data, outputMetadata),
    adminBucket
      .file(`${basePath}/thumbnail.webp`)
      .save(thumbnail.data, outputMetadata),
  ]);

  const privateRef = adminDb.doc(
    getPrivatePhotoPath(object.ownerId, object.slot),
  );
  const publicRef = adminDb.doc(
    `publicPhotos/${getPublicPhotoId(
      object.ownerId,
      object.slot,
    )}`,
  );
  const now = Timestamp.now();

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(privateRef);
    const data: unknown = snapshot.data();

    if (
      !snapshot.exists
      || !isRecord(data)
      || data.reservationId !== object.reservationId
      || data.sourceGeneration !== object.generation
    ) {
      throw new Error('PhotoReservationChanged');
    }

    transaction.update(privateRef, {
      status: 'ready',
      width: optimized.width,
      height: optimized.height,
      updatedAt: now,
      reservationExpiresAt: null,
      errorCode: null,
    });
    transaction.set(publicRef, {
      ownerId: object.ownerId,
      slot: object.slot,
      status: 'ready',
      width: optimized.width,
      height: optimized.height,
      createdAt: data.createdAt ?? now,
      updatedAt: now,
    });
  });
}

export const processPhotoUpload = onObjectFinalized(
  {
    region: 'us-east1',
    bucket: getPhotoStorageBucket(),
    timeoutSeconds: 300,
    memory: '1GiB',
    cpu: 1,
    retry: true,
  },
  async (event) => {
    let object: OriginalPhotoObject | null = null;

    try {
      object = parseOriginalObject(event.data);

      if (!object) {
        return;
      }

      const decision = await beginProcessing(object);

      if (decision === 'already-ready') {
        return;
      }

      if (decision === 'reject') {
        await deleteObjectGeneration(
          object.name,
          object.generation,
        );
        logger.warn('Rejected unreserved photo upload', {
          ownerId: object.ownerId,
          slot: object.slot,
        });
        return;
      }

      await processOriginal(object);

      logger.info('Photo processing completed', {
        ownerId: object.ownerId,
        slot: object.slot,
      });
    } catch (error) {
      const errorCode = getProcessingErrorCode(error);

      if (object && error instanceof InvalidImageDataError) {
        await markFailed(object, errorCode);
        logger.warn('Photo upload contains invalid image data', {
          ownerId: object.ownerId,
          slot: object.slot,
          errorCode,
        });
        return;
      }

      if (
        !object
        && (
          event.data.name
          && event.data.generation
          && ORIGINAL_PATH_PATTERN.test(event.data.name)
        )
      ) {
        await deleteObjectGeneration(
          event.data.name,
          String(event.data.generation),
        );
        logger.warn('Deleted invalid original photo object', {
          errorCode,
        });
        return;
      }

      if (
        error instanceof Error
        && error.message === 'PhotoReservationChanged'
      ) {
        logger.warn('Photo reservation changed during processing', {
          ownerId: object?.ownerId ?? null,
          slot: object?.slot ?? null,
        });
        return;
      }

      logger.error('Photo processing failed', {
        ownerId: object?.ownerId ?? null,
        slot: object?.slot ?? null,
        errorCode,
      });

      throw error;
    }
  },
);
