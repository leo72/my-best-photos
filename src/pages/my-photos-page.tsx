import { CollectionSettingsPanel } from '../components/collection/collection-settings-panel';
import { MyPhotosEmptyState } from '../components/photos/my-photos-empty-state';
import { MyPhotosEmptySteps } from '../components/photos/my-photos-empty-steps';
import { MyPhotosFilledState } from '../components/photos/my-photos-filled-state';
import { MyPhotosProcessingState } from '../components/photos/my-photos-processing-state';
import { Container } from '../components/layout/container';
import { SiteLayout } from '../components/layout/site-layout';
import { RequireAuth } from '../features/auth/require-auth';
import { useAuth } from '../features/auth/auth-provider';
import { useCollection } from '../features/collection/use-collection';
import { useMyPhotos } from '../features/photos/use-my-photos';

function MyPhotosContent() {
  const { user } = useAuth();
  const myPhotos = useMyPhotos();
  const collection = useCollection(user?.id);

  if (
    myPhotos.status === 'loading'
    || collection.status === 'loading'
  ) {
    return (
      <p className="text-sm text-slate-500" role="status">
        Loading photos…
      </p>
    );
  }

  if (myPhotos.status === 'error') {
    return (
      <p className="text-sm text-red-600" role="alert">
        {myPhotos.message}
      </p>
    );
  }

  if (collection.status === 'error' || !user) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {collection.status === 'error'
          ? collection.message
          : 'Sign in to manage your photos'}
      </p>
    );
  }

  const { readyPhotos, pendingCount } = myPhotos.snapshot;

  return (
    <div className="grid gap-6">
      <CollectionSettingsPanel
        ownerId={user.id}
        profile={collection.profile}
      />

      {readyPhotos.length > 0 ? (
        <MyPhotosFilledState
          photos={readyPhotos}
          pendingCount={pendingCount}
        />
      ) : pendingCount > 0 ? (
        <MyPhotosProcessingState />
      ) : (
        <>
          <MyPhotosEmptyState />
          <div className="mt-4 sm:mt-6">
            <MyPhotosEmptySteps />
          </div>
        </>
      )}
    </div>
  );
}

export function MyPhotosPage() {
  return (
    <RequireAuth>
      <SiteLayout>
        <div className="flex flex-1 flex-col bg-slate-50">
          <Container
            as="main"
            className="py-10 sm:py-12"
          >
            <header className="text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                My Photos
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Keep up to 10 photos you actually use.
              </p>
            </header>

            <div className="mt-8">
              <MyPhotosContent />
            </div>
          </Container>
        </div>
      </SiteLayout>
    </RequireAuth>
  );
}
