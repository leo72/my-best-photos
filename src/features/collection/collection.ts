export const MAX_COLLECTION_TITLE_LENGTH = 100;

export const COLLECTION_TYPES = [
  'year',
  'collection',
  'profile',
] as const;

export type CollectionType = (typeof COLLECTION_TYPES)[number];

export type CollectionLook = 'cinematic' | 'gallery' | 'clean';

export interface CollectionProfile {
  ownerId: string;
  collectionType: CollectionType;
  title: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CollectionProfileInput {
  collectionType: CollectionType;
  title: string;
}

const LEGACY_COLLECTION_TYPES = new Set([
  'favorites',
  'family',
  'sharing',
]);

export function isCollectionType(
  value: unknown,
): value is CollectionType {
  return typeof value === 'string'
    && (COLLECTION_TYPES as readonly string[]).includes(value);
}

export function normalizeCollectionType(
  value: unknown,
): CollectionType | null {
  if (isCollectionType(value)) {
    return value;
  }

  if (typeof value === 'string' && LEGACY_COLLECTION_TYPES.has(value)) {
    return 'collection';
  }

  return null;
}

export function getCollectionLook(
  collectionType: CollectionType,
): CollectionLook {
  switch (collectionType) {
    case 'year':
      return 'cinematic';
    case 'collection':
      return 'gallery';
    case 'profile':
      return 'clean';
  }
}

export function getCollectionSubtitle(
  collectionType: CollectionType,
): string {
  switch (collectionType) {
    case 'year':
      return 'Ten photos. One year.';
    case 'collection':
      return 'Moments I love, all in one place.';
    case 'profile':
      return 'A selection of photos that represent me.';
  }
}

export function getDefaultCollectionTitle(
  collectionType: CollectionType,
): string {
  switch (collectionType) {
    case 'year':
      return `My 10 Photos of ${new Date().getFullYear()}`;
    case 'collection':
      return 'My 10 Photos';
    case 'profile':
      return 'My Profile Photos';
  }
}

export function createDefaultCollectionProfile(
  ownerId: string,
): CollectionProfile {
  return {
    ownerId,
    collectionType: 'collection',
    title: getDefaultCollectionTitle('collection'),
    createdAt: null,
    updatedAt: null,
  };
}

export function normalizeCollectionTitle(title: string): string {
  return title.trim().slice(0, MAX_COLLECTION_TITLE_LENGTH);
}

export function getCollectionPath(ownerId: string): string {
  return `users/${ownerId}`;
}
