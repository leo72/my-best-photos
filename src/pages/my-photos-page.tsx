import { MyPhotosEmptyState } from '../components/photos/my-photos-empty-state';
import { MyPhotosEmptySteps } from '../components/photos/my-photos-empty-steps';
import { MyPhotosFilledState } from '../components/photos/my-photos-filled-state';
import { MyPhotosProcessingState } from '../components/photos/my-photos-processing-state';
import { Container } from '../components/layout/container';
import { SiteLayout } from '../components/layout/site-layout';
import { RequireAuth } from '../features/auth/require-auth';
import { useMyPhotos } from '../features/photos/use-my-photos';

function MyPhotosContent() {
  const myPhotos = useMyPhotos();

  if (myPhotos.status === 'loading') {
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

  const { readyPhotos, pendingCount } = myPhotos.snapshot;

  if (readyPhotos.length > 0) {
    return (
      <MyPhotosFilledState
        photos={readyPhotos}
        pendingCount={pendingCount}
      />
    );
  }

  if (pendingCount > 0) {
    return <MyPhotosProcessingState />;
  }

  return (
    <>
      <MyPhotosEmptyState />
      <div className="mt-10 sm:mt-12">
        <MyPhotosEmptySteps />
      </div>
    </>
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
                Keep the photos you actually use — profiles, CV,
                family, and more.
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
