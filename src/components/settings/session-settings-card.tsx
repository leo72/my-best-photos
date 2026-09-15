import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppServices } from '../../app/providers';
import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';
import { Button } from '../ui/button';
import { SettingsCard } from './settings-card';

export function SessionSettingsCard() {
  const { authService } = useAppServices();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  async function handleSignOut(): Promise<void> {
    if (isBusy) {
      return;
    }

    setIsBusy(true);
    setMessage('');

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
    <SettingsCard
      icon={
        <ArrowRightStartOnRectangleIcon
          className="size-5"
          aria-hidden="true"
        />
      }
      title="Session"
      description="Sign out of your account on this device."
    >
      {message ? (
        <p className="mb-3 text-sm text-red-600" role="status">
          {message}
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        disabled={isBusy}
        onClick={() => {
          void handleSignOut();
        }}
      >
        Sign out
      </Button>
    </SettingsCard>
  );
}
