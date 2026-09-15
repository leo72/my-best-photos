const HERO_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    alt: 'Portrait photo',
    className: 'col-span-3 aspect-[5/4]',
  },
  {
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    alt: 'Mountain landscape',
    className: 'col-span-3 aspect-[5/4]',
  },
  {
    src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80',
    alt: 'Child portrait',
    className: 'col-span-2 aspect-[4/3]',
  },
  {
    src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    alt: 'Cat',
    className: 'col-span-2 aspect-[4/3]',
  },
  {
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    alt: 'Sailboat at sunset',
    className: 'col-span-2 aspect-[4/3]',
  },
] as const;

export function HomeHeroPhotoGrid() {
  return (
    <div
      aria-hidden="true"
      className="home-hero-grid grid grid-cols-6 gap-2.5 sm:gap-3"
    >
      {HERO_PHOTOS.map((photo) => (
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className={`${photo.className} w-full rounded-xl object-cover`}
        />
      ))}
    </div>
  );
}
