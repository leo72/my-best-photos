import {
  ArrowRightIcon,
  ArrowUpTrayIcon,
  HeartIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

const STEPS = [
  {
    title: '1. Upload',
    description: 'Add your photos in seconds.',
    Icon: ArrowUpTrayIcon,
  },
  {
    title: '2. Keep your best ones',
    description: 'Store up to 10 photos.',
    Icon: HeartIcon,
  },
  {
    title: '3. Share a page or a single photo',
    description: 'Get a link to share, anytime.',
    Icon: LinkIcon,
  },
] as const;

export function MyPhotosEmptySteps() {
  return (
    <ol className="m-0 flex list-none flex-col items-stretch gap-4 p-0 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
      {STEPS.map(({ title, description, Icon }, index) => (
        <li
          key={title}
          className="flex items-center gap-3 sm:contents"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:max-w-56 sm:flex-col sm:items-center sm:text-center">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="m-0 text-sm font-semibold text-slate-950">
                {title}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            </div>
          </div>

          {index < STEPS.length - 1 ? (
            <ArrowRightIcon
              className="hidden size-4 shrink-0 text-slate-300 sm:block"
              aria-hidden="true"
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
