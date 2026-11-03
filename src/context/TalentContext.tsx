import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TalentProfile,
  SkillItem,
  ExperienceItem,
  EducationItem,
  PortfolioProject,
  UserConnection,
} from '../types';
import { SAMPLE_TALENT, PORTFOLIO_COVERS } from '../data/mockData';
import { useAuth } from './AuthContext';

interface TalentContextType {
  talentList: TalentProfile[];
  getTalentById: (id: string) => TalentProfile | undefined;
  updateTalentProfile: (id: string, updates: Partial<TalentProfile>) => void;
  // Connection methods
  connections: UserConnection[];
  getConnectionStatus: (targetUserId: string) => 'none' | 'pending' | 'accepted';
  sendConnectionRequest: (targetUserId: string) => void;
  acceptConnectionRequest: (connectionId: string) => void;
  declineConnectionRequest: (connectionId: string) => void;
  cancelConnectionRequest: (targetUserId: string) => void;
  // Profile Owner Edit Methods
  addSkillToProfile: (userId: string, skill: SkillItem) => void;
  removeSkillFromProfile: (userId: string, skillId: string) => void;
  updateSkillInProfile: (userId: string, skill: SkillItem) => void;
  addExperienceToProfile: (userId: string, exp: Omit<ExperienceItem, 'id'>) => void;
  updateExperienceInProfile: (userId: string, exp: ExperienceItem) => void;
  deleteExperienceFromProfile: (userId: string, expId: string) => void;
  addEducationToProfile: (userId: string, edu: Omit<EducationItem, 'id'>) => void;
  updateEducationInProfile: (userId: string, edu: EducationItem) => void;
  deleteEducationFromProfile: (userId: string, eduId: string) => void;
  addPortfolioProject: (userId: string, project: Omit<PortfolioProject, 'id'>) => void;
  updatePortfolioProject: (userId: string, project: PortfolioProject) => void;
  deletePortfolioProject: (userId: string, projectId: string) => void;
  reorderPortfolioProjects: (userId: string, startIndex: number, endIndex: number) => void;
  updatePreferences: (userId: string, preferences: string[]) => void;
}

const TalentContext = createContext<TalentContextType | undefined>(undefined);

const TALENT_STORAGE_KEY = 'hustl_talent_profiles_v2';
const CONNECTIONS_STORAGE_KEY = 'hustl_user_connections_v2';

import { profileService } from '../services/profileService';

