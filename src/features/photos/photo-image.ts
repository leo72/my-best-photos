import {
  THUMBNAIL_MAX_SIZE,
  type GalleryPhoto,
} from './photo';

/**
 * Unversioned photos may predate the move to 960px thumbnails, so assume
 * the old 480px bound. Understating is safe: the browser only gets more
 * pixels than it asked for.
 */
const LEGACY_THUMBNAIL_MAX_SIZE = 480;

/**
 * `srcSet` listing the thumbnail and full-size derivatives at their real
 * widths, so small slots download the thumbnail.
 */
export function getPhotoSrcSet(photo: GalleryPhoto): string {
  const thumbnailMaxSize = photo.sourceGeneration
    ? THUMBNAIL_MAX_SIZE
    : LEGACY_THUMBNAIL_MAX_SIZE;
  const longestEdge = Math.max(photo.width, photo.height);

  if (longestEdge <= thumbnailMaxSize) {
    return `${photo.thumbnailUrl} ${photo.width}w`;
  }

  const thumbnailWidth = Math.round(
    (photo.width * thumbnailMaxSize) / longestEdge,
  );

  return `${photo.thumbnailUrl} ${thumbnailWidth}w, `
    + `${photo.optimizedUrl} ${photo.width}w`;
}
