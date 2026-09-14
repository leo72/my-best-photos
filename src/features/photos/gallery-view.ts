import type { GalleryPhoto } from './photo';

export interface GalleryViewElements {
  uploadForm: HTMLFormElement;
  photoInput: HTMLInputElement;
  uploadButton: HTMLButtonElement;
  uploadHint: HTMLParagraphElement;
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
      </div>

      <form id="photo-upload-form" class="photo-upload-form">
        <label>
          Choose a photo
          <input
            id="photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            disabled
          />
        </label>

        <button
          id="photo-upload-button"
          type="submit"
          disabled
        >
          Upload
        </button>
      </form>

      <p id="photo-upload-hint" class="upload-hint">
        Sign in to upload a photo.
      </p>
      <p id="gallery-message" role="status"></p>
      <div id="photo-list" aria-live="polite"></div>
    </section>
  `;

  const uploadForm =
    container.querySelector<HTMLFormElement>(
      '#photo-upload-form',
    );
  const photoInput =
    container.querySelector<HTMLInputElement>(
      '#photo-input',
    );
  const uploadButton =
    container.querySelector<HTMLButtonElement>(
      '#photo-upload-button',
    );
  const uploadHint =
    container.querySelector<HTMLParagraphElement>(
      '#photo-upload-hint',
    );
  const message =
    container.querySelector<HTMLParagraphElement>(
      '#gallery-message',
    );
  const list =
    container.querySelector<HTMLDivElement>('#photo-list');

  if (
    !uploadForm
    || !photoInput
    || !uploadButton
    || !uploadHint
    || !message
    || !list
  ) {
    throw new Error('Gallery view initialization failed');
  }

  return {
    uploadForm,
    photoInput,
    uploadButton,
    uploadHint,
    message,
    list,
  };
}

export function renderGalleryLoading(list: HTMLElement): void {
  const loading = document.createElement('p');
  loading.textContent = 'Loading photos…';
  list.replaceChildren(loading);
}

export function renderGalleryError(list: HTMLElement): void {
  const errorMessage = document.createElement('p');
  errorMessage.textContent =
    'Photos are temporarily unavailable.';
  list.replaceChildren(errorMessage);
}

export function renderPhotos(
  list: HTMLElement,
  photos: GalleryPhoto[],
): void {
  if (photos.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No photos yet.';
    list.replaceChildren(emptyMessage);
    return;
  }

  const cards = photos.map((photo) => {
    const card = document.createElement('article');
    card.className = 'photo-card';

    const link = document.createElement('a');
    link.href = photo.optimizedUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.setAttribute('aria-label', 'Open full-size photo');

    const image = document.createElement('img');
    image.src = photo.thumbnailUrl;
    image.alt = 'Gallery photo';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = photo.width;
    image.height = photo.height;

    link.append(image);
    card.append(link);

    const dimensions = document.createElement('p');
    dimensions.className = 'photo-dimensions';
    dimensions.textContent =
      `${photo.width} × ${photo.height}`;
    card.append(dimensions);

    return card;
  });

  list.replaceChildren(...cards);
}
