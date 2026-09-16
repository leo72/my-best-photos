import { photoDisplayTitle } from '../../features/photos/photo-labels';

import type { GalleryPhoto } from '../../features/photos/photo';

interface PublicPhotoCardProps {
  photo: GalleryPhoto;
}

export function PublicPhotoCard({ photo }: PublicPhotoCardProps) {
  const title = photoDisplayTitle(photo);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <a
        href={photo.optimizedUrl}
        target="_blank"
        rel="noreferrer"
        className="block bg-slate-100 no-underline"
        aria-label={`Open ${title}`}
      >
        <img
          src={photo.optimizedUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          width={photo.width}
          height={photo.height}
          className="aspect-[4/3] h-auto w-full object-cover"
        />
      </a>
    </article>
  );
}
