import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FreelanceProject, FreelanceApplication, FreelanceApplicationStatus } from '../types';

export const freelanceService = {
  /**
   * Fetch all freelance projects from Supabase
   */
  async getProjects(): Promise<FreelanceProject[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('freelance_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('freelanceService.getProjects warning:', error);
        return [];
      }

      return data.map(row => ({
        id: row.id,
        ownerId: row.owner_id,
        clientName: row.client_name || 'HUSTL Client',
        clientLogo: row.client_logo,
        clientDescription: row.client_description || '',
        clientLocation: row.client_location || 'Remote',
        clientWebsite: row.client_website,
        clientJoinedDate: row.client_joined_date || '2024',
        clientVerified: Boolean(row.client_verified),
        clientPublishedProjectsCount: row.client_published_projects_count || 1,
        title: row.title,
        description: row.description,
        category: row.category,
        requiredSkills: row.required_skills || [],
        deliverables: row.deliverables || [],
        requirements: row.requirements || [],
        budgetMin: Number(row.budget_min || 0),
        budgetMax: Number(row.budget_max || 0),
        currency: row.currency || '₹',
        paymentType: row.payment_type || 'Fixed Price',
        compensationType: row.compensation_type || 'Paid',
        experienceLevel: row.experience_level || 'Intermediate',
        duration: row.duration || '2-4 weeks',
        workMode: row.work_mode || 'Remote',
        location: row.location || 'Remote',
        freelancersCount: row.freelancers_count || 1,
        applicationDeadline: row.application_deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
        startDate: row.start_date,
        preferredCommunication: row.preferred_communication,
        status: row.status || 'open',
        applicantCount: row.applicant_count || 0,
        postedDate: row.created_at,
        isDemo: Boolean(row.is_demo),
        featured: Boolean(row.featured),
      }));
    } catch (err) {
      console.warn('freelanceService.getProjects exception:', err);
      return [];
    }
  },

  /**
   * Publish a new freelance project to Supabase
   */
  async createProject(project: Omit<FreelanceProject, 'id' | 'applicantCount' | 'postedDate'>): Promise<FreelanceProject | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const dbRow = {
        owner_id: project.ownerId,
        title: project.title,
        description: project.description,
        category: project.category,
        required_skills: project.requiredSkills,
        deliverables: project.deliverables,
        requirements: project.requirements,
        budget_min: project.budgetMin,
        budget_max: project.budgetMax,
        currency: project.currency,
        payment_type: project.paymentType,
        compensation_type: project.compensationType,
        experience_level: project.experienceLevel,
        duration: project.duration,
        work_mode: project.workMode,
        location: project.location,
        freelancers_count: project.freelancersCount,
        application_deadline: project.applicationDeadline,
        start_date: project.startDate,
        preferred_communication: project.preferredCommunication,
        status: project.status || 'open',
        is_demo: false,
      };

      const { data, error } = await supabase
        .from('freelance_projects')
        .insert(dbRow)
        .select()
        .single();

      if (error || !data) {
        console.error('freelanceService.createProject error:', error);
        return null;
      }

      return {
        ...project,
        id: data.id,
        applicantCount: 0,
        postedDate: data.created_at,
      };
    } catch (err) {
      console.error('freelanceService.createProject exception:', err);
      return null;
    }
  },

  /**
   * Submit an application to a freelance project
   */
  async applyToProject(application: Omit<FreelanceApplication, 'id' | 'createdAt' | 'status'>): Promise<FreelanceApplication | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const dbRow = {
        project_id: application.projectId,
        applicant_id: application.applicantId,
        cover_letter: application.coverLetter,
        relevant_experience: application.relevantExperience,
        portfolio_url: application.portfolioUrl,
        proposed_budget: Number(application.proposedBudget.replace(/[^0-9.]/g, '')) || 0,
        estimated_duration: application.estimatedDuration,
        status: 'Submitted',
      };

      const { data, error } = await supabase
        .from('freelance_applications')
        .insert(dbRow)
        .select()
        .single();

      if (error || !data) {
        console.error('freelanceService.applyToProject error:', error);
        return null;
      }

      return {
        ...application,
        id: data.id,
        status: 'Submitted',
        createdAt: data.created_at,
      };
    } catch (err) {
      console.error('freelanceService.applyToProject exception:', err);
      return null;
    }
  },

  /**
   * Fetch all applications for a user
   */
  async getUserApplications(userId: string): Promise<FreelanceApplication[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('freelance_applications')
        .select('*, freelance_projects(title, client_name)')
        .eq('applicant_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(row => ({
        id: row.id,
        projectId: row.project_id,
        projectTitle: row.freelance_projects?.title || 'Freelance Project',
        clientName: row.freelance_projects?.client_name || 'Client',
        applicantId: row.applicant_id,
        applicantName: 'Applicant',
        applicantSkills: [],
        coverLetter: row.cover_letter,
        relevantExperience: row.relevant_experience || '',
        portfolioUrl: row.portfolio_url || '',
        proposedBudget: String(row.proposed_budget || ''),
        estimatedDuration: row.estimated_duration || '2 weeks',
        status: row.status as FreelanceApplicationStatus,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.warn('freelanceService.getUserApplications exception:', err);
      return [];
    }
  },

  /**
   * Update application status (shortlisted, accepted, rejected, etc.)
   */
  async updateApplicationStatus(applicationId: string, status: FreelanceApplicationStatus): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error } = await supabase
        .from('freelance_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      return !error;
    } catch (err) {
      console.error('freelanceService.updateApplicationStatus exception:', err);
      return false;
    }
  },

  /**
   * Fetch saved projects for a user
   */
  async getSavedProjectIds(userId: string): Promise<string[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('saved_projects')
        .select('project_id')
        .eq('user_id', userId);

      if (error || !data) return [];
      return data.map(r => r.project_id);
    } catch (err) {
      return [];
    }
  },

  /**
   * Toggle saved status for a project
   */
  async toggleSaveProject(userId: string, projectId: string, currentlySaved: boolean): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      if (currentlySaved) {
        await supabase
          .from('saved_projects')
          .delete()
          .eq('user_id', userId)
          .eq('project_id', projectId);
      } else {
        await supabase
          .from('saved_projects')
          .insert({ user_id: userId, project_id: projectId });
      }
      return true;
    } catch (err) {
      return false;
    }
  },
};
