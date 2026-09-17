export {
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTO_SLOTS,
  SUPPORTED_IMAGE_TYPES,
  getPhotoStorageBasePath,
  getPrivatePhotoPath,
  getPublicPhotoId,
  type PhotoReservation,
  type ReservePhotoInput,
  type ReservePhotoResult,
} from '../../../../shared/photo-contract.js';

/** How long a reserved upload slot stays valid before cleanup. */
export const RESERVATION_TTL_MS = 15 * 60 * 1000;
/** Longest edge of the public full-size WebP, in pixels. */
export const OPTIMIZED_MAX_SIZE = 2048;
/** Longest edge of the public thumbnail WebP, in pixels. */
export const THUMBNAIL_MAX_SIZE = 960;

export type PrivatePhotoStatus =
  | 'reserved'
  | 'processing'
  | 'ready'
  | 'failed';
