import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  getFunctions,
} from 'firebase/functions';
import {
  connectStorageEmulator,
  getStorage,
} from 'firebase/storage';

import {
  getFirebaseClientConfig,
  shouldUseFirebaseEmulators,
} from './config';

const firebaseApp = initializeApp(getFirebaseClientConfig());

export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);
export const firebaseFunctions = getFunctions(
  firebaseApp,
  'us-central1',
);
export const firebaseStorage = getStorage(firebaseApp);

if (shouldUseFirebaseEmulators()) {
  connectAuthEmulator(
    firebaseAuth,
    'http://127.0.0.1:9099',
    {
      disableWarnings: true,
    },
  );
  connectFirestoreEmulator(firebaseDb, '127.0.0.1', 8080);
  connectFunctionsEmulator(
    firebaseFunctions,
    '127.0.0.1',
    5001,
  );
  connectStorageEmulator(firebaseStorage, '127.0.0.1', 9199);
}
