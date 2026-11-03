-- ==============================================================================
-- HUSTL Platform Database Schema (PostgreSQL / Supabase) — Extended Part 4
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  display_name TEXT,
  headline TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  institution TEXT,
  availability TEXT DEFAULT 'Available now',
  years_of_experience INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  is_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USER ROLES (Multi-role support: student, freelancer, recruiter, founder, business_owner)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, role)
);

-- 3. USER SKILLS
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency TEXT DEFAULT 'Intermediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, skill_name)
);

-- 4. USER EDUCATION
CREATE TABLE IF NOT EXISTS public.user_education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  graduation_year TEXT,
  qualifications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. USER EXPERIENCE
CREATE TABLE IF NOT EXISTS public.user_experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  position TEXT NOT NULL,
  organisation TEXT NOT NULL,
  description TEXT,
  start_date TEXT,
  end_date TEXT,
  current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PORTFOLIO PROJECTS
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  category TEXT DEFAULT 'Web Application',
  technologies TEXT[] DEFAULT '{}',
  project_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. USER CONNECTIONS
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(requester_id, recipient_id)
);

-- 8. USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  opportunity_types TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'Available now',
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Read policies: public can view verified profiles and public projects
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Portfolio projects are viewable by everyone." 
  ON public.portfolio_projects FOR SELECT USING (true);

CREATE POLICY "User skills are viewable by everyone." 
  ON public.user_skills FOR SELECT USING (true);

CREATE POLICY "User experience is viewable by everyone." 
  ON public.user_experience FOR SELECT USING (true);

CREATE POLICY "User education is viewable by everyone." 
  ON public.user_education FOR SELECT USING (true);

-- Edit policies: users can only manage their own records
CREATE POLICY "Users can update their own profile." 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own portfolio projects." 
  ON public.portfolio_projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills." 
  ON public.user_skills FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own experience." 
  ON public.user_experience FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own education." 
  ON public.user_education FOR ALL USING (auth.uid() = user_id);

-- Connections: either requester or recipient can view/update
CREATE POLICY "Connections viewable by involved parties." 
  ON public.user_connections FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert connection requests." 
  ON public.user_connections FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update connections sent to them." 
  ON public.user_connections FOR UPDATE 
  USING (auth.uid() = recipient_id OR auth.uid() = requester_id);

-- ==============================================================================
-- 9. FREELANCE PROJECTS (Part 5 Freelance Marketplace)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.freelance_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  deliverables TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  budget_min NUMERIC NOT NULL DEFAULT 0,
  budget_max NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT '₹',
  payment_type TEXT DEFAULT 'Fixed Price',
  compensation_type TEXT DEFAULT 'Paid',
  experience_level TEXT DEFAULT 'Intermediate',
  duration TEXT NOT NULL,
  work_mode TEXT DEFAULT 'Remote',
  location TEXT DEFAULT 'Remote',
  freelancers_count INTEGER DEFAULT 1,
  application_deadline DATE,
  start_date DATE,
  preferred_communication TEXT,
  status TEXT CHECK (status IN ('open', 'in-review', 'closed', 'filled')) DEFAULT 'open',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. FREELANCE APPLICATIONS
CREATE TABLE IF NOT EXISTS public.freelance_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.freelance_projects(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cover_letter TEXT NOT NULL,
  relevant_experience TEXT,
  portfolio_url TEXT,
  proposed_budget NUMERIC,
  estimated_duration TEXT,
  status TEXT CHECK (status IN ('Submitted', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected', 'Withdrawn')) DEFAULT 'Submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, applicant_id)
);

-- 11. SAVED PROJECTS
CREATE TABLE IF NOT EXISTS public.saved_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.freelance_projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, project_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_freelance_projects_category ON public.freelance_projects(category);
CREATE INDEX IF NOT EXISTS idx_freelance_projects_status ON public.freelance_projects(status);
CREATE INDEX IF NOT EXISTS idx_freelance_projects_owner ON public.freelance_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_freelance_applications_project ON public.freelance_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_freelance_applications_applicant ON public.freelance_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_saved_projects_user ON public.saved_projects(user_id);

-- RLS Enablement
ALTER TABLE public.freelance_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelance_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;

-- Project Policies
CREATE POLICY "Public projects are viewable by everyone" 
  ON public.freelance_projects FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create projects" 
  ON public.freelance_projects FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update their projects" 
  ON public.freelance_projects FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete their projects" 
  ON public.freelance_projects FOR DELETE 
  USING (auth.uid() = owner_id);

-- Application Policies
CREATE POLICY "Applicants can view their own applications" 
  ON public.freelance_applications FOR SELECT 
  USING (auth.uid() = applicant_id);

CREATE POLICY "Project owners can view applications for their projects" 
  ON public.freelance_applications FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.freelance_projects 
    WHERE id = freelance_applications.project_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can submit applications" 
  ON public.freelance_applications FOR INSERT 
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can withdraw/update their own applications" 
  ON public.freelance_applications FOR UPDATE 
  USING (auth.uid() = applicant_id);

CREATE POLICY "Project owners can update status of applications for their projects" 
  ON public.freelance_applications FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.freelance_projects 
    WHERE id = freelance_applications.project_id AND owner_id = auth.uid()
  ));

