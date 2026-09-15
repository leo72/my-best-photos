import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth';

import { firebaseAuth } from './client';

import type {
  AuthService,
  AuthUser,
} from '../../features/auth/auth-session';

function toAuthUser(user: User): AuthUser {
  return {
    id: user.uid,
    email: user.email,
  };
}

function requireCurrentUser(): User {
  const user = firebaseAuth.currentUser;

  if (!user || !user.email) {
    throw new Error('authentication-required');
  }

  return user;
}

export function createFirebaseAuthService(): AuthService {
  return {
    async register(email, password): Promise<AuthUser> {
      const credential =
        await createUserWithEmailAndPassword(
          firebaseAuth,
          email,
          password,
        );

      return toAuthUser(credential.user);
    },

    async login(email, password): Promise<AuthUser> {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );

      return toAuthUser(credential.user);
    },

    async logout(): Promise<void> {
      await signOut(firebaseAuth);
    },

    async changePassword(
      currentPassword,
      newPassword,
    ): Promise<void> {
      const user = requireCurrentUser();
      const credential = EmailAuthProvider.credential(
        user.email ?? '',
        currentPassword,
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    },

    getCurrentUser(): AuthUser | null {
      return firebaseAuth.currentUser
        ? toAuthUser(firebaseAuth.currentUser)
        : null;
    },

    subscribe(callback): () => void {
      return onAuthStateChanged(
        firebaseAuth,
        (user) => callback(user ? toAuthUser(user) : null),
      );
    },
  };
}
