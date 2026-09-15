import { useEffect, useState } from 'react';

import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';
import { useAppServices } from '../../app/providers';

import type { GalleryPhoto } from './photo';

type GalleryState =
  | { status: 'loading' }
  | { status: 'ready'; photos: GalleryPhoto[] }
  | { status: 'error'; message: string };

export function useGallery(): GalleryState {
  const { photoService } = useAppServices();
  const [state, setState] = useState<GalleryState>({
    status: 'loading',
  });

  useEffect(() => {
    const unsubscribe = photoService.subscribeToGallery(
      (photos) => {
        setState({ status: 'ready', photos });
      },
      (error) => {
        logClientError('Gallery subscription failed', error);
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
  }, [photoService]);

  return state;
}
