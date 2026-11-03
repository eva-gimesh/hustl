export type UserRole = 'student' | 'freelancer' | 'founder' | 'recruiter' | 'business_owner';

export type OpportunityCategory = 'freelance' | 'recruit' | 'teamup';

export type OpportunityWorkType = 'Freelance' | 'Internship' | 'Full-time' | 'Part-time' | 'Collaboration';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type FreelanceCategory =
  | 'Development'
  | 'Design'
  | 'Video Editing'
  | 'Writing'
  | 'Marketing'
  | 'Photography'
  | 'Business'
  | 'Data and Analytics'
  | 'Other';

export type FreelancePaymentType = 'Fixed Price' | 'Hourly' | 'Per Deliverable';

export type FreelanceCompensationType = 'Paid' | 'Unpaid';

export type FreelanceExperienceLevel = 'Entry' | 'Intermediate' | 'Expert';

export type FreelanceWorkMode = 'Remote' | 'Hybrid' | 'On-site';

export type FreelanceProjectStatus = 'open' | 'in-review' | 'closed' | 'filled';

export type FreelanceApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn';

export interface SkillItem {
  id: string;
  name: string;
  proficiency?: ProficiencyLevel;
}

export interface ExperienceItem {
  id: string;
  position: string;
  organisation: string;
  description: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  qualifications?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  coverImage: string;
  description: string;
  technologies: string[];
  category: string;
  projectUrl?: string;
  createdAt?: string;
}

export interface UserConnection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface FreelanceProject {
  id: string;
  ownerId: string;
  clientName: string;
  clientLogo?: string;
  clientDescription: string;
  clientLocation: string;
  clientWebsite?: string;
  clientJoinedDate: string;
  clientVerified: boolean;
  clientPublishedProjectsCount: number;
  title: string;
  description: string;
  category: FreelanceCategory;
  requiredSkills: string[];
  deliverables: string[];
  requirements: string[];
  budgetMin: number;
  budgetMax: number;
  currency: string;
  paymentType: FreelancePaymentType;
  compensationType: FreelanceCompensationType;
  experienceLevel: FreelanceExperienceLevel;
  duration: string;
  workMode: FreelanceWorkMode;
  location: string;
  freelancersCount: number;
  applicationDeadline: string;
  startDate?: string;
  preferredCommunication?: string;
  status: FreelanceProjectStatus;
  applicantCount: number;
  postedDate: string;
  isDemo?: boolean;
  featured?: boolean;
}

export interface FreelanceApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar?: string;
  applicantRole?: string;
  applicantSkills: string[];
  applicantExperience?: string;
  coverLetter: string;
  relevantExperience: string;
  portfolioUrl: string;
  proposedBudget: string;
  estimatedDuration: string;
  status: FreelanceApplicationStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface SavedProject {
  id: string;
  userId: string;
  projectId: string;
  createdAt: string;
}

export interface FreelanceServicePackage {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar?: string;
  freelancerHandle: string;
  title: string;
  category: FreelanceCategory;
  priceStarting: number;
  currency: string;
  deliveryDays: number;
  skills: string[];
  rating: number;
  reviewsCount: number;
  description: string;
}

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  organization: string;
  compensation: string;
  compensationType: 'fixed' | 'hourly' | 'equity' | 'stipend' | 'Paid' | 'Project-based' | 'Equity-based';
  location: string;
  type: 'remote' | 'hybrid' | 'on-site' | 'flexible';
  opportunityType: OpportunityWorkType;
  workMode: WorkMode;
  timeline: string;
  summary: string;
  skills: string[];
  applicantCount: number;
  postedDate?: string;
  featured?: boolean;
  isDemo?: boolean;
}

