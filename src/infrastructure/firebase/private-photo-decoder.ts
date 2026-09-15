import { Timestamp } from 'firebase/firestore';

import {
  MAX_PHOTO_SLOTS,
  type OwnerPhoto,
  type PrivatePhotoStatus,
} from '../../features/photos/photo';

const PRIVATE_PHOTO_STATUSES = new Set<PrivatePhotoStatus>([
  'reserved',
  'processing',
  'ready',
  'failed',
]);

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0
    ? value
    : null;
}

function readPositiveInteger(value: unknown): number | null {
  return typeof value === 'number'
    && Number.isInteger(value)
    && value > 0
    ? value
    : null;
}

function readNullablePositiveInteger(
  value: unknown,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return readPositiveInteger(value);
}

function readDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function readStatus(value: unknown): PrivatePhotoStatus | null {
  return typeof value === 'string'
    && PRIVATE_PHOTO_STATUSES.has(value as PrivatePhotoStatus)
    ? value as PrivatePhotoStatus
    : null;
}

export function decodeOwnerPhoto(
  photoId: string,
  value: unknown,
): OwnerPhoto | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  if (
    !('ownerId' in value)
    || !('slot' in value)
    || !('status' in value)
  ) {
    return null;
  }

  const ownerId = readString(value.ownerId);
  const slot = readPositiveInteger(value.slot);
  const status = readStatus(value.status);

  if (
    !ownerId
    || slot === null
    || slot > MAX_PHOTO_SLOTS
    || status === null
  ) {
    return null;
  }

  return {
    id: photoId,
    ownerId,
    slot,
    status,
    originalFileName:
      'originalFileName' in value
        ? readString(value.originalFileName)
        : null,
    width:
      'width' in value
        ? readNullablePositiveInteger(value.width)
        : null,
    height:
      'height' in value
        ? readNullablePositiveInteger(value.height)
        : null,
    errorCode:
      'errorCode' in value && typeof value.errorCode === 'string'
        ? value.errorCode
        : null,
    createdAt:
      'createdAt' in value ? readDate(value.createdAt) : null,
    updatedAt:
      'updatedAt' in value ? readDate(value.updatedAt) : null,
    reservationExpiresAt:
      'reservationExpiresAt' in value
        ? readDate(value.reservationExpiresAt)
        : null,
  };
}
