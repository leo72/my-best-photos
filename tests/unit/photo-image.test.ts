import {
  describe,
  expect,
  it,
} from 'vitest';

import { getPhotoSrcSet } from '../../src/features/photos/photo-image';

import type { GalleryPhoto } from '../../src/features/photos/photo';

function galleryPhoto(
  width: number,
  height: number,
  sourceGeneration: string | null = '42',
): GalleryPhoto {
  return {
    id: 'owner_1',
    ownerId: 'owner',
    slot: 1,
    sourceGeneration,
    status: 'ready',
    width,
    height,
    createdAt: null,
    updatedAt: null,
    thumbnailUrl: 'https://example.test/thumbnail.webp',
    optimizedUrl: 'https://example.test/optimized.webp',
    originalFileName: null,
  };
}

describe('getPhotoSrcSet', () => {
  it('offers the thumbnail at its scaled width', () => {
    expect(getPhotoSrcSet(galleryPhoto(2048, 1024))).toBe(
      'https://example.test/thumbnail.webp 960w, '
      + 'https://example.test/optimized.webp 2048w',
    );
    expect(getPhotoSrcSet(galleryPhoto(1536, 2048))).toBe(
      'https://example.test/thumbnail.webp 720w, '
      + 'https://example.test/optimized.webp 1536w',
    );
  });

  it('lists only the thumbnail when both derivatives are the same size', () => {
    expect(getPhotoSrcSet(galleryPhoto(800, 600))).toBe(
      'https://example.test/thumbnail.webp 800w',
    );
  });

  it('assumes 480px thumbnails for unversioned photos', () => {
    expect(getPhotoSrcSet(galleryPhoto(2048, 1072, null))).toBe(
      'https://example.test/thumbnail.webp 480w, '
      + 'https://example.test/optimized.webp 2048w',
    );
    expect(getPhotoSrcSet(galleryPhoto(808, 702, null))).toBe(
      'https://example.test/thumbnail.webp 480w, '
      + 'https://example.test/optimized.webp 808w',
    );
    expect(getPhotoSrcSet(galleryPhoto(353, 43, null))).toBe(
      'https://example.test/thumbnail.webp 353w',
    );
  });
});
