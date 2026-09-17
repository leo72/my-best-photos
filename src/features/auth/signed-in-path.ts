import type { AuthUser } from './auth-session';

export const PHOTOS_PATH = '/photos';
export const SIGN_IN_PATH = '/sign-in';
export const VERIFY_EMAIL_PATH = '/verify-email';

export function getSignedInPath(user: AuthUser): string {
  return user.emailVerified ? PHOTOS_PATH : VERIFY_EMAIL_PATH;
}