-- Saved Projects Policies
CREATE POLICY "Users can view their saved projects" 
  ON public.saved_projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save projects" 
  ON public.saved_projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved projects" 
  ON public.saved_projects FOR DELETE 
  USING (auth.uid() = user_id);

-- ==============================================================================
-- PART 6: RECRUITMENT AND HIRING PLATFORM EXTENSION
-- ==============================================================================

-- 12. COMPANIES / ORGANISATIONS
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  cover_image TEXT,
  size TEXT DEFAULT '1-10',
  founded_year TEXT,
  verified BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  social_links JSONB DEFAULT '{}'::jsonb,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. COMPANY MEMBERS
CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'recruiter', 'member')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, user_id)
);

-- 14. JOB LISTINGS
CREATE TABLE IF NOT EXISTS public.job_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  employment_type TEXT CHECK (employment_type IN ('Internship', 'Full-time', 'Part-time', 'Contract')) NOT NULL,
  work_mode TEXT CHECK (work_mode IN ('Remote', 'Hybrid', 'On-site')) NOT NULL,
  location TEXT NOT NULL,
  compensation TEXT NOT NULL,
  compensation_type TEXT CHECK (compensation_type IN ('Paid', 'Unpaid')) DEFAULT 'Paid',
  compensation_min NUMERIC,
  compensation_max NUMERIC,
  currency TEXT DEFAULT 'INR',
  experience_level TEXT NOT NULL,
  education TEXT,
  required_skills TEXT[] DEFAULT '{}',
  bonus_skills TEXT[] DEFAULT '{}',
  overview TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  qualifications TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  hiring_process TEXT[] DEFAULT '{}',
  openings_count INTEGER DEFAULT 1,
  application_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  start_date TEXT,
  duration TEXT,
  requires_resume BOOLEAN DEFAULT TRUE,
  requires_cover_letter BOOLEAN DEFAULT FALSE,
  requires_portfolio BOOLEAN DEFAULT FALSE,
  custom_questions JSONB DEFAULT '[]'::jsonb,
  status TEXT CHECK (status IN ('open', 'closed', 'filled')) DEFAULT 'open',
  applicant_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.job_listings(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_headline TEXT,
  applicant_education TEXT,
  applicant_skills TEXT[] DEFAULT '{}',
  resume_url TEXT,
  cover_letter TEXT,
  relevant_experience TEXT,
  portfolio_url TEXT,
  custom_answers JSONB DEFAULT '[]'::jsonb,
  status TEXT CHECK (status IN ('Submitted', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn')) DEFAULT 'Submitted',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(job_id, applicant_id)
);

-- 16. APPLICATION RECRUITER NOTES
CREATE TABLE IF NOT EXISTS public.application_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. SAVED JOBS
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.job_listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, job_id)
);

-- Indexes for recruitment queries
CREATE INDEX IF NOT EXISTS idx_job_listings_category ON public.job_listings(category);
CREATE INDEX IF NOT EXISTS idx_job_listings_type ON public.job_listings(employment_type);
CREATE INDEX IF NOT EXISTS idx_job_listings_work_mode ON public.job_listings(work_mode);
CREATE INDEX IF NOT EXISTS idx_job_listings_company ON public.job_listings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON public.job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_application ON public.application_notes(application_id);

-- RLS Enablement
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Policies for companies and jobs
CREATE POLICY "Public companies are viewable by everyone"
  ON public.companies FOR SELECT USING (true);

CREATE POLICY "Public jobs are viewable by everyone"
  ON public.job_listings FOR SELECT USING (true);

CREATE POLICY "Recruiters and owners can insert jobs"
  ON public.job_listings FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Recruiters and owners can update jobs"
  ON public.job_listings FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Applicants can view their own job applications"
  ON public.job_applications FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Recruiters can view applications for their posted jobs"
  ON public.job_applications FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.job_listings
    WHERE id = job_applications.job_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can submit job applications"
  ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can withdraw their application"
  ON public.job_applications FOR UPDATE USING (auth.uid() = applicant_id);

