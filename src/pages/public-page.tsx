import { Link, Navigate, useParams } from 'react-router-dom';
import { LinkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

import {
  CinematicPublicLayout,
  CleanPublicLayout,
  GalleryPublicLayout,
} from '../components/collection/public-collection-layouts';
import { Container } from '../components/layout/container';
import { SiteLayout } from '../components/layout/site-layout';
import { TextLink } from '../components/ui/text-link';
import { useAuth } from '../features/auth/auth-provider';
import {
  getCollectionLook,
} from '../features/collection/collection';
import { useCollection } from '../features/collection/use-collection';
import {
  getPublicPageUrl,
} from '../features/photos/public-page-path';
import {
  usePublicPagePhotos,
} from '../features/photos/use-public-page-photos';

function PublicPageContent({ ownerId }: { ownerId: string }) {
  const { user } = useAuth();
  const collection = useCollection(ownerId);
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

  if (
    collection.status === 'loading'
    || pagePhotos.status === 'loading'
  ) {
    return (
      <p className="text-sm text-slate-500" role="status">
        Loading photos…
      </p>
    );
  }

  if (collection.status === 'error') {
    return (
      <p className="text-sm text-red-600" role="alert">
        {collection.message}
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

  const { profile } = collection;
  const photos = pagePhotos.photos;
  const look = getCollectionLook(profile.collectionType);

  if (photos.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">
          {profile.title}
        </h1>
        <p className="mt-3 text-base font-semibold text-slate-950">
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
    );
  }

  const layout = (() => {
    switch (look) {
      case 'cinematic':
        return (
          <CinematicPublicLayout
            profile={profile}
            photos={photos}
          />
        );
      case 'gallery':
        return (
          <GalleryPublicLayout
            profile={profile}
            photos={photos}
          />
        );
      case 'clean':
        return (
          <CleanPublicLayout
            profile={profile}
            photos={photos}
          />
        );
    }
  })();

  return (
    <div className="grid gap-6">
      {look === 'cinematic' ? (
        <div className="-mx-4 overflow-hidden rounded-none sm:-mx-6 sm:rounded-3xl lg:-mx-8">
          {layout}
        </div>
      ) : (
        layout
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-50"
          onClick={() => {
            void copyPageLink();
          }}
        >
          <LinkIcon className="size-5" aria-hidden="true" />
          Share
        </button>
        {copyMessage ? (
          <p className="text-sm text-slate-500" role="status">
            {copyMessage}
          </p>
        ) : null}
      </div>

      {isOwner ? (
        <p className="text-center text-sm text-slate-500">
          Manage purpose, title, and photos from{' '}
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
        <Container as="main" className="pt-0 pb-10 sm:py-12">
          <PublicPageContent ownerId={ownerId} />
        </Container>
      </div>
    </SiteLayout>
  );
}
