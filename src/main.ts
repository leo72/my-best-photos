import './style.css';

import { initAuthController } from './ui/auth/auth-controller';
import { renderAuthView } from './ui/auth/auth-view';

import { initGalleryController } from './ui/gallery/gallery-controller';
import { renderGalleryView } from './ui/gallery/gallery-view';

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
initAuthController(authView);

const galleryView = renderGalleryView(galleryRoot);
initGalleryController(galleryView);