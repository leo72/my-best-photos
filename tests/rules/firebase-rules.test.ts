import { readFile } from 'node:fs/promises';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
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

const projectId = 'my-best-photos-v1';
const validFile = new Uint8Array([1, 2, 3]);

let testEnvironment: RulesTestEnvironment;

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
): Promise<void> {
  const context = testEnvironment.authenticatedContext(
    authenticatedUserId,
  );

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
        testEnvironment
          .authenticatedContext('owner')
          .firestore(),
        'users/owner/photos/1',
      ),
    );
    const otherRead = getDoc(
      doc(
        testEnvironment
          .authenticatedContext('other')
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
          testEnvironment
            .authenticatedContext('owner')
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
          testEnvironment
            .authenticatedContext('owner')
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
          testEnvironment
            .authenticatedContext('other')
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

  it('exposes ready derivatives but keeps originals private', async () => {
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
});
