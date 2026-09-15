import { EmptyPhotosIllustration } from './empty-photos-illustration';

export function MyPhotosProcessingState() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
      <EmptyPhotosIllustration />

      <h2 className="mt-6 text-xl font-semibold text-slate-950 sm:text-2xl">
        Processing your photo
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
        Your upload is in. We&apos;ll show it here as soon as
        processing finishes.
      </p>

      <p
        className="mt-6 text-sm font-medium text-blue-600"
        role="status"
      >
        Processing…
      </p>
    </section>
  );
}
