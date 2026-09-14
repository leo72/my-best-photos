import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  createPhotoService,
  validatePhotoFile,
} from '../../src/features/photos/photo-service';

import type {
  PhotoReservation,
  PublicPhoto,
  ReservePhotoInput,
} from '../../src/features/photos/photo';
import type {
  AuthSession,
  PhotoRepository,
  PhotoUploadGateway,
} from '../../src/features/photos/photo-ports';

const reservation: PhotoReservation = {
  photoId: 'owner_1',
  slot: 1,
  reservationId: 'reservation',
};

class FakePhotoRepository implements PhotoRepository {
  public subscribeToPublicPhotos(
    onPhotos: (photos: PublicPhoto[]) => void,
  ): () => void {
    onPhotos([]);
    return () => undefined;
  }
}

class FakePhotoUploadGateway implements PhotoUploadGateway {
  public readonly reserveInputs: ReservePhotoInput[] = [];
  public readonly uploads: Array<{
    ownerId: string;
    reservation: PhotoReservation;
    file: File;
  }> = [];
  public readonly cancellations: PhotoReservation[] = [];
  public uploadError: Error | null = null;

  public async reservePhoto(
    input: ReservePhotoInput,
  ): Promise<PhotoReservation> {
    this.reserveInputs.push(input);
    return reservation;
  }

  public async cancelReservation(
    value: PhotoReservation,
  ): Promise<void> {
    this.cancellations.push(value);
  }

  public async uploadOriginal(
    ownerId: string,
    value: PhotoReservation,
    file: File,
  ): Promise<void> {
    this.uploads.push({
      ownerId,
      reservation: value,
      file,
    });

    if (this.uploadError) {
      throw this.uploadError;
    }
  }

  public async getDerivativeUrl(
    ownerId: string,
    slot: number,
    derivative: 'optimized.webp' | 'thumbnail.webp',
  ): Promise<string> {
    return `https://example.test/${ownerId}/${slot}/${derivative}`;
  }
}

function createAuthSession(ownerId: string | null): AuthSession {
  return {
    getCurrentUserId: () => ownerId,
  };
}

describe('validatePhotoFile', () => {
  it('accepts supported non-empty images', () => {
    const file = new File(['image'], 'photo.jpg', {
      type: 'image/jpeg',
    });

    expect(() => validatePhotoFile(file)).not.toThrow();
  });

  it('rejects unsupported and empty files', () => {
    expect(() => validatePhotoFile(
      new File(['text'], 'photo.txt', {
        type: 'text/plain',
      }),
    )).toThrow('unsupported-photo-type');
    expect(() => validatePhotoFile(
      new File([], 'empty.jpg', {
        type: 'image/jpeg',
      }),
    )).toThrow('empty-photo');
  });
});

describe('createPhotoService', () => {
  it('reserves and uploads without exposing slot selection', async () => {
    const gateway = new FakePhotoUploadGateway();
    const service = createPhotoService({
      authSession: createAuthSession('owner'),
      repository: new FakePhotoRepository(),
      uploadGateway: gateway,
    });
    const file = new File(['image'], 'photo.jpg', {
      type: 'image/jpeg',
    });

    await expect(service.uploadPhoto(file)).resolves.toEqual({
      photoId: 'owner_1',
      slot: 1,
    });
    expect(gateway.reserveInputs).toEqual([
      {
        originalFileName: 'photo.jpg',
        originalContentType: 'image/jpeg',
        originalSize: file.size,
      },
    ]);
    expect(gateway.uploads).toHaveLength(1);
    expect(gateway.cancellations).toHaveLength(0);
  });

  it('cancels the reservation when upload fails', async () => {
    const gateway = new FakePhotoUploadGateway();
    gateway.uploadError = new Error('upload-failed');
    const service = createPhotoService({
      authSession: createAuthSession('owner'),
      repository: new FakePhotoRepository(),
      uploadGateway: gateway,
    });
    const file = new File(['image'], 'photo.jpg', {
      type: 'image/jpeg',
    });

    await expect(service.uploadPhoto(file))
      .rejects.toThrow('upload-failed');
    expect(gateway.cancellations).toEqual([reservation]);
  });

  it('publishes resolved gallery URLs and unsubscribes', async () => {
    const unsubscribe = vi.fn();
    const photo: PublicPhoto = {
      id: 'owner_1',
      ownerId: 'owner',
      slot: 1,
      status: 'ready',
      width: 1200,
      height: 800,
      createdAt: null,
      updatedAt: null,
    };
    const repository: PhotoRepository = {
      subscribeToPublicPhotos(onPhotos): () => void {
        onPhotos([photo]);
        return unsubscribe;
      },
    };
    const service = createPhotoService({
      authSession: createAuthSession('owner'),
      repository,
      uploadGateway: new FakePhotoUploadGateway(),
    });
    const onPhotos = vi.fn();

    const dispose = service.subscribeToGallery(
      onPhotos,
      vi.fn(),
    );

    await vi.waitFor(() => {
      expect(onPhotos).toHaveBeenCalledWith([
        {
          ...photo,
          thumbnailUrl:
            'https://example.test/owner/1/thumbnail.webp',
          optimizedUrl:
            'https://example.test/owner/1/optimized.webp',
        },
      ]);
    });

    dispose();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
