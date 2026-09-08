import { useCallback, useEffect, useState } from 'react';

import { useRepositories } from '@/storage/repositoryContext';

export type ProfileNameView = {
  draft: string;
  isSaved: boolean;
  didFail: boolean;
};

/**
 * The one editable thing about the profile.
 *
 * The name is written through `update`, so `createdAt` survives — it is the day the user first
 * opened the app, and rewriting the record from scratch would quietly move it to today.
 */
export const useProfileName = () => {
  const repositories = useRepositories();
  const [view, setView] = useState<ProfileNameView>({
    draft: '',
    isSaved: false,
    didFail: false,
  });

  const load = useCallback(async () => {
    const stored = await repositories.profile.read();

    if (!stored.ok) {
      return;
    }

    setView({ draft: stored.value?.name ?? '', isSaved: false, didFail: false });
  }, [repositories]);

  useEffect(() => {
    load();
  }, [load]);

  const changeDraft = (text: string) => {
    setView((current) => ({ ...current, draft: text, isSaved: false, didFail: false }));
  };

  const save = async (): Promise<boolean> => {
    const trimmed = view.draft.trim();
    const createdAt = repositories.clock.now().toISOString();

    const written = await repositories.profile
      .update((current) => ({
        name: trimmed.length === 0 ? null : trimmed,
        createdAt: current?.createdAt ?? createdAt,
      }))
      .catch(() => ({ ok: false }));

    setView((current) => ({ ...current, isSaved: written.ok, didFail: !written.ok }));

    return written.ok;
  };

  return { ...view, changeDraft, save };
};
