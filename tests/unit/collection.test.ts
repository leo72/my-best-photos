import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createDefaultCollectionProfile,
  getCollectionLook,
  getDefaultCollectionSubtitle,
  getDefaultCollectionTitle,
  MAX_COLLECTION_SUBTITLE_LENGTH,
  normalizeCollectionType,
} from '../../src/features/collection/collection';
import {
  createCollectionService,
  subtitleForCollectionTypeChange,
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
      subtitle: 'Moments I love, all in one place.',
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
  it('normalizes title and subtitle', () => {
    expect(validateCollectionInput({
      collectionType: 'year',
      title: '  My year  ',
      subtitle: '  Best moments  ',
    })).toEqual({
      collectionType: 'year',
      title: 'My year',
      subtitle: 'Best moments',
    });
  });

  it('keeps an empty subtitle and trims long ones', () => {
    expect(validateCollectionInput({
      collectionType: 'year',
      title: 'My year',
      subtitle: '   ',
    }).subtitle).toBe('');
    expect(validateCollectionInput({
      collectionType: 'year',
      title: 'My year',
      subtitle: 'a'.repeat(MAX_COLLECTION_SUBTITLE_LENGTH + 5),
    }).subtitle).toHaveLength(MAX_COLLECTION_SUBTITLE_LENGTH);
  });

  it('rejects an empty title', () => {
    expect(() => validateCollectionInput({
      collectionType: 'collection',
      title: '   ',
      subtitle: '',
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

describe('subtitleForCollectionTypeChange', () => {
  it('follows the style while the default is unedited', () => {
    expect(subtitleForCollectionTypeChange(
      'year',
      getDefaultCollectionSubtitle('collection'),
      'collection',
    )).toBe('Ten photos. One year.');
  });

  it('keeps a custom subtitle', () => {
    expect(subtitleForCollectionTypeChange(
      'profile',
      'Street photos from Yerevan',
      'year',
    )).toBe('Street photos from Yerevan');
  });

  it('keeps a cleared subtitle hidden', () => {
    expect(subtitleForCollectionTypeChange(
      'profile',
      '',
      'collection',
    )).toBe('');
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
      subtitle: 'A selection of photos that represent me.',
      photoOrder: [],
      createdAt: null,
      updatedAt: null,
    });
  });

  it('decodes a saved subtitle, including an empty one', () => {
    const profile = {
      collectionType: 'profile',
      title: 'My Profile Photos',
    };

    expect(decodeCollectionProfile('owner', {
      ...profile,
      subtitle: '  Portraits and travel  ',
    })?.subtitle).toBe('Portraits and travel');
    expect(decodeCollectionProfile('owner', {
      ...profile,
      subtitle: '',
    })?.subtitle).toBe('');
    expect(decodeCollectionProfile('owner', {
      ...profile,
      subtitle: 42,
    })?.subtitle).toBe('A selection of photos that represent me.');
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
      subtitle: 'Moments I love, all in one place.',
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
