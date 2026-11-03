import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FreelanceProject,
  FreelanceApplication,
  FreelanceServicePackage,
  FreelanceApplicationStatus,
} from '../types';
import {
  INITIAL_FREELANCE_PROJECTS,
  INITIAL_FREELANCE_APPLICATIONS,
  INITIAL_SERVICE_PACKAGES,
} from '../data/freelanceData';
import { useAuth } from './AuthContext';

interface FreelanceContextType {
  projects: FreelanceProject[];
  applications: FreelanceApplication[];
  savedProjectIds: string[];
  servicePackages: FreelanceServicePackage[];
  getProjectById: (id: string) => FreelanceProject | undefined;
  createProject: (
    data: Omit<FreelanceProject, 'id' | 'applicantCount' | 'postedDate'>
  ) => FreelanceProject;
  updateProject: (id: string, updates: Partial<FreelanceProject>) => void;
  closeProject: (id: string) => void;
  reopenProject: (id: string) => void;
  applyToProject: (
    data: Omit<FreelanceApplication, 'id' | 'createdAt' | 'status'>
  ) => { success: boolean; message: string };
  hasApplied: (projectId: string, applicantId: string) => boolean;
  updateApplicationStatus: (
    applicationId: string,
    status: FreelanceApplicationStatus
  ) => void;
  withdrawApplication: (applicationId: string) => void;
  isProjectSaved: (projectId: string) => boolean;
  toggleSaveProject: (projectId: string) => void;
  getApplicationsForProject: (projectId: string) => FreelanceApplication[];
  getUserApplications: (userId: string) => FreelanceApplication[];
  getUserProjects: (userId: string) => FreelanceProject[];
  getAcceptedProjectsForUser: (userId: string) => FreelanceProject[];
}

const FreelanceContext = createContext<FreelanceContextType | undefined>(undefined);

const STORAGE_KEY_PROJECTS = 'hustl_freelance_projects_v2';
const STORAGE_KEY_APPLICATIONS = 'hustl_freelance_applications_v2';
const STORAGE_KEY_SAVED = 'hustl_saved_projects_v2';

import { freelanceService } from '../services/freelanceService';

