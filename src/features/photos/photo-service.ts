import {
  MAX_PHOTO_SIZE_BYTES,
  SUPPORTED_IMAGE_TYPES,
  type GalleryPhoto,
  type UploadPhotoResult,
} from './photo';

import type {
  AuthSession,
  PhotoRepository,
  PhotoUploadGateway,
} from './photo-ports';

export interface PhotoService {
  uploadPhoto(file: File): Promise<UploadPhotoResult>;
  subscribeToGallery(
    onPhotos: (photos: GalleryPhoto[]) => void,
    onError: (error: unknown) => void,
  ): () => void;
}

export interface PhotoServiceDependencies {
  authSession: AuthSession;
  repository: PhotoRepository;
  uploadGateway: PhotoUploadGateway;
}

export function validatePhotoFile(file: File): void {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error('unsupported-photo-type');
  }

  if (file.size === 0) {
    throw new Error('empty-photo');
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error('photo-too-large');
  }
}

export function createPhotoService({
  authSession,
  repository,
  uploadGateway,
}: PhotoServiceDependencies): PhotoService {
  return {
    async uploadPhoto(file): Promise<UploadPhotoResult> {
      validatePhotoFile(file);

      const ownerId = authSession.getCurrentUserId();

      if (!ownerId) {
        throw new Error('authentication-required');
      }

      const reservation = await uploadGateway.reservePhoto({
        originalFileName: file.name,
        originalContentType: file.type,
        originalSize: file.size,
      });

      try {
        await uploadGateway.uploadOriginal(
          ownerId,
          reservation,
          file,
        );
      } catch (error) {
        try {
          await uploadGateway.cancelReservation(reservation);
        } catch {
          // Reservation expiry remains the safe fallback.
        }

        throw error;
      }

      return {
        photoId: reservation.photoId,
        slot: reservation.slot,
      };
    },

    subscribeToGallery(onPhotos, onError): () => void {
      let isActive = true;
      let snapshotVersion = 0;

      const unsubscribe = repository.subscribeToPublicPhotos(
        (photos) => {
          const currentVersion = ++snapshotVersion;

          void Promise.all(
            photos.map(async (photo): Promise<GalleryPhoto> => ({
              ...photo,
              thumbnailUrl:
                await uploadGateway.getDerivativeUrl(
                  photo.ownerId,
                  photo.slot,
                  'thumbnail.webp',
                ),
              optimizedUrl:
                await uploadGateway.getDerivativeUrl(
                  photo.ownerId,
                  photo.slot,
                  'optimized.webp',
                ),
            })),
          ).then(
            (galleryPhotos) => {
              if (
                isActive
                && currentVersion === snapshotVersion
              ) {
                onPhotos(galleryPhotos);
              }
            },
            (error: unknown) => {
              if (isActive) {
                onError(error);
              }
            },
          );
        },
        onError,
      );

      return () => {
        isActive = false;
        unsubscribe();
      };
    },
  };
}
