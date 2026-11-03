import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  JobListing,
  Company,
  JobApplication,
  ApplicationNote,
  JobApplicationStatus,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_JOB_LISTINGS,
  INITIAL_JOB_APPLICATIONS,
  INITIAL_APPLICATION_NOTES,
} from '../data/recruitData';
import { useAuth } from './AuthContext';

interface RecruitContextType {
  jobs: JobListing[];
  companies: Company[];
  applications: JobApplication[];
  savedJobIds: string[];
  notes: ApplicationNote[];
  getJobById: (id: string) => JobListing | undefined;
  getCompanyById: (id: string) => Company | undefined;
  createJob: (data: Omit<JobListing, 'id' | 'applicantCount' | 'postedDate'>) => JobListing;
  updateJob: (id: string, updates: Partial<JobListing>) => void;
  closeJob: (id: string) => void;
  reopenJob: (id: string) => void;
  applyToJob: (
    data: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt' | 'status'>
  ) => { success: boolean; message: string };
  hasAppliedToJob: (jobId: string, applicantId: string) => boolean;
  updateApplicationStatus: (
    applicationId: string,
    status: JobApplicationStatus,
    rejectionReason?: string
  ) => void;
  withdrawApplication: (applicationId: string) => void;
  addApplicationNote: (
    applicationId: string,
    content: string,
    authorName: string,
    authorRole?: string
  ) => void;
  getApplicationNotes: (applicationId: string) => ApplicationNote[];
  isJobSaved: (jobId: string) => boolean;
  toggleSaveJob: (jobId: string) => void;
  getApplicationsForJob: (jobId: string) => JobApplication[];
  getUserApplications: (userId: string) => JobApplication[];
  getUserJobs: (userId: string) => JobListing[];
  createCompany: (data: Omit<Company, 'id' | 'createdAt'>) => Company;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  getUserCompanies: (userId: string) => Company[];
}

const RecruitContext = createContext<RecruitContextType | undefined>(undefined);

const STORAGE_KEY_JOBS = 'hustl_recruit_jobs_v2';
const STORAGE_KEY_COMPANIES = 'hustl_recruit_companies_v2';
const STORAGE_KEY_APPLICATIONS = 'hustl_recruit_applications_v2';
const STORAGE_KEY_SAVED_JOBS = 'hustl_recruit_saved_jobs_v2';
const STORAGE_KEY_NOTES = 'hustl_recruit_notes_v2';

import { recruitService } from '../services/recruitService';

