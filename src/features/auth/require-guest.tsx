import { Navigate } from 'react-router-dom';

import type { ReactNode } from 'react';

import { useAuth } from './auth-provider';

interface RequireGuestProps {
  children: ReactNode;
}

/** Renders children only for signed-out users; otherwise redirects to My Photos. */
export function RequireGuest({ children }: RequireGuestProps) {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  if (user) {
    return <Navigate to="/photos" replace />;
  }

  return children;
}
