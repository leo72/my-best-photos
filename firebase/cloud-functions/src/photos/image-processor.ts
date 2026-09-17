import sharp from 'sharp';

import {
  OPTIMIZED_MAX_SIZE,
  THUMBNAIL_MAX_SIZE,
} from './photo-contract.js';

/** Sharp decode cap so a huge original cannot exhaust memory. */
const MAX_INPUT_PIXELS = 40_000_000;

export interface ImageDerivative {
  data: Buffer;
  width: number;
  height: number;
}

export interface ImageDerivatives {
  optimized: ImageDerivative;
  thumbnail: ImageDerivative;
}

export class InvalidImageDataError extends Error {
  public readonly code: string;

  public constructor(code: string) {
    super(code);
    this.name = 'InvalidImageDataError';
    this.code = code;
  }
}

export async function createImageDerivatives(
  originalBuffer: Buffer,
): Promise<ImageDerivatives> {
  try {
    const source = sharp(originalBuffer, {
      failOn: 'error',
      limitInputPixels: MAX_INPUT_PIXELS,
      animated: false,
    }).rotate();
    const metadata = await source.metadata();

    if (
      metadata.format !== 'jpeg'
      && metadata.format !== 'png'
      && metadata.format !== 'webp'
    ) {
      throw new InvalidImageDataError(
        'unsupported-image-bytes',
      );
    }

    if (
      !metadata.width
      || !metadata.height
      || (metadata.pages ?? 1) > 1
    ) {
      throw new InvalidImageDataError(
        'invalid-image-dimensions',
      );
    }

    const [optimizedOutput, thumbnailOutput] =
      await Promise.all([
        source
          .clone()
          .resize({
            width: OPTIMIZED_MAX_SIZE,
            height: OPTIMIZED_MAX_SIZE,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 82 })
          .toBuffer({ resolveWithObject: true }),
        source
          .clone()
          .resize({
            width: THUMBNAIL_MAX_SIZE,
            height: THUMBNAIL_MAX_SIZE,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 84 })
          .toBuffer({ resolveWithObject: true }),
      ]);

    return {
      optimized: {
        data: optimizedOutput.data,
        width: optimizedOutput.info.width,
        height: optimizedOutput.info.height,
      },
      thumbnail: {
        data: thumbnailOutput.data,
        width: thumbnailOutput.info.width,
        height: thumbnailOutput.info.height,
      },
    };
  } catch (error) {
    if (error instanceof InvalidImageDataError) {
      throw error;
    }

    throw new InvalidImageDataError('invalid-image-data');
  }
}
