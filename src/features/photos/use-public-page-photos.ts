import { useEffect, useState } from 'react';

import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';
import { useAppServices } from '../../app/providers';

import type { GalleryPhoto } from './photo';

type PublicPagePhotosState =
  | { status: 'loading' }
  | { status: 'ready'; photos: GalleryPhoto[] }
  | { status: 'error'; message: string };

export function usePublicPagePhotos(
  ownerId: string | undefined,
): PublicPagePhotosState {
  const { photoService } = useAppServices();
  const [state, setState] = useState<PublicPagePhotosState>({
    status: 'loading',
  });

  useEffect(() => {
    if (!ownerId) {
      setState({
        status: 'error',
        message: 'This photo page could not be found',
      });
      return;
    }

    setState({ status: 'loading' });

    const unsubscribe = photoService.subscribeToPublicPage(
      ownerId,
      (photos) => {
        setState({ status: 'ready', photos });
      },
      (error) => {
        logClientError('Public page subscription failed', error);
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
  }, [ownerId, photoService]);

  return state;
}
