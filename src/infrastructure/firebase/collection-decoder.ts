import { Timestamp } from 'firebase/firestore';

import {
  getDefaultCollectionSubtitle,
  normalizeCollectionSubtitle,
  normalizeCollectionTitle,
  normalizeCollectionType,
  type CollectionProfile,
} from '../../features/collection/collection';
import { normalizePhotoOrder } from '../../features/photos/photo-order';

function readDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

export function decodeCollectionProfile(
  ownerId: string,
  value: unknown,
): CollectionProfile | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  if (!('collectionType' in value) || !('title' in value)) {
    return null;
  }

  const collectionType = normalizeCollectionType(
    value.collectionType,
  );
  const title = typeof value.title === 'string'
    ? normalizeCollectionTitle(value.title)
    : '';

  if (!collectionType || title.length === 0) {
    return null;
  }

  return {
    ownerId,
    collectionType,
    title,
    // Pages saved before subtitles existed keep their style's line.
    subtitle: 'subtitle' in value && typeof value.subtitle === 'string'
      ? normalizeCollectionSubtitle(value.subtitle)
      : getDefaultCollectionSubtitle(collectionType),
    photoOrder:
      'photoOrder' in value ? normalizePhotoOrder(value.photoOrder) : [],
    createdAt:
      'createdAt' in value ? readDate(value.createdAt) : null,
    updatedAt:
      'updatedAt' in value ? readDate(value.updatedAt) : null,
  };
}
