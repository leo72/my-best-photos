import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../ui/button';
import {
  exampleSetUrl,
  type ExamplePhotoSet,
} from './example-data';

function ExamplePreviewGrid({
  photos,
}: {
  photos: readonly string[];
}) {
  const [hero, ...thumbs] = photos;

  if (!hero) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      <img
        src={hero}
        alt=""
        className="col-span-1 row-span-2 h-full min-h-36 w-full rounded-lg object-cover"
      />
      <div className="col-span-2 grid grid-cols-2 gap-1.5">
        {thumbs.slice(0, 4).map((photo) => (
          <img
            key={photo}
            src={photo}
            alt=""
            className="aspect-square w-full rounded-lg object-cover"
          />
        ))}
      </div>
    </div>
  );
}

interface ExampleCardProps {
  example: ExamplePhotoSet;
}

export function ExampleCard({ example }: ExampleCardProps) {
  const url = exampleSetUrl(example.handle);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">
        {example.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {example.description}
      </p>

      <div className="mt-4">
        <ExamplePreviewGrid photos={example.photos} />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm text-slate-600">
        <span className="min-w-0 flex-1 truncate">{url}</span>
        <ArrowTopRightOnSquareIcon
          className="size-4 shrink-0 text-slate-400"
          aria-hidden="true"
        />
      </div>

      <Button type="button" className="mt-4 w-full">
        View set
        <ArrowRightIcon className="size-4" />
      </Button>
    </article>
  );
}
