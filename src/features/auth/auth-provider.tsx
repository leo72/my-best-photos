import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useAppServices } from '../../app/providers';

import type { AuthUser } from './auth-session';

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(
  null,
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { authService } = useAppServices();
  const [user, setUser] = useState<AuthUser | null>(
    () => authService.getCurrentUser(),
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let isSessionReady = false;

    const unsubscribe = authService.subscribe((nextUser) => {
      if (isCancelled || !isSessionReady) {
        return;
      }

      setUser(nextUser);
    });

    void authService
      .reloadCurrentUser()
      .then((nextUser) => {
        if (!isCancelled) {
          setUser(nextUser);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setUser(authService.getCurrentUser());
        }
      })
      .finally(() => {
        if (!isCancelled) {
          isSessionReady = true;
          setIsReady(true);
        }
      });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [authService]);

  return (
    <AuthContext.Provider value={{ user, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
