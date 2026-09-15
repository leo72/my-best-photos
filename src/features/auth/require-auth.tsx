import { Navigate } from 'react-router-dom';

import type { ReactNode } from 'react';

import { useAuth } from './auth-provider';

interface RequireAuthProps {
  children: ReactNode;
}

/** Renders children only for signed-in users; otherwise redirects to sign-in. */
export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}
