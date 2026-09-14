export function getPublicStorageObjectUrl(
  storageBucket: string,
  objectPath: string,
  isEmulated: boolean,
): string {
  const origin = isEmulated
    ? 'http://127.0.0.1:9199'
    : 'https://firebasestorage.googleapis.com';

  return `${origin}/v0/b/${encodeURIComponent(
    storageBucket,
  )}/o/${encodeURIComponent(objectPath)}?alt=media`;
}