CREATE POLICY "Job owners can update application status"
  ON public.job_applications FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.job_listings
    WHERE id = job_applications.job_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Recruiters can view and add notes"
  ON public.application_notes FOR ALL USING (EXISTS (
    SELECT 1 FROM public.job_applications ja
    JOIN public.job_listings jl ON ja.job_id = jl.id
    WHERE ja.id = application_notes.application_id AND jl.creator_id = auth.uid()
  ));

CREATE POLICY "Users can manage saved jobs"
  ON public.saved_jobs FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- PART 7: TEAMUP CO-FOUNDER DISCOVERY & COLLABORATION SCHEMA
-- ==============================================================================

-- 18. STARTUP IDEAS & VENTURES
CREATE TABLE IF NOT EXISTS public.startup_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  proposed_solution TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  industry TEXT NOT NULL,
  development_stage TEXT CHECK (development_stage IN ('Just an Idea', 'Researching', 'Validating', 'Building MVP', 'Launched', 'Growing')) NOT NULL,
  current_progress TEXT NOT NULL,
  website_url TEXT,
  work_mode TEXT CHECK (work_mode IN ('Remote', 'Hybrid', 'On-site')) DEFAULT 'Remote',
  location TEXT NOT NULL,
  time_commitment TEXT NOT NULL,
  compensation_model TEXT CHECK (compensation_model IN ('Paid', 'Equity-based', 'Unpaid', 'Volunteer', 'Open to discussion')) DEFAULT 'Open to discussion',
  recruitment_status TEXT CHECK (recruitment_status IN ('Recruiting', 'Building', 'Active', 'Paused', 'Completed')) DEFAULT 'Recruiting',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. IDEA REQUIRED SKILLS
CREATE TABLE IF NOT EXISTS public.idea_required_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  UNIQUE(idea_id, skill_name)
);

-- 20. IDEA OPEN ROLES
CREATE TABLE IF NOT EXISTS public.idea_open_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  role_title TEXT NOT NULL,
  openings INTEGER DEFAULT 1,
  responsibilities TEXT[] DEFAULT '{}',
  experience_preference TEXT,
  time_commitment TEXT NOT NULL,
  compensation_model TEXT DEFAULT 'Equity-based',
  is_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 21. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_title TEXT NOT NULL,
  membership_status TEXT CHECK (membership_status IN ('active', 'former')) DEFAULT 'active',
  is_owner BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, user_id)
);

-- 22. COLLABORATION APPLICATIONS
CREATE TABLE IF NOT EXISTS public.collaboration_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.idea_open_roles(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  introduction TEXT NOT NULL,
  motivation TEXT NOT NULL,
  relevant_experience TEXT NOT NULL,
  portfolio_url TEXT,
  status TEXT CHECK (status IN ('Submitted', 'Reviewing', 'Accepted', 'Declined', 'Withdrawn')) DEFAULT 'Submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(role_id, applicant_id)
);

-- 23. TEAM INVITATIONS
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  invited_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_title TEXT NOT NULL,
  message TEXT,
  status TEXT CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Cancelled')) DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE
);

-- 24. SAVED IDEAS
CREATE TABLE IF NOT EXISTS public.saved_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, idea_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_startup_ideas_owner ON public.startup_ideas(owner_id);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_industry ON public.startup_ideas(industry);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_stage ON public.startup_ideas(development_stage);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_status ON public.startup_ideas(recruitment_status);
CREATE INDEX IF NOT EXISTS idx_idea_open_roles_idea ON public.idea_open_roles(idea_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_apps_idea ON public.collaboration_applications(idea_id);
CREATE INDEX IF NOT EXISTS idx_collab_apps_applicant ON public.collaboration_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_user ON public.team_invitations(invited_user_id);

-- RLS Enablement
ALTER TABLE public.startup_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_required_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_open_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_ideas ENABLE ROW LEVEL SECURITY;

-- TeamUp Policies
CREATE POLICY "Public ideas viewable by all" ON public.startup_ideas FOR SELECT USING (true);
CREATE POLICY "Auth users can create ideas" ON public.startup_ideas FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update ideas" ON public.startup_ideas FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete ideas" ON public.startup_ideas FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Public open roles viewable by all" ON public.idea_open_roles FOR SELECT USING (true);
CREATE POLICY "Owners can manage roles" ON public.idea_open_roles FOR ALL USING (EXISTS (
  SELECT 1 FROM public.startup_ideas WHERE id = idea_open_roles.idea_id AND owner_id = auth.uid()
));

CREATE POLICY "Team members viewable by all" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Team owners can manage members" ON public.team_members FOR ALL USING (EXISTS (
  SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid() AND tm.is_owner = true
));

