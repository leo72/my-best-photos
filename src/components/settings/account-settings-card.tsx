import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useState, type SubmitEvent } from 'react';

import { useAppServices } from '../../app/providers';
import { useAuth } from '../../features/auth/auth-provider';
import {
  getUserErrorMessage,
  logClientError,
} from '../../infrastructure/firebase/client-errors';
import { Button } from '../ui/button';
import { SettingsCard } from './settings-card';

export function AccountSettingsCard() {
  const { authService } = useAppServices();
  const { user } = useAuth();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  async function handleChangePassword(
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    setIsBusy(true);
    setMessage('');

    try {
      await authService.changePassword(
        currentPassword,
        newPassword,
      );
      setCurrentPassword('');
      setNewPassword('');
      setIsEditingPassword(false);
      setMessage('Password updated.');
    } catch (error) {
      logClientError('Password change failed', error);
      setMessage(
        getUserErrorMessage(error, 'Could not change password'),
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <SettingsCard
      icon={<EnvelopeIcon className="size-5" aria-hidden="true" />}
      title="Account"
      description="Manage your account security."
    >
      <label className="grid gap-2 text-sm font-medium text-slate-950">
        Email
        <input
          type="email"
          value={user?.email ?? ''}
          readOnly
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700"
        />
      </label>

      {isEditingPassword ? (
        <form
          className="mt-4 grid gap-3"
          onSubmit={handleChangePassword}
        >
          <label className="grid gap-2 text-sm font-medium text-slate-950">
            Current password
            <input
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={currentPassword}
              disabled={isBusy}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 focus:border-slate-400 focus:outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-950">
            New password
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              disabled={isBusy}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 focus:border-slate-400 focus:outline-none"
            />
          </label>

          {message ? (
            <p
              className={`m-0 text-sm ${message === 'Password updated.' ? 'text-emerald-600' : 'text-red-600'}`}
              role="status"
            >
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isBusy}>
              Save password
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isBusy}
              onClick={() => {
                setIsEditingPassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setMessage('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4">
          {message ? (
            <p
              className="mb-3 text-sm text-emerald-600"
              role="status"
            >
              {message}
            </p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setMessage('');
              setIsEditingPassword(true);
            }}
          >
            Change password
          </Button>
        </div>
      )}
    </SettingsCard>
  );
}
