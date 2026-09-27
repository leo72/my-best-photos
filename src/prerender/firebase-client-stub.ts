/**
 * Stand-in for the Firebase client during marketing HTML prerender.
 * The real client initializes Firebase at import time, which cannot run in Node.
 */
export const firebaseAuth = null;
export const firebaseDb = null;
export const firebaseFunctions = null;
export const firebaseStorage = null;
