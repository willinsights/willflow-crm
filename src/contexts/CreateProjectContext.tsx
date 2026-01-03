'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CreateProjectContextType {
  isCreateProjectOpen: boolean;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  setCreateProjectOpen: (open: boolean) => void;
}

const CreateProjectContext = createContext<CreateProjectContextType | undefined>(undefined);

export function CreateProjectProvider({ children }: { children: ReactNode }) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const openCreateProject = () => setIsCreateProjectOpen(true);
  const closeCreateProject = () => setIsCreateProjectOpen(false);
  const setCreateProjectOpen = (open: boolean) => setIsCreateProjectOpen(open);

  return (
    <CreateProjectContext.Provider
      value={{
        isCreateProjectOpen,
        openCreateProject,
        closeCreateProject,
        setCreateProjectOpen,
      }}
    >
      {children}
    </CreateProjectContext.Provider>
  );
}

export function useCreateProject() {
  const context = useContext(CreateProjectContext);
  if (context === undefined) {
    throw new Error('useCreateProject must be used within a CreateProjectProvider');
  }
  return context;
}
