import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { JobListing, Company, JobApplication, ApplicationNote, JobApplicationStatus } from '../types';

export const recruitService = {
  /**
   * Fetch all recruit job listings from Supabase
   */
  async getJobListings(): Promise<JobListing[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('recruitService.getJobListings warning:', error);
        return [];
      }

      return data.map(row => ({
        id: row.id,
        creatorId: row.creator_id,
        companyId: row.company_id,
        companyName: row.company_name || 'HUSTL Partner',
        companyLogo: row.company_logo,
        companyIndustry: row.company_industry || 'Technology',
        companySize: row.company_size || '1-10',
        companyLocation: row.company_location || 'Remote',
        companyWebsite: row.company_website,
        companyVerified: Boolean(row.company_verified),
        title: row.title,
        category: row.category,
        employmentType: row.employment_type || 'Full-time',
        workMode: row.work_mode || 'Remote',
        location: row.location || 'Remote',
        compensation: row.compensation || 'Compensation not specified',
        compensationType: row.compensation_type || 'Paid',
        compensationMin: row.compensation_min,
        compensationMax: row.compensation_max,
        currency: row.currency || 'INR',
        experienceLevel: row.experience_level || '1-3 years',
        education: row.education,
        requiredSkills: row.required_skills || [],
        bonusSkills: row.bonus_skills || [],
        overview: row.overview || row.description || '',
        responsibilities: row.responsibilities || [],
        qualifications: row.qualifications || [],
        benefits: row.benefits || [],
        hiringProcess: row.hiring_process || [],
        openingsCount: row.openings_count || 1,
        applicationDeadline: row.application_deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
        startDate: row.start_date,
        duration: row.duration,
        requiresResume: row.requires_resume ?? true,
        requiresCoverLetter: row.requires_cover_letter ?? false,
        requiresPortfolio: row.requires_portfolio ?? false,
        customQuestions: row.custom_questions || [],
        status: row.status || 'open',
        applicantCount: row.applicant_count || 0,
        postedDate: row.created_at,
        featured: Boolean(row.featured),
        isDemo: Boolean(row.is_demo),
      }));
    } catch (err) {
      console.warn('recruitService.getJobListings exception:', err);
      return [];
    }
  },

  /**
   * Post a new job opportunity
   */
  async createJob(job: Omit<JobListing, 'id' | 'applicantCount' | 'postedDate'>): Promise<JobListing | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const dbRow = {
        creator_id: job.creatorId,
        company_id: job.companyId,
        company_name: job.companyName,
        company_logo: job.companyLogo,
        company_industry: job.companyIndustry,
        company_size: job.companySize,
        company_location: job.companyLocation,
        company_website: job.companyWebsite,
        company_verified: job.companyVerified,
        title: job.title,
        category: job.category,
        employment_type: job.employmentType,
        work_mode: job.workMode,
        location: job.location,
        compensation: job.compensation,
        compensation_type: job.compensationType,
        compensation_min: job.compensationMin,
        compensation_max: job.compensationMax,
        currency: job.currency,
        experience_level: job.experienceLevel,
        education: job.education,
        required_skills: job.requiredSkills,
        bonus_skills: job.bonusSkills,
        overview: job.overview,
        responsibilities: job.responsibilities,
        qualifications: job.qualifications,
        benefits: job.benefits,
        hiring_process: job.hiringProcess,
        openings_count: job.openingsCount,
        application_deadline: job.applicationDeadline,
        start_date: job.startDate,
        duration: job.duration,
        requires_resume: job.requiresResume,
        requires_cover_letter: job.requiresCoverLetter,
        requires_portfolio: job.requiresPortfolio,
        custom_questions: job.customQuestions,
        status: job.status || 'open',
        featured: job.featured || false,
        is_demo: false,
      };

      const { data, error } = await supabase
        .from('job_listings')
        .insert(dbRow)
        .select()
        .single();

      if (error || !data) {
        console.error('recruitService.createJob error:', error);
        return null;
      }

      return {
        ...job,
        id: data.id,
        applicantCount: 0,
        postedDate: data.created_at,
      };
    } catch (err) {
      console.error('recruitService.createJob exception:', err);
      return null;
    }
  },

  /**
   * Submit application to job listing
   */
  async applyToJob(application: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt' | 'status'>): Promise<JobApplication | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const dbRow = {
        job_id: application.jobId,
        applicant_id: application.applicantId,
        applicant_name: application.applicantName,
        applicant_avatar: application.applicantAvatar,
        applicant_headline: application.applicantHeadline,
        applicant_email: application.applicantEmail,
        applicant_education: application.applicantEducation,
        applicant_skills: application.applicantSkills,
        resume_url: application.resumeUrl,
        cover_letter: application.coverLetter,
        relevant_experience: application.relevantExperience,
        portfolio_url: application.portfolioUrl,
        custom_answers: application.answers,
        status: 'Submitted',
      };

      const { data, error } = await supabase
        .from('job_applications')
        .insert(dbRow)
        .select()
        .single();

      if (error || !data) {
        console.error('recruitService.applyToJob error:', error);
        return null;
      }

      return {
        ...application,
        id: data.id,
        status: 'Submitted',
        appliedAt: data.created_at,
        updatedAt: data.created_at,
      };
    } catch (err) {
      console.error('recruitService.applyToJob exception:', err);
      return null;
    }
  },

  /**
   * Update candidate status
   */
  async updateApplicationStatus(applicationId: string, status: JobApplicationStatus, rejectionReason?: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error } = await supabase
        .from('job_applications')
        .update({
          status,
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      return !error;
    } catch (err) {
      return false;
    }
  },

  /**
   * Add internal hiring note
   */
  async addNote(applicationId: string, authorId: string, authorName: string, content: string, authorRole?: string): Promise<ApplicationNote | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('application_notes')
        .insert({
          application_id: applicationId,
          author_id: authorId,
          author_name: authorName,
          content,
          author_role: authorRole,
        })
        .select()
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        applicationId: data.application_id,
        authorId: data.author_id,
        authorName: data.author_name,
        authorRole: data.author_role,
        content: data.content,
        createdAt: data.created_at,
      };
    } catch (err) {
      return null;
    }
  },

  /**
   * Fetch saved jobs for user
   */
  async getSavedJobIds(userId: string): Promise<string[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', userId);

      if (error || !data) return [];
      return data.map(r => r.job_id);
    } catch (err) {
      return [];
    }
  },

  /**
   * Toggle save job
   */
  async toggleSaveJob(userId: string, jobId: string, currentlySaved: boolean): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      if (currentlySaved) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', userId)
          .eq('job_id', jobId);
      } else {
        await supabase
          .from('saved_jobs')
          .insert({ user_id: userId, job_id: jobId });
      }
      return true;
    } catch (err) {
      return false;
    }
  },
};