export const FreelanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [projects, setProjects] = useState<FreelanceProject[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
      return stored ? JSON.parse(stored) : INITIAL_FREELANCE_PROJECTS;
    } catch (e) {
      console.error('Failed to parse stored projects', e);
      return INITIAL_FREELANCE_PROJECTS;
    }
  });

  const [applications, setApplications] = useState<FreelanceApplication[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
      return stored ? JSON.parse(stored) : INITIAL_FREELANCE_APPLICATIONS;
    } catch (e) {
      console.error('Failed to parse stored applications', e);
      return INITIAL_FREELANCE_APPLICATIONS;
    }
  });

  const [savedProjectIds, setSavedProjectIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED);
      return stored ? JSON.parse(stored) : ['proj-01-ecommerce'];
    } catch (e) {
      console.error('Failed to parse saved projects', e);
      return ['proj-01-ecommerce'];
    }
  });

  const [servicePackages] = useState<FreelanceServicePackage[]>(INITIAL_SERVICE_PACKAGES);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadRemoteFreelanceData() {
      try {
        const remoteProjects = await freelanceService.getProjects();
        if (remoteProjects && remoteProjects.length > 0) {
          setProjects(prev => {
            const remoteIds = new Set(remoteProjects.map(r => r.id));
            const existing = prev.filter(p => !remoteIds.has(p.id));
            return [...remoteProjects, ...existing];
          });
        }

        if (user?.id) {
          const userApps = await freelanceService.getUserApplications(user.id);
          if (userApps && userApps.length > 0) {
            setApplications(prev => {
              const remoteIds = new Set(userApps.map(a => a.id));
              const existing = prev.filter(a => !remoteIds.has(a.id));
              return [...userApps, ...existing];
            });
          }

          const savedIds = await freelanceService.getSavedProjectIds(user.id);
          if (savedIds && savedIds.length > 0) {
            setSavedProjectIds(Array.from(new Set([...savedProjectIds, ...savedIds])));
          }
        }
      } catch (err) {
        console.warn('Freelance remote sync note:', err);
      }
    }
    loadRemoteFreelanceData();
  }, [user?.id]);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to storage', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(applications));
    } catch (e) {
      console.error('Failed to save applications to storage', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedProjectIds));
    } catch (e) {
      console.error('Failed to save saved projects to storage', e);
    }
  }, [savedProjectIds]);

  const getProjectById = (id: string): FreelanceProject | undefined => {
    return projects.find((p) => p.id === id);
  };

  const createProject = (
    data: Omit<FreelanceProject, 'id' | 'applicantCount' | 'postedDate'>
  ): FreelanceProject => {
    const newProject: FreelanceProject = {
      ...data,
      id: `proj-${Date.now()}`,
      applicantCount: 0,
      postedDate: 'Just now',
      status: 'open',
    };

    setProjects((prev) => [newProject, ...prev]);

    // Asynchronously publish to Supabase if configured
    freelanceService.createProject(data).then((remote) => {
      if (remote) {
        setProjects((prev) =>
          prev.map((p) => (p.id === newProject.id ? { ...p, id: remote.id } : p))
        );
      }
    }).catch((e) => console.warn('Supabase createProject note:', e));

    return newProject;
  };

  const updateProject = (id: string, updates: Partial<FreelanceProject>) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, ...updates } : proj))
    );
  };

  const closeProject = (id: string) => {
    updateProject(id, { status: 'closed' });
  };

  const reopenProject = (id: string) => {
    updateProject(id, { status: 'open' });
  };

  const hasApplied = (projectId: string, applicantId: string): boolean => {
    return applications.some(
      (app) => app.projectId === projectId && app.applicantId === applicantId
    );
  };

  const applyToProject = (
    data: Omit<FreelanceApplication, 'id' | 'createdAt' | 'status'>
  ): { success: boolean; message: string } => {
    // Prevent duplicate applications
    const alreadyApplied = applications.some(
      (app) => app.projectId === data.projectId && app.applicantId === data.applicantId
    );

    if (alreadyApplied) {
      return {
        success: false,
        message: 'You have already submitted an active proposal for this project.',
      };
    }

    const newApp: FreelanceApplication = {
      ...data,
      id: `app-${Date.now()}`,
      status: 'Submitted',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setApplications((prev) => [newApp, ...prev]);

    // Asynchronously submit to Supabase
    freelanceService.applyToProject(data).catch((e) =>
      console.warn('Supabase applyToProject note:', e)
    );

    // Increment applicantCount on target project
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === data.projectId
          ? { ...proj, applicantCount: proj.applicantCount + 1 }
          : proj
      )
    );

    return {
      success: true,
      message: 'Your application proposal was transmitted directly to the client.',
    };
  };

  const updateApplicationStatus = (
    applicationId: string,
    status: FreelanceApplicationStatus
  ) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
    );
    freelanceService.updateApplicationStatus(applicationId, status).catch(() => {});
  };

  const withdrawApplication = (applicationId: string) => {
    updateApplicationStatus(applicationId, 'Withdrawn');
  };

  const isProjectSaved = (projectId: string): boolean => {
    return savedProjectIds.includes(projectId);
  };

  const toggleSaveProject = (projectId: string) => {
    const isSaved = savedProjectIds.includes(projectId);
    setSavedProjectIds((prev) =>
      isSaved ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );

    if (user?.id) {
      freelanceService.toggleSaveProject(user.id, projectId, isSaved).catch(() => {});
    }
  };

  const getApplicationsForProject = (projectId: string): FreelanceApplication[] => {
    return applications.filter((app) => app.projectId === projectId);
  };

  const getUserApplications = (userId: string): FreelanceApplication[] => {
    return applications.filter((app) => app.applicantId === userId);
  };

  const getUserProjects = (userId: string): FreelanceProject[] => {
    return projects.filter(
      (proj) => proj.ownerId === userId || (user && user.id === proj.ownerId)
    );
  };

  const getAcceptedProjectsForUser = (userId: string): FreelanceProject[] => {
    const acceptedProjectIds = applications
      .filter((app) => app.applicantId === userId && app.status === 'Accepted')
      .map((app) => app.projectId);
    return projects.filter((p) => acceptedProjectIds.includes(p.id));
  };

  return (
    <FreelanceContext.Provider
      value={{
        projects,
        applications,
        savedProjectIds,
        servicePackages,
        getProjectById,
        createProject,
        updateProject,
        closeProject,
        reopenProject,
        applyToProject,
        hasApplied,
        updateApplicationStatus,
        withdrawApplication,
        isProjectSaved,
        toggleSaveProject,
        getApplicationsForProject,
        getUserApplications,
        getUserProjects,
        getAcceptedProjectsForUser,
      }}
    >
      {children}
    </FreelanceContext.Provider>
  );
};

export const useFreelance = (): FreelanceContextType => {
  const context = useContext(FreelanceContext);
  if (!context) {
    throw new Error('useFreelance must be used within a FreelanceProvider');
  }
  return context;
};
