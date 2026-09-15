import { PhotoGrid } from './photo-grid';
import { PhotoUploadForm } from './photo-upload-form';
import { useGallery } from './use-gallery';

export function GallerySection() {
  const gallery = useGallery();

  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-xl font-semibold text-gray-900">
          Photos
        </h2>
      </div>

      <div className="grid gap-3">
        <PhotoUploadForm />

        {gallery.status === 'loading' ? (
          <p className="mb-0 text-gray-900">Loading photos…</p>
        ) : null}

        {gallery.status === 'error' ? (
          <>
            <p className="mb-0 text-gray-900">
              Photos are temporarily unavailable.
            </p>
            <p className="mb-0 min-h-6 text-gray-900" role="status">
              {gallery.message}
            </p>
          </>
        ) : null}

        {gallery.status === 'ready' ? (
          <PhotoGrid photos={gallery.photos} />
        ) : null}
      </div>
    </section>
  );
}
