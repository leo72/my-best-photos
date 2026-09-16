import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

import {
  getCollectionSubtitle,
} from '../../features/collection/collection';

import type { CollectionProfile } from '../../features/collection/collection';
import type { GalleryPhoto } from '../../features/photos/photo';

interface PublicCollectionLayoutProps {
  profile: CollectionProfile;
  photos: readonly GalleryPhoto[];
}

export function CinematicPublicLayout({
  profile,
  photos,
}: PublicCollectionLayoutProps) {
  const [index, setIndex] = useState(0);
  const photo = photos[index] ?? null;
  const subtitle = getCollectionSubtitle(profile.collectionType);

  if (!photo) {
    return null;
  }

  function goTo(nextIndex: number): void {
    if (photos.length === 0) {
      return;
    }

    const normalized =
      (nextIndex + photos.length) % photos.length;
    setIndex(normalized);
  }

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-slate-950 text-white sm:min-h-[78vh]">
      <img
        src={photo.optimizedUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(5, 10, 20, 0.55) 0%,
              rgba(5, 10, 20, 0.28) 32%,
              rgba(5, 10, 20, 0.05) 60%,
              transparent 80%
            ),
            linear-gradient(
              0deg,
              rgba(5, 10, 20, 0.35) 0%,
              transparent 25%
            )
          `,
        }}
      />

      <div className="relative flex min-h-[70vh] flex-col justify-between px-4 py-8 sm:min-h-[78vh] sm:px-8 lg:px-12">
        <div className="max-w-xl pt-6 sm:pt-10">
          <p className="text-sm font-medium text-white/70">
            {String(index + 1).padStart(2, '0')} /{' '}
            {String(photos.length).padStart(2, '0')}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {profile.title}
          </h1>
          <p className="mt-3 text-base text-white/80 sm:text-lg">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            aria-label="Previous photo"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            onClick={() => {
              goTo(index - 1);
            }}
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            onClick={() => {
              goTo(index + 1);
            }}
          >
            <ChevronRightIcon className="size-6" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((entry, photoIndex) => (
            <button
              key={entry.id}
              type="button"
              aria-label={`Show photo ${photoIndex + 1}`}
              aria-current={photoIndex === index}
              className={[
                'h-16 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-opacity',
                photoIndex === index
                  ? 'border-white opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90',
              ].join(' ')}
              onClick={() => {
                setIndex(photoIndex);
              }}
            >
              <img
                src={entry.optimizedUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GalleryPublicLayout({
  profile,
  photos,
}: PublicCollectionLayoutProps) {
  const subtitle = getCollectionSubtitle(profile.collectionType);

  return (
    <div className="grid gap-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {profile.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          {subtitle}
        </p>
      </header>

      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => (
          <a
            key={photo.id}
            href={photo.optimizedUrl}
            target="_blank"
            rel="noreferrer"
            className={[
              'mb-3 block break-inside-avoid overflow-hidden rounded-2xl',
              index % 5 === 0
                ? 'aspect-[3/4]'
                : index % 3 === 0
                  ? 'aspect-square'
                  : 'aspect-[4/3]',
            ].join(' ')}
          >
            <img
              src={photo.optimizedUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

export function CleanPublicLayout({
  profile,
  photos,
}: PublicCollectionLayoutProps) {
  const subtitle = getCollectionSubtitle(profile.collectionType);

  return (
    <div className="grid gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {profile.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          {subtitle}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {photos.map((photo) => (
          <a
            key={photo.id}
            href={photo.optimizedUrl}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-2xl bg-slate-100"
          >
            <img
              src={photo.optimizedUrl}
              alt=""
              className="aspect-square h-auto w-full object-cover"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
