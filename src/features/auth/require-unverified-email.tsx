import { Navigate } from 'react-router-dom';

import type { ReactNode } from 'react';

import { useAuth } from './auth-provider';
import {
  PHOTOS_PATH,
  SIGN_IN_PATH,
} from './signed-in-path';

interface RequireUnverifiedEmailProps {
  children: ReactNode;
}

/** Renders children only for signed-in users who still need to confirm email. */
export function RequireUnverifiedEmail({
  children,
}: RequireUnverifiedEmailProps) {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!user) {
    return <Navigate to={SIGN_IN_PATH} replace />;
  }

  if (user.emailVerified) {
    return <Navigate to={PHOTOS_PATH} replace />;
  }

  return children;
}
