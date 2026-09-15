import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from '../ui/button';
import { HomeHeroPhotoGrid } from './hero-photo-grid';

export function HomeHero() {
  return (
    <section className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
      <div className="home-hero-copy max-w-xl lg:pt-2">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Your photos. Yours.
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.1]">
          Keep your 10 photos.
          <br />
          Always ready.
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg">
          Save up to 10 important photos for profiles, CVs,
          family, sharing — or just for yourself.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/create"
            className={`${primaryButtonClassName} px-5 py-3`}
          >
            Start your 10 photos
            <ArrowRightIcon className="size-4" />
          </Link>

          <Link
            to="/examples"
            className={`${secondaryButtonClassName} px-5 py-3`}
          >
            See example
          </Link>
        </div>

        <p className="mt-3 text-sm text-slate-400">
          No apps. No complicated setup. Just your photos.
        </p>
      </div>

      <HomeHeroPhotoGrid />
    </section>
  );
}
