import { HttpsError } from 'firebase-functions/v2/https';

interface RequestAuth {
  uid: string;
  token: {
    email_verified?: boolean;
  };
}

export function requireVerifiedUserId(
  auth: RequestAuth | undefined,
): string {
  if (!auth) {
    throw new HttpsError(
      'unauthenticated',
      'Authentication is required',
    );
  }

  if (auth.token.email_verified !== true) {
    throw new HttpsError(
      'permission-denied',
      'Verify your email before managing photos',
    );
  }

  return auth.uid;
}
