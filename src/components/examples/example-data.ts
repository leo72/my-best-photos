export interface ExamplePhotoSet {
  id: string;
  title: string;
  description: string;
  handle: string;
  photos: readonly string[];
}

export const EXAMPLE_SETS: readonly ExamplePhotoSet[] = [
  {
    id: 'profile',
    title: 'Profile & CV',
    description:
      'A clean, professional set for your profile, CV or portfolio.',
    handle: 'anna',
    photos: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 'family',
    title: 'Family',
    description:
      'Keep precious family moments in one place, always ready.',
    handle: 'taylor',
    photos: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 'favorites',
    title: 'Favorites',
    description:
      'Your hobbies, travels, pets — whatever matters most to you.',
    handle: 'chris',
    photos: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 'sharing',
    title: 'Sharing',
    description:
      'A curated set to share with friends, clients or your community.',
    handle: 'jordan',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80',
    ],
  },
] as const;

export function exampleSetUrl(handle: string): string {
  return `my10photos.com/${handle}`;
}

export function examplePhotoUrl(
  handle: string,
  photoNumber: number,
): string {
  return `my10photos.com/${handle}/p/${photoNumber}`;
}
