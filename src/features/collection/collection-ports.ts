import type {
  CollectionProfile,
  CollectionProfileInput,
} from './collection';

export interface CollectionRepository {
  subscribeToCollection(
    ownerId: string,
    onProfile: (profile: CollectionProfile | null) => void,
    onError: (error: unknown) => void,
  ): () => void;
  saveCollection(
    ownerId: string,
    input: CollectionProfileInput,
  ): Promise<void>;
}
