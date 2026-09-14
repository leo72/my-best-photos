import { Timestamp } from 'firebase/firestore';

import {
  MAX_PHOTO_SLOTS,
  type PublicPhoto,
} from '../../features/photos/photo';

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

function readDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

export function decodePublicPhoto(
  photoId: string,
  value: unknown,
): PublicPhoto | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  if (
    !('ownerId' in value)
    || !('slot' in value)
    || !('width' in value)
    || !('height' in value)
    || !('status' in value)
  ) {
    return null;
  }

  const ownerId = readString(value.ownerId);
  const slot = readPositiveInteger(value.slot);
  const width = readPositiveInteger(value.width);
  const height = readPositiveInteger(value.height);

  if (
    !ownerId
    || slot === null
    || slot > MAX_PHOTO_SLOTS
    || width === null
    || height === null
    || value.status !== 'ready'
  ) {
    return null;
  }

  return {
    id: photoId,
    ownerId,
    slot,
    status: 'ready',
    width,
    height,
    createdAt:
      'createdAt' in value ? readDate(value.createdAt) : null,
    updatedAt:
      'updatedAt' in value ? readDate(value.updatedAt) : null,
  };
}
