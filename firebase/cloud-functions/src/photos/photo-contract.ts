export {
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTO_SLOTS,
  OPTIMIZED_MAX_SIZE,
  SUPPORTED_IMAGE_TYPES,
  THUMBNAIL_MAX_SIZE,
  getPhotoDerivativePath,
  getPhotoStorageBasePath,
  getPrivatePhotoPath,
  getPublicPhotoId,
  type PhotoDerivative,
  type PhotoReservation,
  type ReservePhotoInput,
  type ReservePhotoResult,
} from '../../../../shared/photo-contract.js';

/** How long a reserved upload slot stays valid before cleanup. */
export const RESERVATION_TTL_MS = 15 * 60 * 1000;

export type PrivatePhotoStatus =
  | 'reserved'
  | 'processing'
  | 'ready'
  | 'failed';
