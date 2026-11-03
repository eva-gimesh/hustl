import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  StartupIdea,
  TeamMember,
  CollaborationApplication,
  TeamInvitation,
  CollaborationApplicationStatus,
  RecruitmentStatus,
  IdeaOpenRole,
  IdeaCategory,
  DevelopmentStage,
  TeamCompensationModel,
} from '../types';

export const teamupService = {
  /**
   * Fetch all startup ideas from Supabase
   */
  async getIdeas(): Promise<StartupIdea[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data: ideasData, error } = await supabase
        .from('startup_ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !ideasData) {
        console.warn('teamupService.getIdeas warning:', error);
        return [];
      }

      // Fetch open roles and required skills in parallel
      const ideaIds = ideasData.map(i => i.id);
      const [skillsRes, rolesRes] = await Promise.all([
        supabase.from('idea_required_skills').select('*').in('idea_id', ideaIds),
        supabase.from('idea_open_roles').select('*').in('idea_id', ideaIds),
      ]);

      return ideasData.map(row => {
        const skills = (skillsRes.data || [])
          .filter(s => s.idea_id === row.id)
          .map(s => s.skill_name);

        const openRoles: IdeaOpenRole[] = (rolesRes.data || [])
          .filter(r => r.idea_id === row.id)
          .map(r => ({
            id: r.id,
            ideaId: r.idea_id,
            roleTitle: r.role_title,
            openings: r.openings || 1,
            requiredSkills: r.required_skills || [],
            responsibilities: r.responsibilities || [],
            experiencePreference: r.experience_preference,
            timeCommitment: r.time_commitment || '10-15 hrs/week',
            compensationModel: (r.compensation_model as TeamCompensationModel) || 'Equity-based',
            isOpen: r.is_open ?? true,
            applicantCount: r.applicant_count || 0,
            createdAt: r.created_at,
          }));

        return {
          id: row.id,
          ownerId: row.owner_id,
          ownerName: row.owner_name || 'Founder',
          ownerAvatar: row.owner_avatar,
          ownerHeadline: row.owner_headline,
          ownerSkills: row.owner_skills || [],
          ownerCollege: row.owner_college,
          title: row.title,
          tagline: row.tagline,
          description: row.description,
          problemStatement: row.problem_statement || '',
          proposedSolution: row.proposed_solution || '',
          targetAudience: row.target_audience || '',
          industry: (row.industry as IdeaCategory) || 'Technology',
          developmentStage: (row.development_stage as DevelopmentStage) || 'Building MVP',
          currentProgress: row.current_progress || '',
          websiteUrl: row.website_url,
          workMode: row.work_mode || 'Remote',
          location: row.location || 'Remote',
          timeCommitment: row.time_commitment || '10-15 hrs/week',
          compensationModel: (row.compensation_model as TeamCompensationModel) || 'Open to discussion',
          recruitmentStatus: (row.recruitment_status as RecruitmentStatus) || 'Recruiting',
          requiredSkills: skills.length > 0 ? skills : (row.required_skills || []),
          openRoles,
          teamSize: row.team_size || 1,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          isDemo: Boolean(row.is_demo),
        };
      });
    } catch (err) {
      console.warn('teamupService.getIdeas exception:', err);
      return [];
    }
  },

  /**
   * Create a new startup idea
   */
  async createIdea(idea: Omit<StartupIdea, 'id' | 'teamSize' | 'createdAt' | 'updatedAt'>): Promise<StartupIdea | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const dbRow = {
        owner_id: idea.ownerId,
        owner_name: idea.ownerName,
        owner_avatar: idea.ownerAvatar,
        owner_headline: idea.ownerHeadline,
        owner_college: idea.ownerCollege,
        owner_skills: idea.ownerSkills,
        title: idea.title,
        tagline: idea.tagline,
        description: idea.description,
        problem_statement: idea.problemStatement,
        proposed_solution: idea.proposedSolution,
        target_audience: idea.targetAudience,
        industry: idea.industry,
        development_stage: idea.developmentStage,
        current_progress: idea.currentProgress,
        website_url: idea.websiteUrl,
        work_mode: idea.workMode,
        location: idea.location,
        time_commitment: idea.timeCommitment,
        compensation_model: idea.compensationModel,
        recruitment_status: idea.recruitmentStatus,
        is_demo: false,
      };

      const { data: ideaCreated, error } = await supabase
        .from('startup_ideas')
        .insert(dbRow)
        .select()
        .single();

      if (error || !ideaCreated) {
        console.error('teamupService.createIdea error:', error);
        return null;
      }

      // Insert required skills
      if (idea.requiredSkills && idea.requiredSkills.length > 0) {
        const skillInserts = idea.requiredSkills.map(s => ({
          idea_id: ideaCreated.id,
          skill_name: s,
        }));
        await supabase.from('idea_required_skills').insert(skillInserts);
      }

      // Insert open roles
      let createdRoles: IdeaOpenRole[] = [];
      if (idea.openRoles && idea.openRoles.length > 0) {
        const roleInserts = idea.openRoles.map(r => ({
          idea_id: ideaCreated.id,
          role_title: r.roleTitle,
          openings: r.openings || 1,
          required_skills: r.requiredSkills || [],
          responsibilities: r.responsibilities || [],
          experience_preference: r.experiencePreference,
          time_commitment: r.timeCommitment,
          compensation_model: r.compensationModel,
          is_open: true,
        }));
        const { data: rolesData } = await supabase.from('idea_open_roles').insert(roleInserts).select();
        if (rolesData) {
          createdRoles = rolesData.map(r => ({
            id: r.id,
            ideaId: r.idea_id,
            roleTitle: r.role_title,
            openings: r.openings,
            requiredSkills: r.required_skills || [],
            responsibilities: r.responsibilities || [],
            experiencePreference: r.experience_preference,
            timeCommitment: r.time_commitment,
            compensationModel: r.compensation_model as TeamCompensationModel,
            isOpen: r.is_open,
            applicantCount: 0,
            createdAt: r.created_at,
          }));
        }
      }

      // Add founder as first team member
      await supabase.from('team_members').insert({
        team_id: ideaCreated.id,
        user_id: idea.ownerId,
        role_title: 'Founder & Team Lead',
        membership_status: 'active',
        is_owner: true,
      });

      return {
        ...idea,
        id: ideaCreated.id,
        teamSize: 1,
        openRoles: createdRoles.length > 0 ? createdRoles : idea.openRoles,
        createdAt: ideaCreated.created_at,
        updatedAt: ideaCreated.created_at,
      };
    } catch (err) {
      console.error('teamupService.createIdea exception:', err);
      return null;
    }
  },

  /**
   * Apply for open role on startup idea
   */
  async applyToRole(application: Omit<CollaborationApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<CollaborationApplication | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const dbRow = {
        idea_id: application.ideaId,
        role_id: application.roleId,
        applicant_id: application.applicantId,
        introduction: application.introduction,
        motivation: application.motivation,
        relevant_experience: application.relevantExperience,
        portfolio_url: application.portfolioUrl,
        status: 'Submitted',
      };

      const { data, error } = await supabase
        .from('collaboration_applications')
        .insert(dbRow)
        .select()
        .single();

      if (error || !data) {
        console.error('teamupService.applyToRole error:', error);
        return null;
      }

      return {
        ...application,
        id: data.id,
        status: 'Submitted',
        createdAt: data.created_at,
        updatedAt: data.created_at,
      };
    } catch (err) {
      console.error('teamupService.applyToRole exception:', err);
      return null;
    }
  },

  /**
   * Update collaboration application status
   */
  async updateApplicationStatus(applicationId: string, status: CollaborationApplicationStatus): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const { error } = await supabase
        .from('collaboration_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      return !error;
    } catch (err) {
      return false;
    }
  },

  /**
   * Fetch saved ideas
   */
  async getSavedIdeaIds(userId: string): Promise<string[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('saved_ideas')
        .select('idea_id')
        .eq('user_id', userId);

      if (error || !data) return [];
      return data.map(r => r.idea_id);
    } catch (err) {
      return [];
    }
  },

  /**
   * Toggle save idea
   */
  async toggleSaveIdea(userId: string, ideaId: string, currentlySaved: boolean): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      if (currentlySaved) {
        await supabase
          .from('saved_ideas')
          .delete()
          .eq('user_id', userId)
          .eq('idea_id', ideaId);
      } else {
        await supabase
          .from('saved_ideas')
          .insert({ user_id: userId, idea_id: ideaId });
      }
      return true;
    } catch (err) {
      return false;
    }
  },
};
