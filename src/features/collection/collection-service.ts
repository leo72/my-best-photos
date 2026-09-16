import {
  createDefaultCollectionProfile,
  getDefaultCollectionTitle,
  isCollectionType,
  normalizeCollectionTitle,
  type CollectionProfile,
  type CollectionProfileInput,
  type CollectionType,
} from './collection';

import type { CollectionRepository } from './collection-ports';

export interface CollectionService {
  subscribeToCollection(
    ownerId: string,
    onProfile: (profile: CollectionProfile) => void,
    onError: (error: unknown) => void,
  ): () => void;
  saveCollection(
    ownerId: string,
    input: CollectionProfileInput,
  ): Promise<CollectionProfileInput>;
}

export interface CollectionServiceDependencies {
  repository: CollectionRepository;
}

export function validateCollectionInput(
  input: CollectionProfileInput,
): CollectionProfileInput {
  if (!isCollectionType(input.collectionType)) {
    throw new Error('invalid-collection-type');
  }

  const title = normalizeCollectionTitle(input.title);

  if (title.length === 0) {
    throw new Error('empty-collection-title');
  }

  return {
    collectionType: input.collectionType,
    title,
  };
}

export function createCollectionService({
  repository,
}: CollectionServiceDependencies): CollectionService {
  return {
    subscribeToCollection(ownerId, onProfile, onError): () => void {
      if (!ownerId) {
        onError(new Error('invalid-owner-id'));
        return () => undefined;
      }

      return repository.subscribeToCollection(
        ownerId,
        (profile) => {
          onProfile(
            profile ?? createDefaultCollectionProfile(ownerId),
          );
        },
        onError,
      );
    },

    async saveCollection(ownerId, input) {
      if (!ownerId) {
        throw new Error('authentication-required');
      }

      const normalized = validateCollectionInput(input);
      await repository.saveCollection(ownerId, normalized);
      return normalized;
    },
  };
}

export function titleForCollectionTypeChange(
  nextType: CollectionType,
  currentTitle: string,
  previousType: CollectionType,
): string {
  const previousDefault = getDefaultCollectionTitle(previousType);

  if (
    normalizeCollectionTitle(currentTitle) === ''
    || normalizeCollectionTitle(currentTitle) === previousDefault
  ) {
    return getDefaultCollectionTitle(nextType);
  }

  return currentTitle;
}
