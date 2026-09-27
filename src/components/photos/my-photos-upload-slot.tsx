import { PlusIcon } from '@heroicons/react/24/outline';

import { MAX_PHOTO_SLOTS } from '../../features/photos/photo';
import { usePhotoUpload } from '../../features/photos/use-photo-upload';

interface MyPhotosUploadSlotProps {
  remainingSlots: number;
}

export function MyPhotosUploadSlot({
  remainingSlots,
}: MyPhotosUploadSlotProps) {
  const {
    fileInputRef,
    errorMessage,
    isUploading,
    openFilePicker,
    uploadFiles,
  } = usePhotoUpload({ remainingSlots });

  return (
    <div className="flex min-h-full flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        disabled={isUploading}
        onChange={(event) => {
          void uploadFiles(event.target.files);
        }}
      />

      <button
        type="button"
        disabled={isUploading}
        className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/40 disabled:cursor-default disabled:opacity-60"
        onClick={openFilePicker}
      >
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
          <PlusIcon className="size-7" aria-hidden="true" />
        </span>
        <span className="mt-4 text-base font-semibold text-slate-950">
          {isUploading ? 'Uploading…' : 'Upload photos'}
        </span>
        <span className="mt-1 max-w-52 text-sm text-slate-500">
          Add another photo (up to {MAX_PHOTO_SLOTS} total)
        </span>
      </button>

      {errorMessage ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
