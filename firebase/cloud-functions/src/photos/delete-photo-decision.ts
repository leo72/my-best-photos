export function canDeleteOwnerPhotoStatus(
  status: unknown,
): boolean {
  return status === 'ready' || status === 'failed';
}
