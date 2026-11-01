import { MAX_PHOTO_SLOTS } from './photo';

interface OrderablePhoto {
  slot: number;
  updatedAt: Date | null;
}

/** Keeps valid, distinct slots in their saved order. */
export function normalizePhotoOrder(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const slots: number[] = [];

  for (const slot of value) {
    if (
      typeof slot === 'number'
      && Number.isInteger(slot)
      && slot >= 1
      && slot <= MAX_PHOTO_SLOTS
      && !slots.includes(slot)
    ) {
      slots.push(slot);
    }
  }

  return slots;
}

/**
 * Sorts photos by their saved position. Photos not placed yet (new
 * uploads) come first, newest first, as before ordering existed.
 */
export function sortPhotosByOrder<T extends OrderablePhoto>(
  photos: readonly T[],
  photoOrder: readonly number[],
): T[] {
  const positions = new Map(
    photoOrder.map((slot, index) => [slot, index]),
  );

  return [...photos].sort((left, right) => {
    const leftPosition = positions.get(left.slot);
    const rightPosition = positions.get(right.slot);

    if (leftPosition !== undefined && rightPosition !== undefined) {
      return leftPosition - rightPosition;
    }

    if (leftPosition !== undefined) {
      return 1;
    }

    if (rightPosition !== undefined) {
      return -1;
    }

    return (right.updatedAt?.getTime() ?? 0)
      - (left.updatedAt?.getTime() ?? 0);
  });
}
