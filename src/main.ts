import './style.css';

import { initAuthController } from './ui/auth-controller';
import { renderAuthView } from './ui/auth-view';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('#app element not found');
}

const authView = renderAuthView(app);

initAuthController(authView);