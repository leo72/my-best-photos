import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';

import type {
  AuthAction,
  AuthService,
  AuthUser,
} from './auth-session';
import type { AuthViewElements } from './auth-view';

function isAuthAction(value: string): value is AuthAction {
  return value === 'register' || value === 'login';
}

export function initAuthController(
  view: AuthViewElements,
  authService: AuthService,
  onAuthChanged: (user: AuthUser | null) => void,
): () => void {
  const {
    form,
    emailInput,
    passwordInput,
    registerButton,
    loginButton,
    logoutButton,
    status,
    message,
  } = view;
  let currentUser = authService.getCurrentUser();
  let isBusy = false;

  function updateControls(): void {
    registerButton.disabled = isBusy;
    loginButton.disabled = isBusy;
    logoutButton.disabled = isBusy || currentUser === null;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    const submitter = event.submitter;

    if (!(submitter instanceof HTMLButtonElement)) {
      return;
    }

    const action = submitter.value;

    if (!isAuthAction(action)) {
      return;
    }

    isBusy = true;
    message.textContent = '';
    updateControls();

    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const user = action === 'register'
        ? await authService.register(email, password)
        : await authService.login(email, password);

      passwordInput.value = '';
      message.textContent = action === 'register'
        ? `Registered: ${user.email ?? ''}`
        : `Logged in: ${user.email ?? ''}`;
    } catch (error) {
      logClientError('Authentication request failed', error);
      message.textContent = getUserErrorMessage(
        error,
        'Authentication failed',
      );
    } finally {
      isBusy = false;
      updateControls();
    }
  });

  logoutButton.addEventListener('click', async () => {
    if (isBusy) {
      return;
    }

    isBusy = true;
    message.textContent = '';
    updateControls();

    try {
      await authService.logout();
      passwordInput.value = '';
    } catch (error) {
      logClientError('Logout failed', error);
      message.textContent = getUserErrorMessage(
        error,
        'Logout failed',
      );
    } finally {
      isBusy = false;
      updateControls();
    }
  });

  const unsubscribe = authService.subscribe((user) => {
    currentUser = user;
    status.textContent = user
      ? `Current user: ${user.email ?? user.id}`
      : 'Current user: none';
    updateControls();
    onAuthChanged(user);
  });

  updateControls();

  return unsubscribe;
}
