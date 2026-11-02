import { readFile } from 'node:fs/promises';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import {
  getBytes,
  ref,
  uploadBytes,
} from 'firebase/storage';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from 'vitest';

import {
  MAX_COLLECTION_SUBTITLE_LENGTH,
  MAX_COLLECTION_TITLE_LENGTH,
} from '../../src/features/collection/collection';

const projectId = 'my-best-photos-v1';
const validFile = new Uint8Array([1, 2, 3]);

let testEnvironment: RulesTestEnvironment;

function authContext(
  userId: string,
  emailVerified = true,
) {
  return testEnvironment.authenticatedContext(userId, {
    email_verified: emailVerified,
  });
}

async function seedReservation(
  ownerId: string,
  slot: number,
  reservationId: string,
  originalSize = validFile.byteLength,
): Promise<void> {
  await testEnvironment.withSecurityRulesDisabled(
    async (context) => {
      await setDoc(
        doc(
          context.firestore(),
          `users/${ownerId}/photos/${slot}`,
        ),
        {
          ownerId,
          slot,
          reservationId,
          status: 'reserved',
          originalFileName: 'photo.jpg',
          originalContentType: 'image/jpeg',
          originalSize,
        },
      );
    },
  );
}

async function uploadOriginal(
  authenticatedUserId: string,
  ownerId: string,
  slot: number,
  reservationId: string,
  bytes = validFile,
  contentType = 'image/jpeg',
  emailVerified = true,
): Promise<void> {
  const context = authContext(authenticatedUserId, emailVerified);

  await uploadBytes(
    ref(
      context.storage(),
      `photos/${ownerId}/${slot}/original`,
    ),
    bytes,
    {
      contentType,
      customMetadata: {
        reservationId,
        originalFileName: 'photo.jpg',
      },
    },
  );
}

beforeAll(async () => {
  const [firestoreRules, storageRules] = await Promise.all([
    readFile('firebase/firestore.rules', 'utf8'),
    readFile('firebase/storage.rules', 'utf8'),
  ]);

  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: firestoreRules,
    },
    storage: {
      rules: storageRules,
    },
  });
});

beforeEach(async () => {
  await Promise.all([
    testEnvironment.clearFirestore(),
    testEnvironment.clearStorage(),
  ]);
});

afterAll(async () => {
  await testEnvironment.cleanup();
});

