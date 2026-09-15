import { useRef, useState } from 'react';

import { useAppServices } from '../../app/providers';
import {
  logClientError,
} from '../../infrastructure/firebase/client-errors';

import { getPhotoErrorMessage } from './photo-errors';

export function usePhotoUpload() {
  const { photoService } = useAppServices();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  function openFilePicker(): void {
    fileInputRef.current?.click();
  }

  async function uploadFile(file: File | null): Promise<void> {
    if (!file || isUploading) {
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      await photoService.uploadPhoto(file);
    } catch (error) {
      logClientError('Photo upload failed', error);
      setErrorMessage(getPhotoErrorMessage(error));
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return {
    fileInputRef,
    errorMessage,
    isUploading,
    openFilePicker,
    uploadFile,
  };
}
