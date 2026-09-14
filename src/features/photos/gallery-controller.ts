import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';
import {
  renderGalleryError,
  renderGalleryLoading,
  renderPhotos,
  type GalleryViewElements,
} from './gallery-view';

import type { PhotoService } from './photo-service';

export interface GalleryController {
  setAuthenticated(isAuthenticated: boolean): void;
  dispose(): void;
}

function getPhotoErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const domainMessages: Readonly<Record<string, string>> = {
      'authentication-required':
        'Sign in before uploading a photo',
      'empty-photo': 'Image must not be empty',
      'photo-too-large': 'Image must not exceed 12 MB',
      'unsupported-photo-type':
        'Only JPEG, PNG and WebP images are supported',
    };
    const domainMessage = domainMessages[error.message];

    if (domainMessage) {
      return domainMessage;
    }
  }

  return getUserErrorMessage(error, 'Failed to upload photo');
}

export function initGalleryController(
  view: GalleryViewElements,
  photoService: PhotoService,
): GalleryController {
  const {
    uploadForm,
    photoInput,
    uploadButton,
    uploadHint,
    message,
    list,
  } = view;
  let isAuthenticated = false;
  let isUploading = false;

  function updateUploadControls(): void {
    const isEnabled = isAuthenticated && !isUploading;
    photoInput.disabled = !isEnabled;
    uploadButton.disabled = !isEnabled;
    uploadHint.textContent = isAuthenticated
      ? 'JPEG, PNG or WebP, up to 12 MB.'
      : 'Sign in to upload a photo.';
  }

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    if (!isAuthenticated || isUploading) {
      return;
    }

    const file = photoInput.files?.item(0);

    if (!file) {
      message.textContent = 'Choose a photo to upload';
      return;
    }

    isUploading = true;
    message.textContent = 'Uploading photo…';
    updateUploadControls();

    try {
      await photoService.uploadPhoto(file);
      photoInput.value = '';
      message.textContent =
        'Photo uploaded. It will appear after processing.';
    } catch (error) {
      logClientError('Photo upload failed', error);
      message.textContent = getPhotoErrorMessage(error);
    } finally {
      isUploading = false;
      updateUploadControls();
    }
  };

  uploadForm.addEventListener('submit', handleSubmit);
  renderGalleryLoading(list);

  const unsubscribeGallery = photoService.subscribeToGallery(
    (photos) => {
      renderPhotos(list, photos);
    },
    (error) => {
      logClientError('Gallery subscription failed', error);
      renderGalleryError(list);
      message.textContent = getUserErrorMessage(
        error,
        'Failed to load photos',
      );
    },
  );

  updateUploadControls();

  return {
    setAuthenticated(nextIsAuthenticated): void {
      isAuthenticated = nextIsAuthenticated;
      updateUploadControls();
    },

    dispose(): void {
      uploadForm.removeEventListener('submit', handleSubmit);
      unsubscribeGallery();
    },
  };
}
