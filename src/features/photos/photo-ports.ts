import type {
  OwnerPhoto,
  PhotoReservation,
  PublicPhoto,
  ReservePhotoInput,
} from './photo';

export interface AuthSession {
  getCurrentUserId(): string | null;
}

export interface PhotoRepository {
  subscribeToPublicPhotos(
    onPhotos: (photos: PublicPhoto[]) => void,
    onError: (error: unknown) => void,
  ): () => void;
  subscribeToOwnerPublicPhotos(
    ownerId: string,
    onPhotos: (photos: PublicPhoto[]) => void,
    onError: (error: unknown) => void,
  ): () => void;
  subscribeToOwnerPhotos(
    ownerId: string,
    onPhotos: (photos: OwnerPhoto[]) => void,
    onError: (error: unknown) => void,
  ): () => void;
}

export interface PhotoUploadGateway {
  reservePhoto(
    input: ReservePhotoInput,
  ): Promise<PhotoReservation>;
  cancelReservation(
    reservation: PhotoReservation,
  ): Promise<void>;
  deletePhoto(slot: number): Promise<void>;
  uploadOriginal(
    ownerId: string,
    reservation: PhotoReservation,
    file: File,
  ): Promise<void>;
  getDerivativeUrl(
    ownerId: string,
    slot: number,
    derivative: 'optimized.webp' | 'thumbnail.webp',
  ): Promise<string>;
}