describe('Firestore rules', () => {
  it('allows only the owner to read private photo records', async () => {
    await seedReservation('owner', 1, 'reservation');

    const ownerRead = getDoc(
      doc(
        authContext('owner')
          .firestore(),
        'users/owner/photos/1',
      ),
    );
    const otherRead = getDoc(
      doc(
        authContext('other')
          .firestore(),
        'users/owner/photos/1',
      ),
    );

    await assertSucceeds(ownerRead);
    await assertFails(otherRead);
  });

  it('allows public ready reads and denies client writes', async () => {
    await testEnvironment.withSecurityRulesDisabled(
      async (context) => {
        await setDoc(
          doc(context.firestore(), 'publicPhotos/owner_1'),
          {
            status: 'ready',
            ownerId: 'owner',
            slot: 1,
          },
        );
      },
    );

    await assertSucceeds(
      getDoc(
        doc(
          testEnvironment
            .unauthenticatedContext()
            .firestore(),
          'publicPhotos/owner_1',
        ),
      ),
    );
    await assertFails(
      setDoc(
        doc(
          authContext('owner')
            .firestore(),
          'publicPhotos/owner_2',
        ),
        {
          status: 'ready',
          ownerId: 'owner',
          slot: 2,
        },
      ),
    );
  });

  it('allows empty public slots but hides records that are not ready', async () => {
    await testEnvironment.withSecurityRulesDisabled(
      async (context) => {
        await setDoc(
          doc(context.firestore(), 'publicPhotos/owner_3'),
          {
            status: 'processing',
            ownerId: 'owner',
            slot: 3,
          },
        );
      },
    );

    const anonymousDb = testEnvironment
      .unauthenticatedContext()
      .firestore();

    await assertSucceeds(
      getDoc(doc(anonymousDb, 'publicPhotos/owner_2')),
    );
    await assertFails(
      getDoc(doc(anonymousDb, 'publicPhotos/owner_3')),
    );
  });

  it('denies listing profiles and public photos', async () => {
    await testEnvironment.withSecurityRulesDisabled(
      async (context) => {
        await Promise.all([
          setDoc(
            doc(context.firestore(), 'users/owner'),
            {
              ownerId: 'owner',
              collectionType: 'collection',
              title: 'My 10 Photos',
            },
          ),
          setDoc(
            doc(context.firestore(), 'publicPhotos/owner_1'),
            {
              status: 'ready',
              ownerId: 'owner',
              slot: 1,
            },
          ),
        ]);
      },
    );

    const anonymousDb = testEnvironment
      .unauthenticatedContext()
      .firestore();
    const ownerDb = authContext('owner').firestore();

    await assertFails(getDocs(collection(anonymousDb, 'users')));
    await assertFails(getDocs(collection(ownerDb, 'users')));
    await assertFails(
      getDocs(query(
        collection(anonymousDb, 'publicPhotos'),
        where('status', '==', 'ready'),
      )),
    );
    await assertFails(
      getDocs(query(
        collection(ownerDb, 'publicPhotos'),
        where('ownerId', '==', 'owner'),
      )),
    );
  });

  it('allows public collection reads and owner writes', async () => {
    const now = Timestamp.now();
    const payload = {
      ownerId: 'owner',
      collectionType: 'collection',
      title: 'My 10 Photos',
      createdAt: now,
      updatedAt: now,
    };

    await assertSucceeds(
      setDoc(
        doc(
          authContext('owner')
            .firestore(),
          'users/owner',
        ),
        payload,
      ),
    );

    await assertSucceeds(
      getDoc(
        doc(
          testEnvironment
            .unauthenticatedContext()
            .firestore(),
          'users/owner',
        ),
      ),
    );

    await assertFails(
      setDoc(
        doc(
          authContext('other')
            .firestore(),
          'users/owner',
        ),
        {
          ...payload,
          ownerId: 'other',
        },
      ),
    );
  });

  it('accepts subtitles up to the client limit and no longer', async () => {
    const now = Timestamp.now();
    const ownerDoc = doc(
      authContext('owner').firestore(),
      'users/owner',
    );
    const payload = {
      ownerId: 'owner',
      collectionType: 'collection',
      title: 'My 10 Photos',
      createdAt: now,
      updatedAt: now,
    };

    await assertSucceeds(
      setDoc(ownerDoc, { ...payload, subtitle: '' }),
    );
    await assertSucceeds(
      setDoc(ownerDoc, {
        ...payload,
        subtitle: 'a'.repeat(MAX_COLLECTION_SUBTITLE_LENGTH),
      }),
    );
    await assertFails(
      setDoc(ownerDoc, {
        ...payload,
        subtitle: 'a'.repeat(MAX_COLLECTION_SUBTITLE_LENGTH + 1),
      }),
    );
    await assertFails(
      setDoc(ownerDoc, { ...payload, subtitle: 42 }),
    );
  });

  it('accepts a photo order of distinct slots only', async () => {
    const now = Timestamp.now();
    const ownerDoc = doc(
      authContext('owner').firestore(),
      'users/owner',
    );
    const payload = {
      ownerId: 'owner',
      collectionType: 'collection',
      title: 'My 10 Photos',
      createdAt: now,
      updatedAt: now,
    };

    await assertSucceeds(
      setDoc(ownerDoc, { ...payload, photoOrder: [] }),
    );
    await assertSucceeds(
      setDoc(ownerDoc, {
        ...payload,
        photoOrder: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      }),
    );

    for (const photoOrder of [
      [0],
      [11],
      [1, 1],
      ['1'],
      [1.5],
      'not-a-list',
    ]) {
      await assertFails(
        setDoc(ownerDoc, { ...payload, photoOrder }),
      );
    }
  });

  it('accepts titles up to the client limit and no longer', async () => {
    const now = Timestamp.now();
    const ownerDoc = doc(
      authContext('owner').firestore(),
      'users/owner',
    );
    const payload = {
      ownerId: 'owner',
      collectionType: 'collection',
      createdAt: now,
      updatedAt: now,
    };

    await assertSucceeds(
      setDoc(ownerDoc, {
        ...payload,
        title: 'a'.repeat(MAX_COLLECTION_TITLE_LENGTH),
      }),
    );
    await assertFails(
      setDoc(ownerDoc, {
        ...payload,
        title: 'a'.repeat(MAX_COLLECTION_TITLE_LENGTH + 1),
      }),
    );
  });

  it('denies unverified owners from private reads and writes', async () => {
    const now = Timestamp.now();
    await seedReservation('owner', 1, 'reservation');

    await assertFails(
      getDoc(
        doc(
          authContext('owner', false)
            .firestore(),
          'users/owner/photos/1',
        ),
      ),
    );
    await assertFails(
      setDoc(
        doc(
          authContext('owner', false)
            .firestore(),
          'users/owner',
        ),
        {
          ownerId: 'owner',
          collectionType: 'collection',
          title: 'My 10 Photos',
          createdAt: now,
          updatedAt: now,
        },
      ),
    );
  });
});

