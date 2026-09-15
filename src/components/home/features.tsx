import {
  DevicePhoneMobileIcon,
  PhotoIcon,
  ShareIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import type { ComponentType, SVGProps } from 'react';

interface HomeFeature {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const FEATURES: readonly HomeFeature[] = [
  {
    title: 'Up to 10 photos',
    description: 'Keep only what matters',
    Icon: PhotoIcon,
  },
  {
    title: 'Always available',
    description: 'Access from any device',
    Icon: DevicePhoneMobileIcon,
  },
  {
    title: 'Full quality',
    description: 'Keep the original when you need it',
    Icon: ShieldCheckIcon,
  },
  {
    title: 'Share when you want',
    description: 'Your photos stay yours',
    Icon: ShareIcon,
  },
];

export function HomeFeatures() {
  return (
    <section className="home-features border-t border-slate-100 pt-10 sm:pt-12">
      <ul className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-8 p-0 lg:grid-cols-4 lg:gap-8">
        {FEATURES.map(({ title, description, Icon }) => (
          <li
            key={title}
            className="flex flex-col items-center text-center"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-base font-semibold text-slate-950">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
