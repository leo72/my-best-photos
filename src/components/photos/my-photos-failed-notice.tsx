import { XMarkIcon } from '@heroicons/react/24/outline';

import { useFailedPhotoNotice } from '../../features/photos/use-failed-photo-notice';

import type { FailedPhoto } from '../../features/photos/photo';

interface MyPhotosFailedNoticeProps {
  ownerId: string;
  photos: readonly FailedPhoto[];
}

export function MyPhotosFailedNotice({
  ownerId,
  photos,
}: MyPhotosFailedNoticeProps) {
  const { message, dismiss } = useFailedPhotoNotice(
    ownerId,
    photos,
  );

  if (!message) {
    return null;
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 sm:px-5">
      <p
        className="min-w-0 py-1 text-sm break-words text-red-600"
        role="alert"
      >
        {message}
      </p>
      <button
        type="button"
        className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-100"
        aria-label="Dismiss"
        onClick={dismiss}
      >
        <XMarkIcon className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
