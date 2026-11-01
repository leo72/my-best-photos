import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  formatFailedPhotosMessage,
  getFailedPhotoKey,
  getVisibleFailedPhotos,
  readDismissedFailedPhotoKeys,
  writeDismissedFailedPhotoKeys,
} from '../../src/features/photos/failed-photo-notice';

import type { FailedPhoto } from '../../src/features/photos/photo';

function failedPhoto(
  slot: number,
  originalFileName: string | null,
  updatedAtMs = 1_000,
): FailedPhoto {
  return {
    id: String(slot),
    slot,
    originalFileName,
    updatedAt: new Date(updatedAtMs),
  };
}

class MemoryStorage {
  public readonly items = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

describe('formatFailedPhotosMessage', () => {
  it('names a single failed photo', () => {
    expect(formatFailedPhotosMessage([
      failedPhoto(1, 'beach.jpg'),
    ])).toBe(
      '1 photo (beach.jpg) couldn\'t be processed. '
      + 'Try uploading it again.',
    );
  });

  it('falls back to a count without file names', () => {
    expect(formatFailedPhotosMessage([
      failedPhoto(1, null),
    ])).toBe(
      '1 photo couldn\'t be processed. Try uploading it again.',
    );
  });

  it('lists the known names of several failed photos', () => {
    expect(formatFailedPhotosMessage([
      failedPhoto(1, 'beach.jpg'),
      failedPhoto(2, null),
      failedPhoto(3, 'city.png'),
    ])).toBe(
      '3 photos (beach.jpg, city.png) couldn\'t be processed. '
      + 'Try uploading them again.',
    );
  });
});

describe('getVisibleFailedPhotos', () => {
  it('hides dismissed failures', () => {
    const dismissed = failedPhoto(1, 'beach.jpg');
    const fresh = failedPhoto(2, 'city.png');

    expect(getVisibleFailedPhotos(
      [dismissed, fresh],
      new Set([getFailedPhotoKey(dismissed)]),
    )).toEqual([fresh]);
  });

  it('shows a new failure in a reused slot', () => {
    const dismissed = failedPhoto(1, 'beach.jpg', 1_000);
    const retried = failedPhoto(1, 'beach.jpg', 2_000);

    expect(getVisibleFailedPhotos(
      [retried],
      new Set([getFailedPhotoKey(dismissed)]),
    )).toEqual([retried]);
  });
});

describe('dismissed failed photo storage', () => {
  it('round-trips keys per owner', () => {
    const storage = new MemoryStorage();
    const keys = new Set(['1@1000', '2@2000']);

    writeDismissedFailedPhotoKeys(storage, 'owner', keys);

    expect(readDismissedFailedPhotoKeys(storage, 'owner'))
      .toEqual(keys);
    expect(readDismissedFailedPhotoKeys(storage, 'other'))
      .toEqual(new Set());
  });

  it('ignores missing, malformed or failing storage', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      'my-best-photos:dismissed-failed-photos:owner',
      '{not json',
    );
    const throwingStorage = {
      getItem(): string | null {
        throw new Error('blocked');
      },
      setItem(): void {
        throw new Error('blocked');
      },
    };

    expect(readDismissedFailedPhotoKeys(storage, 'owner'))
      .toEqual(new Set());
    expect(readDismissedFailedPhotoKeys(null, 'owner'))
      .toEqual(new Set());
    expect(readDismissedFailedPhotoKeys(throwingStorage, 'owner'))
      .toEqual(new Set());
    expect(() => writeDismissedFailedPhotoKeys(
      throwingStorage,
      'owner',
      new Set(['1@1000']),
    )).not.toThrow();
  });
});
