/** Processing attempts, counted as each one starts, before marking the photo failed. */
export const MAX_PHOTO_PROCESSING_ATTEMPTS = 5;
/** Processing with no progress for this long is treated as crashed. */
export const PROCESSING_STALL_TIMEOUT_MS = 60 * 60 * 1000;

export type ProcessingDecision =
  | 'process'
  | 'already-ready'
  | 'reject';

export type ProcessingRetryDecision = 'retry' | 'give-up';

/**
 * Attempts are counted when they start, so a run that times out or
 * crashes before reaching the failure handler still uses one up.
 */
export function canStartProcessingAttempt(attempt: number): boolean {
  return attempt <= MAX_PHOTO_PROCESSING_ATTEMPTS;
}

export function decideProcessingRetry(
  failedAttempt: number,
): ProcessingRetryDecision {
  return failedAttempt >= MAX_PHOTO_PROCESSING_ATTEMPTS
    ? 'give-up'
    : 'retry';
}

export function isStalledProcessing(
  status: unknown,
  updatedAtMs: number | null,
  nowMs: number,
): boolean {
  return status === 'processing'
    && updatedAtMs !== null
    && updatedAtMs <= nowMs - PROCESSING_STALL_TIMEOUT_MS;
}

export function decidePhotoProcessing(
  value: unknown,
  reservationId: string,
  generation: string,
): ProcessingDecision {
  if (typeof value !== 'object' || value === null) {
    return 'reject';
  }

  if (
    'status' in value
    && 'sourceGeneration' in value
    && value.status === 'ready'
    && value.sourceGeneration === generation
  ) {
    return 'already-ready';
  }

  if (
    !('reservationId' in value)
    || value.reservationId !== reservationId
    || !('status' in value)
    || (
      value.status !== 'reserved'
      && value.status !== 'processing'
    )
  ) {
    return 'reject';
  }

  if (
    value.status === 'processing'
    && (
      !('sourceGeneration' in value)
      || value.sourceGeneration !== generation
    )
  ) {
    return 'reject';
  }

  return 'process';
}
