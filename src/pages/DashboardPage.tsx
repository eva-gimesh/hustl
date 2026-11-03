import { formatBudgetRange, formatMoneyRange } from '../utils/currency';
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, PlatformRole } from '../context/AuthContext';
import { useFreelance } from '../context/FreelanceContext';
import { useRecruit } from '../context/RecruitContext';
import { useTeamUp } from '../context/TeamUpContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetaTag } from '../components/ui/Badge';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Bookmark,
  Sparkles,
  Clock,
  ArrowUpRight,
  Settings,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Sliders,
  Filter,
  Eye,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Layers,
  Send,
  Inbox,
  UserCheck,
  RefreshCw,
  FileText,
  Plus,
  Compass,
  Check,
  Calendar,
  IndianRupee as DollarSign,
  Building,
  Rocket,
  MapPin,
  ChevronDown
} from 'lucide-react';

type DashboardTab = 'overview' | 'applications' | 'postings' | 'recommendations' | 'saved' | 'activity' | 'settings';
type RoleLens = 'all' | 'student' | 'freelancer' | 'recruiter' | 'founder';

interface UnifiedApplication {
  id: string;
  sourceType: 'freelance' | 'recruit' | 'teamup';
  title: string;
  entityName: string;
  entitySubtitle?: string;
  linkUrl: string;
  compensationOrBudget: string;
  workMode: string;
  date: string;
  rawDate: number;
  status: string;
  statusVariant: 'neutral' | 'accent' | 'warning' | 'danger';
  canWithdraw: boolean;
  onWithdraw: () => void;
}

interface RecommendedItem {
  id: string;
  pillar: 'freelance' | 'recruit' | 'teamup';
  title: string;
  creatorOrCompany: string;
  workMode: string;
  compensation: string;
  matchScore: number;
  matchedSkills: string[];
  explanation: string;
  linkUrl: string;
  isSaved: boolean;
  onToggleSave: () => void;
}

interface ActivityEvent {
  id: string;
  type: 'application' | 'invitation' | 'posting' | 'status_change';
  title: string;
  description: string;
  timestamp: string;
  rawTimestamp: number;
  linkUrl?: string;
  badge: string;
  badgeColor: string;
}

