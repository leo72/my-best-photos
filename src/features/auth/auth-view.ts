export interface AuthViewElements {
  form: HTMLFormElement;
  emailInput: HTMLInputElement;
  passwordInput: HTMLInputElement;
  registerButton: HTMLButtonElement;
  loginButton: HTMLButtonElement;
  logoutButton: HTMLButtonElement;
  status: HTMLParagraphElement;
  message: HTMLParagraphElement;
}

export function renderAuthView(
  container: HTMLElement,
): AuthViewElements {
  container.innerHTML = `
    <section class="auth-card">
      <h2>Authentication</h2>

      <form id="auth-form">
        <label>
          Email
          <input
            id="email"
            type="email"
            autocomplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            id="password"
            type="password"
            autocomplete="current-password"
            minlength="6"
            required
          />
        </label>

        <div class="actions">
          <button
            id="register-button"
            type="submit"
            name="action"
            value="register"
          >
            Register
          </button>

          <button
            id="login-button"
            type="submit"
            name="action"
            value="login"
          >
            Login
          </button>

          <button
            id="logout-button"
            type="button"
          >
            Logout
          </button>
        </div>
      </form>

      <p id="auth-status">Checking authentication...</p>
      <p id="auth-message" role="status"></p>
    </section>
  `;

  const form =
    container.querySelector<HTMLFormElement>('#auth-form');
  const emailInput =
    container.querySelector<HTMLInputElement>('#email');
  const passwordInput =
    container.querySelector<HTMLInputElement>('#password');
  const registerButton =
    container.querySelector<HTMLButtonElement>(
      '#register-button',
    );
  const loginButton =
    container.querySelector<HTMLButtonElement>(
      '#login-button',
    );
  const logoutButton =
    container.querySelector<HTMLButtonElement>(
      '#logout-button',
    );
  const status =
    container.querySelector<HTMLParagraphElement>(
      '#auth-status',
    );
  const message =
    container.querySelector<HTMLParagraphElement>(
      '#auth-message',
    );

  if (
    !form
    || !emailInput
    || !passwordInput
    || !registerButton
    || !loginButton
    || !logoutButton
    || !status
    || !message
  ) {
    throw new Error('Auth view initialization failed');
  }

  return {
    form,
    emailInput,
    passwordInput,
    registerButton,
    loginButton,
    logoutButton,
    status,
    message,
  };
}
