import type { ReactNode } from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

import {
  EXAMPLE_SETS,
  examplePhotoUrl,
  exampleSetUrl,
} from './example-data';

function UrlChip({ url }: { url: string }) {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
      <span className="min-w-0 flex-1 truncate">{url}</span>
      <DocumentDuplicateIcon
        className="size-4 shrink-0 text-slate-400"
        aria-hidden="true"
      />
    </div>
  );
}

function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="size-1.5 rounded-full bg-slate-300" />
        <span className="size-1.5 rounded-full bg-slate-300" />
        <span className="size-1.5 rounded-full bg-slate-300" />
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

export function ExamplesSharingModes() {
  const sample = EXAMPLE_SETS[0];
  const handle = sample?.handle ?? 'anna';
  const previewPhotos = sample?.photos ?? [];

  return (
    <section className="rounded-3xl bg-slate-100 px-6 py-8 sm:px-8 sm:py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-12">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Share one photo or all 10
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
            Every My10Photos user gets a page for all 10 photos,
            plus a dedicated link for each individual photo.
            Share what you need, when you need it.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Full set page
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Share your complete set of 10 photos.
            </p>
            <UrlChip url={exampleSetUrl(handle)} />
            <div className="mt-4">
              <BrowserFrame>
                <div className="grid grid-cols-3 gap-1">
                  {previewPhotos.slice(0, 6).map((photo) => (
                    <img
                      key={photo}
                      src={photo}
                      alt=""
                      className="aspect-square w-full rounded object-cover"
                    />
                  ))}
                </div>
              </BrowserFrame>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Single photo page
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Share any individual photo directly.
            </p>
            <UrlChip url={examplePhotoUrl(handle, 3)} />
            <div className="mt-4">
              <BrowserFrame>
                <img
                  src={previewPhotos[2] ?? previewPhotos[0]}
                  alt=""
                  className="aspect-[4/3] w-full rounded object-cover"
                />
              </BrowserFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
