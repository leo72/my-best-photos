export const MAX_PHOTO_SLOTS = 10;
export const MAX_PHOTO_SIZE_BYTES = 12 * 1024 * 1024;
/** Longest edge of the public full-size WebP, in pixels. */
export const OPTIMIZED_MAX_SIZE = 2048;
/** Longest edge of the public thumbnail WebP, in pixels. */
export const THUMBNAIL_MAX_SIZE = 960;

export const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export interface ReservePhotoInput {
  originalFileName: string;
  originalContentType: string;
  originalSize: number;
}

export interface PhotoReservation {
  photoId: string;
  slot: number;
  reservationId: string;
}

export type ReservePhotoResult = PhotoReservation;

export type PhotoDerivative = 'optimized.webp' | 'thumbnail.webp';

export function getPrivatePhotoPath(
  ownerId: string,
  slot: number,
): string {
  return `users/${ownerId}/photos/${slot}`;
}

export function getPublicPhotoId(
  ownerId: string,
  slot: number,
): string {
  return `${ownerId}_${slot}`;
}

export function getPhotoStorageBasePath(
  ownerId: string,
  slot: number,
): string {
  return `photos/${ownerId}/${slot}`;
}

/**
 * Derivatives sit under the original's generation so a reused slot gets
 * new URLs; `null` is the unversioned layout of older photos.
 */
export function getPhotoDerivativePath(
  ownerId: string,
  slot: number,
  sourceGeneration: string | null,
  derivative: PhotoDerivative,
): string {
  const basePath = getPhotoStorageBasePath(ownerId, slot);

  return sourceGeneration
    ? `${basePath}/${sourceGeneration}/${derivative}`
    : `${basePath}/${derivative}`;
}
