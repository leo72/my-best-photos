import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppServices } from '../../app/providers';
import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';

const GOOGLE_UNAVAILABLE_MESSAGE =
  'Google sign-in is not available yet. Use email and password.';

type AuthSubmitAction = 'login' | 'register';

interface UseAuthCredentialsFormOptions {
  action: AuthSubmitAction;
  errorFallback: string;
  logMessage: string;
}

export function useAuthCredentialsForm({
  action,
  errorFallback,
  logMessage,
}: UseAuthCredentialsFormOptions) {
  const { authService } = useAppServices();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    setIsBusy(true);
    setMessage('');

    try {
      if (action === 'register') {
        await authService.register(email.trim(), password);
      } else {
        await authService.login(email.trim(), password);
      }

      void navigate('/');
    } catch (error) {
      logClientError(logMessage, error);
      setMessage(getUserErrorMessage(error, errorFallback));
    } finally {
      setIsBusy(false);
    }
  }

  function showGoogleUnavailable(): void {
    setMessage(GOOGLE_UNAVAILABLE_MESSAGE);
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    message,
    setMessage,
    isBusy,
    handleSubmit,
    showGoogleUnavailable,
  };
}
