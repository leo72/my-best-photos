import { InformationCircleIcon } from '@heroicons/react/24/outline';

export function MyPhotosInfoBanner() {
  return (
    <aside className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 sm:px-5">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
        <InformationCircleIcon
          className="size-5"
          aria-hidden="true"
        />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">
          Each photo has its own direct link.
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Your public page shows all your photos in one place.
        </p>
      </div>
    </aside>
  );
}
