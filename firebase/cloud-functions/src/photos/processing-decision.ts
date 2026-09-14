export const MAX_PHOTO_PROCESSING_ATTEMPTS = 5;

export type ProcessingDecision =
  | 'process'
  | 'already-ready'
  | 'reject';

export type ProcessingRetryDecision = 'retry' | 'give-up';

export function decideProcessingRetry(
  failedAttemptCount: number,
): ProcessingRetryDecision {
  return failedAttemptCount >= MAX_PHOTO_PROCESSING_ATTEMPTS
    ? 'give-up'
    : 'retry';
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
