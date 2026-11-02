export {
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTO_SLOTS,
  SUPPORTED_IMAGE_TYPES,
  THUMBNAIL_MAX_SIZE,
  getPhotoDerivativePath,
  getPhotoStorageBasePath,
  getPublicPhotoId,
  type PhotoDerivative,
  type PhotoReservation,
  type ReservePhotoInput,
} from '../../../shared/photo-contract';

export type PrivatePhotoStatus =
  | 'reserved'
  | 'processing'
  | 'ready'
  | 'failed';

export interface PublicPhoto {
  id: string;
  ownerId: string;
  slot: number;
  /** Version of the derivatives; `null` for the unversioned layout. */
  sourceGeneration: string | null;
  status: 'ready';
  width: number;
  height: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface OwnerPhoto {
  id: string;
  ownerId: string;
  slot: number;
  sourceGeneration: string | null;
  status: PrivatePhotoStatus;
  originalFileName: string | null;
  width: number | null;
  height: number | null;
  errorCode: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  reservationExpiresAt: Date | null;
}

export interface GalleryPhoto extends PublicPhoto {
  thumbnailUrl: string;
  optimizedUrl: string;
  originalFileName: string | null;
}

export type FailedPhoto = Pick<
  OwnerPhoto,
  'id' | 'slot' | 'originalFileName' | 'updatedAt'
>;

export interface MyPhotosSnapshot {
  readyPhotos: GalleryPhoto[];
  pendingCount: number;
  failedPhotos: FailedPhoto[];
}

export interface UploadPhotoResult {
  photoId: string;
  slot: number;
}
