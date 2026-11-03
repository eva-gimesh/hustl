import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, PlatformRole } from '../context/AuthContext';
import { TalentProfile, UserRole } from '../types';

export const profileService = {
  /**
   * Fetch full user profile by ID with associated metadata
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, headline, avatar_url, bio, location, institution, availability, years_of_experience, completed_projects, verified, is_onboarded, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error || !profile) return null;

      // Email is private (not selectable from profiles); take it from the auth session for the signed-in user only.
      const { data: sess } = await supabase.auth.getSession();
      const sessionEmail = sess.session?.user?.id === userId ? (sess.session.user.email || '') : '';

      // Parallel fetch related tables
      const [rolesRes, skillsRes, eduRes, expRes, prefRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', userId),
        supabase.from('user_skills').select('skill_name').eq('user_id', userId),
        supabase.from('user_education').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
        supabase.from('user_experience').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
        supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      const roles = (rolesRes.data?.map(r => r.role as PlatformRole)) || [];
      const skills = (skillsRes.data?.map(s => s.skill_name)) || [];
      const education = eduRes.data?.[0];
      const experience = expRes.data?.[0];
      const preferences = prefRes.data;

      return {
        id: profile.id,
        email: sessionEmail,
        fullName: profile.full_name,
        displayName: profile.display_name || profile.full_name?.split(' ')[0] || 'User',
        avatarUrl: profile.avatar_url || '',
        location: profile.location || '',
        institution: profile.institution || education?.institution || '',
        bio: profile.bio || '',
        roles: roles.length > 0 ? roles : ['student'],
        skills,
        education: education ? {
          institution: education.institution,
          degree: education.degree,
          graduationYear: education.graduation_year,
        } : undefined,
        experience: experience ? {
          level: experience.position,
          previousExperience: experience.description,
          organizationDetails: experience.organisation,
        } : undefined,
        preferences: preferences ? {
          lookingFor: preferences.opportunity_types || [],
          availability: preferences.availability || profile.availability || 'Available now',
          portfolioUrl: preferences.portfolio_url,
          linkedinUrl: preferences.linkedin_url,
          githubUrl: preferences.github_url,
        } : undefined,
        isOnboarded: Boolean(profile.is_onboarded),
        createdAt: profile.created_at,
      };
    } catch (err) {
      console.warn('profileService.getProfile failed:', err);
      return null;
    }
  },

  /**
   * Save or update basic profile information
   */
  async upsertProfile(profile: Partial<UserProfile> & { id: string }): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (profile.fullName) updates.full_name = profile.fullName;
      if (profile.displayName) updates.display_name = profile.displayName;
      if (profile.avatarUrl !== undefined) updates.avatar_url = profile.avatarUrl;
      if (profile.bio !== undefined) updates.bio = profile.bio;
      if (profile.location !== undefined) updates.location = profile.location;
      if (profile.institution !== undefined) updates.institution = profile.institution;
      if (profile.isOnboarded !== undefined) updates.is_onboarded = profile.isOnboarded;
      if (profile.preferences?.availability) updates.availability = profile.preferences.availability;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) {
        console.error('Error in upsertProfile:', error);
        return false;
      }

      // Sync roles if provided
      if (profile.roles && profile.roles.length > 0) {
        await supabase.from('user_roles').delete().eq('user_id', profile.id);
        const roleInserts = profile.roles.map(r => ({ user_id: profile.id, role: r }));
        await supabase.from('user_roles').insert(roleInserts);
      }

      // Sync skills if provided
      if (profile.skills) {
        await supabase.from('user_skills').delete().eq('user_id', profile.id);
        if (profile.skills.length > 0) {
          const skillInserts = profile.skills.map(s => ({ user_id: profile.id, skill_name: s }));
          await supabase.from('user_skills').insert(skillInserts);
        }
      }

      // Sync preferences
      if (profile.preferences) {
        await supabase.from('user_preferences').upsert({
          user_id: profile.id,
          availability: profile.preferences.availability,
          opportunity_types: profile.preferences.lookingFor,
          portfolio_url: profile.preferences.portfolioUrl,
          linkedin_url: profile.preferences.linkedinUrl,
          github_url: profile.preferences.githubUrl,
          updated_at: new Date().toISOString(),
        });
      }

      return true;
    } catch (err) {
      console.error('profileService.upsertProfile exception:', err);
      return false;
    }
  },

  /**
   * Fetch list of talent profiles for discovery / explore
   */
  async getTalentListings(): Promise<TalentProfile[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          display_name,
          headline,
          avatar_url,
          bio,
          location,
          institution,
          availability,
          years_of_experience,
          completed_projects,
          verified,
          created_at
        `)
        .order('completed_projects', { ascending: false })
        .limit(50);

      if (error || !profiles) return [];

      const profileIds = profiles.map(p => p.id);
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('user_id, skill_name, proficiency')
        .in('user_id', profileIds);

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profileIds);

      return profiles.map(p => {
        const userSkills = (skillsData || [])
          .filter(s => s.user_id === p.id)
          .map(s => s.skill_name);

        const userSkillsDetailed = (skillsData || [])
          .filter(s => s.user_id === p.id)
          .map(s => ({
            id: s.skill_name,
            name: s.skill_name,
            proficiency: (s.proficiency as any) || 'Intermediate',
          }));

        const userRoles = (rolesData || [])
          .filter(r => r.user_id === p.id)
          .map(r => r.role as UserRole);

        return {
          id: p.id,
          name: p.full_name,
          handle: `@${(p.display_name || p.full_name?.split(' ')[0] || 'builder').toLowerCase()}`,
          title: p.headline || 'Opportunity Seeker & Builder',
          headline: p.headline || 'Opportunity Seeker & Builder',
          role: userRoles[0] || 'student',
          institution: p.institution || '',
          location: p.location || 'Remote',
          roles: userRoles.length > 0 ? userRoles : ['freelancer'],
          availability: p.availability || 'Available now',
          skills: userSkills,
          skillsDetailed: userSkillsDetailed,
          rating: 4.9,
          completedProjects: p.completed_projects || 0,
          yearsOfExperience: p.years_of_experience || 0,
          bio: p.bio || '',
          verified: Boolean(p.verified),
          avatarUrl: p.avatar_url || '',
          joinedDate: p.created_at,
          connectionStatus: 'none',
        };
      });
    } catch (err) {
      console.warn('profileService.getTalentListings failed:', err);
      return [];
    }
  },
};
