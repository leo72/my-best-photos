import {
  useRef,
  useState,
  type SubmitEvent,
} from 'react';

import {
  logClientError,
} from '../../infrastructure/firebase/client-errors';
import { useAppServices } from '../../app/providers';
import { useAuth } from '../auth/auth-provider';
import { getPhotoErrorMessage } from './photo-errors';

export function PhotoUploadForm() {
  const { photoService } = useAppServices();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const isAuthenticated = user !== null;
  const isEnabled = isAuthenticated && !isUploading;

  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!isAuthenticated || isUploading) {
      return;
    }

    const file = fileInputRef.current?.files?.item(0);

    if (!file) {
      setMessage('Choose a photo to upload');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading photo…');

    try {
      await photoService.uploadPhoto(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setMessage(
        'Photo uploaded. It will appear after processing.',
      );
    } catch (error) {
      logClientError('Photo upload failed', error);
      setMessage(getPhotoErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <form
        className="flex flex-col items-stretch gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-end"
        onSubmit={handleSubmit}
      >
        <label className="grid flex-1 gap-2 font-medium text-gray-900">
          Choose a photo
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            disabled={!isEnabled}
            className="w-full rounded-[10px] border border-slate-300 bg-white px-3.5 py-3 text-gray-900 disabled:cursor-default disabled:opacity-50 focus:outline-2 focus:outline-offset-1 focus:outline-blue-300"
          />
        </label>

        <button
          type="submit"
          disabled={!isEnabled}
          className="shrink-0 cursor-pointer rounded-[10px] border-0 bg-gray-200 px-4 py-2.5 text-gray-900 hover:bg-gray-300 disabled:cursor-default disabled:opacity-50"
        >
          Upload
        </button>
      </form>

      <p className="mb-0 text-sm text-slate-500">
        {isAuthenticated
          ? 'JPEG, PNG or WebP, up to 12 MB.'
          : 'Sign in to upload a photo.'}
      </p>

      <p className="mb-0 min-h-6 text-gray-900" role="status">
        {message}
      </p>
    </>
  );
}