export const TalentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [talentList, setTalentList] = useState<TalentProfile[]>([]);
  const [connections, setConnections] = useState<UserConnection[]>([]);

  // Initialize data from localStorage or mock data, then fetch live from Supabase
  useEffect(() => {
    try {
      const storedTalentRaw = localStorage.getItem(TALENT_STORAGE_KEY);
      if (storedTalentRaw) {
        setTalentList(JSON.parse(storedTalentRaw));
      } else {
        setTalentList(SAMPLE_TALENT);
        localStorage.setItem(TALENT_STORAGE_KEY, JSON.stringify(SAMPLE_TALENT));
      }

      const storedConnRaw = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
      if (storedConnRaw) {
        setConnections(JSON.parse(storedConnRaw));
      } else {
        const initialConns: UserConnection[] = [
          {
            id: 'conn-1',
            requesterId: 'aarav-sharma',
            recipientId: 'current-user',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        ];
        setConnections(initialConns);
        localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(initialConns));
      }
    } catch (err) {
      console.warn('Error reading talent storage:', err);
      setTalentList(SAMPLE_TALENT);
    }

    // Live remote sync
    async function loadRemoteTalent() {
      try {
        const remoteTalent = await profileService.getTalentListings();
        if (remoteTalent && remoteTalent.length > 0) {
          setTalentList(prev => {
            const remoteIds = new Set(remoteTalent.map(t => t.id));
            const existing = prev.filter(t => !remoteIds.has(t.id));
            return [...remoteTalent, ...existing];
          });
        }
      } catch (err) {
        console.warn('Talent remote sync note:', err);
      }
    }
    loadRemoteTalent();
  }, []);

  // Save talent list updates to localStorage
  const persistTalentList = (updated: TalentProfile[]) => {
    setTalentList(updated);
    localStorage.setItem(TALENT_STORAGE_KEY, JSON.stringify(updated));
  };

  // Save connections updates to localStorage
  const persistConnections = (updated: UserConnection[]) => {
    setConnections(updated);
    localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(updated));
  };

  const getTalentById = (id: string): TalentProfile | undefined => {
    // If id is 'me' or matches the logged in user id, synthesize user profile
    if ((id === 'me' || id === user?.id) && user) {
      return {
        id: user.id,
        name: user.fullName,
        handle: user.displayName || user.fullName.toLowerCase().replace(/\s+/g, '_'),
        title: user.roles?.[0] ? `${user.roles[0].toUpperCase()} OPERATOR` : 'Builder',
        headline: user.bio?.substring(0, 50) || 'Systems Engineer & Collegiate Builder',
        role: user.roles?.[0] || 'student',
        institution: user.institution || 'University',
        location: user.location || 'India',
        roles: user.roles as any[],
        availability: user.preferences?.availability || 'Available now',
        skills: user.skills || ['React', 'TypeScript', 'Tailwind CSS'],
        skillsDetailed: (user.skills || ['React', 'TypeScript']).map((s, idx) => ({
          id: `sk-usr-${idx}`,
          name: s,
          proficiency: 'Advanced',
        })),
        experiences: user.experience?.previousExperience
          ? [
              {
                id: 'exp-user-1',
                position: 'Lead Systems Developer',
                organisation: user.institution || 'Tech Venture',
                description: user.experience.previousExperience,
                startDate: '2024',
                current: true,
              },
            ]
          : [],
        educations: user.education?.degree
          ? [
              {
                id: 'edu-user-1',
                institution: user.education.institution || user.institution || 'University',
                degree: user.education.degree,
                fieldOfStudy: 'Engineering',
                graduationYear: user.education.graduationYear || '2026',
              },
            ]
          : [],
        portfolioProjects: [
          {
            id: 'proj-usr-1',
            title: 'HUSTL Platform Component Kit',
            description: 'Esports-inspired dark mode UI kit with tokenized spacing, accessible keyboard navigation, and Framer Motion easing curves.',
            category: 'Web Application',
            coverImage: PORTFOLIO_COVERS.designSystem,
            technologies: user.skills?.slice(0, 4) || ['React', 'TypeScript'],
            projectUrl: 'https://github.com/hustl-core',
            createdAt: '2026',
          },
        ],
        opportunityPreferences: user.preferences?.lookingFor || ['Freelance projects', 'Co-founders'],
        completedProjects: 14,
        yearsOfExperience: 3,
        bio: user.bio || 'Building next-generation web applications.',
        verified: true,
        avatarUrl: user.avatarUrl,
        avatarInitials: user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'HU',
        isDemo: false,
        joinedDate: 'Joined recently',
      };
    }

    return talentList.find((t) => t.id === id || t.handle === id);
  };

  const updateTalentProfile = (id: string, updates: Partial<TalentProfile>) => {
    const updated = talentList.map((t) => (t.id === id ? { ...t, ...updates } : t));
    persistTalentList(updated);
  };

  // Connection handlers
  const getConnectionStatus = (targetUserId: string): 'none' | 'pending' | 'accepted' => {
    const currentUserId = user?.id || 'current-user';
    const conn = connections.find(
      (c) =>
        (c.requesterId === currentUserId && c.recipientId === targetUserId) ||
        (c.requesterId === targetUserId && c.recipientId === currentUserId)
    );
    if (!conn) return 'none';
    if (conn.status === 'accepted') return 'accepted';
    return 'pending';
  };

  const sendConnectionRequest = (targetUserId: string) => {
    const currentUserId = user?.id || 'current-user';
    const existing = connections.find(
      (c) =>
        (c.requesterId === currentUserId && c.recipientId === targetUserId) ||
        (c.requesterId === targetUserId && c.recipientId === currentUserId)
    );
    if (existing) return;

    const newConn: UserConnection = {
      id: `conn_${Date.now()}`,
      requesterId: currentUserId,
      recipientId: targetUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    persistConnections([...connections, newConn]);
  };

  const acceptConnectionRequest = (connectionId: string) => {
    const updated = connections.map((c) =>
      c.id === connectionId ? { ...c, status: 'accepted' as const } : c
    );
    persistConnections(updated);
  };

  const declineConnectionRequest = (connectionId: string) => {
    const updated = connections.filter((c) => c.id !== connectionId);
    persistConnections(updated);
  };

  const cancelConnectionRequest = (targetUserId: string) => {
    const currentUserId = user?.id || 'current-user';
    const updated = connections.filter(
      (c) =>
        !(
          (c.requesterId === currentUserId && c.recipientId === targetUserId) ||
          (c.requesterId === targetUserId && c.recipientId === currentUserId)
        )
    );
    persistConnections(updated);
  };

  // Skill mutations
  const addSkillToProfile = (userId: string, skill: SkillItem) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const existingDetailed = profile.skillsDetailed || [];
    const updatedDetailed = [...existingDetailed, skill];
    const updatedSkills = [...profile.skills, skill.name];
    updateTalentProfile(userId, { skillsDetailed: updatedDetailed, skills: updatedSkills });
  };

  const removeSkillFromProfile = (userId: string, skillId: string) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const skillToRemove = profile.skillsDetailed?.find((s) => s.id === skillId)?.name;
    const updatedDetailed = profile.skillsDetailed?.filter((s) => s.id !== skillId) || [];
    const updatedSkills = profile.skills.filter((s) => s !== skillToRemove);
    updateTalentProfile(userId, { skillsDetailed: updatedDetailed, skills: updatedSkills });
  };

  const updateSkillInProfile = (userId: string, updatedSkill: SkillItem) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const updatedDetailed =
      profile.skillsDetailed?.map((s) => (s.id === updatedSkill.id ? updatedSkill : s)) || [];
    updateTalentProfile(userId, { skillsDetailed: updatedDetailed });
  };

  // Experience mutations
  const addExperienceToProfile = (userId: string, exp: Omit<ExperienceItem, 'id'>) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const newExp: ExperienceItem = { ...exp, id: `exp_${Date.now()}` };
    const updatedExp = [newExp, ...(profile.experiences || [])];
    updateTalentProfile(userId, { experiences: updatedExp });
  };

  const updateExperienceInProfile = (userId: string, updatedExp: ExperienceItem) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const updated = profile.experiences?.map((e) => (e.id === updatedExp.id ? updatedExp : e)) || [];
    updateTalentProfile(userId, { experiences: updated });
  };

  const deleteExperienceFromProfile = (userId: string, expId: string) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const updated = profile.experiences?.filter((e) => e.id !== expId) || [];
    updateTalentProfile(userId, { experiences: updated });
  };

  // Education mutations
  const addEducationToProfile = (userId: string, edu: Omit<EducationItem, 'id'>) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const newEdu: EducationItem = { ...edu, id: `edu_${Date.now()}` };
    const updated = [newEdu, ...(profile.educations || [])];
    updateTalentProfile(userId, { educations: updated });
  };

  const updateEducationInProfile = (userId: string, updatedEdu: EducationItem) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const updated = profile.educations?.map((e) => (e.id === updatedEdu.id ? updatedEdu : e)) || [];
    updateTalentProfile(userId, { educations: updated });
  };

  const deleteEducationFromProfile = (userId: string, eduId: string) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const updated = profile.educations?.filter((e) => e.id !== eduId) || [];
    updateTalentProfile(userId, { educations: updated });
  };

  // Portfolio mutations
  const addPortfolioProject = (userId: string, project: Omit<PortfolioProject, 'id'>) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const newProject: PortfolioProject = {
      ...project,
      id: `proj_${Date.now()}`,
      createdAt: new Date().getFullYear().toString(),
    };
    const updated = [newProject, ...(profile.portfolioProjects || [])];
    updateTalentProfile(userId, {
      portfolioProjects: updated,
      completedProjects: (profile.completedProjects || 0) + 1,
    });
  };

  const updatePortfolioProject = (userId: string, updatedProj: PortfolioProject) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const updated =
      profile.portfolioProjects?.map((p) => (p.id === updatedProj.id ? updatedProj : p)) || [];
    updateTalentProfile(userId, { portfolioProjects: updated });
  };

  const deletePortfolioProject = (userId: string, projectId: string) => {
    const profile = getTalentById(userId);
    if (!profile) return;
    const updated = profile.portfolioProjects?.filter((p) => p.id !== projectId) || [];
    updateTalentProfile(userId, { portfolioProjects: updated });
  };

  const reorderPortfolioProjects = (userId: string, startIndex: number, endIndex: number) => {
    const profile = getTalentById(userId);
    if (!profile || !profile.portfolioProjects) return;
    const result = Array.from(profile.portfolioProjects);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    updateTalentProfile(userId, { portfolioProjects: result });
  };

  const updatePreferences = (userId: string, preferences: string[]) => {
    updateTalentProfile(userId, { opportunityPreferences: preferences });
  };

  return (
    <TalentContext.Provider
      value={{
        talentList,
        getTalentById,
        updateTalentProfile,
        connections,
        getConnectionStatus,
        sendConnectionRequest,
        acceptConnectionRequest,
        declineConnectionRequest,
        cancelConnectionRequest,
        addSkillToProfile,
        removeSkillFromProfile,
        updateSkillInProfile,
        addExperienceToProfile,
        updateExperienceInProfile,
        deleteExperienceFromProfile,
        addEducationToProfile,
        updateEducationInProfile,
        deleteEducationFromProfile,
        addPortfolioProject,
        updatePortfolioProject,
        deletePortfolioProject,
        reorderPortfolioProjects,
        updatePreferences,
      }}
    >
      {children}
    </TalentContext.Provider>
  );
};

export const useTalent = () => {
  const context = useContext(TalentContext);
  if (!context) {
    throw new Error('useTalent must be used within a TalentProvider');
  }
  return context;
};
