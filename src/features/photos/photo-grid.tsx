import type { GalleryPhoto } from './photo';

interface PhotoGridProps {
  photos: GalleryPhoto[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) {
    return <p className="mb-0 text-gray-900">No photos yet.</p>;
  }

  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4"
      aria-live="polite"
    >
      {photos.map((photo) => (
        <article
          key={photo.id}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <a
            href={photo.optimizedUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open full-size photo"
            className="block bg-slate-200"
          >
            <img
              src={photo.thumbnailUrl}
              alt="Gallery photo"
              loading="lazy"
              decoding="async"
              width={photo.width}
              height={photo.height}
              className="block aspect-[4/3] h-auto w-full object-cover"
            />
          </a>
          <p className="m-0 px-3 py-2.5 text-sm text-gray-500">
            {photo.width} × {photo.height}
          </p>
        </article>
      ))}
    </div>
  );
}
