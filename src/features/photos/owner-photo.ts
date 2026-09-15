import type { OwnerPhoto } from './photo';

export function isActiveOwnerPhoto(
  photo: OwnerPhoto,
  nowMs: number,
): boolean {
  if (photo.status === 'failed') {
    return false;
  }

  if (
    photo.status === 'reserved'
    && photo.reservationExpiresAt !== null
    && photo.reservationExpiresAt.getTime() <= nowMs
  ) {
    return false;
  }

  return true;
}
