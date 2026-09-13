import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User,
  } from 'firebase/auth';
  
  import { firebaseApp } from '../firebase/app';
  
  const auth = getAuth(firebaseApp);
  
  export async function register(
    email: string,
    password: string,
  ): Promise<User> {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
  
    return credential.user;
  }
  
  export async function login(
    email: string,
    password: string,
  ): Promise<User> {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
  
    return credential.user;
  }
  
  export async function logout(): Promise<void> {
    await signOut(auth);
  }
  
  export function subscribeToAuthState(
    callback: (user: User | null) => void,
  ): () => void {
    return onAuthStateChanged(auth, callback);
  }