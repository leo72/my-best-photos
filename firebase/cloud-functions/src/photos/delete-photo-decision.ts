export function canDeleteOwnerPhotoStatus(
  status: unknown,
): boolean {
  return status === 'ready' || status === 'failed';
}

/**
 * Whether the owner's saved photo order lists this slot. A deleted
 * slot is dropped so the next upload there doesn't inherit its place.
 */
export function isSlotInPhotoOrder(
  profile: unknown,
  slot: number,
): boolean {
  return typeof profile === 'object'
    && profile !== null
    && 'photoOrder' in profile
    && Array.isArray(profile.photoOrder)
    && profile.photoOrder.includes(slot);
}
