import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StartupIdea,
  TeamMember,
  CollaborationApplication,
  TeamInvitation,
  CollaborationApplicationStatus,
  RecruitmentStatus,
  IdeaOpenRole,
} from '../types';
import {
  INITIAL_STARTUP_IDEAS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_COLLABORATION_APPLICATIONS,
  INITIAL_TEAM_INVITATIONS,
} from '../data/teamUpData';
import { useAuth } from './AuthContext';

interface TeamUpContextType {
  ideas: StartupIdea[];
  teamMembers: TeamMember[];
  applications: CollaborationApplication[];
  invitations: TeamInvitation[];
  savedIdeaIds: string[];
  getIdeaById: (id: string) => StartupIdea | undefined;
  getTeamMembers: (ideaId: string) => TeamMember[];
  getIdeaRoles: (ideaId: string) => IdeaOpenRole[];
  createIdea: (
    data: Omit<StartupIdea, 'id' | 'teamSize' | 'createdAt' | 'updatedAt'>
  ) => StartupIdea;
  updateIdea: (id: string, updates: Partial<StartupIdea>) => void;
  deleteIdea: (id: string) => void;
  toggleRecruitmentStatus: (id: string, status: RecruitmentStatus) => void;
  applyToRole: (
    data: Omit<CollaborationApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => { success: boolean; message: string };
  hasAppliedToRole: (roleId: string, applicantId: string) => boolean;
  hasAppliedToIdea: (ideaId: string, applicantId: string) => boolean;
  updateApplicationStatus: (
    applicationId: string,
    status: CollaborationApplicationStatus
  ) => void;
  withdrawApplication: (applicationId: string) => void;
  getUserApplications: (userId: string) => CollaborationApplication[];
  getIdeaApplications: (ideaId: string) => CollaborationApplication[];
  sendInvitation: (
    data: Omit<TeamInvitation, 'id' | 'createdAt' | 'status'>
  ) => { success: boolean; message: string };
  respondToInvitation: (invitationId: string, action: 'accept' | 'decline') => void;
  cancelInvitation: (invitationId: string) => void;
  getUserInvitations: (userId: string) => TeamInvitation[];
  getSentInvitations: (userId: string) => TeamInvitation[];
  addTeamMember: (data: Omit<TeamMember, 'id' | 'joinedAt'>) => void;
  removeTeamMember: (teamMemberId: string) => { success: boolean; message: string };
  leaveTeam: (teamId: string, userId: string) => { success: boolean; message: string };
  updateMemberRole: (teamMemberId: string, newRoleTitle: string) => void;
  isIdeaSaved: (ideaId: string) => boolean;
  toggleSaveIdea: (ideaId: string) => void;
  calculateMatchScore: (
    idea: StartupIdea,
    userSkills?: string[]
  ) => { score: number; matchedSkills: string[]; reason: string };
}

const TeamUpContext = createContext<TeamUpContextType | undefined>(undefined);

const STORAGE_KEY_IDEAS = 'hustl_teamup_ideas_v2';
const STORAGE_KEY_MEMBERS = 'hustl_teamup_members_v2';
const STORAGE_KEY_APPLICATIONS = 'hustl_teamup_applications_v2';
const STORAGE_KEY_INVITATIONS = 'hustl_teamup_invitations_v2';
const STORAGE_KEY_SAVED_IDEAS = 'hustl_teamup_saved_ideas_v2';

import { teamupService } from '../services/teamupService';

export const TeamUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [ideas, setIdeas] = useState<StartupIdea[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_IDEAS);
      return stored ? JSON.parse(stored) : INITIAL_STARTUP_IDEAS;
    } catch (e) {
      console.error('Failed to parse stored ideas', e);
      return INITIAL_STARTUP_IDEAS;
    }
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MEMBERS);
      return stored ? JSON.parse(stored) : INITIAL_TEAM_MEMBERS;
    } catch (e) {
      console.error('Failed to parse stored team members', e);
      return INITIAL_TEAM_MEMBERS;
    }
  });

  const [applications, setApplications] = useState<CollaborationApplication[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
      return stored ? JSON.parse(stored) : INITIAL_COLLABORATION_APPLICATIONS;
    } catch (e) {
      console.error('Failed to parse stored applications', e);
      return INITIAL_COLLABORATION_APPLICATIONS;
    }
  });

  const [invitations, setInvitations] = useState<TeamInvitation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INVITATIONS);
      return stored ? JSON.parse(stored) : INITIAL_TEAM_INVITATIONS;
    } catch (e) {
      console.error('Failed to parse stored invitations', e);
      return INITIAL_TEAM_INVITATIONS;
    }
  });

  const [savedIdeaIds, setSavedIdeaIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED_IDEAS);
      return stored ? JSON.parse(stored) : ['idea-02-kintsugi'];
    } catch (e) {
      console.error('Failed to parse saved ideas', e);
      return ['idea-02-kintsugi'];
    }
  });

  // Load from Supabase on mount
  useEffect(() => {
    async function loadRemoteTeamUpData() {
      try {
        const remoteIdeas = await teamupService.getIdeas();
        if (remoteIdeas && remoteIdeas.length > 0) {
          setIdeas(prev => {
            const remoteIds = new Set(remoteIdeas.map(r => r.id));
            const existing = prev.filter(i => !remoteIds.has(i.id));
            return [...remoteIdeas, ...existing];
          });
        }

        if (user?.id) {
          const remoteSavedIds = await teamupService.getSavedIdeaIds(user.id);
          if (remoteSavedIds && remoteSavedIds.length > 0) {
            setSavedIdeaIds(Array.from(new Set([...savedIdeaIds, ...remoteSavedIds])));
          }
        }
      } catch (err) {
        console.warn('TeamUp remote sync note:', err);
      }
    }
    loadRemoteTeamUpData();
  }, [user?.id]);

  // LocalStorage sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_IDEAS, JSON.stringify(ideas));
    } catch (e) {
      console.error(e);
    }
  }, [ideas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(teamMembers));
    } catch (e) {
      console.error(e);
    }
  }, [teamMembers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(applications));
    } catch (e) {
      console.error(e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(invitations));
    } catch (e) {
      console.error(e);
    }
  }, [invitations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_IDEAS, JSON.stringify(savedIdeaIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedIdeaIds]);

  const getIdeaById = (id: string) => {
    return ideas.find((i) => i.id === id);
  };

  const getTeamMembers = (ideaId: string) => {
    return teamMembers.filter((tm) => (tm.teamId === ideaId || tm.ideaId === ideaId) && tm.membershipStatus === 'active');
  };

  const getIdeaRoles = (ideaId: string) => {
    const idea = ideas.find((i) => i.id === ideaId);
    return idea ? idea.openRoles : [];
  };

  const createIdea = (
    data: Omit<StartupIdea, 'id' | 'teamSize' | 'createdAt' | 'updatedAt'>
  ): StartupIdea => {
    const now = new Date().toISOString();
    const newIdeaId = `idea-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Assign ideaId to any openRoles
    const rolesWithId = (data.openRoles || []).map((r, idx) => ({
      ...r,
      id: r.id || `role-${Date.now()}-${idx}`,
      ideaId: newIdeaId,
      isOpen: true,
      applicantCount: 0,
      createdAt: now,
    }));

    const newIdea: StartupIdea = {
      ...data,
      id: newIdeaId,
      openRoles: rolesWithId,
      teamSize: 1,
      createdAt: now,
      updatedAt: now,
    };

    // Automatically add owner as lead team member
    const ownerMember: TeamMember = {
      id: `tm-${Date.now()}-owner`,
      teamId: newIdeaId,
      ideaId: newIdeaId,
      userId: data.ownerId,
      userName: data.ownerName,
      userAvatar: data.ownerAvatar,
      userHeadline: data.ownerHeadline,
      userSkills: data.ownerSkills || [],
      roleTitle: 'Founder & Project Lead',
      membershipStatus: 'active',
      isOwner: true,
      joinedAt: now,
    };

    setIdeas((prev) => [newIdea, ...prev]);
    setTeamMembers((prev) => [ownerMember, ...prev]);
    return newIdea;
  };

  const updateIdea = (id: string, updates: Partial<StartupIdea>) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, ...updates, updatedAt: new Date().toISOString() } : idea
      )
    );
  };

  const deleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    setTeamMembers((prev) => prev.filter((tm) => tm.ideaId !== id));
    setApplications((prev) => prev.filter((a) => a.ideaId !== id));
    setInvitations((prev) => prev.filter((inv) => inv.ideaId !== id));
  };

  const toggleRecruitmentStatus = (id: string, status: RecruitmentStatus) => {
    updateIdea(id, { recruitmentStatus: status });
  };

  const hasAppliedToRole = (roleId: string, applicantId: string) => {
    return applications.some(
      (a) => a.roleId === roleId && a.applicantId === applicantId && a.status !== 'Withdrawn'
    );
  };

  const hasAppliedToIdea = (ideaId: string, applicantId: string) => {
    return applications.some(
      (a) => a.ideaId === ideaId && a.applicantId === applicantId && a.status !== 'Withdrawn'
    );
  };

  const applyToRole = (
    data: Omit<CollaborationApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): { success: boolean; message: string } => {
    const targetIdea = ideas.find((i) => i.id === data.ideaId);
    if (!targetIdea) {
      return { success: false, message: 'Startup idea not found' };
    }

    if (targetIdea.ownerId === data.applicantId) {
      return { success: false, message: 'You cannot apply to your own venture.' };
    }

    if (hasAppliedToRole(data.roleId, data.applicantId)) {
      return { success: false, message: 'You have already applied for this role.' };
    }

    const now = new Date().toISOString();
    const newApplication: CollaborationApplication = {
      ...data,
      id: `capp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
    };

    setApplications((prev) => [newApplication, ...prev]);

    // Increment applicantCount on the role
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id !== data.ideaId) return idea;
        return {
          ...idea,
          openRoles: idea.openRoles.map((r) =>
            r.id === data.roleId ? { ...r, applicantCount: (r.applicantCount || 0) + 1 } : r
          ),
        };
      })
    );

    return {
      success: true,
      message: `Application submitted to ${targetIdea.title} for ${data.roleTitle}`,
    };
  };

  const updateApplicationStatus = (
    applicationId: string,
    status: CollaborationApplicationStatus
  ) => {
    const now = new Date().toISOString();
    const app = applications.find((a) => a.id === applicationId);

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status, updatedAt: now } : a))
    );

    // If accepted, automatically add applicant as team member!
    if (status === 'Accepted' && app) {
      const existingMember = teamMembers.find(
        (tm) => tm.ideaId === app.ideaId && tm.userId === app.applicantId && tm.membershipStatus === 'active'
      );
      if (!existingMember) {
        const newMember: TeamMember = {
          id: `tm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          teamId: app.ideaId,
          ideaId: app.ideaId,
          userId: app.applicantId,
          userName: app.applicantName,
          userAvatar: app.applicantAvatar,
          userHeadline: app.applicantHeadline,
          userSkills: app.applicantSkills,
          roleTitle: app.roleTitle,
          membershipStatus: 'active',
          isOwner: false,
          joinedAt: now,
        };
        setTeamMembers((prev) => [...prev, newMember]);

        // Increment teamSize on idea
        setIdeas((prev) =>
          prev.map((i) => (i.id === app.ideaId ? { ...i, teamSize: (i.teamSize || 1) + 1 } : i))
        );
      }
    }
  };

  const withdrawApplication = (applicationId: string) => {
    updateApplicationStatus(applicationId, 'Withdrawn');
  };

  const getUserApplications = (userId: string) => {
    return applications.filter((a) => a.applicantId === userId);
  };

  const getIdeaApplications = (ideaId: string) => {
    return applications.filter((a) => a.ideaId === ideaId);
  };

  const sendInvitation = (
    data: Omit<TeamInvitation, 'id' | 'createdAt' | 'status'>
  ): { success: boolean; message: string } => {
    // Check if user is already a member
    const isMember = teamMembers.some(
      (tm) => tm.ideaId === data.ideaId && tm.userId === data.invitedUserId && tm.membershipStatus === 'active'
    );
    if (isMember) {
      return { success: false, message: 'User is already an active member of this team.' };
    }

    // Check if already invited
    const activeInvite = invitations.find(
      (inv) =>
        inv.ideaId === data.ideaId &&
        inv.invitedUserId === data.invitedUserId &&
        inv.status === 'Pending'
    );
    if (activeInvite) {
      return { success: false, message: 'An active invitation is already pending for this user.' };
    }

    const newInvite: TeamInvitation = {
      ...data,
      id: `tinv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    setInvitations((prev) => [newInvite, ...prev]);
    return {
      success: true,
      message: `Invitation transmitted to ${data.invitedUserName} for ${data.roleTitle}`,
    };
  };

  const respondToInvitation = (invitationId: string, action: 'accept' | 'decline') => {
    const invite = invitations.find((i) => i.id === invitationId);
    if (!invite) return;

    const now = new Date().toISOString();
    const newStatus = action === 'accept' ? 'Accepted' : 'Declined';

    setInvitations((prev) =>
      prev.map((i) =>
        i.id === invitationId ? { ...i, status: newStatus, respondedAt: now } : i
      )
    );

    if (action === 'accept') {
      // Add user to team
      const existingMember = teamMembers.find(
        (tm) => tm.ideaId === invite.ideaId && tm.userId === invite.invitedUserId && tm.membershipStatus === 'active'
      );
      if (!existingMember) {
        const newMember: TeamMember = {
          id: `tm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          teamId: invite.teamId || invite.ideaId,
          ideaId: invite.ideaId,
          userId: invite.invitedUserId,
          userName: invite.invitedUserName,
          userAvatar: '',
          userHeadline: 'Team Member',
          userSkills: [],
          roleTitle: invite.roleTitle,
          membershipStatus: 'active',
          isOwner: false,
          joinedAt: now,
        };
        setTeamMembers((prev) => [...prev, newMember]);

        // Increment team size on idea
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === invite.ideaId ? { ...idea, teamSize: (idea.teamSize || 1) + 1 } : idea
          )
        );
      }
    }
  };

  const cancelInvitation = (invitationId: string) => {
    setInvitations((prev) =>
      prev.map((i) => (i.id === invitationId ? { ...i, status: 'Cancelled' } : i))
    );
  };

  const getUserInvitations = (userId: string) => {
    return invitations.filter((i) => i.invitedUserId === userId);
  };

  const getSentInvitations = (userId: string) => {
    return invitations.filter((i) => i.invitedByUserId === userId);
  };

  const addTeamMember = (data: Omit<TeamMember, 'id' | 'joinedAt'>) => {
    const newMember: TeamMember = {
      ...data,
      id: `tm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      joinedAt: new Date().toISOString(),
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setIdeas((prev) =>
      prev.map((i) => (i.id === data.ideaId ? { ...i, teamSize: (i.teamSize || 1) + 1 } : i))
    );
  };

  const removeTeamMember = (teamMemberId: string): { success: boolean; message: string } => {
    const member = teamMembers.find((tm) => tm.id === teamMemberId);
    if (!member) {
      return { success: false, message: 'Member not found' };
    }
    if (member.isOwner) {
      // Check if there is another owner
      const otherOwners = teamMembers.filter(
        (tm) => tm.ideaId === member.ideaId && tm.id !== teamMemberId && tm.isOwner && tm.membershipStatus === 'active'
      );
      if (otherOwners.length === 0) {
        return {
          success: false,
          message: 'The last team owner cannot be removed. Transfer ownership first.',
        };
      }
    }

    setTeamMembers((prev) =>
      prev.map((tm) => (tm.id === teamMemberId ? { ...tm, membershipStatus: 'former' } : tm))
    );

    // Decrement teamSize
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === member.ideaId ? { ...i, teamSize: Math.max(1, (i.teamSize || 1) - 1) } : i
      )
    );

    return { success: true, message: `${member.userName} removed from active roster.` };
  };

  const leaveTeam = (teamId: string, userId: string): { success: boolean; message: string } => {
    const member = teamMembers.find(
      (tm) => (tm.teamId === teamId || tm.ideaId === teamId) && tm.userId === userId && tm.membershipStatus === 'active'
    );
    if (!member) {
      return { success: false, message: 'You are not an active member of this team.' };
    }

    if (member.isOwner) {
      const otherOwners = teamMembers.filter(
        (tm) => (tm.teamId === teamId || tm.ideaId === teamId) && tm.userId !== userId && tm.isOwner && tm.membershipStatus === 'active'
      );
      if (otherOwners.length === 0) {
        return {
          success: false,
          message: 'As the sole founder/owner, you must designate another owner before leaving.',
        };
      }
    }

    setTeamMembers((prev) =>
      prev.map((tm) => (tm.id === member.id ? { ...tm, membershipStatus: 'former' } : tm))
    );

    // Decrement teamSize
    setIdeas((prev) =>
      prev.map((i) => (i.id === teamId ? { ...i, teamSize: Math.max(1, (i.teamSize || 1) - 1) } : i))
    );

    return { success: true, message: 'You have left the team.' };
  };

  const updateMemberRole = (teamMemberId: string, newRoleTitle: string) => {
    setTeamMembers((prev) =>
      prev.map((tm) => (tm.id === teamMemberId ? { ...tm, roleTitle: newRoleTitle } : tm))
    );
  };

  const isIdeaSaved = (ideaId: string) => {
    return savedIdeaIds.includes(ideaId);
  };

  const toggleSaveIdea = (ideaId: string) => {
    setSavedIdeaIds((prev) =>
      prev.includes(ideaId) ? prev.filter((id) => id !== ideaId) : [...prev, ideaId]
    );
  };

  // Rule-based transparent matching calculation
  const calculateMatchScore = (idea: StartupIdea, userSkills: string[] = []) => {
    if (!userSkills || userSkills.length === 0) {
      return { score: 50, matchedSkills: [], reason: 'General alignment' };
    }

    const allIdeaSkills = new Set<string>();
    idea.requiredSkills.forEach((s) => allIdeaSkills.add(s.toLowerCase()));
    idea.openRoles.forEach((r) => r.requiredSkills.forEach((s) => allIdeaSkills.add(s.toLowerCase())));

    const matched: string[] = [];
    userSkills.forEach((sk) => {
      if (allIdeaSkills.has(sk.toLowerCase())) {
        matched.push(sk);
      }
    });

    if (matched.length >= 3) {
      return {
        score: Math.min(99, 85 + matched.length * 3),
        matchedSkills: matched,
        reason: `Strong match across ${matched.length} key required technical skills`,
      };
    } else if (matched.length >= 1) {
      return {
        score: 65 + matched.length * 8,
        matchedSkills: matched,
        reason: `Complementary skill overlap on ${matched.join(', ')}`,
      };
    } else {
      return {
        score: 45,
        matchedSkills: [],
        reason: 'Complementary cross-discipline opportunity',
      };
    }
  };

  return (
    <TeamUpContext.Provider
      value={{
        ideas,
        teamMembers,
        applications,
        invitations,
        savedIdeaIds,
        getIdeaById,
        getTeamMembers,
        getIdeaRoles,
        createIdea,
        updateIdea,
        deleteIdea,
        toggleRecruitmentStatus,
        applyToRole,
        hasAppliedToRole,
        hasAppliedToIdea,
        updateApplicationStatus,
        withdrawApplication,
        getUserApplications,
        getIdeaApplications,
        sendInvitation,
        respondToInvitation,
        cancelInvitation,
        getUserInvitations,
        getSentInvitations,
        addTeamMember,
        removeTeamMember,
        leaveTeam,
        updateMemberRole,
        isIdeaSaved,
        toggleSaveIdea,
        calculateMatchScore,
      }}
    >
      {children}
    </TeamUpContext.Provider>
  );
};

export const useTeamUp = () => {
  const context = useContext(TeamUpContext);
  if (!context) {
    throw new Error('useTeamUp must be used within a TeamUpProvider');
  }
  return context;
};
