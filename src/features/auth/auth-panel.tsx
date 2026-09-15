import {
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react';

import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';
import { useAppServices } from '../../app/providers';
import { useAuth } from './auth-provider';

import type { AuthAction } from './auth-session';

function isAuthAction(value: string): value is AuthAction {
  return value === 'register' || value === 'login';
}

export function AuthPanel() {
  const { authService } = useAppServices();
  const { user, isReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const statusText = !isReady
    ? 'Checking authentication...'
    : user
      ? `Current user: ${user.email ?? user.id}`
      : 'Current user: none';

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    const submitter = (
      event.nativeEvent as SubmitEvent
    ).submitter;

    if (!(submitter instanceof HTMLButtonElement)) {
      return;
    }

    const action = submitter.value;

    if (!isAuthAction(action)) {
      return;
    }

    setIsBusy(true);
    setMessage('');

    try {
      const nextUser = action === 'register'
        ? await authService.register(
          email.trim(),
          password,
        )
        : await authService.login(email.trim(), password);

      setPassword('');
      setMessage(
        action === 'register'
          ? `Registered: ${nextUser.email ?? ''}`
          : `Logged in: ${nextUser.email ?? ''}`,
      );
    } catch (error) {
      logClientError('Authentication request failed', error);
      setMessage(
        getUserErrorMessage(error, 'Authentication failed'),
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLogout(
    event: MouseEvent<HTMLButtonElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    setIsBusy(true);
    setMessage('');

    try {
      await authService.logout();
      setPassword('');
    } catch (error) {
      logClientError('Logout failed', error);
      setMessage(getUserErrorMessage(error, 'Logout failed'));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">
      <h2 className="mt-0 mb-6 text-xl font-semibold text-gray-900">
        Authentication
      </h2>

      <form className="grid gap-[18px]" onSubmit={handleSubmit}>
        <label className="grid gap-2 font-medium text-gray-900">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-[10px] border border-slate-300 bg-white px-3.5 py-3 text-gray-900 focus:outline-2 focus:outline-offset-1 focus:outline-blue-300"
          />
        </label>

        <label className="grid gap-2 font-medium text-gray-900">
          Password
          <input
            type="password"
            autoComplete="current-password"
            minLength={6}
            required
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className="w-full rounded-[10px] border border-slate-300 bg-white px-3.5 py-3 text-gray-900 focus:outline-2 focus:outline-offset-1 focus:outline-blue-300"
          />
        </label>

        <div className="mt-1 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <button
            type="submit"
            name="action"
            value="register"
            disabled={isBusy}
            className="cursor-pointer rounded-[10px] border-0 bg-gray-200 px-4 py-2.5 text-gray-900 hover:bg-gray-300 disabled:cursor-default disabled:opacity-50 sm:w-auto w-full"
          >
            Register
          </button>

          <button
            type="submit"
            name="action"
            value="login"
            disabled={isBusy}
            className="cursor-pointer rounded-[10px] border-0 bg-gray-200 px-4 py-2.5 text-gray-900 hover:bg-gray-300 disabled:cursor-default disabled:opacity-50 sm:w-auto w-full"
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isBusy || user === null}
            className="cursor-pointer rounded-[10px] border-0 bg-gray-200 px-4 py-2.5 text-gray-900 hover:bg-gray-300 disabled:cursor-default disabled:opacity-50 sm:w-auto w-full"
          >
            Logout
          </button>
        </div>
      </form>

      <p className="mb-0 mt-4 text-gray-900">{statusText}</p>
      <p className="mb-0 mt-2 min-h-6 text-gray-900" role="status">
        {message}
      </p>
    </section>
  );
}
