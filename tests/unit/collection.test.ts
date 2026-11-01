import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createDefaultCollectionProfile,
  getCollectionLook,
  getDefaultCollectionTitle,
  normalizeCollectionType,
} from '../../src/features/collection/collection';
import {
  createCollectionService,
  titleForCollectionTypeChange,
  validateCollectionInput,
} from '../../src/features/collection/collection-service';
import { decodeCollectionProfile } from '../../src/infrastructure/firebase/collection-decoder';

describe('collection defaults', () => {
  it('maps purpose to public look', () => {
    expect(getCollectionLook('year')).toBe('cinematic');
    expect(getCollectionLook('collection')).toBe('gallery');
    expect(getCollectionLook('profile')).toBe('clean');
  });

  it('creates a default collection profile', () => {
    expect(createDefaultCollectionProfile('owner')).toMatchObject({
      ownerId: 'owner',
      collectionType: 'collection',
      title: 'My 10 Photos',
    });
  });

  it('maps legacy purposes to collection', () => {
    expect(normalizeCollectionType('favorites')).toBe('collection');
    expect(normalizeCollectionType('family')).toBe('collection');
    expect(normalizeCollectionType('sharing')).toBe('collection');
    expect(normalizeCollectionType('year')).toBe('year');
  });
});

describe('validateCollectionInput', () => {
  it('normalizes title', () => {
    expect(validateCollectionInput({
      collectionType: 'year',
      title: '  My year  ',
    })).toEqual({
      collectionType: 'year',
      title: 'My year',
    });
  });

  it('rejects an empty title', () => {
    expect(() => validateCollectionInput({
      collectionType: 'collection',
      title: '   ',
    })).toThrow('empty-collection-title');
  });
});

describe('savePhotoOrder', () => {
  function serviceWithSavedOrders() {
    const savedOrders: (readonly number[])[] = [];
    const service = createCollectionService({
      repository: {
        subscribeToCollection: () => () => undefined,
        saveCollection: async () => undefined,
        savePhotoOrder: async (_ownerId, photoOrder) => {
          savedOrders.push(photoOrder);
        },
      },
    });

    return { service, savedOrders };
  }

  it('saves a valid order', async () => {
    const { service, savedOrders } = serviceWithSavedOrders();

    await service.savePhotoOrder('owner', [3, 1, 2]);

    expect(savedOrders).toEqual([[3, 1, 2]]);
  });

  it('rejects invalid or repeated slots', async () => {
    const { service, savedOrders } = serviceWithSavedOrders();

    await expect(service.savePhotoOrder('owner', [1, 1]))
      .rejects.toThrow('invalid-photo-order');
    await expect(service.savePhotoOrder('owner', [0, 2]))
      .rejects.toThrow('invalid-photo-order');
    expect(savedOrders).toEqual([]);
  });

  it('requires an owner', async () => {
    const { service } = serviceWithSavedOrders();

    await expect(service.savePhotoOrder('', [1]))
      .rejects.toThrow('authentication-required');
  });
});

describe('titleForCollectionTypeChange', () => {
  it('replaces default titles when purpose changes', () => {
    expect(titleForCollectionTypeChange(
      'profile',
      getDefaultCollectionTitle('collection'),
      'collection',
    )).toBe('My Profile Photos');
  });

  it('keeps a custom title', () => {
    expect(titleForCollectionTypeChange(
      'year',
      'Our Album',
      'collection',
    )).toBe('Our Album');
  });
});

describe('decodeCollectionProfile', () => {
  it('decodes a valid profile', () => {
    expect(decodeCollectionProfile('owner', {
      collectionType: 'profile',
      title: 'My Profile Photos',
    })).toEqual({
      ownerId: 'owner',
      collectionType: 'profile',
      title: 'My Profile Photos',
      photoOrder: [],
      createdAt: null,
      updatedAt: null,
    });
  });

  it('decodes the photo order, dropping invalid slots', () => {
    expect(decodeCollectionProfile('owner', {
      collectionType: 'profile',
      title: 'My Profile Photos',
      photoOrder: [4, 2, 11, 4, 'x', 1],
    })?.photoOrder).toEqual([4, 2, 1]);
  });

  it('maps legacy collection types', () => {
    expect(decodeCollectionProfile('owner', {
      collectionType: 'sharing',
      title: 'My 10 Photos',
      year: 2026,
    })).toEqual({
      ownerId: 'owner',
      collectionType: 'collection',
      title: 'My 10 Photos',
      photoOrder: [],
      createdAt: null,
      updatedAt: null,
    });
  });

  it('rejects invalid profiles', () => {
    expect(decodeCollectionProfile('owner', {
      collectionType: 'nope',
      title: 'Title',
    })).toBeNull();
  });
});
