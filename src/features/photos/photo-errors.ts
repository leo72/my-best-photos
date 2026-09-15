import {
  getUserErrorMessage,
} from '../../infrastructure/firebase/client-errors';

export function getPhotoErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const domainMessages: Readonly<Record<string, string>> = {
      'authentication-required':
        'Sign in before uploading a photo',
      'empty-photo': 'Image must not be empty',
      'photo-too-large': 'Image must not exceed 12 MB',
      'unsupported-photo-type':
        'Only JPEG, PNG and WebP images are supported',
    };
    const domainMessage = domainMessages[error.message];

    if (domainMessage) {
      return domainMessage;
    }
  }

  return getUserErrorMessage(error, 'Failed to upload photo');
}
