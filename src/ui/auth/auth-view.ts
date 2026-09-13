export interface AuthViewElements {
  form: HTMLFormElement;
  emailInput: HTMLInputElement;
  passwordInput: HTMLInputElement;
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
            required
          />
        </label>

        <label>
          Password
          <input
            id="password"
            type="password"
            minlength="6"
            required
          />
        </label>

        <div class="actions">
          <button
            type="submit"
            name="action"
            value="register"
          >
            Register
          </button>

          <button
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
      <p id="auth-message"></p>
    </section>
  `;

  const form =
    container.querySelector<HTMLFormElement>('#auth-form');

  const emailInput =
    container.querySelector<HTMLInputElement>('#email');

  const passwordInput =
    container.querySelector<HTMLInputElement>('#password');

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
    !form ||
    !emailInput ||
    !passwordInput ||
    !logoutButton ||
    !status ||
    !message
  ) {
    throw new Error('Auth view initialization failed');
  }

  return {
    form,
    emailInput,
    passwordInput,
    logoutButton,
    status,
    message,
  };
}