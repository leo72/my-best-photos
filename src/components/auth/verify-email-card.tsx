import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppServices } from '../../app/providers';
import { useAuth } from '../../features/auth/auth-provider';
import { PHOTOS_PATH } from '../../features/auth/signed-in-path';
import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';
import { Button } from '../ui/button';
import { TextLinkButton } from '../ui/text-link';
import { AuthFormMessage } from './form-message';

/** How often to refresh the user while waiting for the inbox confirmation link. */
const RELOAD_INTERVAL_MS = 4000;

export function VerifyEmailCard() {
  const { authService } = useAppServices();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void authService.reloadCurrentUser();
    }, RELOAD_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [authService]);

  async function handleConfirmed(): Promise<void> {
    if (isBusy) {
      return;
    }

    setIsBusy(true);
    setMessage('');
    setStatusMessage('');

    try {
      const nextUser = await authService.reloadCurrentUser();

      if (nextUser?.emailVerified) {
        void navigate(PHOTOS_PATH);
        return;
      }

      setMessage(
        'Email is not confirmed yet. Open the link we sent, then try again.',
      );
    } catch (error) {
      logClientError('Email verification reload failed', error);
      setMessage(
        getUserErrorMessage(error, 'Could not check confirmation'),
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleResend(): Promise<void> {
    if (isBusy) {
      return;
    }

    setIsBusy(true);
    setMessage('');
    setStatusMessage('');

    try {
      await authService.resendEmailVerification();
      setStatusMessage('Confirmation email sent again.');
    } catch (error) {
      logClientError('Resend verification email failed', error);
      setMessage(
        getUserErrorMessage(
          error,
          'Could not send confirmation email',
        ),
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    if (isBusy) {
      return;
    }

    setIsBusy(true);
    setMessage('');
    setStatusMessage('');

    try {
      await authService.logout();
      void navigate('/');
    } catch (error) {
      logClientError('Sign out failed', error);
      setMessage(getUserErrorMessage(error, 'Sign out failed'));
      setIsBusy(false);
    }
  }

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Confirm your email
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          We sent a confirmation link to{' '}
          <span className="font-medium text-slate-950">
            {user?.email ?? 'your email'}
          </span>
          . Open it, then continue here.
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        <AuthFormMessage message={message} />

        {statusMessage ? (
          <p className="m-0 text-sm text-emerald-600" role="status">
            {statusMessage}
          </p>
        ) : null}

        <Button
          type="button"
          disabled={isBusy}
          className="w-full"
          onClick={() => {
            void handleConfirmed();
          }}
        >
          I&apos;ve confirmed
        </Button>

        <p className="m-0 text-center text-sm text-slate-500">
          Didn&apos;t get the email?{' '}
          <TextLinkButton
            disabled={isBusy}
            onClick={() => {
              void handleResend();
            }}
          >
            Send it again
          </TextLinkButton>
        </p>
      </div>

      <div className="mt-6 text-center text-sm text-slate-500">
        <TextLinkButton
          disabled={isBusy}
          onClick={() => {
            void handleSignOut();
          }}
        >
          Sign out
        </TextLinkButton>
      </div>
    </section>
  );
}
