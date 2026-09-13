import {
  createTestPhoto,
  getPhotos,
} from '../../services/photo-service';

import {
  renderPhotos,
  type GalleryViewElements,
} from './gallery-view';

export function initGalleryController(
  view: GalleryViewElements,
): void {
  const {
    createTestPhotoButton,
    message,
    list,
  } = view;

  async function loadPhotos(): Promise<void> {
    try {
      const photos = await getPhotos();

      renderPhotos(list, photos);
    } catch (error) {
      console.error(error);

      message.textContent =
        error instanceof Error
          ? error.message
          : 'Failed to load photos';
    }
  }

  createTestPhotoButton.addEventListener(
    'click',
    async () => {
      message.textContent = '';

      try {
        await createTestPhoto();
        await loadPhotos();

        message.textContent = 'Photo created';
      } catch (error) {
        console.error(error);

        message.textContent =
          error instanceof Error
            ? error.message
            : 'Failed to create photo';
      }
    },
  );

  void loadPhotos();
}