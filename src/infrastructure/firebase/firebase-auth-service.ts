import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
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
