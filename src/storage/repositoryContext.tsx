import { createContext, ReactNode, useContext } from 'react';

import { Repositories } from './repositories/buildRepositories';

const RepositoryContext = createContext<Repositories | null>(null);

export type RepositoryProviderProps = {
  repositories: Repositories;
  children: ReactNode;
};

/**
 * Hands the repository set built by the composition root down to the screens. Nothing below this
 * point ever constructs an adapter, which is what keeps every feature testable over the in-memory
 * doubles.
 */
export const RepositoryProvider = ({ repositories, children }: RepositoryProviderProps) => {
  return <RepositoryContext value={repositories}>{children}</RepositoryContext>;
};

export const useRepositories = (): Repositories => {
  const repositories = useContext(RepositoryContext);

  if (repositories === null) {
    throw new Error('useRepositories was called outside RepositoryProvider');
  }

  return repositories;
};