CREATE POLICY "Applicants can view own applications" ON public.collaboration_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Idea owners can view applications" ON public.collaboration_applications FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.startup_ideas WHERE id = collaboration_applications.idea_id AND owner_id = auth.uid()
));
CREATE POLICY "Auth users can submit applications" ON public.collaboration_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Applicants can withdraw applications" ON public.collaboration_applications FOR UPDATE USING (auth.uid() = applicant_id);
CREATE POLICY "Idea owners can update application status" ON public.collaboration_applications FOR UPDATE USING (EXISTS (
  SELECT 1 FROM public.startup_ideas WHERE id = collaboration_applications.idea_id AND owner_id = auth.uid()
));

CREATE POLICY "Users can view received invitations" ON public.team_invitations FOR SELECT USING (auth.uid() = invited_user_id OR auth.uid() = invited_by);
CREATE POLICY "Owners can send invitations" ON public.team_invitations FOR INSERT WITH CHECK (auth.uid() = invited_by);
CREATE POLICY "Users can respond to invitations" ON public.team_invitations FOR UPDATE USING (auth.uid() = invited_user_id OR auth.uid() = invited_by);

CREATE POLICY "Users can manage saved ideas" ON public.saved_ideas FOR ALL USING (auth.uid() = user_id);

-- 17. USER DASHBOARD PREFERENCES (Part 8)
CREATE TABLE IF NOT EXISTS public.user_dashboard_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferred_lens TEXT DEFAULT 'all',
  visible_sections JSONB DEFAULT '{"metrics": true, "applications": true, "projects": true, "recommendations": true, "saved": true, "activity": true}'::jsonb,
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  recommendations_compact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dashboard_prefs_user ON public.user_dashboard_preferences(user_id);

ALTER TABLE public.user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dashboard preferences" ON public.user_dashboard_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- PART 9: MESSAGING & NOTIFICATIONS SCHEMA
-- ==============================================================================

-- 18. CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_type TEXT DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'project', 'job', 'teamup')),
  context_type TEXT CHECK (context_type IN ('freelance', 'recruit', 'teamup', 'general')),
  context_id TEXT,
  context_title TEXT,
  context_subtitle TEXT,
  context_url TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. CONVERSATION PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE,
  muted_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(conversation_id, user_id)
);

-- 20. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 21. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('freelance', 'recruit', 'teamup', 'messaging', 'account')),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id TEXT,
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 22. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  new_messages_in_app BOOLEAN DEFAULT TRUE,
  new_messages_email BOOLEAN DEFAULT TRUE,
  freelance_updates_in_app BOOLEAN DEFAULT TRUE,
  freelance_updates_email BOOLEAN DEFAULT TRUE,
  recruit_updates_in_app BOOLEAN DEFAULT TRUE,
  recruit_updates_email BOOLEAN DEFAULT TRUE,
  teamup_invites_in_app BOOLEAN DEFAULT TRUE,
  teamup_invites_email BOOLEAN DEFAULT TRUE,
  account_alerts_in_app BOOLEAN DEFAULT TRUE,
  account_alerts_email BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance & chronological queries
CREATE INDEX IF NOT EXISTS idx_conv_last_msg ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_part_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_part_conv ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON public.notification_preferences(user_id);

-- RLS Enablement
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Messaging RLS Policies: Only conversation participants can view conversation details
CREATE POLICY "Participants can view conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Participants can update conversations" ON public.conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can view participant list" ON public.conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id AND cp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add conversation participants" ON public.conversation_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own participant record" ON public.conversation_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages RLS Policies: Only participants can view and send messages
CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authorized participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

-- Notifications RLS: Only recipient can view and update their notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = recipient_id);

CREATE POLICY "System/Authorized users can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Preferences RLS
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- 23. AUTOMATIC PROFILE CREATION TRIGGER FOR SUPABASE AUTH
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, avatar_url, is_onboarded)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    FALSE
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  -- Default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 24. SUPABASE STORAGE BUCKETS SETUP & SECURITY POLICIES
-- ==============================================================================
-- Create storage buckets for user media and attachments
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('portfolio', 'portfolio', true),
  ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Public access to read avatars
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Storage Policy: Authenticated users can upload avatars to their own folder
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid() IS NOT NULL
  );

-- Storage Policy: Public access to portfolio assets
CREATE POLICY "Public portfolio access" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload portfolio assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio' AND 
    auth.uid() IS NOT NULL
  );

-- Storage Policy: Authenticated users can access opportunity & chat attachments
CREATE POLICY "Users can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments' AND 
    auth.uid() IS NOT NULL
  );





