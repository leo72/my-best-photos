import { CollectionSettingsPanel } from '../components/collection/collection-settings-panel';
import { MyPhotosEmptyState } from '../components/photos/my-photos-empty-state';
import { MyPhotosEmptySteps } from '../components/photos/my-photos-empty-steps';
import { MyPhotosFailedNotice } from '../components/photos/my-photos-failed-notice';
import { MyPhotosFilledState } from '../components/photos/my-photos-filled-state';
import { MyPhotosProcessingState } from '../components/photos/my-photos-processing-state';
import { Container } from '../components/layout/container';
import { SiteLayout } from '../components/layout/site-layout';
import { RequireAuth } from '../features/auth/require-auth';
import { useAuth } from '../features/auth/auth-provider';
import { useCollection } from '../features/collection/use-collection';
import { MAX_PHOTO_SLOTS } from '../features/photos/photo';
import { useMyPhotos } from '../features/photos/use-my-photos';
import { usePhotoUpload } from '../features/photos/use-photo-upload';

function MyPhotosContent() {
  const { user } = useAuth();
  const myPhotos = useMyPhotos();
  const collection = useCollection(user?.id);
  const usedCount = myPhotos.status === 'ready'
    ? myPhotos.snapshot.readyPhotos.length
      + myPhotos.snapshot.pendingCount
    : 0;
  const upload = usePhotoUpload({
    remainingSlots: MAX_PHOTO_SLOTS - usedCount,
  });

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

  const { readyPhotos, pendingCount, failedPhotos } =
    myPhotos.snapshot;

  return (
    <div className="grid gap-6">
      <CollectionSettingsPanel
        ownerId={user.id}
        profile={collection.profile}
      />

      <input
        ref={upload.fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        disabled={upload.isUploading}
        onChange={(event) => {
          void upload.uploadFiles(event.target.files);
        }}
      />

      <MyPhotosFailedNotice
        key={user.id}
        ownerId={user.id}
        photos={failedPhotos}
      />

      {readyPhotos.length > 0 ? (
        <MyPhotosFilledState
          ownerId={user.id}
          photos={readyPhotos}
          photoOrder={collection.profile.photoOrder}
          pendingCount={pendingCount}
          upload={upload}
        />
      ) : pendingCount > 0 ? (
        <MyPhotosProcessingState
          errorMessage={upload.errorMessage}
        />
      ) : (
        <>
          <MyPhotosEmptyState upload={upload} />
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
