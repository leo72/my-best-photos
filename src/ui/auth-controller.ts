import {
    login,
    logout,
    register,
    subscribeToAuthState,
  } from '../services/auth-service';
  
  import type { AuthAction } from '../types/auth-action';
  import type { AuthViewElements } from './auth-view';
  
  function isAuthAction(value: string): value is AuthAction {
    return value === 'register' || value === 'login';
  }
  
  export function initAuthController(
    view: AuthViewElements,
  ): void {
    const {
      form,
      emailInput,
      passwordInput,
      logoutButton,
      status,
      message,
    } = view;
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const submitter = event.submitter;
  
      if (!(submitter instanceof HTMLButtonElement)) {
        return;
      }
  
      const action = submitter.value;
  
      if (!isAuthAction(action)) {
        return;
      }
  
      message.textContent = '';
  
      const email = emailInput.value.trim();
      const password = passwordInput.value;
  
      try {
        if (action === 'register') {
          const user = await register(email, password);
  
          message.textContent =
            `Registered: ${user.email ?? ''}`;
  
          return;
        }
  
        const user = await login(email, password);
  
        message.textContent =
          `Logged in: ${user.email ?? ''}`;
      } catch (error) {
        console.error(error);
  
        message.textContent =
          error instanceof Error
            ? error.message
            : 'Authentication failed';
      }
    });
  
    logoutButton.addEventListener('click', async () => {
      message.textContent = '';
  
      try {
        await logout();
      } catch (error) {
        console.error(error);
  
        message.textContent =
          error instanceof Error
            ? error.message
            : 'Logout failed';
      }
    });
  
    subscribeToAuthState((user) => {
      if (user) {
        status.textContent =
          `Current user: ${user.email ?? user.uid}`;
  
        logoutButton.disabled = false;
        return;
      }
  
      status.textContent = 'Current user: none';
      logoutButton.disabled = true;
    });
  }