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
      createdAt: null,
      updatedAt: null,
    });
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
