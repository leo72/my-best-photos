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

export const RESERVATION_TTL_MS = 15 * 60 * 1000;
export const OPTIMIZED_MAX_SIZE = 2048;
export const THUMBNAIL_MAX_SIZE = 480;

export type PrivatePhotoStatus =
  | 'reserved'
  | 'processing'
  | 'ready'
  | 'failed';
