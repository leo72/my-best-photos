import { Timestamp } from 'firebase/firestore';
import {
  describe,
  expect,
  it,
} from 'vitest';

import { isActiveOwnerPhoto } from '../../src/features/photos/owner-photo';
import { decodeOwnerPhoto } from '../../src/infrastructure/firebase/private-photo-decoder';
import { decodePublicPhoto } from '../../src/infrastructure/firebase/public-photo-decoder';
import { getPublicStorageObjectUrl } from '../../src/infrastructure/firebase/storage-url';

describe('decodePublicPhoto', () => {
  it('decodes a valid ready photo', () => {
    const createdAt = Timestamp.fromMillis(1_000);

    expect(decodePublicPhoto('owner_1', {
      ownerId: 'owner',
      slot: 1,
      status: 'ready',
      width: 1200,
      height: 800,
      createdAt,
      updatedAt: createdAt,
    })).toEqual({
      id: 'owner_1',
      ownerId: 'owner',
      slot: 1,
      status: 'ready',
      width: 1200,
      height: 800,
      createdAt: new Date(1_000),
      updatedAt: new Date(1_000),
    });
  });

  it('rejects malformed or non-ready documents', () => {
    expect(decodePublicPhoto('owner_1', {
      ownerId: 'owner',
      slot: 1,
      status: 'processing',
      width: 1200,
      height: 800,
    })).toBeNull();
    expect(decodePublicPhoto('owner_11', {
      ownerId: 'owner',
      slot: 11,
      status: 'ready',
      width: 1200,
      height: 800,
    })).toBeNull();
  });
});

describe('decodeOwnerPhoto', () => {
  it('decodes reserved and ready owner photos', () => {
    const expiresAt = Timestamp.fromMillis(5_000);

    expect(decodeOwnerPhoto('1', {
      ownerId: 'owner',
      slot: 1,
      status: 'reserved',
      originalFileName: 'mountains.jpg',
      width: null,
      height: null,
      errorCode: null,
      reservationExpiresAt: expiresAt,
    })).toEqual({
      id: '1',
      ownerId: 'owner',
      slot: 1,
      status: 'reserved',
      originalFileName: 'mountains.jpg',
      width: null,
      height: null,
      errorCode: null,
      createdAt: null,
      updatedAt: null,
      reservationExpiresAt: new Date(5_000),
    });

    expect(decodeOwnerPhoto('2', {
      ownerId: 'owner',
      slot: 2,
      status: 'ready',
      width: 800,
      height: 600,
      errorCode: null,
    })).toEqual({
      id: '2',
      ownerId: 'owner',
      slot: 2,
      status: 'ready',
      originalFileName: null,
      width: 800,
      height: 600,
      errorCode: null,
      createdAt: null,
      updatedAt: null,
      reservationExpiresAt: null,
    });
  });
});

describe('isActiveOwnerPhoto', () => {
  it('treats failed and expired reservations as inactive', () => {
    expect(isActiveOwnerPhoto({
      id: '1',
      ownerId: 'owner',
      slot: 1,
      status: 'failed',
      originalFileName: null,
      width: null,
      height: null,
      errorCode: 'processing-failed',
      createdAt: null,
      updatedAt: null,
      reservationExpiresAt: null,
    }, 10_000)).toBe(false);

    expect(isActiveOwnerPhoto({
      id: '1',
      ownerId: 'owner',
      slot: 1,
      status: 'reserved',
      originalFileName: null,
      width: null,
      height: null,
      errorCode: null,
      createdAt: null,
      updatedAt: null,
      reservationExpiresAt: new Date(1_000),
    }, 10_000)).toBe(false);

    expect(isActiveOwnerPhoto({
      id: '1',
      ownerId: 'owner',
      slot: 1,
      status: 'processing',
      originalFileName: null,
      width: null,
      height: null,
      errorCode: null,
      createdAt: null,
      updatedAt: null,
      reservationExpiresAt: null,
    }, 10_000)).toBe(true);
  });
});

describe('getPublicStorageObjectUrl', () => {
  it('encodes production object paths', () => {
    expect(getPublicStorageObjectUrl(
      'photos.example.app',
      'photos/user id/1/thumbnail.webp',
      false,
    )).toBe(
      'https://firebasestorage.googleapis.com/v0/b/'
      + 'photos.example.app/o/'
      + 'photos%2Fuser%20id%2F1%2Fthumbnail.webp?alt=media',
    );
  });

  it('uses the Storage emulator origin when requested', () => {
    expect(getPublicStorageObjectUrl(
      'demo.appspot.com',
      'photos/user/1/optimized.webp',
      true,
    )).toBe(
      'http://127.0.0.1:9199/v0/b/demo.appspot.com/o/'
      + 'photos%2Fuser%2F1%2Foptimized.webp?alt=media',
    );
  });
});
