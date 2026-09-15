import { ArrowRightIcon } from '@heroicons/react/24/outline';

import { useAuthCredentialsForm } from '../../features/auth/use-auth-credentials-form';
import { Button } from '../ui/button';
import { TextLink } from '../ui/text-link';
import { AuthCard } from './card';
import { EmailField, PasswordField } from './fields';
import { AuthFormMessage } from './form-message';

export function CreatePageForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    message,
    isBusy,
    handleSubmit,
    showGoogleUnavailable,
  } = useAuthCredentialsForm({
    action: 'register',
    errorFallback: 'Could not create your page',
    logMessage: 'Registration failed',
  });

  return (
    <AuthCard
      title="Create your page"
      subtitle="Get started in seconds. Upload up to 10 photos and share a simple link with the world."
      isGoogleBusy={isBusy}
      onGoogleContinue={showGoogleUnavailable}
      footer={
        <>
          By creating an account, you agree to our{' '}
          <TextLink to="/terms">Terms of Service</TextLink>
          {' '}and{' '}
          <TextLink to="/privacy">Privacy Policy</TextLink>.
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          value={password}
          disabled={isBusy}
          onChange={(event) => setPassword(event.target.value)}
        />

        <AuthFormMessage message={message} />

        <Button
          type="submit"
          disabled={isBusy}
          className="w-full"
        >
          Create my page
          <ArrowRightIcon className="size-4" />
        </Button>
      </form>
    </AuthCard>
  );
}
