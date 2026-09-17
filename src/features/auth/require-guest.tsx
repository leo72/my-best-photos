import { Navigate } from 'react-router-dom';

import type { ReactNode } from 'react';

import { useAuth } from './auth-provider';
import { getSignedInPath } from './signed-in-path';

interface RequireGuestProps {
  children: ReactNode;
}

/** Renders children only for signed-out users; otherwise redirects. */
export function RequireGuest({ children }: RequireGuestProps) {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  if (user) {
    return <Navigate to={getSignedInPath(user)} replace />;
  }

  return children;
}
