import { Link, Navigate, useParams } from 'react-router-dom';
import { LinkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

import { useAuth } from '../features/auth/auth-provider';
import { MAX_PHOTO_SLOTS } from '../features/photos/photo';
import {
  getPublicPageUrl,
} from '../features/photos/public-page-path';
import {
  usePublicPagePhotos,
} from '../features/photos/use-public-page-photos';
import { Container } from '../components/layout/container';
import { SiteLayout } from '../components/layout/site-layout';
import { PublicPhotoCard } from '../components/photos/public-photo-card';
import { TextLink } from '../components/ui/text-link';

function PublicPageContent({ ownerId }: { ownerId: string }) {
  const { user } = useAuth();
  const pagePhotos = usePublicPagePhotos(ownerId);
  const [copyMessage, setCopyMessage] = useState('');
  const isOwner = user?.id === ownerId;

  async function copyPageLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(
        getPublicPageUrl(ownerId),
      );
      setCopyMessage('Page link copied');
    } catch {
      setCopyMessage('Could not copy link');
    }

    window.setTimeout(() => {
      setCopyMessage('');
    }, 2_000);
  }

  if (pagePhotos.status === 'loading') {
    return (
      <p className="text-sm text-slate-500" role="status">
        Loading photos…
      </p>
    );
  }

  if (pagePhotos.status === 'error') {
    return (
      <p className="text-sm text-red-600" role="alert">
        {pagePhotos.message}
      </p>
    );
  }

  const photos = pagePhotos.photos;

  return (
    <div className="grid gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Photos
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Shared on My10Photos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isOwner ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
              {photos.length} of {MAX_PHOTO_SLOTS} photos
            </span>
          ) : null}
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-50"
            onClick={() => {
              void copyPageLink();
            }}
          >
            <LinkIcon className="size-5" aria-hidden="true" />
            Copy page link
          </button>
        </div>
      </header>

      {copyMessage ? (
        <p className="text-sm text-slate-500" role="status">
          {copyMessage}
        </p>
      ) : null}

      {photos.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-950">
            No photos on this page yet
          </p>
          {isOwner ? (
            <>
              <p className="mt-2 text-sm text-slate-500">
                Upload photos in My Photos and they will show up
                here for anyone with the link.
              </p>
              <div className="mt-4">
                <TextLink to="/photos">Go to My Photos</TextLink>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Check back later.
            </p>
          )}
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo) => (
            <PublicPhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}

      {isOwner ? (
        <p className="text-center text-sm text-slate-500">
          Manage uploads from{' '}
          <Link
            to="/photos"
            className="font-medium text-blue-600 no-underline hover:text-blue-700"
          >
            My Photos
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}

export function PublicPage() {
  const { ownerId } = useParams();

  if (!ownerId) {
    return <Navigate to="/" replace />;
  }

  return (
    <SiteLayout>
      <div className="flex flex-1 flex-col bg-slate-50">
        <Container as="main" className="py-10 sm:py-12">
          <PublicPageContent ownerId={ownerId} />
        </Container>
      </div>
    </SiteLayout>
  );
}
