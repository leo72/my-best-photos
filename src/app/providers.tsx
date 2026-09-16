/**
 * App-wide service wiring: Firebase adapters → domain services → React context.
 */
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { AuthProvider } from '../features/auth/auth-provider';
import type { AuthService } from '../features/auth/auth-session';
import {
  createCollectionService,
  type CollectionService,
} from '../features/collection/collection-service';
import {
  createPhotoService,
  type PhotoService,
} from '../features/photos/photo-service';
import { createFirebaseAuthService } from '../infrastructure/firebase/firebase-auth-service';
import { createFirebaseCollectionRepository } from '../infrastructure/firebase/firebase-collection-repository';
import { createFirebasePhotoRepository } from '../infrastructure/firebase/firebase-photo-repository';
import { createFirebasePhotoUploadGateway } from '../infrastructure/firebase/firebase-photo-upload-gateway';

/** Composition root for auth, photos, and collection services. */
interface AppServices {
  authService: AuthService;
  photoService: PhotoService;
  collectionService: CollectionService;
}

const AppServicesContext = createContext<AppServices | null>(
  null,
);

/** Builds Firebase-backed services once for the app lifetime. */
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
  const collectionService = createCollectionService({
    repository: createFirebaseCollectionRepository(),
  });

  return { authService, photoService, collectionService };
}

/** Provides app services and auth session to the React tree. */
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

/** Access the composition-root services; must be under AppProviders. */
export function useAppServices(): AppServices {
  const services = useContext(AppServicesContext);

  if (!services) {
    throw new Error(
      'useAppServices must be used within AppProviders',
    );
  }

  return services;
}
