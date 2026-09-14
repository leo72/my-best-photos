export const MAX_PHOTO_SLOTS = 10;
export const MAX_PHOTO_SIZE_BYTES = 12 * 1024 * 1024;

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
