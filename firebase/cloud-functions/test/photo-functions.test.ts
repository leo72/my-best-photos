import { HttpsError } from 'firebase-functions/v2/https';
import sharp from 'sharp';
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';

import { getPhotoStorageBucket } from '../src/firebase-admin.js';
import { requireVerifiedUserId } from '../src/require-verified-user.js';
import { createImageDerivatives } from '../src/photos/image-processor.js';
import {
  decidePhotoProcessing,
  decideProcessingRetry,
  MAX_PHOTO_PROCESSING_ATTEMPTS,
} from '../src/photos/processing-decision.js';
import { canDeleteOwnerPhotoStatus } from '../src/photos/delete-photo-decision.js';
import { findAvailableSlot } from '../src/photos/slot-allocation.js';
import {
  InvalidPhotoInputError,
  parseReservePhotoInput,
} from '../src/photos/validation.js';

describe('getPhotoStorageBucket', () => {
  const originalStorageBucket = process.env.STORAGE_BUCKET;
  const originalProjectId = process.env.GCLOUD_PROJECT;

  afterEach(() => {
    if (originalStorageBucket === undefined) {
      delete process.env.STORAGE_BUCKET;
    } else {
      process.env.STORAGE_BUCKET = originalStorageBucket;
    }

    if (originalProjectId === undefined) {
      delete process.env.GCLOUD_PROJECT;
    } else {
      process.env.GCLOUD_PROJECT = originalProjectId;
    }
  });

  it('uses STORAGE_BUCKET when set', () => {
    process.env.STORAGE_BUCKET = 'custom.firebasestorage.app';
    process.env.GCLOUD_PROJECT = 'other-project';

    expect(getPhotoStorageBucket()).toBe(
      'custom.firebasestorage.app',
    );
  });

  it('uses the Firebase default bucket for the project', () => {
    delete process.env.STORAGE_BUCKET;
    process.env.GCLOUD_PROJECT = 'my-best-photos-v1';

    expect(getPhotoStorageBucket()).toBe(
      'my-best-photos-v1.firebasestorage.app',
    );
  });
});

describe('parseReservePhotoInput', () => {
  it('accepts a supported bounded image request', () => {
    expect(parseReservePhotoInput({
      originalFileName: 'photo.jpg',
      originalContentType: 'image/jpeg',
      originalSize: 1024,
    })).toEqual({
      originalFileName: 'photo.jpg',
      originalContentType: 'image/jpeg',
      originalSize: 1024,
    });
  });

  it('rejects untrusted input', () => {
    expect(() => parseReservePhotoInput({
      originalFileName: 'photo.svg',
      originalContentType: 'image/svg+xml',
      originalSize: 1024,
    })).toThrow(InvalidPhotoInputError);
  });
});

describe('findAvailableSlot', () => {
  it('reuses failed and expired reservations only', () => {
    const occupied = {
      status: 'ready',
      reservationExpiresAtMs: null,
    };
    const slots = Array.from({ length: 10 }, () => occupied);
    slots[2] = {
      status: 'reserved',
      reservationExpiresAtMs: 999,
    };

    expect(findAvailableSlot(slots, 1_000)).toBe(3);
    slots[2] = occupied;
    slots[5] = {
      status: 'failed',
      reservationExpiresAtMs: null,
    };
    expect(findAvailableSlot(slots, 1_000)).toBe(6);
  });

  it('returns null when every slot is occupied', () => {
    const slots = Array.from({ length: 10 }, () => ({
      status: 'ready',
      reservationExpiresAtMs: null,
    }));

    expect(findAvailableSlot(slots, 1_000)).toBeNull();
  });
});

describe('decideProcessingRetry', () => {
  it('retries until the attempt limit then gives up', () => {
    expect(decideProcessingRetry(MAX_PHOTO_PROCESSING_ATTEMPTS - 1))
      .toBe('retry');
    expect(decideProcessingRetry(MAX_PHOTO_PROCESSING_ATTEMPTS))
      .toBe('give-up');
  });
});

describe('decidePhotoProcessing', () => {
  it('makes duplicate finalized events idempotent', () => {
    expect(decidePhotoProcessing(
      {
        status: 'ready',
        reservationId: 'reservation',
        sourceGeneration: '42',
      },
      'reservation',
      '42',
    )).toBe('already-ready');
  });

  it('rejects stale reservations and generations', () => {
    expect(decidePhotoProcessing(
      {
        status: 'reserved',
        reservationId: 'new-reservation',
      },
      'old-reservation',
      '42',
    )).toBe('reject');
    expect(decidePhotoProcessing(
      {
        status: 'processing',
        reservationId: 'reservation',
        sourceGeneration: '43',
      },
      'reservation',
      '42',
    )).toBe('reject');
  });
});

describe('createImageDerivatives', () => {
  it('creates bounded WebP derivatives without distortion', async () => {
    const original = await sharp({
      create: {
        width: 3000,
        height: 1500,
        channels: 3,
        background: '#336699',
      },
    }).jpeg().toBuffer();

    const result = await createImageDerivatives(original);
    const [optimizedMetadata, thumbnailMetadata] =
      await Promise.all([
        sharp(result.optimized.data).metadata(),
        sharp(result.thumbnail.data).metadata(),
      ]);

    expect(result.optimized).toMatchObject({
      width: 2048,
      height: 1024,
    });
    expect(result.thumbnail).toMatchObject({
      width: 960,
      height: 480,
    });
    expect(optimizedMetadata.format).toBe('webp');
    expect(thumbnailMetadata.format).toBe('webp');
  });

  it('rejects invalid image bytes', async () => {
    await expect(
      createImageDerivatives(Buffer.from('not-an-image')),
    ).rejects.toThrow();
  });
});

describe('canDeleteOwnerPhotoStatus', () => {
  it('allows ready and failed photos only', () => {
    expect(canDeleteOwnerPhotoStatus('ready')).toBe(true);
    expect(canDeleteOwnerPhotoStatus('failed')).toBe(true);
    expect(canDeleteOwnerPhotoStatus('reserved')).toBe(false);
    expect(canDeleteOwnerPhotoStatus('processing')).toBe(false);
  });
});

describe('requireVerifiedUserId', () => {
  it('returns the uid for a verified user', () => {
    expect(requireVerifiedUserId({
      uid: 'owner',
      token: { email_verified: true },
    })).toBe('owner');
  });

  it('rejects missing auth', () => {
    try {
      requireVerifiedUserId(undefined);
      throw new Error('expected HttpsError');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpsError);
      expect((error as HttpsError).code).toBe('unauthenticated');
    }
  });

  it('rejects unverified auth', () => {
    try {
      requireVerifiedUserId({
        uid: 'owner',
        token: { email_verified: false },
      });
      throw new Error('expected HttpsError');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpsError);
      expect((error as HttpsError).code).toBe('permission-denied');
    }
  });
});
