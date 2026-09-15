import {
  getUserErrorMessage,
} from '../../infrastructure/firebase/client-errors';

export function getPhotoErrorMessage(
  error: unknown,
  fallback = 'Failed to upload photo',
): string {
  if (error instanceof Error) {
    const domainMessages: Readonly<Record<string, string>> = {
      'authentication-required':
        'Sign in before uploading a photo',
      'empty-photo': 'Image must not be empty',
      'invalid-photo-slot': 'That photo could not be found',
      'photo-too-large': 'Image must not exceed 12 MB',
      'unsupported-photo-type':
        'Only JPEG, PNG and WebP images are supported',
    };
    const domainMessage = domainMessages[error.message];

    if (domainMessage) {
      return domainMessage;
    }
  }

  return getUserErrorMessage(error, fallback);
}
