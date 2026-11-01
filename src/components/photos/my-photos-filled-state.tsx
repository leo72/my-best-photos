import { MAX_PHOTO_SLOTS } from '../../features/photos/photo';

import type { GalleryPhoto } from '../../features/photos/photo';
import type { PhotoUploadControls } from '../../features/photos/use-photo-upload';

import { MyPhotoCard } from './my-photo-card';
import { MyPhotosInfoBanner } from './my-photos-info-banner';
import { MyPhotosToolbar } from './my-photos-toolbar';
import { MyPhotosUploadSlot } from './my-photos-upload-slot';

interface MyPhotosFilledStateProps {
  photos: readonly GalleryPhoto[];
  pendingCount: number;
  upload: PhotoUploadControls;
}

export function MyPhotosFilledState({
  photos,
  pendingCount,
  upload,
}: MyPhotosFilledStateProps) {
  const usedCount = photos.length + pendingCount;
  const canUpload = usedCount < MAX_PHOTO_SLOTS;

  return (
    <div className="grid gap-6">
      <MyPhotosToolbar
        usedCount={usedCount}
        canUpload={canUpload}
        upload={upload}
      />

      {pendingCount > 0 ? (
        <p className="text-sm text-slate-500" role="status">
          Processing {pendingCount} photo
          {pendingCount === 1 ? '' : 's'}…
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <MyPhotoCard key={photo.id} photo={photo} />
        ))}
        {canUpload ? (
          <MyPhotosUploadSlot upload={upload} />
        ) : null}
      </div>

      <MyPhotosInfoBanner />
    </div>
  );
}