describe('Storage rules', () => {
  it('accepts a matching owner reservation', async () => {
    await seedReservation('owner', 1, 'reservation');

    await assertSucceeds(
      uploadOriginal('owner', 'owner', 1, 'reservation'),
    );
  });

  it('rejects cross-user, wrong-token and wrong-type uploads', async () => {
    await seedReservation('owner', 1, 'reservation');
    await seedReservation('owner', 2, 'reservation-2');
    await seedReservation('owner', 3, 'reservation-3');

    await assertFails(
      uploadOriginal('other', 'owner', 1, 'reservation'),
    );
    await assertFails(
      uploadOriginal('owner', 'owner', 2, 'wrong'),
    );
    await assertFails(
      uploadOriginal(
        'owner',
        'owner',
        3,
        'reservation-3',
        validFile,
        'text/plain',
      ),
    );
  });

  it('rejects files larger than 12 MB', async () => {
    const oversizedFile =
      new Uint8Array(12 * 1024 * 1024 + 1);
    await seedReservation(
      'owner',
      1,
      'reservation',
      oversizedFile.byteLength,
    );

    await assertFails(
      uploadOriginal(
        'owner',
        'owner',
        1,
        'reservation',
        oversizedFile,
      ),
    );
  });

  it('exposes the current derivative generation but keeps originals private', async () => {
    await testEnvironment.withSecurityRulesDisabled(
      async (context) => {
        await setDoc(
          doc(context.firestore(), 'publicPhotos/owner_1'),
          {
            status: 'ready',
            ownerId: 'owner',
            slot: 1,
            sourceGeneration: '42',
          },
        );
        await Promise.all([
          'photos/owner/1/42/thumbnail.webp',
          'photos/owner/1/41/thumbnail.webp',
          'photos/owner/1/thumbnail.webp',
        ].map((path) => uploadBytes(
          ref(context.storage(), path),
          validFile,
          {
            contentType: 'image/webp',
          },
        )));
        await uploadBytes(
          ref(
            context.storage(),
            'photos/owner/1/original',
          ),
          validFile,
          {
            contentType: 'image/jpeg',
          },
        );
      },
    );

    const anonymousStorage = testEnvironment
      .unauthenticatedContext()
      .storage();

    await assertSucceeds(
      getBytes(
        ref(
          anonymousStorage,
          'photos/owner/1/42/thumbnail.webp',
        ),
      ),
    );
    await assertFails(
      getBytes(
        ref(
          anonymousStorage,
          'photos/owner/1/41/thumbnail.webp',
        ),
      ),
    );
    await assertFails(
      getBytes(
        ref(
          anonymousStorage,
          'photos/owner/1/thumbnail.webp',
        ),
      ),
    );
    await assertFails(
      getBytes(
        ref(
          anonymousStorage,
          'photos/owner/1/original',
        ),
      ),
    );
  });

  it('serves unversioned derivatives for records without a generation', async () => {
    await testEnvironment.withSecurityRulesDisabled(
      async (context) => {
        await setDoc(
          doc(context.firestore(), 'publicPhotos/owner_1'),
          {
            status: 'ready',
            ownerId: 'owner',
            slot: 1,
          },
        );
        await uploadBytes(
          ref(
            context.storage(),
            'photos/owner/1/thumbnail.webp',
          ),
          validFile,
          {
            contentType: 'image/webp',
          },
        );
      },
    );

    await assertSucceeds(
      getBytes(
        ref(
          testEnvironment
            .unauthenticatedContext()
            .storage(),
          'photos/owner/1/thumbnail.webp',
        ),
      ),
    );
  });

  it('rejects unverified owner uploads', async () => {
    await seedReservation('owner', 1, 'reservation');

    await assertFails(
      uploadOriginal(
        'owner',
        'owner',
        1,
        'reservation',
        validFile,
        'image/jpeg',
        false,
      ),
    );
  });
});
