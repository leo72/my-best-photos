import {
  httpsCallable,
} from 'firebase/functions';
import {
  ref,
  uploadBytes,
} from 'firebase/storage';

import {
  firebaseFunctions,
  firebaseStorage,
} from './client';
import {
  getFirebaseClientConfig,
  shouldUseFirebaseEmulators,
} from './config';
import { getPublicStorageObjectUrl } from './storage-url';

import {
  getPhotoStorageBasePath,
  MAX_PHOTO_SLOTS,
  type PhotoReservation,
  type ReservePhotoInput,
} from '../../features/photos/photo';
import type { PhotoUploadGateway } from '../../features/photos/photo-ports';

interface CancelReservationInput {
  slot: number;
  reservationId: string;
}

function parsePhotoReservation(
  value: unknown,
): PhotoReservation {
  if (typeof value !== 'object' || value === null) {
    throw new Error('invalid-photo-reservation');
  }

  if (
    !('photoId' in value)
    || typeof value.photoId !== 'string'
    || !('slot' in value)
    || typeof value.slot !== 'number'
    || !Number.isInteger(value.slot)
    || value.slot < 1
    || value.slot > MAX_PHOTO_SLOTS
    || !('reservationId' in value)
    || typeof value.reservationId !== 'string'
  ) {
    throw new Error('invalid-photo-reservation');
  }

  return {
    photoId: value.photoId,
    slot: value.slot,
    reservationId: value.reservationId,
  };
}

export function createFirebasePhotoUploadGateway(): PhotoUploadGateway {
  const { storageBucket } = getFirebaseClientConfig();
  const isEmulated = shouldUseFirebaseEmulators();
  const reservePhotoUpload = httpsCallable<
    ReservePhotoInput,
    unknown
  >(firebaseFunctions, 'reservePhotoUpload');
  const cancelPhotoUpload = httpsCallable<
    CancelReservationInput,
    void
  >(firebaseFunctions, 'cancelPhotoUpload');
  const deletePhotoCallable = httpsCallable<
    { slot: number },
    void
  >(firebaseFunctions, 'deletePhoto');

  return {
    async reservePhoto(input): Promise<PhotoReservation> {
      const result = await reservePhotoUpload(input);
      return parsePhotoReservation(result.data);
    },

    async cancelReservation(reservation): Promise<void> {
      await cancelPhotoUpload({
        slot: reservation.slot,
        reservationId: reservation.reservationId,
      });
    },

    async deletePhoto(slot): Promise<void> {
      await deletePhotoCallable({ slot });
    },

    async uploadOriginal(
      ownerId,
      reservation,
      file,
    ): Promise<void> {
      const storageReference = ref(
        firebaseStorage,
        `${getPhotoStorageBasePath(ownerId, reservation.slot)}/original`,
      );

      await uploadBytes(storageReference, file, {
        contentType: file.type,
        customMetadata: {
          reservationId: reservation.reservationId,
        },
      });
    },

    async getDerivativeUrl(
      ownerId,
      slot,
      derivative,
    ): Promise<string> {
      return getPublicStorageObjectUrl(
        storageBucket,
        `${getPhotoStorageBasePath(ownerId, slot)}/${derivative}`,
        isEmulated,
      );
    },
  };
}
