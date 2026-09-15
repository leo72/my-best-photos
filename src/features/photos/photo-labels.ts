import type { GalleryPhoto } from './photo';

export function photoDisplayTitle(photo: GalleryPhoto): string {
  const fileName = photo.originalFileName;

  if (!fileName) {
    return `Photo ${photo.slot}`;
  }

  const baseName = fileName
    .replace(/\.[^.]+$/u, '')
    .replace(/[_-]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();

  if (!baseName) {
    return `Photo ${photo.slot}`;
  }

  return baseName.replace(
    /\b([a-z])/gu,
    (letter) => letter.toUpperCase(),
  );
}

export function formatUploadedAt(date: Date | null): string {
  if (!date) {
    return 'Uploaded recently';
  }

  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);

  return `Uploaded ${formatted}`;
}
