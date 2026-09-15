import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

import { usePhotoUpload } from '../../features/photos/use-photo-upload';
import { TextLink } from '../ui/text-link';
import { EmptyPhotosIllustration } from './empty-photos-illustration';

export function MyPhotosEmptyState() {
  const {
    fileInputRef,
    errorMessage,
    isUploading,
    openFilePicker,
    uploadFile,
  } = usePhotoUpload();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
      <EmptyPhotosIllustration />

      <h2 className="mt-6 text-xl font-semibold text-slate-950 sm:text-2xl">
        You don&apos;t have any photos yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
        Upload your first photo to get started. You can keep up
        to 10 photos.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={isUploading}
        onChange={(event) => {
          void uploadFile(event.target.files?.item(0) ?? null);
        }}
      />

      <button
        type="button"
        disabled={isUploading}
        className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-default disabled:bg-blue-300"
        onClick={openFilePicker}
      >
        <ArrowUpTrayIcon className="size-5" aria-hidden="true" />
        {isUploading ? 'Uploading…' : 'Upload your first photo'}
      </button>

      <div className="mt-4">
        <TextLink to="/examples">Learn how it works</TextLink>
      </div>

      {errorMessage ? (
        <p
          className="mt-4 text-sm text-red-600"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
