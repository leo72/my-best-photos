import './style.css';

import { initAuthController } from './features/auth/auth-controller';
import { renderAuthView } from './features/auth/auth-view';
import { initGalleryController } from './features/photos/gallery-controller';
import { renderGalleryView } from './features/photos/gallery-view';
import { createPhotoService } from './features/photos/photo-service';
import { createFirebaseAuthService } from './infrastructure/firebase/firebase-auth-service';
import { createFirebasePhotoRepository } from './infrastructure/firebase/firebase-photo-repository';
import { createFirebasePhotoUploadGateway } from './infrastructure/firebase/firebase-photo-upload-gateway';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('#app element not found');
}

app.innerHTML = `
  <main class="app-layout">
    <div id="auth-root"></div>
    <div id="gallery-root"></div>
  </main>
`;

const authRoot =
  document.querySelector<HTMLDivElement>('#auth-root');

const galleryRoot =
  document.querySelector<HTMLDivElement>('#gallery-root');

if (!authRoot || !galleryRoot) {
  throw new Error('Application roots not found');
}

const authView = renderAuthView(authRoot);
const galleryView = renderGalleryView(galleryRoot);

const authService = createFirebaseAuthService();
const photoService = createPhotoService({
  authSession: {
    getCurrentUserId: () =>
      authService.getCurrentUser()?.id ?? null,
  },
  repository: createFirebasePhotoRepository(),
  uploadGateway: createFirebasePhotoUploadGateway(),
});
const galleryController = initGalleryController(
  galleryView,
  photoService,
);
const unsubscribeAuth = initAuthController(
  authView,
  authService,
  (user) => {
    galleryController.setAuthenticated(user !== null);
  },
);

window.addEventListener(
  'beforeunload',
  () => {
    unsubscribeAuth();
    galleryController.dispose();
  },
  {
    once: true,
  },
);