import {
  ArrowTopRightOnSquareIcon,
  EllipsisHorizontalIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { useId, useState } from 'react';

import { useAppServices } from '../../app/providers';
import { getPhotoErrorMessage } from '../../features/photos/photo-errors';
import {
  formatUploadedAt,
  photoDisplayTitle,
} from '../../features/photos/photo-labels';
import {
  logClientError,
} from '../../infrastructure/firebase/client-errors';

import type { GalleryPhoto } from '../../features/photos/photo';

interface MyPhotoCardProps {
  photo: GalleryPhoto;
}

export function MyPhotoCard({ photo }: MyPhotoCardProps) {
  const { photoService } = useAppServices();
  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);
  const title = photoDisplayTitle(photo);
  const uploadedLabel = formatUploadedAt(
    photo.createdAt ?? photo.updatedAt,
  );

  function showStatus(message: string): void {
    setStatusMessage(message);
    window.setTimeout(() => {
      setStatusMessage('');
    }, 2_000);
  }

  async function copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(photo.optimizedUrl);
      showStatus('Link copied');
    } catch {
      showStatus('Could not copy link');
    }
  }

  async function removePhoto(): Promise<void> {
    const shouldRemove = window.confirm(
      `Remove “${title}”? This cannot be undone.`,
    );

    if (!shouldRemove || isRemoving) {
      return;
    }

    setIsRemoving(true);
    setStatusMessage('Removing photo…');

    try {
      await photoService.deletePhoto(photo.slot);
    } catch (error) {
      logClientError('Photo delete failed', error);
      setStatusMessage(
        getPhotoErrorMessage(error, 'Failed to remove photo'),
      );
      setIsRemoving(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative bg-slate-100">
        <img
          src={photo.thumbnailUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          width={photo.width}
          height={photo.height}
          className="aspect-[4/3] h-auto w-full object-cover"
        />

        <div className="absolute top-3 right-3">
          <button
            type="button"
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white disabled:cursor-default disabled:opacity-60"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-label={`Options for ${title}`}
            disabled={isRemoving}
            onClick={() => {
              setIsMenuOpen((open) => !open);
            }}
          >
            <EllipsisHorizontalIcon
              className="size-5"
              aria-hidden="true"
            />
          </button>

          {isMenuOpen ? (
            <div
              id={menuId}
              role="menu"
              className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              <a
                role="menuitem"
                href={photo.optimizedUrl}
                target="_blank"
                rel="noreferrer"
                className="block px-3 py-2 text-sm text-slate-700 no-underline hover:bg-slate-50"
                onClick={() => {
                  setIsMenuOpen(false);
                }}
              >
                Open photo
              </a>
              <button
                type="button"
                role="menuitem"
                className="block w-full cursor-pointer border-0 bg-transparent px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setIsMenuOpen(false);
                  void copyLink();
                }}
              >
                Copy link
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full cursor-pointer border-0 bg-transparent px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                disabled={isRemoving}
                onClick={() => {
                  setIsMenuOpen(false);
                  void removePhoto();
                }}
              >
                Remove photo
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 pt-3 pb-4">
        <h3 className="truncate text-base font-semibold text-slate-950">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {uploadedLabel}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={photo.optimizedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-950 no-underline transition-colors hover:bg-slate-50"
          >
            <ArrowTopRightOnSquareIcon
              className="size-4 shrink-0"
              aria-hidden="true"
            />
            Open photo
          </a>

          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-50"
            onClick={() => {
              void copyLink();
            }}
          >
            <LinkIcon
              className="size-4 shrink-0"
              aria-hidden="true"
            />
            Copy link
          </button>
        </div>

        {statusMessage ? (
          <p className="mt-2 text-xs text-slate-500" role="status">
            {statusMessage}
          </p>
        ) : null}
      </div>
    </article>
  );
}
