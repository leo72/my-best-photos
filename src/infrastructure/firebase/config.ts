export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function requireEnvironmentValue(
  name: string,
  value: string | undefined,
): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
}

export function getFirebaseClientConfig(): FirebaseClientConfig {
  return {
    apiKey: requireEnvironmentValue(
      'VITE_FIREBASE_API_KEY',
      import.meta.env.VITE_FIREBASE_API_KEY,
    ),
    authDomain: requireEnvironmentValue(
      'VITE_FIREBASE_AUTH_DOMAIN',
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    ),
    projectId: requireEnvironmentValue(
      'VITE_FIREBASE_PROJECT_ID',
      import.meta.env.VITE_FIREBASE_PROJECT_ID,
    ),
    storageBucket: requireEnvironmentValue(
      'VITE_FIREBASE_STORAGE_BUCKET',
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    ),
    messagingSenderId: requireEnvironmentValue(
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    ),
    appId: requireEnvironmentValue(
      'VITE_FIREBASE_APP_ID',
      import.meta.env.VITE_FIREBASE_APP_ID,
    ),
  };
}

export function shouldUseFirebaseEmulators(): boolean {
  return import.meta.env.DEV;
}
