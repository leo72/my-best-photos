import { MAX_PHOTO_SLOTS } from './photo-contract.js';

export interface SlotState {
  status: unknown;
  reservationExpiresAtMs: number | null;
}

export function findAvailableSlot(
  slots: ReadonlyArray<SlotState | null>,
  nowMs: number,
): number | null {
  for (let index = 0; index < MAX_PHOTO_SLOTS; index += 1) {
    const slot = slots[index];

    if (
      !slot
      || slot.status === 'failed'
      || (
        slot.status === 'reserved'
        && slot.reservationExpiresAtMs !== null
        && slot.reservationExpiresAtMs <= nowMs
      )
    ) {
      return index + 1;
    }
  }

  return null;
}
