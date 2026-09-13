import type { Photo } from '../../types/photo';

export interface GalleryViewElements {
  container: HTMLElement;
  createTestPhotoButton: HTMLButtonElement;
  message: HTMLParagraphElement;
  list: HTMLDivElement;
}

export function renderGalleryView(
  container: HTMLElement,
): GalleryViewElements {
  container.innerHTML = `
    <section class="gallery">
      <div class="gallery-header">
        <h2>Photos</h2>

        <button id="create-test-photo-button" type="button">
          Create test photo
        </button>
      </div>

      <p id="gallery-message"></p>

      <div id="photo-list"></div>
    </section>
  `;

  const createTestPhotoButton =
    container.querySelector<HTMLButtonElement>(
      '#create-test-photo-button',
    );

  const message =
    container.querySelector<HTMLParagraphElement>(
      '#gallery-message',
    );

  const list =
    container.querySelector<HTMLDivElement>('#photo-list');

  if (!createTestPhotoButton || !message || !list) {
    throw new Error('Gallery view initialization failed');
  }

  return {
    container,
    createTestPhotoButton,
    message,
    list,
  };
}

export function renderPhotos(
  list: HTMLElement,
  photos: Photo[],
): void {
  if (photos.length === 0) {
    list.innerHTML = '<p>No photos yet.</p>';
    return;
  }

  list.innerHTML = photos
    .map(
      (photo) => `
        <article class="photo-card">
          <strong>${photo.title}</strong>

          <div>
            ${photo.id}
          </div>
        </article>
      `,
    )
    .join('');
}