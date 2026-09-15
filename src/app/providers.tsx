import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { AuthProvider } from '../features/auth/auth-provider';
import type { AuthService } from '../features/auth/auth-session';
import {
  createPhotoService,
  type PhotoService,
} from '../features/photos/photo-service';
import { createFirebaseAuthService } from '../infrastructure/firebase/firebase-auth-service';
import { createFirebasePhotoRepository } from '../infrastructure/firebase/firebase-photo-repository';
import { createFirebasePhotoUploadGateway } from '../infrastructure/firebase/firebase-photo-upload-gateway';

interface AppServices {
  authService: AuthService;
  photoService: PhotoService;
}

const AppServicesContext = createContext<AppServices | null>(
  null,
);

function createAppServices(): AppServices {
  const authService = createFirebaseAuthService();
  const photoService = createPhotoService({
    authSession: {
      getCurrentUserId: () =>
        authService.getCurrentUser()?.id ?? null,
    },
    repository: createFirebasePhotoRepository(),
    uploadGateway: createFirebasePhotoUploadGateway(),
  });

  return { authService, photoService };
}

export function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  const services = useMemo(() => createAppServices(), []);

  return (
    <AppServicesContext.Provider value={services}>
      <AuthProvider>{children}</AuthProvider>
    </AppServicesContext.Provider>
  );
}

export function useAppServices(): AppServices {
  const services = useContext(AppServicesContext);

  if (!services) {
    throw new Error(
      'useAppServices must be used within AppProviders',
    );
  }

  return services;
}
