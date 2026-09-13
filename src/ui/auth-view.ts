export interface AuthViewElements {
    form: HTMLFormElement;
    emailInput: HTMLInputElement;
    passwordInput: HTMLInputElement;
    logoutButton: HTMLButtonElement;
    status: HTMLParagraphElement;
    message: HTMLParagraphElement;
    createTestPhotoButton: HTMLButtonElement;
    photos: HTMLDivElement;
  }
  
  export function renderAuthView(
    container: HTMLElement,
  ): AuthViewElements {
    container.innerHTML = `
      <main class="auth-page">
        <h1>My Best Photos</h1>
  
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
  
          <p id="status">Checking authentication...</p>
          <p id="message"></p>
          <div id="photos"></div>
        </section>
        <button
  id="create-test-photo-button"
  type="button"
>
  Create test photo
</button>
      </main>
    `;
  
    const form =
      container.querySelector<HTMLFormElement>('#auth-form');
  
    const emailInput =
      container.querySelector<HTMLInputElement>('#email');
  
    const passwordInput =
      container.querySelector<HTMLInputElement>('#password');
  
    const logoutButton =
      container.querySelector<HTMLButtonElement>('#logout-button');
  
    const status =
      container.querySelector<HTMLParagraphElement>('#status');
  
    const message =
      container.querySelector<HTMLParagraphElement>('#message');

      const createTestPhotoButton =
      container.querySelector<HTMLButtonElement>(
        '#create-test-photo-button',
      );
      const photos =
  container.querySelector<HTMLDivElement>('#photos');
  
    if (
      !form ||
      !emailInput ||
      !passwordInput ||
      !logoutButton ||
      !status ||
      !message ||
      !createTestPhotoButton
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
      createTestPhotoButton,
    };
  }