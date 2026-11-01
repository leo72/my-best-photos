import type { FailedPhoto } from './photo';

const DISMISSED_KEYS_STORAGE_PREFIX =
  'my-best-photos:dismissed-failed-photos:';

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Identifies one failure, not the slot: uploads reuse failed slots, so a
 * later failure in the same slot has a new `updatedAt` and shows again.
 */
export function getFailedPhotoKey(photo: FailedPhoto): string {
  return `${photo.id}@${photo.updatedAt?.getTime() ?? 0}`;
}

export function getVisibleFailedPhotos(
  photos: readonly FailedPhoto[],
  dismissedKeys: ReadonlySet<string>,
): FailedPhoto[] {
  return photos.filter(
    (photo) => !dismissedKeys.has(getFailedPhotoKey(photo)),
  );
}

export function formatFailedPhotosMessage(
  photos: readonly FailedPhoto[],
): string {
  const count = photos.length;
  const fileNames = photos.flatMap((photo) =>
    photo.originalFileName ? [photo.originalFileName] : [],
  );
  const subject = count === 1 ? '1 photo' : `${count} photos`;
  const names = fileNames.length > 0
    ? ` (${fileNames.join(', ')})`
    : '';

  return `${subject}${names} couldn't be processed. `
    + `Try uploading ${count === 1 ? 'it' : 'them'} again.`;
}

export function readDismissedFailedPhotoKeys(
  storage: KeyValueStorage | null,
  ownerId: string,
): Set<string> {
  try {
    const stored: unknown = JSON.parse(
      storage?.getItem(DISMISSED_KEYS_STORAGE_PREFIX + ownerId)
        ?? '[]',
    );

    return new Set(
      Array.isArray(stored)
        ? stored.filter(
          (key): key is string => typeof key === 'string',
        )
        : [],
    );
  } catch {
    return new Set();
  }
}

export function writeDismissedFailedPhotoKeys(
  storage: KeyValueStorage | null,
  ownerId: string,
  keys: ReadonlySet<string>,
): void {
  try {
    storage?.setItem(
      DISMISSED_KEYS_STORAGE_PREFIX + ownerId,
      JSON.stringify([...keys]),
    );
  } catch {
    // The dismissal still holds until the page reloads.
  }
}
