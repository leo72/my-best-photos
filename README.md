# My Best Photos

A Firebase-backed photo gallery with authenticated uploads,
transactional slot reservations, server-side image processing,
and public optimized images.

Frontend stack: Vite, React, TypeScript, Tailwind CSS,
React Router, and the Firebase JS SDK.

## Prerequisites

- Node.js 22 or newer
- Java 21 or newer for Firebase emulators
- A Firebase project on the Blaze plan for Cloud Functions

The Firebase CLI is installed locally as the `firebase-tools`
dev dependency. Project config, security rules, and Cloud
Functions live in `firebase/`. App SDK code lives in
`src/infrastructure/firebase/`. Use `npm run firebase -- …`
instead of a global `firebase` install.

## Local setup

1. Install dependencies:

   ```sh
   npm ci
   npm --prefix firebase/cloud-functions ci
   ```

2. Copy `.env.tpl` to `.env.local` and fill in the Firebase web
   configuration from the console. The same keys are used locally
   and in production. `npm run dev` always talks to emulators;
   GitHub Pages (`vite build`) always talks to the cloud project.

3. Start Firebase emulators and Vite in separate terminals:

   ```sh
   npm run emulators
   npm run dev
   ```

Open http://localhost:5173 for the app and http://127.0.0.1:4000
for the emulator UI. Production data is not used.

Auth users, Firestore, and Storage persist under
`firebase/emulator-data/` across emulator restarts. Stop the
emulators with a single Ctrl+C so the snapshot can export.
Use `npm run emulators:fresh` to wipe that local data and start
empty.

## Verification

```sh
npm run build
npm test
npm run test:rules
```

Rules tests require Java because Firestore and Storage rules execute
inside Firebase emulators. `npm run emulators` and `npm run test:rules`
will use Homebrew OpenJDK automatically when `java` is not on PATH.

## Deployment

Pushing to `main` (or running the **Deploy** workflow) ships
the Firebase backend and the GitHub Pages frontend together.
The workflow tests, builds, deploys Functions plus Firestore and
Storage rules, then publishes `dist`. Pages deploy waits until
the backend deploy succeeds.

### GitHub configuration

1. Enable Pages: Settings → Pages → Source **GitHub Actions**.

2. Set these **Actions variables** to the same values as
   `.env.local`:

   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID` (`my-best-photos-v1`)
   - `VITE_FIREBASE_STORAGE_BUCKET`
     (`my-best-photos-v1.firebasestorage.app`)
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. Create a Google Cloud service account in
   `my-best-photos-v1` and grant:

   - Firebase Admin
   - Service Account User
   - Cloud Run Admin
   - Eventarc Admin

   Create a JSON key and store the full JSON as the Actions
   secret `FIREBASE_SERVICE_ACCOUNT`.

4. In the Firebase console, enable Email/Password auth and add
   the GitHub Pages host (for example `your-user.github.io`) to
   **Authorized domains**.

The project must be on the Blaze plan. The first Storage rules
deploy that uses `firestore.get()` may require granting the
Firebase Rules service agent access to Firestore.

### Local backend deploy

```sh
npm run firebase -- login
npm run deploy:backend
```
