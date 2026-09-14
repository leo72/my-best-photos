export {
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTO_SLOTS,
  SUPPORTED_IMAGE_TYPES,
  getPhotoStorageBasePath,
  type PhotoReservation,
  type ReservePhotoInput,
} from '../../../shared/photo-contract';

export interface PublicPhoto {
  id: string;
  ownerId: string;
  slot: number;
  status: 'ready';
  width: number;
  height: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface GalleryPhoto extends PublicPhoto {
  thumbnailUrl: string;
  optimizedUrl: string;
}

export interface UploadPhotoResult {
  photoId: string;
  slot: number;
}
