import { useEffect, useState } from 'react';

import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';
import { useAppServices } from '../../app/providers';

import type {
  CollectionProfile,
  CollectionProfileInput,
} from './collection';

type CollectionState =
  | { status: 'loading' }
  | { status: 'ready'; profile: CollectionProfile }
  | { status: 'error'; message: string };

export function useCollection(
  ownerId: string | undefined,
): CollectionState {
  const { collectionService } = useAppServices();
  const [state, setState] = useState<CollectionState>({
    status: 'loading',
  });

  useEffect(() => {
    if (!ownerId) {
      setState({
        status: 'error',
        message: 'Collection could not be found',
      });
      return;
    }

    setState({ status: 'loading' });

    const unsubscribe = collectionService.subscribeToCollection(
      ownerId,
      (profile) => {
        setState({ status: 'ready', profile });
      },
      (error) => {
        logClientError('Collection subscription failed', error);
        setState({
          status: 'error',
          message: getUserErrorMessage(
            error,
            'Failed to load collection',
          ),
        });
      },
    );

    return unsubscribe;
  }, [collectionService, ownerId]);

  return state;
}

export function useSaveCollection(ownerId: string | undefined) {
  const { collectionService } = useAppServices();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function saveCollection(
    input: CollectionProfileInput,
  ): Promise<boolean> {
    if (!ownerId || isSaving) {
      return false;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await collectionService.saveCollection(ownerId, input);
      setIsSaving(false);
      return true;
    } catch (error) {
      logClientError('Collection save failed', error);
      setErrorMessage(
        getUserErrorMessage(error, 'Failed to save collection'),
      );
      setIsSaving(false);
      return false;
    }
  }

  return {
    isSaving,
    errorMessage,
    saveCollection,
  };
}
