import { Timestamp } from 'firebase/firestore';
import {
  describe,
  expect,
  it,
} from 'vitest';

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
