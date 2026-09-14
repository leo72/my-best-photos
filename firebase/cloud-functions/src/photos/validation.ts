import {
  MAX_PHOTO_SIZE_BYTES,
  SUPPORTED_IMAGE_TYPES,
  type ReservePhotoInput,
} from './photo-contract.js';

export class InvalidPhotoInputError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidPhotoInputError';
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseReservePhotoInput(
  value: unknown,
): ReservePhotoInput {
  if (!isRecord(value)) {
    throw new InvalidPhotoInputError(
      'Photo upload data is required',
    );
  }

  const {
    originalFileName,
    originalContentType,
    originalSize,
  } = value;

  if (
    typeof originalFileName !== 'string'
    || originalFileName.length === 0
    || originalFileName.length > 255
  ) {
    throw new InvalidPhotoInputError(
      'Original filename must contain 1 to 255 characters',
    );
  }

  if (
    typeof originalContentType !== 'string'
    || !SUPPORTED_IMAGE_TYPES.has(originalContentType)
  ) {
    throw new InvalidPhotoInputError(
      'Only JPEG, PNG and WebP images are supported',
    );
  }

  if (
    typeof originalSize !== 'number'
    || !Number.isInteger(originalSize)
    || originalSize <= 0
    || originalSize > MAX_PHOTO_SIZE_BYTES
  ) {
    throw new InvalidPhotoInputError(
      'Image size must be between 1 byte and 12 MB',
    );
  }

  return {
    originalFileName,
    originalContentType,
    originalSize,
  };
}
