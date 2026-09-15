export function getPublicPagePath(ownerId: string): string {
  return `/u/${ownerId}`;
}

export function getPublicPageUrl(ownerId: string): string {
  const path = getPublicPagePath(ownerId);
  const hashPath = path.startsWith('/') ? path.slice(1) : path;

  if (typeof window === 'undefined') {
    return `#/${hashPath}`;
  }

  return `${window.location.origin}${window.location.pathname}#/${hashPath}`;
}
