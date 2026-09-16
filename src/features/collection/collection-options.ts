import {
  PhotoIcon,
  Squares2X2Icon,
  UserIcon,
} from '@heroicons/react/24/outline';

import type { ComponentType, SVGProps } from 'react';

import type { CollectionType } from './collection';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface CollectionTypeOption {
  type: CollectionType;
  label: string;
  description: string;
  lookLabel: string;
  Icon: IconComponent;
}

export const COLLECTION_TYPE_OPTIONS: readonly CollectionTypeOption[] = [
  {
    type: 'year',
    label: 'Year',
    description: 'Tell your year in 10 photos.',
    lookLabel: 'Cinematic slideshow',
    Icon: PhotoIcon,
  },
  {
    type: 'collection',
    label: 'Collection',
    description: 'A beautiful gallery for any 10 photos.',
    lookLabel: 'Modern gallery',
    Icon: Squares2X2Icon,
  },
  {
    type: 'profile',
    label: 'Profile',
    description: 'A clean page about you.',
    lookLabel: 'Portfolio grid',
    Icon: UserIcon,
  },
] as const;

export function getCollectionTypeOption(
  type: CollectionType,
): CollectionTypeOption {
  return COLLECTION_TYPE_OPTIONS.find(
    (entry) => entry.type === type,
  ) ?? COLLECTION_TYPE_OPTIONS.find(
    (entry) => entry.type === 'collection',
  )!;
}
