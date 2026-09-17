import { useEffect, useState } from 'react';

import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';
import { useAppServices } from '../../app/providers';
import { useAuth } from '../auth/auth-provider';

import type { MyPhotosSnapshot } from './photo';

type MyPhotosState =
  | { status: 'loading' }
  | { status: 'ready'; snapshot: MyPhotosSnapshot }
  | { status: 'error'; message: string };

export function useMyPhotos(): MyPhotosState {
  const { user } = useAuth();
  const { photoService } = useAppServices();
  const [state, setState] = useState<MyPhotosState>({
    status: 'loading',
  });

  useEffect(() => {
    if (!user?.emailVerified) {
      return;
    }

    const unsubscribe = photoService.subscribeToMyPhotos(
      (snapshot) => {
        setState({ status: 'ready', snapshot });
      },
      (error) => {
        logClientError('My photos subscription failed', error);
        setState({
          status: 'error',
          message: getUserErrorMessage(
            error,
            'Failed to load photos',
          ),
        });
      },
    );

    return unsubscribe;
  }, [photoService, user?.emailVerified, user?.id]);

  return state;
}