export interface TalentProfile {
  id: string;
  name: string;
  handle: string;
  title: string;
  headline: string;
  role: string;
  institution?: string;
  location: string;
  roles: UserRole[];
  availability: string;
  skills: string[];
  skillsDetailed?: SkillItem[];
  experiences?: ExperienceItem[];
  educations?: EducationItem[];
  portfolioProjects?: PortfolioProject[];
  opportunityPreferences?: string[];
  rating?: number;
  completedProjects: number;
  yearsOfExperience: number;
  hourlyRate?: string;
  bio: string;
  verified: boolean;
  avatarUrl?: string;
  avatarInitials?: string;
  isDemo?: boolean;
  joinedDate?: string;
  connectionStatus?: 'none' | 'pending' | 'connected';
}

export interface FilterState {
  category: 'all' | OpportunityCategory;
  opportunityType: 'all' | OpportunityWorkType;
  search: string;
  type: string;
}

// ==========================================
// RECRUITMENT & HIRING SYSTEM TYPES (PART 6)
// ==========================================

export type JobEmploymentType = 'Internship' | 'Full-time' | 'Part-time' | 'Contract';

export type JobWorkMode = 'Remote' | 'Hybrid' | 'On-site';

export type JobCategory =
  | 'Engineering'
  | 'Design'
  | 'Marketing'
  | 'Product'
  | 'Operations'
  | 'Data & AI'
  | 'Sales'
  | 'Other';

export type JobExperienceLevel =
  | 'Student / Fresher'
  | '0-1 years'
  | '1-3 years'
  | '3+ years';

export type JobApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn';

export interface CustomQuestion {
  id: string;
  question: string;
  required: boolean;
}

export interface CustomQuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface Company {
  id: string;
  name: string;
  tagline: string;
  description: string;
  industry: string;
  location: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  size: string;
  foundedYear: string;
  verified: boolean;
  ownerId: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  isDemo?: boolean;
  createdAt: string;
}

