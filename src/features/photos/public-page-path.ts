export function getPublicPagePath(ownerId: string): string {
  return `/u/${ownerId}`;
}

export function getPublicPageUrl(ownerId: string): string {
  const path = getPublicPagePath(ownerId);

  if (typeof window === 'undefined') {
    return path;
  }

  return `${window.location.origin}${path}`;
}
