import { useEffect, useState } from 'react';

import {
  MAX_COLLECTION_TITLE_LENGTH,
  type CollectionProfile,
  type CollectionType,
} from '../../features/collection/collection';
import {
  COLLECTION_TYPE_OPTIONS,
} from '../../features/collection/collection-options';
import {
  titleForCollectionTypeChange,
} from '../../features/collection/collection-service';
import {
  useSaveCollection,
} from '../../features/collection/use-collection';

interface CollectionSettingsPanelProps {
  ownerId: string;
  profile: CollectionProfile;
}

export function CollectionSettingsPanel({
  ownerId,
  profile,
}: CollectionSettingsPanelProps) {
  const { isSaving, errorMessage, saveCollection } =
    useSaveCollection(ownerId);
  const [collectionType, setCollectionType] =
    useState<CollectionType>(profile.collectionType);
  const [title, setTitle] = useState(profile.title);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setCollectionType(profile.collectionType);
    setTitle(profile.title);
  }, [profile]);

  async function persist(next: {
    collectionType: CollectionType;
    title: string;
  }): Promise<void> {
    const saved = await saveCollection(next);

    if (saved) {
      setStatusMessage('Saved');
      window.setTimeout(() => {
        setStatusMessage('');
      }, 1_500);
    }
  }

  function handleTypeChange(nextType: CollectionType): void {
    const nextTitle = titleForCollectionTypeChange(
      nextType,
      title,
      collectionType,
    );

    setCollectionType(nextType);
    setTitle(nextTitle);
    void persist({
      collectionType: nextType,
      title: nextTitle,
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-slate-950">
          Page style
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          This determines how your public page will look.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {COLLECTION_TYPE_OPTIONS.map((option) => {
            const isSelected = option.type === collectionType;

            return (
              <button
                key={option.type}
                type="button"
                disabled={isSaving}
                className={[
                  'cursor-pointer rounded-2xl border px-4 py-4 text-left transition-colors',
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                ].join(' ')}
                onClick={() => {
                  if (option.type !== collectionType) {
                    handleTypeChange(option.type);
                  }
                }}
              >
                <option.Icon
                  className={[
                    'size-6',
                    isSelected
                      ? 'text-blue-600'
                      : 'text-slate-500',
                  ].join(' ')}
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  {option.label}
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {option.description}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {option.lookLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <label className="grid gap-2 text-sm font-medium text-slate-950">
          Page title
          <div className="relative">
            <input
              type="text"
              value={title}
              maxLength={MAX_COLLECTION_TITLE_LENGTH}
              disabled={isSaving}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 pr-16 text-sm font-normal text-slate-950 focus:outline-2 focus:outline-offset-1 focus:outline-blue-300"
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              onBlur={() => {
                void persist({
                  collectionType,
                  title,
                });
              }}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400">
              {title.trim().length}/{MAX_COLLECTION_TITLE_LENGTH}
            </span>
          </div>
        </label>

        {(statusMessage || errorMessage) ? (
          <p
            className={[
              'mt-3 text-sm',
              errorMessage ? 'text-red-600' : 'text-slate-500',
            ].join(' ')}
            role={errorMessage ? 'alert' : 'status'}
          >
            {errorMessage || statusMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}
