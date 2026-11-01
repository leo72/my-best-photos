import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useState } from 'react';

import { useSavePhotoOrder } from '../../features/collection/use-collection';
import { MAX_PHOTO_SLOTS } from '../../features/photos/photo';
import { photoDisplayTitle } from '../../features/photos/photo-labels';
import { sortPhotosByOrder } from '../../features/photos/photo-order';

import type { GalleryPhoto } from '../../features/photos/photo';
import type { PhotoUploadControls } from '../../features/photos/use-photo-upload';

import { MyPhotoCard } from './my-photo-card';
import { MyPhotosInfoBanner } from './my-photos-info-banner';
import { MyPhotosToolbar } from './my-photos-toolbar';
import { MyPhotosUploadSlot } from './my-photos-upload-slot';

interface MyPhotosFilledStateProps {
  ownerId: string;
  photos: readonly GalleryPhoto[];
  photoOrder: readonly number[];
  pendingCount: number;
  upload: PhotoUploadControls;
}

interface LocalPhotoOrder {
  order: readonly number[];
  /** The saved order this was made from; a newer snapshot replaces it. */
  basis: readonly number[];
}

export function MyPhotosFilledState({
  ownerId,
  photos,
  photoOrder,
  pendingCount,
  upload,
}: MyPhotosFilledStateProps) {
  const {
    isSaving,
    errorMessage,
    savePhotoOrder,
  } = useSavePhotoOrder(ownerId);
  const [localOrder, setLocalOrder] =
    useState<LocalPhotoOrder | null>(null);
  // Mouse drags start after a small move; touch needs a press and
  // hold so swiping still scrolls the page.
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const visibleOrder = localOrder?.basis === photoOrder
    ? localOrder.order
    : photoOrder;
  const orderedPhotos = sortPhotosByOrder(photos, visibleOrder);
  const photoIds = orderedPhotos.map((photo) => photo.id);
  const usedCount = photos.length + pendingCount;
  const canUpload = usedCount < MAX_PHOTO_SLOTS;
  const canReorder = orderedPhotos.length > 1;

  function titleOf(id: UniqueIdentifier): string {
    const photo = orderedPhotos.find((entry) => entry.id === id);
    return photo ? photoDisplayTitle(photo) : 'Photo';
  }

  function positionOf(id: UniqueIdentifier): string {
    return `position ${photoIds.indexOf(String(id)) + 1} of ${photoIds.length}`;
  }

  function handleDragEnd({ active, over }: DragEndEvent): void {
    if (!over || active.id === over.id) {
      return;
    }

    const nextOrder = arrayMove(
      orderedPhotos,
      photoIds.indexOf(String(active.id)),
      photoIds.indexOf(String(over.id)),
    ).map((photo) => photo.slot);

    setLocalOrder({ order: nextOrder, basis: photoOrder });
    void savePhotoOrder(nextOrder).then((saved) => {
      if (!saved) {
        setLocalOrder(null);
      }
    });
  }

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

      {canReorder ? (
        <div className="grid gap-1">
          <p className="text-sm text-slate-500">
            Drag photos to set their order on your page. On a
            touch screen, press and hold a photo first.
          </p>
          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) =>
              `Picked up ${titleOf(active.id)}.`,
            onDragOver: ({ active, over }) =>
              over
                ? `${titleOf(active.id)} moved to ${positionOf(over.id)}.`
                : `${titleOf(active.id)} is not over a position.`,
            onDragEnd: ({ active, over }) =>
              over
                ? `${titleOf(active.id)} dropped at ${positionOf(over.id)}.`
                : `${titleOf(active.id)} dropped.`,
            onDragCancel: ({ active }) =>
              `Moving ${titleOf(active.id)} was cancelled.`,
          },
        }}
      >
        <SortableContext
          items={photoIds}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {orderedPhotos.map((photo) => (
              <MyPhotoCard
                key={photo.id}
                photo={photo}
                canReorder={canReorder}
                isReorderDisabled={isSaving}
              />
            ))}
            {canUpload ? (
              <MyPhotosUploadSlot upload={upload} />
            ) : null}
          </div>
        </SortableContext>
      </DndContext>

      <MyPhotosInfoBanner />
    </div>
  );
}
