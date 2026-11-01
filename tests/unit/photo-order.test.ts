import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  normalizePhotoOrder,
  sortPhotosByOrder,
} from '../../src/features/photos/photo-order';

function photo(slot: number, updatedAtMs: number | null) {
  return {
    slot,
    updatedAt: updatedAtMs === null ? null : new Date(updatedAtMs),
  };
}

function slotsOf(photos: readonly { slot: number }[]): number[] {
  return photos.map((entry) => entry.slot);
}

describe('normalizePhotoOrder', () => {
  it('keeps valid distinct slots in order', () => {
    expect(normalizePhotoOrder([3, 1, 10])).toEqual([3, 1, 10]);
  });

  it('drops invalid and repeated slots', () => {
    expect(
      normalizePhotoOrder([0, 2, 11, 2.5, '4', null, 2, 5]),
    ).toEqual([2, 5]);
  });

  it('treats a non-list as no order', () => {
    expect(normalizePhotoOrder(undefined)).toEqual([]);
    expect(normalizePhotoOrder({ 0: 1 })).toEqual([]);
  });
});

describe('sortPhotosByOrder', () => {
  it('keeps newest first when nothing is ordered', () => {
    const photos = [photo(1, 100), photo(2, 300), photo(3, 200)];

    expect(slotsOf(sortPhotosByOrder(photos, []))).toEqual([2, 3, 1]);
  });

  it('follows the saved order', () => {
    const photos = [photo(1, 100), photo(2, 300), photo(3, 200)];

    expect(slotsOf(sortPhotosByOrder(photos, [1, 3, 2]))).toEqual([
      1,
      3,
      2,
    ]);
  });

  it('puts photos missing from the order first, newest first', () => {
    const photos = [
      photo(1, 100),
      photo(2, 300),
      photo(3, 200),
      photo(4, 400),
    ];

    expect(slotsOf(sortPhotosByOrder(photos, [3, 1]))).toEqual([
      4,
      2,
      3,
      1,
    ]);
  });

  it('ignores ordered slots that have no photo', () => {
    const photos = [photo(1, 100), photo(3, 200)];

    expect(slotsOf(sortPhotosByOrder(photos, [5, 3, 1]))).toEqual([
      3,
      1,
    ]);
  });

  it('does not mutate the input', () => {
    const photos = [photo(1, 100), photo(2, 300)];

    sortPhotosByOrder(photos, [2, 1]);

    expect(slotsOf(photos)).toEqual([1, 2]);
  });
});