const PREF_STORAGE_KEY = 'hustl_dashboard_preferences_v1';
const LENS_STORAGE_KEY = 'hustl_dashboard_lens_v1';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfileData } = useAuth();
  const {
    projects: freelanceProjects,
    applications: freelanceApps,
    savedProjectIds,
    toggleSaveProject,
    isProjectSaved,
    getUserApplications: getFreelanceUserApps,
    getUserProjects: getFreelanceUserProjects,
    withdrawApplication: withdrawFreelanceApp,
  } = useFreelance();

  const {
    jobs: recruitJobs,
    applications: recruitApps,
    savedJobIds,
    toggleSaveJob,
    isJobSaved,
    getUserApplications: getRecruitUserApps,
    getUserJobs: getRecruitUserJobs,
    getApplicationsForJob,
    withdrawApplication: withdrawRecruitApp,
    closeJob,
    reopenJob,
  } = useRecruit();

  const {
    ideas: teamUpIdeas,
    applications: teamUpApps,
    invitations: teamUpInvitations,
    savedIdeaIds,
    toggleSaveIdea,
    isIdeaSaved,
    getUserApplications: getTeamUpUserApps,
    getUserInvitations,
    getSentInvitations,
    withdrawApplication: withdrawTeamUpApp,
    respondToInvitation,
    toggleRecruitmentStatus,
  } = useTeamUp();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Multi-Role Active Lens
  const [activeLens, setActiveLens] = useState<RoleLens>(() => {
    try {
      const stored = localStorage.getItem(LENS_STORAGE_KEY);
      return (stored as RoleLens) || 'all';
    } catch {
      return 'all';
    }
  });

  // Custom Preferences (Visible Modules)
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem(PREF_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      showMetrics: true,
      showApplications: true,
      showPostings: true,
      showRecommendations: true,
      showSaved: true,
      showActivity: true,
      compactView: false,
      notifications: true,
    };
  });

  // Save Preferences
  const updatePreference = (key: string, val: boolean) => {
    setPreferences((prev: typeof preferences) => {
      const updated = { ...prev, [key]: val };
      try {
        localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleLensChange = (lens: RoleLens) => {
    setActiveLens(lens);
    try {
      localStorage.setItem(LENS_STORAGE_KEY, lens);
    } catch (e) {
      console.error(e);
    }
  };

  // Sub-tab filters
  const [appPillarFilter, setAppPillarFilter] = useState<'all' | 'freelance' | 'recruit' | 'teamup'>('all');
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'active' | 'accepted' | 'closed'>('all');
  const [recPillarFilter, setRecPillarFilter] = useState<'all' | 'freelance' | 'recruit' | 'teamup'>('all');
  const [savedPillarFilter, setSavedPillarFilter] = useState<'all' | 'freelance' | 'recruit' | 'teamup'>('all');
  const [postingsPillarFilter, setPostingsPillarFilter] = useState<'all' | 'freelance' | 'recruit' | 'teamup'>('all');

  // Dismissed recommendation IDs
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);

  // Profile Checklist Modal state
  const [showProfileAudit, setShowProfileAudit] = useState(false);

  // Status feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentUserId = user?.id || 'usr_demo_8829';

  // -------------------------------------------------------------
  // 1. CALCULATE REAL PROFILE COMPLETION
  // -------------------------------------------------------------
  const profileAudit = useMemo(() => {
    const checks = [
      {
        id: 'avatar',
        label: 'Profile Photo / Avatar',
        completed: Boolean(user?.avatarUrl && user.avatarUrl.trim().length > 0),
        actionLink: '/profile',
        description: 'Add a high-resolution headshot or custom operator avatar.',
      },
      {
        id: 'bio',
        label: 'Professional Bio & Headline',
        completed: Boolean(user?.bio && user.bio.trim().length > 20),
        actionLink: '/profile',
        description: 'Describe what you build, your engineering focus, or vision.',
      },
      {
        id: 'skills',
        label: 'Core Technical Skills',
        completed: Boolean(user?.skills && user.skills.length >= 3),
        actionLink: '/profile',
        description: 'Add at least 3 verified technical skills or design tools.',
      },
      {
        id: 'education',
        label: 'Academic Background',
        completed: Boolean(user?.institution || user?.education?.institution),
        actionLink: '/onboarding',
        description: 'List your university, college, or active degree program.',
      },
      {
        id: 'experience',
        label: 'Experience & Past Work',
        completed: Boolean(user?.experience?.level || user?.experience?.previousExperience),
        actionLink: '/onboarding',
        description: 'Highlight past internships, personal projects, or startup contributions.',
      },
      {
        id: 'portfolio',
        label: 'Portfolio or GitHub Links',
        completed: Boolean(
          user?.preferences?.portfolioUrl ||
          user?.preferences?.githubUrl ||
          user?.preferences?.linkedinUrl
        ),
        actionLink: '/profile',
        description: 'Connect your GitHub, Behance, or live production URLs.',
      },
      {
        id: 'roles',
        label: 'Ecosystem Roles & Personas',
        completed: Boolean(user?.roles && user.roles.length > 0),
        actionLink: '/onboarding',
        description: 'Select your operational roles (Student, Freelancer, Founder, Recruiter).',
      },
      {
        id: 'availability',
        label: 'Availability & Work Status',
        completed: Boolean(user?.preferences?.availability),
        actionLink: '#availability',
        description: 'Set whether you are actively available now or busy on ventures.',
      },
    ];

    const completedCount = checks.filter((c) => c.completed).length;
    const percentage = Math.round((completedCount / checks.length) * 100);

    return {
      checks,
      completedCount,
      totalCount: checks.length,
      percentage,
    };
  }, [user]);

  // Handle Availability Change directly
  const handleAvailabilityChange = async (newAvailability: string) => {
    if (updateProfileData && user) {
      await updateProfileData({
        preferences: {
          ...user.preferences,
          lookingFor: user.preferences?.lookingFor || [],
          availability: newAvailability,
        },
      });
      showToast(`Availability updated to "${newAvailability}"`);
    }
  };

  // -------------------------------------------------------------
  // 2. RETRIEVE REAL DATA ACROSS ALL 3 PILLARS
  // -------------------------------------------------------------
  // User's Submitted Applications / Proposals
  const myFreelanceApps = useMemo(() => {
    return getFreelanceUserApps(currentUserId);
  }, [getFreelanceUserApps, currentUserId, freelanceApps]);

  const myRecruitApps = useMemo(() => {
    return getRecruitUserApps(currentUserId);
  }, [getRecruitUserApps, currentUserId, recruitApps]);

  const myTeamUpApps = useMemo(() => {
    return getTeamUpUserApps(currentUserId);
  }, [getTeamUpUserApps, currentUserId, teamUpApps]);

  // User's Received & Sent TeamUp Invitations
  const myReceivedInvitations = useMemo(() => {
    return getUserInvitations(currentUserId);
  }, [getUserInvitations, currentUserId, teamUpInvitations]);

  const mySentInvitations = useMemo(() => {
    return getSentInvitations(currentUserId);
  }, [getSentInvitations, currentUserId, teamUpInvitations]);

  // User's Created / Managed Postings
  const myClientProjects = useMemo(() => {
    return getFreelanceUserProjects(currentUserId);
  }, [getFreelanceUserProjects, currentUserId, freelanceProjects]);

  const myRecruitJobs = useMemo(() => {
    return getRecruitUserJobs(currentUserId);
  }, [getRecruitUserJobs, currentUserId, recruitJobs]);

  const myStartupIdeas = useMemo(() => {
    return teamUpIdeas.filter((idea) => idea.ownerId === currentUserId);
  }, [teamUpIdeas, currentUserId]);

  // Calculate candidates needing review across all user's listings
  const myReviewCandidatesCount = useMemo(() => {
    // 1. Applicants on user's posted freelance projects
    const freelanceApplicants = myClientProjects.reduce((acc, p) => acc + (p.applicantCount || 0), 0);
    
    // 2. Candidates on user's recruit jobs
    const recruitCandidates = myRecruitJobs.reduce((acc, j) => {
      const candidates = getApplicationsForJob(j.id);
      return acc + candidates.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
    }, 0);

    // 3. Applicants on user's startup ideas
    const teamUpApplicants = teamUpApps.filter(
      (app) => myStartupIdeas.some((idea) => idea.id === app.ideaId) &&
               (app.status === 'Submitted' || app.status === 'Reviewing')
    ).length;

    return freelanceApplicants + recruitCandidates + teamUpApplicants;
  }, [myClientProjects, myRecruitJobs, myStartupIdeas, getApplicationsForJob, teamUpApps]);

  // -------------------------------------------------------------
  // 3. UNIFIED APPLICATIONS LIST
  // -------------------------------------------------------------
  const unifiedApplications: UnifiedApplication[] = useMemo(() => {
    const list: UnifiedApplication[] = [];

    // Freelance proposals
    myFreelanceApps.forEach((app) => {
      const project = freelanceProjects.find((p) => p.id === app.projectId);
      let statusVariant: 'neutral' | 'accent' | 'warning' | 'danger' = 'neutral';
      if (app.status === 'Accepted') statusVariant = 'accent';
      else if (app.status === 'Shortlisted') statusVariant = 'accent';
      else if (app.status === 'Under Review') statusVariant = 'warning';
      else if (app.status === 'Rejected' || app.status === 'Withdrawn') statusVariant = 'danger';

      list.push({
        id: `freelance-${app.id}`,
        sourceType: 'freelance',
        title: app.projectTitle || project?.title || 'Freelance Project',
        entityName: app.clientName || project?.clientName || 'Direct Client',
        entitySubtitle: project?.category || 'Development',
        linkUrl: `/freelance/${app.projectId}`,
        compensationOrBudget: app.proposedBudget || (project ? formatMoneyRange(project.budgetMin, project.budgetMax, project.currency) : 'Negotiable'),
        workMode: project?.workMode || 'Remote',
        date: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent',
        rawDate: app.createdAt ? new Date(app.createdAt).getTime() : Date.now(),
        status: app.status,
        statusVariant,
        canWithdraw: app.status === 'Submitted' || app.status === 'Under Review',
        onWithdraw: () => {
          if (window.confirm('Are you sure you want to withdraw this proposal?')) {
            withdrawFreelanceApp(app.id);
            showToast('Proposal withdrawn successfully.');
          }
        },
      });
    });

    // Recruit job applications
    myRecruitApps.forEach((app) => {
      const job = recruitJobs.find((j) => j.id === app.jobId);
      let statusVariant: 'neutral' | 'accent' | 'warning' | 'danger' = 'neutral';
      if (app.status === 'Selected' || app.status === 'Interview') statusVariant = 'accent';
      else if (app.status === 'Shortlisted') statusVariant = 'accent';
      else if (app.status === 'Submitted' || app.status === 'Under Review') statusVariant = 'warning';
      else if (app.status === 'Rejected' || app.status === 'Withdrawn') statusVariant = 'danger';

      list.push({
        id: `recruit-${app.id}`,
        sourceType: 'recruit',
        title: app.jobTitle || job?.title || 'Job Opening',
        entityName: app.companyName || job?.companyName || 'Recruiting Company',
        entitySubtitle: job?.employmentType || 'Internship',
        linkUrl: `/recruit/opportunities/${app.jobId}`,
        compensationOrBudget: job?.compensation || 'Standard Rate',
        workMode: job?.workMode || 'Hybrid',
        date: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent',
        rawDate: app.appliedAt ? new Date(app.appliedAt).getTime() : Date.now(),
        status: app.status,
        statusVariant,
        canWithdraw: app.status === 'Submitted' || app.status === 'Under Review',
        onWithdraw: () => {
          if (window.confirm('Withdraw your application for this position?')) {
            withdrawRecruitApp(app.id);
            showToast('Job application withdrawn.');
          }
        },
      });
    });

    // TeamUp collaboration applications
    myTeamUpApps.forEach((app) => {
      const idea = teamUpIdeas.find((i) => i.id === app.ideaId);
      let statusVariant: 'neutral' | 'accent' | 'warning' | 'danger' = 'neutral';
      if (app.status === 'Accepted') statusVariant = 'accent';
      else if (app.status === 'Submitted' || app.status === 'Reviewing') statusVariant = 'warning';
      else if (app.status === 'Declined' || app.status === 'Withdrawn') statusVariant = 'danger';


      list.push({
        id: `teamup-${app.id}`,
        sourceType: 'teamup',
        title: `${app.roleTitle} // ${app.ideaTitle || idea?.title}`,
        entityName: idea?.ownerName || 'Venture Founder',
        entitySubtitle: idea?.industry || 'Startup Collaboration',
        linkUrl: `/teamup/ideas/${app.ideaId}`,
        compensationOrBudget: idea?.compensationModel || 'Equity / Rev-Share',
        workMode: idea?.workMode || 'Remote',
        date: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent',
        rawDate: app.createdAt ? new Date(app.createdAt).getTime() : Date.now(),
        status: app.status,
        statusVariant,
        canWithdraw: app.status === 'Submitted' || app.status === 'Reviewing',
        onWithdraw: () => {
          if (window.confirm('Withdraw this collaboration application?')) {
            withdrawTeamUpApp(app.id);
            showToast('TeamUp application withdrawn.');
          }
        },
      });
    });

    // Sort by latest first
    return list.sort((a, b) => b.rawDate - a.rawDate);
  }, [myFreelanceApps, myRecruitApps, myTeamUpApps, freelanceProjects, recruitJobs, teamUpIdeas, withdrawFreelanceApp, withdrawRecruitApp, withdrawTeamUpApp]);

  // Filtered applications based on current sub-filters
  const filteredApplications = useMemo(() => {
    return unifiedApplications.filter((app) => {
      if (appPillarFilter !== 'all' && app.sourceType !== appPillarFilter) return false;
      if (appStatusFilter === 'active') {
        const isAct = app.status === 'Submitted' || app.status === 'Under Review' || app.status === 'Reviewing';
        if (!isAct) return false;
      } else if (appStatusFilter === 'accepted') {
        const isAcc = app.status === 'Accepted' || app.status === 'Shortlisted' || app.status === 'Interview' || app.status === 'Offer';
        if (!isAcc) return false;
      } else if (appStatusFilter === 'closed') {
        const isCls = app.status === 'Rejected' || app.status === 'Withdrawn';
        if (!isCls) return false;
      }
      return true;
    });
  }, [unifiedApplications, appPillarFilter, appStatusFilter]);

  // -------------------------------------------------------------
  // 4. RULE-BASED RECOMMENDED OPPORTUNITIES
  // -------------------------------------------------------------
  const recommendations: RecommendedItem[] = useMemo(() => {
    const userSkills = user?.skills || [];
    const coverage = (hit: number, total: number) => (total > 0 ? Math.round((hit / total) * 100) : 0);
    const items: RecommendedItem[] = [];

    // Score Freelance Projects
    freelanceProjects.forEach((proj) => {
      if (dismissedRecs.includes(`freelance-${proj.id}`)) return;
      if (myFreelanceApps.some((a) => a.projectId === proj.id)) return; // already applied

      const intersection = proj.requiredSkills.filter((sk) =>
        userSkills.some((us) => us.toLowerCase() === sk.toLowerCase())
      );
      if (intersection.length > 0) {
        const score = coverage(intersection.length, proj.requiredSkills.length);
        items.push({
          id: `freelance-${proj.id}`,
          pillar: 'freelance',
          title: proj.title,
          creatorOrCompany: proj.clientName,
          workMode: proj.workMode,
          compensation:
            formatMoneyRange(proj.budgetMin, proj.budgetMax, proj.currency),
          matchScore: score,
          matchedSkills: intersection.length > 0 ? intersection : proj.requiredSkills.slice(0, 2),
          explanation: intersection.length > 0
            ? `Matches ${intersection.length} of your skills (${intersection.join(', ')})`
            : `Featured high-priority sprint matching your general focus`,
          linkUrl: `/freelance/${proj.id}`,
          isSaved: isProjectSaved(proj.id),
          onToggleSave: () => toggleSaveProject(proj.id),
        });
      }
    });

    // Score Recruit Jobs
    recruitJobs.forEach((job) => {
      if (dismissedRecs.includes(`recruit-${job.id}`)) return;
      if (myRecruitApps.some((a) => a.jobId === job.id)) return; // already applied

      const intersection = job.requiredSkills.filter((sk) =>
        userSkills.some((us) => us.toLowerCase() === sk.toLowerCase())
      );
      if (intersection.length > 0) {
        const score = coverage(intersection.length, job.requiredSkills.length);
        items.push({
          id: `recruit-${job.id}`,
          pillar: 'recruit',
          title: job.title,
          creatorOrCompany: job.companyName,
          workMode: job.workMode,
          compensation: job.compensation,
          matchScore: score,
          matchedSkills: intersection.length > 0 ? intersection : job.requiredSkills.slice(0, 2),
          explanation: intersection.length > 0
            ? `Matches ${intersection.length} core requirements (${intersection.join(', ')})`
            : `Verified studio hiring talent in your category`,
          linkUrl: `/recruit/opportunities/${job.id}`,
          isSaved: isJobSaved(job.id),
          onToggleSave: () => toggleSaveJob(job.id),
        });
      }
    });

    // Score TeamUp Ideas
    teamUpIdeas.forEach((idea) => {
      if (dismissedRecs.includes(`teamup-${idea.id}`)) return;
      if (idea.ownerId === currentUserId) return; // user's own venture
      if (myTeamUpApps.some((a) => a.ideaId === idea.id)) return; // already applied

      const intersection = (idea.requiredSkills || []).filter((sk) =>
        userSkills.some((us) => us.toLowerCase() === sk.toLowerCase())
      );
      if (intersection.length > 0) {
        const score = coverage(intersection.length, (idea.requiredSkills || []).length);
        items.push({
          id: `teamup-${idea.id}`,
          pillar: 'teamup',
          title: idea.title,
          creatorOrCompany: `Led by ${idea.ownerName}`,
          workMode: idea.workMode,
          compensation: idea.compensationModel,
          matchScore: score,
          matchedSkills: intersection.length > 0 ? intersection : (idea.requiredSkills || []).slice(0, 2),
          explanation: intersection.length > 0
            ? `Complementary co-founder match on ${intersection.join(', ')}`
            : `Actively assembling founding teammates in ${idea.industry}`,
          linkUrl: `/teamup/ideas/${idea.id}`,
          isSaved: isIdeaSaved(idea.id),
          onToggleSave: () => toggleSaveIdea(idea.id),
        });
      }
    });

    // Sort by match score descending
    return items.sort((a, b) => b.matchScore - a.matchScore);
  }, [freelanceProjects, recruitJobs, teamUpIdeas, user?.skills, dismissedRecs, myFreelanceApps, myRecruitApps, myTeamUpApps, isProjectSaved, isJobSaved, isIdeaSaved, toggleSaveProject, toggleSaveJob, toggleSaveIdea, currentUserId]);

  const filteredRecommendations = useMemo(() => {
    if (recPillarFilter === 'all') return recommendations;
    return recommendations.filter((r) => r.pillar === recPillarFilter);
  }, [recommendations, recPillarFilter]);

  // -------------------------------------------------------------
  // 5. UNIFIED SAVED OPPORTUNITIES
  // -------------------------------------------------------------
  const unifiedSaved = useMemo(() => {
    const list: Array<{
      id: string;
      pillar: 'freelance' | 'recruit' | 'teamup';
      title: string;
      subtitle: string;
      compensation: string;
      workMode: string;
      linkUrl: string;
      onRemove: () => void;
    }> = [];

    // Saved Freelance
    savedProjectIds.forEach((pid) => {
      const p = freelanceProjects.find((x) => x.id === pid);
      if (p) {
        list.push({
          id: `saved-free-${p.id}`,
          pillar: 'freelance',
          title: p.title,
          subtitle: p.clientName,
          compensation: formatMoneyRange(p.budgetMin, p.budgetMax, p.currency),
          workMode: p.workMode,
          linkUrl: `/freelance/${p.id}`,
          onRemove: () => {
            toggleSaveProject(p.id);
            showToast('Project removed from saved.');
          },
        });
      }
    });

    // Saved Recruit
    savedJobIds.forEach((jid) => {
      const j = recruitJobs.find((x) => x.id === jid);
      if (j) {
        list.push({
          id: `saved-rec-${j.id}`,
          pillar: 'recruit',
          title: j.title,
          subtitle: j.companyName,
          compensation: j.compensation,
          workMode: j.workMode,
          linkUrl: `/recruit/opportunities/${j.id}`,
          onRemove: () => {
            toggleSaveJob(j.id);
            showToast('Job removed from saved.');
          },
        });
      }
    });

    // Saved TeamUp
    savedIdeaIds.forEach((iid) => {
      const i = teamUpIdeas.find((x) => x.id === iid);
      if (i) {
        list.push({
          id: `saved-team-${i.id}`,
          pillar: 'teamup',
          title: i.title,
          subtitle: `By ${i.ownerName}`,
          compensation: i.compensationModel,
          workMode: i.workMode,
          linkUrl: `/teamup/ideas/${i.id}`,
          onRemove: () => {
            toggleSaveIdea(i.id);
            showToast('Venture removed from saved.');
          },
        });
      }
    });

    return list;
  }, [savedProjectIds, savedJobIds, savedIdeaIds, freelanceProjects, recruitJobs, teamUpIdeas, toggleSaveProject, toggleSaveJob, toggleSaveIdea]);

  const filteredSaved = useMemo(() => {
    if (savedPillarFilter === 'all') return unifiedSaved;
    return unifiedSaved.filter((item) => item.pillar === savedPillarFilter);
  }, [unifiedSaved, savedPillarFilter]);

  // -------------------------------------------------------------
  // 6. REAL RECENT ACTIVITY STREAM
  // -------------------------------------------------------------
  const activityEvents: ActivityEvent[] = useMemo(() => {
    const events: ActivityEvent[] = [];

    // Applications submitted
    myFreelanceApps.forEach((app) => {
      events.push({
        id: `act-fapp-${app.id}`,
        type: 'application',
        title: `Submitted Freelance Proposal`,
        description: `Applied to "${app.projectTitle}" for ${app.proposedBudget || 'standard budget'}.`,
        timestamp: app.createdAt || 'Recent',
        rawTimestamp: app.createdAt ? new Date(app.createdAt).getTime() : Date.now() - 86400000,
        linkUrl: `/freelance/${app.projectId}`,
        badge: 'FREELANCE',
        badgeColor: 'border-[#B6FF4A]/40 text-[#B6FF4A] bg-[#B6FF4A]/10',
      });
    });

    myRecruitApps.forEach((app) => {
      events.push({
        id: `act-rapp-${app.id}`,
        type: 'application',
        title: `Applied to ${app.jobTitle}`,
        description: `Sent candidate application to ${app.companyName}. Current status: ${app.status}.`,
        timestamp: app.appliedAt || 'Recent',
        rawTimestamp: app.appliedAt ? new Date(app.appliedAt).getTime() : Date.now() - 172800000,
        linkUrl: `/recruit/opportunities/${app.jobId}`,
        badge: 'RECRUIT',
        badgeColor: 'border-cyan-400/40 text-cyan-400 bg-cyan-400/10',
      });
    });

    myTeamUpApps.forEach((app) => {
      events.push({
        id: `act-tapp-${app.id}`,
        type: 'application',
        title: `Requested Co-Founder Collaboration`,
        description: `Applied for ${app.roleTitle} on "${app.ideaTitle}".`,
        timestamp: app.createdAt || 'Recent',
        rawTimestamp: app.createdAt ? new Date(app.createdAt).getTime() : Date.now() - 250000000,
        linkUrl: `/teamup/ideas/${app.ideaId}`,
        badge: 'TEAMUP',
        badgeColor: 'border-purple-400/40 text-purple-400 bg-purple-400/10',
      });
    });

    // Invitations received
    myReceivedInvitations.forEach((inv) => {
      events.push({
        id: `act-inv-${inv.id}`,
        type: 'invitation',
        title: `Received Team Invitation from ${inv.invitedByUserName}`,
        description: `Invited to join ${inv.ideaTitle} as ${inv.roleTitle}.`,
        timestamp: inv.createdAt || 'Recent',
        rawTimestamp: inv.createdAt ? new Date(inv.createdAt).getTime() : Date.now() - 50000000,
        linkUrl: `/teamup/invitations`,
        badge: 'INVITATION',
        badgeColor: 'border-amber-400/40 text-amber-400 bg-amber-400/10',
      });
    });

    // Posted projects
    myClientProjects.forEach((proj) => {
      events.push({
        id: `act-post-proj-${proj.id}`,
        type: 'posting',
        title: `Published Client Project`,
        description: `Listed "${proj.title}" (${proj.applicantCount || 0} applicants registered).`,
        timestamp: proj.postedDate || 'Recent',
        rawTimestamp: Date.now() - 400000000,
        linkUrl: `/freelance/${proj.id}`,
        badge: 'CLIENT',
        badgeColor: 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10',
      });
    });

    // Posted jobs
    myRecruitJobs.forEach((job) => {
      events.push({
        id: `act-post-job-${job.id}`,
        type: 'posting',
        title: `Opened Recruitment Opening`,
        description: `Hiring for "${job.title}" at ${job.companyName}.`,
        timestamp: job.postedDate || 'Recent',
        rawTimestamp: job.postedDate ? new Date(job.postedDate).getTime() : Date.now() - 500000000,
        linkUrl: `/recruit/opportunities/${job.id}`,
        badge: 'HIRING',
        badgeColor: 'border-cyan-400/40 text-cyan-400 bg-cyan-400/10',
      });
    });

    // Posted ideas
    myStartupIdeas.forEach((idea) => {
      events.push({
        id: `act-post-idea-${idea.id}`,
        type: 'posting',
        title: `Founded Venture Project`,
        description: `Launched "${idea.title}" on TeamUp (${idea.teamSize} current teammates).`,
        timestamp: idea.createdAt || 'Recent',
        rawTimestamp: idea.createdAt ? new Date(idea.createdAt).getTime() : Date.now() - 600000000,
        linkUrl: `/teamup/ideas/${idea.id}`,
        badge: 'VENTURE',
        badgeColor: 'border-[#B6FF4A]/40 text-[#B6FF4A] bg-[#B6FF4A]/10',
      });
    });

    return events.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
  }, [myFreelanceApps, myRecruitApps, myTeamUpApps, myReceivedInvitations, myClientProjects, myRecruitJobs, myStartupIdeas]);

  // Total saved count
  const totalSavedCount = savedProjectIds.length + savedJobIds.length + savedIdeaIds.length;

  // Pending invitations count
  const pendingInvitationsCount = myReceivedInvitations.filter((i) => i.status === 'Pending').length;

  // Real Metric Numbers
  const totalApplicationsCount = unifiedApplications.length;
  const activeApplicationsCount = unifiedApplications.filter(
    (a) => a.status === 'Submitted' || a.status === 'Under Review' || a.status === 'Reviewing'
  ).length;
  const totalManagedPostings = myClientProjects.length + myRecruitJobs.length + myStartupIdeas.length;

  return (
    <div className="w-full min-h-screen bg-[#080B09] text-[#F4F7F1] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141B15] border border-[#B6FF4A] text-[#F4F7F1] px-4 py-3 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 animate-fade-in font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#B6FF4A] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#A0AAA0] hover:text-[#F4F7F1] ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header / Breadcrumb Bar */}
      <div className="border-b border-[#273128] bg-[#101510]/80 backdrop-blur-sm sticky top-18 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#B6FF4A] font-bold tracking-wider uppercase">
              HUSTL // COMMAND_CENTER
            </span>
            <span className="text-[#273128]">/</span>
            <span className="font-mono text-xs text-[#A0AAA0]">
              {user?.fullName || 'Active Operator'}
            </span>
            <span className="text-[#273128]">/</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#141B15] border border-[#273128] rounded-xs font-mono text-[10px] text-[#B6FF4A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF4A] animate-pulse"></span>
              LIVE_SYSTEM
            </span>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Link
              to="/freelance"
              className="px-2.5 py-1 text-xs font-mono bg-[#141B15] hover:bg-[#1a231b] border border-[#273128] hover:border-[#B6FF4A]/40 text-[#A0AAA0] hover:text-[#F4F7F1] transition-colors whitespace-nowrap"
            >
              Freelance Hub
            </Link>
            <Link
              to="/recruit"
              className="px-2.5 py-1 text-xs font-mono bg-[#141B15] hover:bg-[#1a231b] border border-[#273128] hover:border-[#B6FF4A]/40 text-[#A0AAA0] hover:text-[#F4F7F1] transition-colors whitespace-nowrap"
            >
              Recruit Hub
            </Link>
            <Link
              to="/teamup"
              className="px-2.5 py-1 text-xs font-mono bg-[#141B15] hover:bg-[#1a231b] border border-[#273128] hover:border-[#B6FF4A]/40 text-[#A0AAA0] hover:text-[#F4F7F1] transition-colors whitespace-nowrap"
            >
              TeamUp Radar
            </Link>
            {pendingInvitationsCount > 0 && (
              <Link
                to="/teamup/invitations"
                className="px-2.5 py-1 text-xs font-mono bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 whitespace-nowrap animate-pulse"
              >
                <Inbox className="w-3 h-3" />
                {pendingInvitationsCount} Invites
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Main Grid: Sidebar Rail (Desktop) + Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ======================================================== */}
          {/* LEFT NAVIGATION RAIL (Desktop)                           */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 space-y-6">
            {/* Operator Card */}
            <div className="bg-[#141B15] border border-[#273128] p-5 rounded-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#B6FF4A]/5 blur-2xl pointer-events-none"></div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#101510] border-2 border-[#B6FF4A] flex items-center justify-center font-display font-extrabold text-xl text-[#B6FF4A] shrink-0 overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'HU'
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-display font-bold text-lg text-[#F4F7F1] truncate">
                    {user?.fullName || 'HUSTL Operator'}
                  </h2>
                  <p className="text-xs font-mono text-[#A0AAA0] truncate">
                    {user?.email || 'operator@hustl.io'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-[#B6FF4A]/10 border border-[#B6FF4A]/30 text-[10px] font-mono text-[#B6FF4A] uppercase">
                      Verified
                    </span>
                    {user?.institution && (
                      <span className="px-1.5 py-0.5 bg-[#101510] border border-[#273128] text-[10px] font-mono text-[#A0AAA0] truncate max-w-[120px]">
                        {user.institution}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Completion Bar */}
              <div className="mt-5 pt-4 border-t border-[#273128]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-[#A0AAA0]">Profile Audit:</span>
                  <button
                    onClick={() => setShowProfileAudit(true)}
                    className="font-mono font-bold text-[#B6FF4A] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {profileAudit.percentage}% Complete
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="w-full h-1.5 bg-[#101510] border border-[#273128] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7CCB37] to-[#B6FF4A] transition-all duration-500"
                    style={{ width: `${profileAudit.percentage}%` }}
                  ></div>
                </div>
                {profileAudit.percentage < 100 && (
                  <button
                    onClick={() => setShowProfileAudit(true)}
                    className="mt-2 text-[11px] font-mono text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{profileAudit.totalCount - profileAudit.completedCount} fields to reach 100%</span>
                  </button>
                )}
              </div>

              {/* Quick Availability Switcher */}
              <div className="mt-4 pt-3 border-t border-[#273128]/70">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#A0AAA0] mb-1.5">
                  <span>Current Availability:</span>
                </div>
                <select
                  value={user?.preferences?.availability || 'Available now'}
                  onChange={(e) => handleAvailabilityChange(e.target.value)}
                  className="w-full bg-[#101510] border border-[#273128] text-xs font-mono text-[#F4F7F1] px-2.5 py-1.5 rounded-sm focus:border-[#B6FF4A] focus:outline-hidden cursor-pointer"
                >
                  <option value="Available now">🟢 Available now</option>
                  <option value="Open to offers">🟡 Open to offers</option>
                  <option value="Busy on ventures">🔴 Busy on ventures</option>
                  <option value="On sabbatical">⚪ On sabbatical</option>
                </select>
              </div>

              {/* View Public Profile Link */}
              <div className="mt-4 pt-3 border-t border-[#273128]/70 flex items-center justify-between">
                <Link
                  to={`/profile/${currentUserId}`}
                  className="text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Public Profile</span>
                </Link>
                <Link
                  to="/onboarding"
                  className="text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] transition-colors"
                  title="Configure roles and info"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Navigation Tabs Rail */}
            <div className="bg-[#141B15] border border-[#273128] p-2 rounded-sm space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono tracking-wider transition-colors cursor-pointer rounded-xs ${
                  activeTab === 'overview'
                    ? 'bg-[#B6FF4A] text-[#080B09] font-bold shadow-xs'
                    : 'text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#101510]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>OVERVIEW</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'overview' ? 'text-[#080B09]' : 'text-[#273128]'}`} />
              </button>

              <button
                onClick={() => setActiveTab('applications')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono tracking-wider transition-colors cursor-pointer rounded-xs ${
                  activeTab === 'applications'
                    ? 'bg-[#B6FF4A] text-[#080B09] font-bold shadow-xs'
                    : 'text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#101510]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>APPLICATIONS</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs ${
                  activeTab === 'applications' ? 'bg-[#080B09] text-[#B6FF4A]' : 'bg-[#101510] text-[#A0AAA0]'
                }`}>
                  {totalApplicationsCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('postings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono tracking-wider transition-colors cursor-pointer rounded-xs ${
                  activeTab === 'postings'
                    ? 'bg-[#B6FF4A] text-[#080B09] font-bold shadow-xs'
                    : 'text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#101510]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>MY POSTS & TEAMS</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs ${
                  activeTab === 'postings' ? 'bg-[#080B09] text-[#B6FF4A]' : 'bg-[#101510] text-[#A0AAA0]'
                }`}>
                  {totalManagedPostings}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('recommendations')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono tracking-wider transition-colors cursor-pointer rounded-xs ${
                  activeTab === 'recommendations'
                    ? 'bg-[#B6FF4A] text-[#080B09] font-bold shadow-xs'
                    : 'text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#101510]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4" />
                  <span>RECOMMENDED</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs ${
                  activeTab === 'recommendations' ? 'bg-[#080B09] text-[#B6FF4A]' : 'bg-[#101510] text-[#A0AAA0]'
                }`}>
                  {recommendations.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono tracking-wider transition-colors cursor-pointer rounded-xs ${
                  activeTab === 'saved'
                    ? 'bg-[#B6FF4A] text-[#080B09] font-bold shadow-xs'
                    : 'text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#101510]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4" />
                  <span>SAVED OPPORTUNITIES</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs ${
                  activeTab === 'saved' ? 'bg-[#080B09] text-[#B6FF4A]' : 'bg-[#101510] text-[#A0AAA0]'
                }`}>
                  {totalSavedCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono tracking-wider transition-colors cursor-pointer rounded-xs ${
                  activeTab === 'activity'
                    ? 'bg-[#B6FF4A] text-[#080B09] font-bold shadow-xs'
                    : 'text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#101510]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4" />
                  <span>RECENT ACTIVITY</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs ${
                  activeTab === 'activity' ? 'bg-[#080B09] text-[#B6FF4A]' : 'bg-[#101510] text-[#A0AAA0]'
                }`}>
                  {activityEvents.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono tracking-wider transition-colors cursor-pointer rounded-xs ${
                  activeTab === 'settings'
                    ? 'bg-[#B6FF4A] text-[#080B09] font-bold shadow-xs'
                    : 'text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#101510]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4" />
                  <span>DASHBOARD SETTINGS</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'settings' ? 'text-[#080B09]' : 'text-[#273128]'}`} />
              </button>
            </div>

            {/* Pillar Direct Launchers */}
            <div className="bg-[#141B15] border border-[#273128] p-4 rounded-sm space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A0AAA0]">
                Quick Create
              </span>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Link
                  to="/freelance/create"
                  className="flex items-center justify-between p-2 bg-[#101510] hover:bg-[#19221a] border border-[#273128] hover:border-[#B6FF4A]/40 text-xs font-mono text-[#F4F7F1] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#B6FF4A]" />
                    Post Client Gig
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#A0AAA0]" />
                </Link>

                <Link
                  to="/recruit/create"
                  className="flex items-center justify-between p-2 bg-[#101510] hover:bg-[#19221a] border border-[#273128] hover:border-[#B6FF4A]/40 text-xs font-mono text-[#F4F7F1] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    Post Job / Internship
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#A0AAA0]" />
                </Link>

                <Link
                  to="/teamup/create"
                  className="flex items-center justify-between p-2 bg-[#101510] hover:bg-[#19221a] border border-[#273128] hover:border-[#B6FF4A]/40 text-xs font-mono text-[#F4F7F1] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                    Launch Venture Idea
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#A0AAA0]" />
                </Link>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT / MAIN CONTENT AREA                                */}
          {/* ======================================================== */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Top Multi-Role Lens Selector & Context Welcome */}
            <div className="bg-[#141B15] border border-[#273128] p-6 rounded-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#B6FF4A] uppercase tracking-wider">
                      COMMAND LENS
                    </span>
                    <span className="text-[#273128]">·</span>
                    <span className="font-mono text-xs text-[#A0AAA0]">
                      Adaptive Multi-Role Perspective
                    </span>
                  </div>
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F4F7F1] mt-1">
                    WELCOME BACK, {user?.fullName ? user.fullName.toUpperCase() : 'BUILDER'}
                  </h1>
                </div>

                {/* Adaptive Lens Buttons */}
                <div className="flex items-center gap-1 p-1 bg-[#101510] border border-[#273128] rounded-xs flex-wrap">
                  {(['all', 'student', 'freelancer', 'recruiter', 'founder'] as RoleLens[]).map((lens) => (
                    <button
                      key={lens}
                      onClick={() => handleLensChange(lens)}
                      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                        activeLens === lens
                          ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                          : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
                      }`}
                    >
                      {lens === 'all' ? 'Combined Overview' : lens}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lens Descriptive Callout */}
              <div className="mt-4 pt-3 border-t border-[#273128] flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[#A0AAA0] gap-2">
                <div>
                  {activeLens === 'all' && (
                    <span>Displaying aggregated opportunities, applications, and postings across Freelance, Recruit, and TeamUp.</span>
                  )}
                  {activeLens === 'student' && (
                    <span>Focused on student discovery: internship openings, venture teams seeking collaborators, and skill-matching gigs.</span>
                  )}
                  {activeLens === 'freelancer' && (
                    <span>Focused on client contracts, delivered milestones, active proposals, and incoming freelance opportunities.</span>
                  )}
                  {activeLens === 'recruiter' && (
                    <span>Focused on company job postings, candidate applications, candidate review status, and talent sourcing.</span>
                  )}
                  {activeLens === 'founder' && (
                    <span>Focused on co-founder discovery, equity venture ideas, incoming teammate applications, and squad building.</span>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[11px] text-[#7CCB37]">
                    Active Roles: {user?.roles?.join(', ') || 'Student, Freelancer, Founder'}
                  </span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* VIEW 1: OVERVIEW TAB                                     */}
            {/* ======================================================== */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* 1. Real-time Metric Cards (Calculated from Real Data) */}
                {preferences.showMetrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#141B15] border border-[#273128] p-4 rounded-sm">
                      <div className="flex items-center justify-between text-[#A0AAA0] text-xs font-mono">
                        <span>Active Applications</span>
                        <FileText className="w-3.5 h-3.5 text-[#B6FF4A]" />
                      </div>
                      <div className="font-mono font-bold text-2xl text-[#F4F7F1] mt-1.5">
                        {activeApplicationsCount}
                      </div>
                      <div className="text-[10px] font-mono text-[#A0AAA0] mt-1">
                        {totalApplicationsCount} lifetime submissions
                      </div>
                    </div>

                    <div className="bg-[#141B15] border border-[#273128] p-4 rounded-sm">
                      <div className="flex items-center justify-between text-[#A0AAA0] text-xs font-mono">
                        <span>Managed Postings</span>
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="font-mono font-bold text-2xl text-[#F4F7F1] mt-1.5">
                        {totalManagedPostings}
                      </div>
                      <div className="text-[10px] font-mono text-[#A0AAA0] mt-1">
                        Gigs, jobs & venture teams
                      </div>
                    </div>

                    <div className="bg-[#141B15] border border-[#273128] p-4 rounded-sm">
                      <div className="flex items-center justify-between text-[#A0AAA0] text-xs font-mono">
                        <span>Candidates / In Review</span>
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div className="font-mono font-bold text-2xl text-[#F4F7F1] mt-1.5">
                        {myReviewCandidatesCount}
                      </div>
                      <div className="text-[10px] font-mono text-[#A0AAA0] mt-1">
                        Across all your postings
                      </div>
                    </div>

                    <div className="bg-[#141B15] border border-[#273128] p-4 rounded-sm">
                      <div className="flex items-center justify-between text-[#A0AAA0] text-xs font-mono">
                        <span>Saved Opportunities</span>
                        <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="font-mono font-bold text-2xl text-[#F4F7F1] mt-1.5">
                        {totalSavedCount}
                      </div>
                      <div className="text-[10px] font-mono text-[#A0AAA0] mt-1">
                        Tracked across 3 pillars
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Action Required / Pending Invitations Callout (If any) */}
                {pendingInvitationsCount > 0 && (
                  <div className="bg-amber-950/20 border border-amber-500/40 p-5 rounded-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Inbox className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-display font-bold text-sm text-[#F4F7F1]">
                            You have {pendingInvitationsCount} Pending Team Invitation{pendingInvitationsCount > 1 ? 's' : ''}
                          </h3>
                          <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                            Founders on HUSTL have extended invitations for you to join their core squads.
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/teamup/invitations"
                        className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500 text-amber-200 text-xs font-mono tracking-wider uppercase transition-colors shrink-0 text-center"
                      >
                        Review Invitations ({pendingInvitationsCount})
                      </Link>
                    </div>
                  </div>
                )}

                {/* 3. Applications Tracker Preview (Top 3) */}
                <div className="bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#273128] pb-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#B6FF4A]" />
                      <h2 className="font-display font-bold text-lg text-[#F4F7F1]">
                        Active Applications & Proposals
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="text-xs font-mono text-[#B6FF4A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All ({totalApplicationsCount})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {unifiedApplications.length === 0 ? (
                    <div className="py-8 text-center space-y-3">
                      <p className="text-xs font-mono text-[#A0AAA0]">No applications submitted yet.</p>
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          to="/freelance"
                          className="px-3 py-1.5 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A] text-xs font-mono text-[#F4F7F1]"
                        >
                          Find Freelance Gigs
                        </Link>
                        <Link
                          to="/recruit/opportunities"
                          className="px-3 py-1.5 bg-[#101510] border border-[#273128] hover:border-cyan-400 text-xs font-mono text-[#F4F7F1]"
                        >
                          Find Internships
                        </Link>
                        <Link
                          to="/teamup/discover"
                          className="px-3 py-1.5 bg-[#101510] border border-[#273128] hover:border-purple-400 text-xs font-mono text-[#F4F7F1]"
                        >
                          Discover Teams
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unifiedApplications.slice(0, 3).map((app) => (
                        <div
                          key={app.id}
                          className="p-4 bg-[#101510] border border-[#273128] hover:border-[#273128]/80 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                                  app.sourceType === 'freelance'
                                    ? 'border-[#B6FF4A]/40 text-[#B6FF4A] bg-[#B6FF4A]/10'
                                    : app.sourceType === 'recruit'
                                    ? 'border-cyan-400/40 text-cyan-400 bg-cyan-400/10'
                                    : 'border-purple-400/40 text-purple-400 bg-purple-400/10'
                                }`}
                              >
                                {app.sourceType}
                              </span>
                              <Link
                                to={app.linkUrl}
                                className="font-display font-bold text-sm text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors truncate"
                              >
                                {app.title}
                              </Link>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
                              <span>{app.entityName}</span>
                              <span>·</span>
                              <span>{app.compensationOrBudget}</span>
                              <span>·</span>
                              <span>{app.workMode}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`px-2 py-0.5 text-xs font-mono border rounded-xs ${
                                app.statusVariant === 'accent'
                                  ? 'border-[#B6FF4A]/50 text-[#B6FF4A] bg-[#B6FF4A]/10 font-bold'
                                  : app.statusVariant === 'warning'
                                  ? 'border-amber-400/50 text-amber-300 bg-amber-400/10'
                                  : app.statusVariant === 'danger'
                                  ? 'border-rose-500/50 text-rose-300 bg-rose-500/10'
                                  : 'border-[#273128] text-[#A0AAA0] bg-[#141B15]'
                              }`}
                            >
                              {app.status}
                            </span>
                            <Link
                              to={app.linkUrl}
                              className="p-1.5 text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors"
                              title="View opportunity details"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Top Recommended Opportunities (Top 3) */}
                {preferences.showRecommendations && (
                  <div className="bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-[#273128] pb-3">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#B6FF4A]" />
                        <h2 className="font-display font-bold text-lg text-[#F4F7F1]">
                          Skill-Matched Opportunities
                        </h2>
                      </div>
                      <button
                        onClick={() => setActiveTab('recommendations')}
                        className="text-xs font-mono text-[#B6FF4A] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All ({recommendations.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendations.slice(0, 3).map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-[#101510] border border-[#273128] hover:border-[#B6FF4A]/40 p-4 rounded-xs flex flex-col justify-between space-y-3 transition-colors"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                                  rec.pillar === 'freelance'
                                    ? 'border-[#B6FF4A]/40 text-[#B6FF4A] bg-[#B6FF4A]/10'
                                    : rec.pillar === 'recruit'
                                    ? 'border-cyan-400/40 text-cyan-400 bg-cyan-400/10'
                                    : 'border-purple-400/40 text-purple-400 bg-purple-400/10'
                                }`}
                              >
                                {rec.pillar}
                              </span>
                              <span className="font-mono text-xs font-bold text-[#B6FF4A]">
                                {rec.matchScore}% SKILL OVERLAP
                              </span>
                            </div>

                            <Link
                              to={rec.linkUrl}
                              className="font-display font-bold text-sm text-[#F4F7F1] hover:text-[#B6FF4A] line-clamp-1 block"
                            >
                              {rec.title}
                            </Link>

                            <p className="text-xs font-mono text-[#A0AAA0]">
                              {rec.creatorOrCompany}
                            </p>

                            <p className="text-[11px] font-mono text-[#7CCB37] line-clamp-2">
                              {rec.explanation}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-[#273128] flex items-center justify-between">
                            <span className="text-xs font-mono text-[#F4F7F1]">
                              {rec.compensation}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={rec.onToggleSave}
                                className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                                  rec.isSaved
                                    ? 'text-[#B6FF4A] bg-[#B6FF4A]/10'
                                    : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
                                }`}
                                title={rec.isSaved ? 'Remove from saved' : 'Save opportunity'}
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                to={rec.linkUrl}
                                className="px-2 py-1 bg-[#141B15] hover:bg-[#B6FF4A] hover:text-[#080B09] border border-[#273128] text-xs font-mono text-[#F4F7F1] transition-colors"
                              >
                                Apply
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. My Postings & Teams Hub Preview */}
                <div className="bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#273128] pb-3">
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-[#B6FF4A]" />
                      <h2 className="font-display font-bold text-lg text-[#F4F7F1]">
                        My Projects, Jobs & Ventures
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('postings')}
                      className="text-xs font-mono text-[#B6FF4A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage All ({totalManagedPostings})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {totalManagedPostings === 0 ? (
                    <div className="py-6 text-center text-xs font-mono text-[#A0AAA0]">
                      You haven't posted any client projects, jobs, or ventures yet. Use the Quick Create tools in the left rail to begin.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Client Projects Summary */}
                      <div className="p-4 bg-[#101510] border border-[#273128] rounded-xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-[#A0AAA0]">
                          <span>Client Gigs</span>
                          <span className="font-bold text-[#F4F7F1]">{myClientProjects.length}</span>
                        </div>
                        {myClientProjects.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-display font-bold text-sm text-[#F4F7F1] truncate">
                              {myClientProjects[0].title}
                            </p>
                            <p className="text-[11px] font-mono text-[#B6FF4A]">
                              {myClientProjects[0].applicantCount || 0} applicant(s)
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] font-mono text-[#A0AAA0]">No client gigs posted.</p>
                        )}
                        <Link
                          to="/freelance/create"
                          className="block text-[11px] font-mono text-[#A0AAA0] hover:text-[#B6FF4A] pt-2 border-t border-[#273128]"
                        >
                          + Post another gig
                        </Link>
                      </div>

                      {/* Recruiter Jobs Summary */}
                      <div className="p-4 bg-[#101510] border border-[#273128] rounded-xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-[#A0AAA0]">
                          <span>Recruit Openings</span>
                          <span className="font-bold text-cyan-400">{myRecruitJobs.length}</span>
                        </div>
                        {myRecruitJobs.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-display font-bold text-sm text-[#F4F7F1] truncate">
                              {myRecruitJobs[0].title}
                            </p>
                            <Link
                              to={`/recruit/manage/${myRecruitJobs[0].id}`}
                              className="text-[11px] font-mono text-cyan-400 hover:underline block"
                            >
                              Manage candidates →
                            </Link>
                          </div>
                        ) : (
                          <p className="text-[11px] font-mono text-[#A0AAA0]">No job openings listed.</p>
                        )}
                        <Link
                          to="/recruit/create"
                          className="block text-[11px] font-mono text-[#A0AAA0] hover:text-cyan-400 pt-2 border-t border-[#273128]"
                        >
                          + Post an opening
                        </Link>
                      </div>

                      {/* Founder Ventures Summary */}
                      <div className="p-4 bg-[#101510] border border-[#273128] rounded-xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-[#A0AAA0]">
                          <span>Ventures & Squads</span>
                          <span className="font-bold text-purple-400">{myStartupIdeas.length}</span>
                        </div>
                        {myStartupIdeas.length > 0 ? (
                          <div className="space-y-1">
                            <p className="font-display font-bold text-sm text-[#F4F7F1] truncate">
                              {myStartupIdeas[0].title}
                            </p>
                            <Link
                              to={`/teamup/teams/${myStartupIdeas[0].id}`}
                              className="text-[11px] font-mono text-purple-400 hover:underline block"
                            >
                              Manage squad ({myStartupIdeas[0].teamSize} members) →
                            </Link>
                          </div>
                        ) : (
                          <p className="text-[11px] font-mono text-[#A0AAA0]">No ventures created.</p>
                        )}
                        <Link
                          to="/teamup/create"
                          className="block text-[11px] font-mono text-[#A0AAA0] hover:text-purple-400 pt-2 border-t border-[#273128]"
                        >
                          + Start new venture
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: APPLICATIONS TAB                                 */}
            {/* ======================================================== */}
            {activeTab === 'applications' && (
              <div className="bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273128] pb-4">
                  <div>
                    <h2 className="font-display font-bold text-xl text-[#F4F7F1]">
                      Multi-Pillar Application Tracker
                    </h2>
                    <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                      Monitor all your proposals, job candidacies, and co-founder applications in real-time.
                    </p>
                  </div>

                  {/* Pillar Sub-filter */}
                  <div className="flex items-center gap-1 p-1 bg-[#101510] border border-[#273128] rounded-xs self-start">
                    {(['all', 'freelance', 'recruit', 'teamup'] as const).map((pillar) => (
                      <button
                        key={pillar}
                        onClick={() => setAppPillarFilter(pillar)}
                        className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                          appPillarFilter === pillar
                            ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                            : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
                        }`}
                      >
                        {pillar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Sub-filter Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                  <span className="text-[#A0AAA0] uppercase text-[11px] mr-1">Status:</span>
                  {(['all', 'active', 'accepted', 'closed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setAppStatusFilter(st)}
                      className={`px-3 py-1 border rounded-xs transition-colors cursor-pointer ${
                        appStatusFilter === st
                          ? 'border-[#B6FF4A] text-[#B6FF4A] bg-[#B6FF4A]/10 font-bold'
                          : 'border-[#273128] text-[#A0AAA0] hover:text-[#F4F7F1]'
                      }`}
                    >
                      {st === 'all' ? 'All Statuses' : st === 'active' ? 'Under Review / In Flight' : st === 'accepted' ? 'Accepted / Shortlisted' : 'Withdrawn / Closed'}
                    </button>
                  ))}
                </div>

                {/* Applications Table / List */}
                {filteredApplications.length === 0 ? (
                  <div className="py-12 text-center space-y-3 bg-[#101510] border border-[#273128] rounded-xs">
                    <p className="text-sm font-mono text-[#A0AAA0]">
                      No applications found matching the current filter.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <Link
                        to="/freelance"
                        className="px-3 py-1.5 bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A] text-xs font-mono text-[#F4F7F1]"
                      >
                        Explore Freelance
                      </Link>
                      <Link
                        to="/recruit/opportunities"
                        className="px-3 py-1.5 bg-[#141B15] border border-[#273128] hover:border-cyan-400 text-xs font-mono text-[#F4F7F1]"
                      >
                        Explore Recruit
                      </Link>
                      <Link
                        to="/teamup/discover"
                        className="px-3 py-1.5 bg-[#141B15] border border-[#273128] hover:border-purple-400 text-xs font-mono text-[#F4F7F1]"
                      >
                        Explore TeamUp
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 bg-[#101510] border border-[#273128] hover:border-[#273128]/80 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                                app.sourceType === 'freelance'
                                  ? 'border-[#B6FF4A]/40 text-[#B6FF4A] bg-[#B6FF4A]/10'
                                  : app.sourceType === 'recruit'
                                  ? 'border-cyan-400/40 text-cyan-400 bg-cyan-400/10'
                                  : 'border-purple-400/40 text-purple-400 bg-purple-400/10'
                              }`}
                            >
                              {app.sourceType}
                            </span>
                            <Link
                              to={app.linkUrl}
                              className="font-display font-bold text-base text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors"
                            >
                              {app.title}
                            </Link>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0] flex-wrap">
                            <span className="text-[#F4F7F1]">{app.entityName}</span>
                            {app.entitySubtitle && (
                              <>
                                <span>·</span>
                                <span>{app.entitySubtitle}</span>
                              </>
                            )}
                            <span>·</span>
                            <span>{app.compensationOrBudget}</span>
                            <span>·</span>
                            <span>{app.workMode}</span>
                            <span>·</span>
                            <span>Applied: {app.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                          <span
                            className={`px-2.5 py-1 text-xs font-mono border rounded-xs ${
                              app.statusVariant === 'accent'
                                ? 'border-[#B6FF4A]/50 text-[#B6FF4A] bg-[#B6FF4A]/10 font-bold'
                                : app.statusVariant === 'warning'
                                ? 'border-amber-400/50 text-amber-300 bg-amber-400/10'
                                : app.statusVariant === 'danger'
                                ? 'border-rose-500/50 text-rose-300 bg-rose-500/10'
                                : 'border-[#273128] text-[#A0AAA0] bg-[#141B15]'
                            }`}
                          >
                            {app.status}
                          </span>

                          <Link
                            to={app.linkUrl}
                            className="px-3 py-1 bg-[#141B15] hover:bg-[#1f2920] border border-[#273128] text-xs font-mono text-[#F4F7F1] transition-colors"
                          >
                            View
                          </Link>

                          {app.canWithdraw && (
                            <button
                              onClick={app.onWithdraw}
                              className="px-2.5 py-1 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/40 rounded-xs transition-colors cursor-pointer"
                              title="Withdraw this application"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 3: MY POSTINGS & TEAMS TAB                          */}
            {/* ======================================================== */}
            {activeTab === 'postings' && (
              <div className="bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273128] pb-4">
                  <div>
                    <h2 className="font-display font-bold text-xl text-[#F4F7F1]">
                      My Postings, Jobs & Venture Teams
                    </h2>
                    <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                      Oversee your published freelance gigs, hiring vacancies, and co-founder teams.
                    </p>
                  </div>

                  {/* Sub-filter */}
                  <div className="flex items-center gap-1 p-1 bg-[#101510] border border-[#273128] rounded-xs self-start">
                    {(['all', 'freelance', 'recruit', 'teamup'] as const).map((pillar) => (
                      <button
                        key={pillar}
                        onClick={() => setPostingsPillarFilter(pillar)}
                        className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                          postingsPillarFilter === pillar
                            ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                            : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
                        }`}
                      >
                        {pillar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section A: Freelance Client Projects */}
                {(postingsPillarFilter === 'all' || postingsPillarFilter === 'freelance') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#B6FF4A]"></span>
                        <h3 className="font-display font-bold text-base text-[#F4F7F1]">
                          Freelance Client Projects ({myClientProjects.length})
                        </h3>
                      </div>
                      <Link
                        to="/freelance/create"
                        className="text-xs font-mono text-[#B6FF4A] hover:underline"
                      >
                        + Post Project
                      </Link>
                    </div>

                    {myClientProjects.length === 0 ? (
                      <div className="p-6 bg-[#101510] border border-[#273128] rounded-xs text-center space-y-2">
                        <p className="text-xs font-mono text-[#A0AAA0]">No client projects published yet.</p>
                        <Link
                          to="/freelance/create"
                          className="inline-block px-3 py-1.5 bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A] text-xs font-mono text-[#F4F7F1]"
                        >
                          Post First Client Gig
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myClientProjects.map((p) => (
                          <div
                            key={p.id}
                            className="p-4 bg-[#101510] border border-[#273128] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1 min-w-0">
                              <Link
                                to={`/freelance/${p.id}`}
                                className="font-display font-bold text-base text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors"
                              >
                                {p.title}
                              </Link>
                              <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
                                <span>{p.category}</span>
                                <span>·</span>
                                <span>{formatMoneyRange(p.budgetMin, p.budgetMax, p.currency)}</span>
                                <span>·</span>
                                <span className="text-[#B6FF4A] font-bold">{p.applicantCount || 0} proposals</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/freelance/${p.id}`}
                                className="px-3 py-1 bg-[#141B15] hover:bg-[#1a231b] border border-[#273128] text-xs font-mono text-[#F4F7F1]"
                              >
                                View Listing
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Section B: Recruitment Job Openings */}
                {(postingsPillarFilter === 'all' || postingsPillarFilter === 'recruit') && (
                  <div className="space-y-4 pt-4 border-t border-[#273128]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <h3 className="font-display font-bold text-base text-[#F4F7F1]">
                          Recruiter Job Openings ({myRecruitJobs.length})
                        </h3>
                      </div>
                      <Link
                        to="/recruit/create"
                        className="text-xs font-mono text-cyan-400 hover:underline"
                      >
                        + Post Opening
                      </Link>
                    </div>

                    {myRecruitJobs.length === 0 ? (
                      <div className="p-6 bg-[#101510] border border-[#273128] rounded-xs text-center space-y-2">
                        <p className="text-xs font-mono text-[#A0AAA0]">No recruitment jobs posted yet.</p>
                        <Link
                          to="/recruit/create"
                          className="inline-block px-3 py-1.5 bg-[#141B15] border border-[#273128] hover:border-cyan-400 text-xs font-mono text-[#F4F7F1]"
                        >
                          Post First Job Opening
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myRecruitJobs.map((j) => {
                          const candidates = getApplicationsForJob(j.id);
                          return (
                            <div
                              key={j.id}
                              className="p-4 bg-[#101510] border border-[#273128] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1 min-w-0">
                                <Link
                                  to={`/recruit/opportunities/${j.id}`}
                                  className="font-display font-bold text-base text-[#F4F7F1] hover:text-cyan-400 transition-colors"
                                >
                                  {j.title}
                                </Link>
                                <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
                                  <span>{j.companyName}</span>
                                  <span>·</span>
                                  <span>{j.compensation}</span>
                                  <span>·</span>
                                  <span className="text-cyan-400 font-bold">{candidates.length} candidates</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/recruit/manage/${j.id}`}
                                  className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-xs font-mono text-cyan-300 transition-colors"
                                >
                                  Manage Candidates ({candidates.length})
                                </Link>
                                <Link
                                  to={`/recruit/opportunities/${j.id}`}
                                  className="px-3 py-1 bg-[#141B15] hover:bg-[#1a231b] border border-[#273128] text-xs font-mono text-[#F4F7F1]"
                                >
                                  Public Page
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Section C: Founder Ventures & Squads */}
                {(postingsPillarFilter === 'all' || postingsPillarFilter === 'teamup') && (
                  <div className="space-y-4 pt-4 border-t border-[#273128]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        <h3 className="font-display font-bold text-base text-[#F4F7F1]">
                          Founder Ventures & Teams ({myStartupIdeas.length})
                        </h3>
                      </div>
                      <Link
                        to="/teamup/create"
                        className="text-xs font-mono text-purple-400 hover:underline"
                      >
                        + Start Venture
                      </Link>
                    </div>

                    {myStartupIdeas.length === 0 ? (
                      <div className="p-6 bg-[#101510] border border-[#273128] rounded-xs text-center space-y-2">
                        <p className="text-xs font-mono text-[#A0AAA0]">No venture ideas created yet.</p>
                        <Link
                          to="/teamup/create"
                          className="inline-block px-3 py-1.5 bg-[#141B15] border border-[#273128] hover:border-purple-400 text-xs font-mono text-[#F4F7F1]"
                        >
                          Launch First Venture
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myStartupIdeas.map((i) => {
                          const ideaApps = teamUpApps.filter((a) => a.ideaId === i.id);
                          return (
                            <div
                              key={i.id}
                              className="p-4 bg-[#101510] border border-[#273128] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1 min-w-0">
                                <Link
                                  to={`/teamup/ideas/${i.id}`}
                                  className="font-display font-bold text-base text-[#F4F7F1] hover:text-purple-400 transition-colors"
                                >
                                  {i.title}
                                </Link>
                                <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
                                  <span>{i.industry}</span>
                                  <span>·</span>
                                  <span>Stage: {i.developmentStage}</span>
                                  <span>·</span>
                                  <span className="text-purple-400 font-bold">{i.teamSize} team members</span>
                                  <span>·</span>
                                  <span className="text-[#B6FF4A] font-bold">{ideaApps.length} applicants</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/teamup/teams/${i.id}`}
                                  className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-xs font-mono text-purple-300 transition-colors"
                                >
                                  Manage Squad ({i.teamSize})
                                </Link>
                                <Link
                                  to={`/teamup/ideas/${i.id}`}
                                  className="px-3 py-1 bg-[#141B15] hover:bg-[#1a231b] border border-[#273128] text-xs font-mono text-[#F4F7F1]"
                                >
                                  Public Page
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 4: RECOMMENDATIONS TAB                              */}
            {/* ======================================================== */}
            {activeTab === 'recommendations' && (
              <div className="bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273128] pb-4">
                  <div>
                    <h2 className="font-display font-bold text-xl text-[#F4F7F1]">
                      Rule-Based Opportunity Matches
                    </h2>
                    <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                      Matched directly against your verified skills: {user?.skills?.join(', ') || 'React, TypeScript, Tailwind, Node, Postgres'}
                    </p>
                  </div>

                  {/* Sub-filter */}
                  <div className="flex items-center gap-1 p-1 bg-[#101510] border border-[#273128] rounded-xs self-start">
                    {(['all', 'freelance', 'recruit', 'teamup'] as const).map((pillar) => (
                      <button
                        key={pillar}
                        onClick={() => setRecPillarFilter(pillar)}
                        className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                          recPillarFilter === pillar
                            ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                            : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
                        }`}
                      >
                        {pillar}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredRecommendations.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-[#A0AAA0] bg-[#101510] border border-[#273128] rounded-xs">
                    No recommendations matching the current filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRecommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-5 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A]/40 rounded-xs flex flex-col justify-between space-y-4 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                                rec.pillar === 'freelance'
                                  ? 'border-[#B6FF4A]/40 text-[#B6FF4A] bg-[#B6FF4A]/10'
                                  : rec.pillar === 'recruit'
                                  ? 'border-cyan-400/40 text-cyan-400 bg-cyan-400/10'
                                  : 'border-purple-400/40 text-purple-400 bg-purple-400/10'
                              }`}
                            >
                              {rec.pillar}
                            </span>
                            <span className="font-mono text-xs font-bold text-[#B6FF4A] bg-[#B6FF4A]/10 px-2 py-0.5 border border-[#B6FF4A]/30 rounded-xs">
                              {rec.matchScore}% SKILL OVERLAP
                            </span>
                          </div>

                          <Link
                            to={rec.linkUrl}
                            className="font-display font-bold text-base text-[#F4F7F1] hover:text-[#B6FF4A] block"
                          >
                            {rec.title}
                          </Link>

                          <div className="flex items-center gap-2 text-xs font-mono text-[#A0AAA0]">
                            <span>{rec.creatorOrCompany}</span>
                            <span>·</span>
                            <span>{rec.workMode}</span>
                            <span>·</span>
                            <span className="text-[#F4F7F1] font-semibold">{rec.compensation}</span>
                          </div>

                          <div className="p-2.5 bg-[#141B15] border border-[#273128] rounded-xs text-xs font-mono text-[#7CCB37]">
                            <div className="flex items-center gap-1.5 mb-1 font-bold text-[#B6FF4A]">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Why It Matches:</span>
                            </div>
                            <p className="text-[11px] text-[#A0AAA0]">{rec.explanation}</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#273128] flex items-center justify-between">
                          <button
                            onClick={() => {
                              setDismissedRecs((prev) => [...prev, rec.id]);
                              showToast('Opportunity dismissed from recommendations.');
                            }}
                            className="text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] cursor-pointer"
                          >
                            Dismiss
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={rec.onToggleSave}
                              className={`p-1.5 rounded-xs transition-colors cursor-pointer border ${
                                rec.isSaved
                                  ? 'text-[#B6FF4A] bg-[#B6FF4A]/10 border-[#B6FF4A]/40'
                                  : 'text-[#A0AAA0] hover:text-[#F4F7F1] border-[#273128]'
                              }`}
                              title={rec.isSaved ? 'Remove from saved' : 'Save opportunity'}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              to={rec.linkUrl}
                              className="px-3 py-1.5 bg-[#B6FF4A] text-[#080B09] font-bold text-xs font-mono tracking-wider hover:bg-[#7CCB37] transition-colors"
                            >
                              Inspect & Apply
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 5: SAVED OPPORTUNITIES TAB                          */}
            {/* ======================================================== */}
            {activeTab === 'saved' && (
              <div className="bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273128] pb-4">
                  <div>
                    <h2 className="font-display font-bold text-xl text-[#F4F7F1]">
                      Unified Saved Opportunities ({unifiedSaved.length})
                    </h2>
                    <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                      Your bookmarked freelance projects, recruit job postings, and venture ideas.
                    </p>
                  </div>

                  {/* Sub-filter */}
                  <div className="flex items-center gap-1 p-1 bg-[#101510] border border-[#273128] rounded-xs self-start">
                    {(['all', 'freelance', 'recruit', 'teamup'] as const).map((pillar) => (
                      <button
                        key={pillar}
                        onClick={() => setSavedPillarFilter(pillar)}
                        className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                          savedPillarFilter === pillar
                            ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                            : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
                        }`}
                      >
                        {pillar}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSaved.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-[#A0AAA0] bg-[#101510] border border-[#273128] rounded-xs">
                    No saved opportunities found. Browse HUSTL to bookmark opportunities for later review.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSaved.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-[#101510] border border-[#273128] hover:border-[#273128]/80 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                                item.pillar === 'freelance'
                                  ? 'border-[#B6FF4A]/40 text-[#B6FF4A] bg-[#B6FF4A]/10'
                                  : item.pillar === 'recruit'
                                  ? 'border-cyan-400/40 text-cyan-400 bg-cyan-400/10'
                                  : 'border-purple-400/40 text-purple-400 bg-purple-400/10'
                              }`}
                            >
                              {item.pillar}
                            </span>
                            <Link
                              to={item.linkUrl}
                              className="font-display font-bold text-base text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors"
                            >
                              {item.title}
                            </Link>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
                            <span>{item.subtitle}</span>
                            <span>·</span>
                            <span>{item.compensation}</span>
                            <span>·</span>
                            <span>{item.workMode}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            to={item.linkUrl}
                            className="px-3 py-1.5 bg-[#141B15] hover:bg-[#1a231b] border border-[#273128] text-xs font-mono text-[#F4F7F1] transition-colors"
                          >
                            Open Opportunity
                          </Link>
                          <button
                            onClick={item.onRemove}
                            className="p-1.5 text-[#A0AAA0] hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 6: RECENT ACTIVITY TAB                              */}
            {/* ======================================================== */}
            {activeTab === 'activity' && (
              <div className="bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-6">
                <div className="border-b border-[#273128] pb-4">
                  <h2 className="font-display font-bold text-xl text-[#F4F7F1]">
                    Chronological Activity Stream
                  </h2>
                  <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                    Real-time audit log of your proposals, candidacies, invitations, and creations.
                  </p>
                </div>

                <div className="space-y-4">
                  {activityEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 bg-[#101510] border border-[#273128] rounded-xs flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-[#B6FF4A] shrink-0"></div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-1.5 py-0.2 text-[10px] font-mono border ${ev.badgeColor}`}>
                              {ev.badge}
                            </span>
                            <span className="font-display font-bold text-sm text-[#F4F7F1]">
                              {ev.title}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-[#A0AAA0]">
                            {ev.description}
                          </p>
                          <span className="text-[10px] font-mono text-[#7CCB37]">
                            {ev.timestamp}
                          </span>
                        </div>
                      </div>

                      {ev.linkUrl && (
                        <Link
                          to={ev.linkUrl}
                          className="p-1.5 text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors shrink-0"
                          title="Inspect event target"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 7: DASHBOARD SETTINGS TAB                           */}
            {/* ======================================================== */}
            {activeTab === 'settings' && (
              <div className="bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-6">
                <div className="border-b border-[#273128] pb-4">
                  <h2 className="font-display font-bold text-xl text-[#F4F7F1]">
                    Dashboard Customization & Preferences
                  </h2>
                  <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                    Configure your command center layout, visible sections, and default perspective.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0]">
                    Visible Modules on Overview
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 bg-[#101510] border border-[#273128] rounded-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.showMetrics}
                        onChange={(e) => updatePreference('showMetrics', e.target.checked)}
                        className="rounded-xs accent-[#B6FF4A] cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-mono font-bold text-[#F4F7F1]">Metric Cards Bar</div>
                        <div className="text-[11px] font-mono text-[#A0AAA0]">Show active counts & KPI summaries</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-[#101510] border border-[#273128] rounded-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.showRecommendations}
                        onChange={(e) => updatePreference('showRecommendations', e.target.checked)}
                        className="rounded-xs accent-[#B6FF4A] cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-mono font-bold text-[#F4F7F1]">Skill-Matched Opportunities</div>
                        <div className="text-[11px] font-mono text-[#A0AAA0]">Show rule-based recommendations</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-[#101510] border border-[#273128] rounded-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.showPostings}
                        onChange={(e) => updatePreference('showPostings', e.target.checked)}
                        className="rounded-xs accent-[#B6FF4A] cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-mono font-bold text-[#F4F7F1]">My Postings Summary</div>
                        <div className="text-[11px] font-mono text-[#A0AAA0]">Show client gigs & venture squads</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-[#101510] border border-[#273128] rounded-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) => updatePreference('notifications', e.target.checked)}
                        className="rounded-xs accent-[#B6FF4A] cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-mono font-bold text-[#F4F7F1]">Real-time Invitations Banner</div>
                        <div className="text-[11px] font-mono text-[#A0AAA0]">Alert when new team invites arrive</div>
                      </div>
                    </label>
                  </div>

                  <div className="pt-6 border-t border-[#273128] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-[#F4F7F1] font-bold">Preferences Saved Locally</div>
                      <div className="text-[11px] font-mono text-[#A0AAA0]">Configuration automatically persists in browser session</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        showToast('Dashboard preferences synchronized.');
                      }}
                    >
                      Sync Now
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PROFILE AUDIT & COMPLETION MODAL                         */}
      {/* ======================================================== */}
      {showProfileAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B09]/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141B15] border border-[#273128] max-w-xl w-full p-6 rounded-sm space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#273128] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#B6FF4A]" />
                <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                  Profile Completeness Audit
                </h3>
              </div>
              <button
                onClick={() => setShowProfileAudit(false)}
                className="text-[#A0AAA0] hover:text-[#F4F7F1] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#A0AAA0]">Completion Progress:</span>
                <span className="text-[#B6FF4A] font-bold">{profileAudit.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-[#101510] border border-[#273128] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7CCB37] to-[#B6FF4A]"
                  style={{ width: `${profileAudit.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs font-mono text-[#A0AAA0]">
                High profile completion increases your discovery score in Talent Radar and grants verified recruiter review status.
              </p>
            </div>

            <div className="space-y-2.5">
              {profileAudit.checks.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border rounded-xs flex items-center justify-between gap-3 ${
                    item.completed
                      ? 'bg-[#101510]/60 border-[#273128]'
                      : 'bg-amber-950/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#B6FF4A] shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-mono text-xs font-bold text-[#F4F7F1]">
                        {item.label}
                      </div>
                      <div className="text-[11px] font-mono text-[#A0AAA0]">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {!item.completed && (
                    <Link
                      to={item.actionLink}
                      onClick={() => setShowProfileAudit(false)}
                      className="px-2.5 py-1 bg-[#101510] hover:bg-[#B6FF4A] hover:text-[#080B09] border border-[#273128] text-xs font-mono text-[#F4F7F1] shrink-0 transition-colors"
                    >
                      Complete
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#273128] flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileAudit(false)}
              >
                Close Audit
              </Button>
              <Link
                to="/profile"
                onClick={() => setShowProfileAudit(false)}
                className="px-3 py-1.5 bg-[#B6FF4A] text-[#080B09] text-xs font-mono font-bold tracking-wider hover:bg-[#7CCB37] transition-colors flex items-center gap-1.5"
              >
                <span>Edit Full Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