export interface JobListing {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyIndustry: string;
  companySize: string;
  companyLocation: string;
  companyWebsite?: string;
  companyVerified: boolean;
  creatorId: string;
  title: string;
  category: JobCategory;
  employmentType: JobEmploymentType;
  workMode: JobWorkMode;
  location: string;
  compensation: string;
  compensationType: 'Paid' | 'Unpaid';
  compensationMin?: number;
  compensationMax?: number;
  currency?: string;
  experienceLevel: JobExperienceLevel;
  education?: string;
  requiredSkills: string[];
  bonusSkills?: string[];
  overview: string;
  responsibilities: string[];
  qualifications: string[];
  benefits?: string[];
  hiringProcess?: string[];
  openingsCount: number;
  applicationDeadline: string;
  startDate?: string;
  duration?: string;
  requiresResume: boolean;
  requiresCoverLetter: boolean;
  requiresPortfolio: boolean;
  customQuestions?: CustomQuestion[];
  status: 'open' | 'closed' | 'filled';
  applicantCount: number;
  postedDate: string;
  featured?: boolean;
  isDemo?: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantHeadline?: string;
  applicantAvatar?: string;
  applicantEducation?: string;
  applicantSkills: string[];
  resumeUrl: string;
  resumeFileName?: string;
  coverLetter?: string;
  relevantExperience?: string;
  portfolioUrl?: string;
  answers?: CustomQuestionAnswer[];
  status: JobApplicationStatus;
  rejectionReason?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface ApplicationNote {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  content: string;
  createdAt: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
}

// ==========================================
// TEAMUP & CO-FOUNDER PLATFORM TYPES (PART 7)
// ==========================================

export type IdeaCategory =
  | 'Technology'
  | 'Artificial Intelligence'
  | 'Design'
  | 'Education'
  | 'Sustainability'
  | 'Healthcare'
  | 'Finance'
  | 'Social Impact'
  | 'E-commerce'
  | 'Media and Content'
  | 'Other';

export type DevelopmentStage =
  | 'Just an Idea'
  | 'Researching'
  | 'Validating'
  | 'Building MVP'
  | 'Launched'
  | 'Growing';

export type RecruitmentStatus =
  | 'Recruiting'
  | 'Building'
  | 'Active'
  | 'Paused'
  | 'Completed';

export type TeamCompensationModel =
  | 'Paid'
  | 'Equity-based'
  | 'Unpaid'
  | 'Volunteer'
  | 'Open to discussion';

export type CollaborationApplicationStatus =
  | 'Submitted'
  | 'Reviewing'
  | 'Accepted'
  | 'Declined'
  | 'Withdrawn';

export type TeamInvitationStatus =
  | 'Pending'
  | 'Accepted'
  | 'Declined'
  | 'Cancelled';

export interface IdeaOpenRole {
  id: string;
  ideaId: string;
  roleTitle: string;
  openings: number;
  requiredSkills: string[];
  responsibilities: string[];
  experiencePreference?: string;
  timeCommitment: string;
  compensationModel: TeamCompensationModel;
  isOpen: boolean;
  applicantCount: number;
  createdAt?: string;
}

export interface StartupIdea {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  ownerHeadline?: string;
  ownerSkills?: string[];
  ownerCollege?: string;
  title: string;
  tagline: string;
  description: string;
  problemStatement: string;
  proposedSolution: string;
  targetAudience: string;
  industry: IdeaCategory;
  developmentStage: DevelopmentStage;
  currentProgress: string;
  websiteUrl?: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  location: string;
  timeCommitment: string;
  compensationModel: TeamCompensationModel;
  recruitmentStatus: RecruitmentStatus;
  requiredSkills: string[];
  openRoles: IdeaOpenRole[];
  teamSize: number;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface TeamMember {
  id: string;
  teamId: string; // matches ideaId
  ideaId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userHeadline?: string;
  userSkills: string[];
  roleTitle: string;
  membershipStatus: 'active' | 'former';
  isOwner: boolean;
  joinedAt: string;
}

export interface CollaborationApplication {
  id: string;
  ideaId: string;
  ideaTitle: string;
  roleId: string;
  roleTitle: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantAvatar?: string;
  applicantHeadline?: string;
  applicantSkills: string[];
  introduction: string;
  motivation: string;
  relevantExperience: string;
  portfolioUrl?: string;
  status: CollaborationApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  ideaId: string;
  ideaTitle: string;
  invitedUserId: string;
  invitedUserName: string;
  invitedUserEmail?: string;
  invitedByUserId: string;
  invitedByUserName: string;
  roleTitle: string;
  message?: string;
  status: TeamInvitationStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface SavedIdea {
  id: string;
  userId: string;
  ideaId: string;
  createdAt: string;
}

// ==============================================================================
// PART 9: MESSAGING & NOTIFICATIONS TYPES
// ==============================================================================

export type ConversationContextType = 'freelance' | 'recruit' | 'teamup' | 'general';

export interface ConversationParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  roleTitle?: string;
  headline?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  lastMessage?: Message;
  lastMessageAt: string;
  conversationType: 'direct' | 'project' | 'job' | 'teamup';
  contextType?: ConversationContextType;
  contextId?: string;
  contextTitle?: string;
  contextSubtitle?: string;
  contextUrl?: string;
  isArchived?: boolean;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export type NotificationCategory =
  | 'freelance'
  | 'recruit'
  | 'teamup'
  | 'messaging'
  | 'account';

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  category: NotificationCategory;
  notificationType: string;
  title: string;
  body: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  newMessagesInApp: boolean;
  newMessagesEmail: boolean;
  freelanceUpdatesInApp: boolean;
  freelanceUpdatesEmail: boolean;
  recruitUpdatesInApp: boolean;
  recruitUpdatesEmail: boolean;
  teamUpInvitesInApp: boolean;
  teamUpInvitesEmail: boolean;
  accountAlertsInApp: boolean;
  accountAlertsEmail: boolean;
}