export const RecruitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<JobListing[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_JOBS);
      return stored ? JSON.parse(stored) : INITIAL_JOB_LISTINGS;
    } catch (e) {
      console.error('Failed to parse stored jobs', e);
      return INITIAL_JOB_LISTINGS;
    }
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPANIES);
      return stored ? JSON.parse(stored) : INITIAL_COMPANIES;
    } catch (e) {
      console.error('Failed to parse stored companies', e);
      return INITIAL_COMPANIES;
    }
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
      return stored ? JSON.parse(stored) : INITIAL_JOB_APPLICATIONS;
    } catch (e) {
      console.error('Failed to parse stored applications', e);
      return INITIAL_JOB_APPLICATIONS;
    }
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED_JOBS);
      return stored ? JSON.parse(stored) : ['job-01-backend-nova'];
    } catch (e) {
      console.error('Failed to parse saved jobs', e);
      return ['job-01-backend-nova'];
    }
  });

  const [notes, setNotes] = useState<ApplicationNote[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTES);
      return stored ? JSON.parse(stored) : INITIAL_APPLICATION_NOTES;
    } catch (e) {
      console.error('Failed to parse stored notes', e);
      return INITIAL_APPLICATION_NOTES;
    }
  });

  // Load from Supabase on mount
  useEffect(() => {
    async function loadRemoteRecruitData() {
      try {
        const remoteJobs = await recruitService.getJobListings();
        if (remoteJobs && remoteJobs.length > 0) {
          setJobs(prev => {
            const remoteIds = new Set(remoteJobs.map(r => r.id));
            const existing = prev.filter(j => !remoteIds.has(j.id));
            return [...remoteJobs, ...existing];
          });
        }

        if (user?.id) {
          const remoteSavedIds = await recruitService.getSavedJobIds(user.id);
          if (remoteSavedIds && remoteSavedIds.length > 0) {
            setSavedJobIds(Array.from(new Set([...savedJobIds, ...remoteSavedIds])));
          }
        }
      } catch (err) {
        console.warn('Recruit remote sync note:', err);
      }
    }
    loadRemoteRecruitData();
  }, [user?.id]);

  // Local storage synchronization
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to save jobs to local storage', e);
    }
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    } catch (e) {
      console.error('Failed to save companies to local storage', e);
    }
  }, [companies]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(applications));
    } catch (e) {
      console.error('Failed to save applications to local storage', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_JOBS, JSON.stringify(savedJobIds));
    } catch (e) {
      console.error('Failed to save saved jobs to local storage', e);
    }
  }, [savedJobIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save application notes to local storage', e);
    }
  }, [notes]);

  const getJobById = (id: string) => {
    return jobs.find((j) => j.id === id);
  };

  const getCompanyById = (id: string) => {
    return companies.find((c) => c.id === id);
  };

  const createJob = (
    data: Omit<JobListing, 'id' | 'applicantCount' | 'postedDate'>
  ): JobListing => {
    const newJob: JobListing = {
      ...data,
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      applicantCount: 0,
      postedDate: new Date().toISOString(),
      status: 'open',
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const updateJob = (id: string, updates: Partial<JobListing>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updates } : job))
    );
  };

  const closeJob = (id: string) => {
    updateJob(id, { status: 'closed' });
  };

  const reopenJob = (id: string) => {
    updateJob(id, { status: 'open' });
  };

  const hasAppliedToJob = (jobId: string, applicantId: string) => {
    return applications.some(
      (app) =>
        app.jobId === jobId &&
        app.applicantId === applicantId &&
        app.status !== 'Withdrawn'
    );
  };

  const applyToJob = (
    data: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt' | 'status'>
  ): { success: boolean; message: string } => {
    const targetJob = jobs.find((j) => j.id === data.jobId);
    if (!targetJob) {
      return { success: false, message: 'Opening not found' };
    }

    if (targetJob.status !== 'open') {
      return { success: false, message: 'This opening is currently closed for applications' };
    }

    // Check duplicate
    if (hasAppliedToJob(data.jobId, data.applicantId)) {
      return {
        success: false,
        message: 'You have already submitted an active application for this opening.',
      };
    }

    const now = new Date().toISOString();
    const newApplication: JobApplication = {
      ...data,
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Submitted',
      appliedAt: now,
      updatedAt: now,
    };

    setApplications((prev) => [newApplication, ...prev]);

    // Increment applicantCount on job
    setJobs((prev) =>
      prev.map((job) =>
        job.id === data.jobId
          ? { ...job, applicantCount: (job.applicantCount || 0) + 1 }
          : job
      )
    );

    return {
      success: true,
      message: 'Application submitted successfully to ' + targetJob.companyName,
    };
  };

  const updateApplicationStatus = (
    applicationId: string,
    status: JobApplicationStatus,
    rejectionReason?: string
  ) => {
    const now = new Date().toISOString();
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status,
              rejectionReason: rejectionReason !== undefined ? rejectionReason : app.rejectionReason,
              updatedAt: now,
            }
          : app
      )
    );
  };

  const withdrawApplication = (applicationId: string) => {
    updateApplicationStatus(applicationId, 'Withdrawn');
  };

  const addApplicationNote = (
    applicationId: string,
    content: string,
    authorName: string,
    authorRole: string = 'Hiring Team'
  ) => {
    const newNote: ApplicationNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      applicationId,
      authorId: user?.id || 'usr_anonymous',
      authorName,
      authorRole,
      content,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const getApplicationNotes = (applicationId: string) => {
    return notes.filter((n) => n.applicationId === applicationId);
  };

  const isJobSaved = (jobId: string) => {
    return savedJobIds.includes(jobId);
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const getApplicationsForJob = (jobId: string) => {
    return applications.filter((app) => app.jobId === jobId);
  };

  const getUserApplications = (userId: string) => {
    return applications.filter((app) => app.applicantId === userId);
  };

  const getUserJobs = (userId: string) => {
    // Return jobs where creatorId matches, or companies owned by user
    const userCompanyIds = companies.filter((c) => c.ownerId === userId).map((c) => c.id);
    return jobs.filter((job) => job.creatorId === userId || userCompanyIds.includes(job.companyId));
  };

  const createCompany = (data: Omit<Company, 'id' | 'createdAt'>): Company => {
    const newCompany: Company = {
      ...data,
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setCompanies((prev) => [newCompany, ...prev]);
    return newCompany;
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const getUserCompanies = (userId: string) => {
    return companies.filter((c) => c.ownerId === userId);
  };

  return (
    <RecruitContext.Provider
      value={{
        jobs,
        companies,
        applications,
        savedJobIds,
        notes,
        getJobById,
        getCompanyById,
        createJob,
        updateJob,
        closeJob,
        reopenJob,
        applyToJob,
        hasAppliedToJob,
        updateApplicationStatus,
        withdrawApplication,
        addApplicationNote,
        getApplicationNotes,
        isJobSaved,
        toggleSaveJob,
        getApplicationsForJob,
        getUserApplications,
        getUserJobs,
        createCompany,
        updateCompany,
        getUserCompanies,
      }}
    >
      {children}
    </RecruitContext.Provider>
  );
};

export const useRecruit = () => {
  const context = useContext(RecruitContext);
  if (!context) {
    throw new Error('useRecruit must be used within a RecruitProvider');
  }
  return context;
};
