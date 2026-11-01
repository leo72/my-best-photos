import { useState } from 'react';

import {
  formatFailedPhotosMessage,
  getFailedPhotoKey,
  getVisibleFailedPhotos,
  readDismissedFailedPhotoKeys,
  writeDismissedFailedPhotoKeys,
} from './failed-photo-notice';

import type { FailedPhoto } from './photo';

interface FailedPhotoNotice {
  message: string | null;
  dismiss: () => void;
}

function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Hides failures per browser instead of deleting their records, so slot
 * reuse never races a dismissal. Remount (e.g. `key`) when the owner changes.
 */
export function useFailedPhotoNotice(
  ownerId: string,
  failedPhotos: readonly FailedPhoto[],
): FailedPhotoNotice {
  const [dismissedKeys, setDismissedKeys] = useState(() =>
    readDismissedFailedPhotoKeys(getBrowserStorage(), ownerId),
  );
  const visiblePhotos = getVisibleFailedPhotos(
    failedPhotos,
    dismissedKeys,
  );

  return {
    message: visiblePhotos.length > 0
      ? formatFailedPhotosMessage(visiblePhotos)
      : null,
    dismiss: () => {
      // Only current failures are kept, so the list never outgrows the slots.
      const nextKeys = new Set(failedPhotos.map(getFailedPhotoKey));

      setDismissedKeys(nextKeys);
      writeDismissedFailedPhotoKeys(
        getBrowserStorage(),
        ownerId,
        nextKeys,
      );
    },
  };
}
