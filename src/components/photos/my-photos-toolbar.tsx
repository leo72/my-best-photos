import { Link } from 'react-router-dom';
import {
  ArrowUpTrayIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../../features/auth/auth-provider';
import { MAX_PHOTO_SLOTS } from '../../features/photos/photo';
import {
  getPublicPagePath,
} from '../../features/photos/public-page-path';
import { usePhotoUpload } from '../../features/photos/use-photo-upload';

interface MyPhotosToolbarProps {
  usedCount: number;
  canUpload: boolean;
}

export function MyPhotosToolbar({
  usedCount,
  canUpload,
}: MyPhotosToolbarProps) {
  const { user } = useAuth();
  const {
    fileInputRef,
    errorMessage,
    isUploading,
    openFilePicker,
    uploadFile,
  } = usePhotoUpload();
  const progressPercent = Math.min(
    100,
    Math.round((usedCount / MAX_PHOTO_SLOTS) * 100),
  );
  const publicPagePath = user
    ? getPublicPagePath(user.id)
    : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 lg:max-w-sm">
          <p className="text-sm font-medium text-slate-950">
            {usedCount} of {MAX_PHOTO_SLOTS} photos used
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={MAX_PHOTO_SLOTS}
            aria-valuenow={usedCount}
            aria-label="Photo slots used"
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={!canUpload || isUploading}
            onChange={(event) => {
              void uploadFile(
                event.target.files?.item(0) ?? null,
              );
            }}
          />

          <button
            type="button"
            disabled={!canUpload || isUploading}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-default disabled:bg-blue-300"
            onClick={openFilePicker}
          >
            <ArrowUpTrayIcon
              className="size-5"
              aria-hidden="true"
            />
            {isUploading ? 'Uploading…' : 'Upload photo'}
          </button>

          {publicPagePath ? (
            <Link
              to={publicPagePath}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 no-underline transition-colors hover:bg-slate-50"
            >
              <LinkIcon className="size-5" aria-hidden="true" />
              View public page
            </Link>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
