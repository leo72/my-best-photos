import { isActiveOwnerPhoto } from './owner-photo';
import {
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTO_SLOTS,
  SUPPORTED_IMAGE_TYPES,
  type GalleryPhoto,
  type MyPhotosSnapshot,
  type OwnerPhoto,
  type PublicPhoto,
  type UploadPhotoResult,
} from './photo';

import type {
  AuthSession,
  PhotoRepository,
  PhotoUploadGateway,
} from './photo-ports';

export interface PhotoService {
  uploadPhoto(file: File): Promise<UploadPhotoResult>;
  deletePhoto(slot: number): Promise<void>;
  subscribeToGallery(
    onPhotos: (photos: GalleryPhoto[]) => void,
    onError: (error: unknown) => void,
  ): () => void;
  subscribeToPublicPage(
    ownerId: string,
    onPhotos: (photos: GalleryPhoto[]) => void,
    onError: (error: unknown) => void,
  ): () => void;
  subscribeToMyPhotos(
    onPhotos: (snapshot: MyPhotosSnapshot) => void,
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

async function toGalleryPhoto(
  photo: OwnerPhoto,
  uploadGateway: PhotoUploadGateway,
): Promise<GalleryPhoto | null> {
  if (
    photo.status !== 'ready'
    || photo.width === null
    || photo.height === null
  ) {
    return null;
  }

  const [thumbnailUrl, optimizedUrl] = await Promise.all([
    uploadGateway.getDerivativeUrl(
      photo.ownerId,
      photo.slot,
      'thumbnail.webp',
    ),
    uploadGateway.getDerivativeUrl(
      photo.ownerId,
      photo.slot,
      'optimized.webp',
    ),
  ]);

  return {
    id: `${photo.ownerId}_${photo.slot}`,
    ownerId: photo.ownerId,
    slot: photo.slot,
    status: 'ready',
    width: photo.width,
    height: photo.height,
    createdAt: photo.createdAt,
    updatedAt: photo.updatedAt,
    thumbnailUrl,
    optimizedUrl,
    originalFileName: photo.originalFileName,
  };
}

function subscribeResolvedPublicPhotos(
  subscribe: (
    onPhotos: (photos: PublicPhoto[]) => void,
    onError: (error: unknown) => void,
  ) => () => void,
  uploadGateway: PhotoUploadGateway,
  onPhotos: (photos: GalleryPhoto[]) => void,
  onError: (error: unknown) => void,
): () => void {
  let isActive = true;
  let snapshotVersion = 0;

  const unsubscribe = subscribe(
    (photos) => {
      const currentVersion = ++snapshotVersion;

      void Promise.all(
        photos.map(async (photo): Promise<GalleryPhoto> => ({
          ...photo,
          thumbnailUrl: await uploadGateway.getDerivativeUrl(
            photo.ownerId,
            photo.slot,
            'thumbnail.webp',
          ),
          optimizedUrl: await uploadGateway.getDerivativeUrl(
            photo.ownerId,
            photo.slot,
            'optimized.webp',
          ),
          originalFileName: null,
        })),
      ).then(
        (galleryPhotos) => {
          if (isActive && currentVersion === snapshotVersion) {
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

    async deletePhoto(slot): Promise<void> {
      if (!authSession.getCurrentUserId()) {
        throw new Error('authentication-required');
      }

      if (
        !Number.isInteger(slot)
        || slot < 1
        || slot > MAX_PHOTO_SLOTS
      ) {
        throw new Error('invalid-photo-slot');
      }

      await uploadGateway.deletePhoto(slot);
    },

    subscribeToGallery(onPhotos, onError): () => void {
      return subscribeResolvedPublicPhotos(
        repository.subscribeToPublicPhotos.bind(repository),
        uploadGateway,
        onPhotos,
        onError,
      );
    },

    subscribeToPublicPage(ownerId, onPhotos, onError): () => void {
      if (!ownerId) {
        onError(new Error('invalid-owner-id'));
        return () => undefined;
      }

      return subscribeResolvedPublicPhotos(
        (nextPhotos, nextError) =>
          repository.subscribeToOwnerPublicPhotos(
            ownerId,
            nextPhotos,
            nextError,
          ),
        uploadGateway,
        onPhotos,
        onError,
      );
    },

    subscribeToMyPhotos(onPhotos, onError): () => void {
      const ownerId = authSession.getCurrentUserId();

      if (!ownerId) {
        onError(new Error('authentication-required'));
        return () => undefined;
      }

      let isActive = true;
      let snapshotVersion = 0;

      const unsubscribe = repository.subscribeToOwnerPhotos(
        ownerId,
        (photos) => {
          const currentVersion = ++snapshotVersion;
          const nowMs = Date.now();
          const failedCount = photos.filter(
            (photo) => photo.status === 'failed',
          ).length;
          const activePhotos = photos.filter((photo) =>
            isActiveOwnerPhoto(photo, nowMs),
          );
          const pendingCount = activePhotos.filter(
            (photo) =>
              photo.status === 'reserved'
              || photo.status === 'processing',
          ).length;
          const readyOwnerPhotos = activePhotos.filter(
            (photo) => photo.status === 'ready',
          );

          void Promise.all(
            readyOwnerPhotos.map((photo) =>
              toGalleryPhoto(photo, uploadGateway),
            ),
          ).then(
            (resolvedPhotos) => {
              if (
                !isActive
                || currentVersion !== snapshotVersion
              ) {
                return;
              }

              const readyPhotos = resolvedPhotos
                .filter((photo): photo is GalleryPhoto =>
                  photo !== null,
                )
                .sort((left, right) => {
                  const leftTime =
                    left.updatedAt?.getTime() ?? 0;
                  const rightTime =
                    right.updatedAt?.getTime() ?? 0;
                  return rightTime - leftTime;
                });

              onPhotos({
                readyPhotos,
                pendingCount,
                failedCount,
              });
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
