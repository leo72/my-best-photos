import { FirebaseError } from 'firebase/app';

const USER_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  'auth/email-already-in-use':
    'An account already exists for this email',
  'auth/invalid-credential': 'Invalid email or password',
  'auth/invalid-email': 'Enter a valid email address',
  'auth/too-many-requests':
    'Too many attempts. Please try again later',
  'auth/weak-password': 'Choose a stronger password',
  'functions/resource-exhausted':
    'All photo slots are occupied',
  'functions/unauthenticated':
    'Sign in before uploading a photo',
  'storage/unauthorized':
    'This upload is not authorized',
};

export function getErrorCode(error: unknown): string | null {
  return error instanceof FirebaseError ? error.code : null;
}

export function getUserErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const errorCode = getErrorCode(error);

  return errorCode
    ? USER_ERROR_MESSAGES[errorCode] ?? fallback
    : fallback;
}

export function logClientError(
  message: string,
  error: unknown,
): void {
  console.error(message, {
    errorCode: getErrorCode(error) ?? 'unknown',
    errorName:
      error instanceof Error ? error.name : 'UnknownError',
  });
}
