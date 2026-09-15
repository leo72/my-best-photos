import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

import { useAuthCredentialsForm } from '../../features/auth/use-auth-credentials-form';
import { Button } from '../ui/button';
import { TextLink, TextLinkButton } from '../ui/text-link';
import { AuthCard } from './card';
import { EmailField, PasswordField } from './fields';
import { AuthFormMessage } from './form-message';

export function SignInForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    message,
    setMessage,
    isBusy,
    handleSubmit,
    showGoogleUnavailable,
  } = useAuthCredentialsForm({
    action: 'login',
    errorFallback: 'Sign in failed',
    logMessage: 'Sign in failed',
  });
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back! Sign in to manage your photos."
      isGoogleBusy={isBusy}
      onGoogleContinue={showGoogleUnavailable}
      footer={
        <>
          Don&apos;t have an account?{' '}
          <TextLink to="/create">Create your page</TextLink>
        </>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <EmailField
          value={email}
          disabled={isBusy}
          onChange={(event) => setEmail(event.target.value)}
        />

        <PasswordField
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          disabled={isBusy}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={keepSignedIn}
              disabled={isBusy}
              onChange={(event) =>
                setKeepSignedIn(event.target.checked)
              }
              className="size-4 rounded border-slate-300 accent-blue-600"
            />
            Keep me signed in
          </label>

          <TextLinkButton
            onClick={() => {
              setMessage(
                'Password reset is not available yet.',
              );
            }}
          >
            Forgot password?
          </TextLinkButton>
        </div>

        <AuthFormMessage message={message} />

        <Button
          type="submit"
          disabled={isBusy}
          className="w-full"
        >
          Sign in
          <ArrowRightIcon className="size-4" />
        </Button>
      </form>
    </AuthCard>
  );
}
