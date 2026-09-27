import { useRef, useState } from 'react';

import { useAppServices } from '../../app/providers';
import {
  logClientError,
} from '../../infrastructure/firebase/client-errors';

import { MAX_PHOTO_SLOTS } from './photo';
import { getPhotoErrorMessage } from './photo-errors';

interface UsePhotoUploadOptions {
  remainingSlots?: number;
}

function toFileList(files: FileList | readonly File[] | null): File[] {
  if (!files) {
    return [];
  }

  return Array.from(files).filter((file) => file.size > 0);
}

export function usePhotoUpload({
  remainingSlots = MAX_PHOTO_SLOTS,
}: UsePhotoUploadOptions = {}) {
  const { photoService } = useAppServices();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploadingRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  function openFilePicker(): void {
    fileInputRef.current?.click();
  }

  async function uploadFiles(
    files: FileList | readonly File[] | null,
  ): Promise<void> {
    const selected = toFileList(files);
    const pickedCount = files ? files.length : 0;

    if (isUploadingRef.current) {
      return;
    }

    if (selected.length === 0) {
      if (pickedCount > 0) {
        setErrorMessage('Image must not be empty');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    const slotsLeft = Math.max(0, remainingSlots);

    if (slotsLeft === 0) {
      setErrorMessage('All photo slots are occupied');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    const filesToUpload = selected.slice(0, slotsLeft);
    const skippedCount = selected.length - filesToUpload.length;

    isUploadingRef.current = true;
    setIsUploading(true);
    setErrorMessage('');

    let failureMessage = '';

    try {
      for (const file of filesToUpload) {
        try {
          await photoService.uploadPhoto(file);
        } catch (error) {
          logClientError('Photo upload failed', error);
          failureMessage = getPhotoErrorMessage(error);
        }
      }

      if (skippedCount > 0) {
        const uploadedCount = filesToUpload.length;
        const capacityMessage =
          uploadedCount === 1
            ? 'Only 1 more photo can be added. Extra files were skipped.'
            : `Only ${uploadedCount} more photos can be added. Extra files were skipped.`;
        setErrorMessage(
          failureMessage
            ? `${failureMessage} ${capacityMessage}`
            : capacityMessage,
        );
      } else if (failureMessage) {
        setErrorMessage(failureMessage);
      }
    } finally {
      isUploadingRef.current = false;
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
    uploadFiles,
  };
}
