/**
 * HUSTL AI Service
 * Communicates with server-side Gemini 3.8 Flash proxy (/api/ai/generate).
 * Never exposes API keys directly to the client bundle.
 */

export interface AIHealthStatus {
  available: boolean;
  model: string;
  configured: boolean;
  message: string;
}

export interface ProfileImprovementResult {
  headline: string;
  bio: string;
  skillSuggestions: string[];
  experienceTips: string[];
}

export interface ResumeAssistResult {
  bullets: string[];
  summary: string;
  keywordsMatched: string[];
}

export interface ProjectDescriptionResult {
  title: string;
  description: string;
  deliverables: string[];
  requirements: string[];
  recommendedSkills: string[];
  suggestedBudgetMin: number;
  suggestedBudgetMax: number;
  suggestedDuration: string;
}

export interface JobDescriptionResult {
  title: string;
  overview: string;
  responsibilities: string[];
  qualifications: string[];
  requiredSkills: string[];
  bonusSkills: string[];
  benefits: string[];
  suggestedStipend: string;
}

export interface TeamUpMatchResult {
  matchScore: number;
  synergySummary: string;
  complementarySkills: string[];
  growthOpportunities: string[];
  recommendedPitchAngle: string;
}

export interface OpportunitySearchResult {
  keywords: string[];
  category: 'freelance' | 'recruit' | 'teamup' | 'all';
  workMode: 'Remote' | 'Hybrid' | 'On-site' | 'any';
  maxBudget: number | null;
  minBudget: number | null;
  experienceLevel: 'Entry' | 'Intermediate' | 'Expert' | 'any';
  intentExplanation: string;
}

export interface ApplicationAssistResult {
  coverLetter: string;
  relevantHighlights: string[];
  suggestedRate?: string;
}

class AIService {
  private cachedHealth: AIHealthStatus | null = null;
  private lastHealthCheck = 0;

  async checkHealth(): Promise<AIHealthStatus> {
    const now = Date.now();
    if (this.cachedHealth && now - this.lastHealthCheck < 30000) {
      return this.cachedHealth;
    }

    try {
      const res = await fetch('/api/ai/health');
      if (!res.ok) throw new Error('Health check endpoint failed');
      const data = await res.json();
      this.cachedHealth = data;
      this.lastHealthCheck = now;
      return data;
    } catch {
      return {
        available: false,
        model: 'gemini-3.8-flash',
        configured: false,
        message: 'Could not connect to HUSTL AI backend.',
      };
    }
  }

  private async callAI<T>(task: string, prompt: string, context?: any): Promise<T> {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task, prompt, context }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData.message || `AI request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    const result = await response.json();
    return result.data as T;
  }

  /**
   * Refines a user's headline, bio, and experience bullets
   */
  async improveProfile(
    profileContext: {
      name?: string;
      headline?: string;
      skills?: string[];
      bio?: string;
      experience?: unknown;
      education?: unknown;
    },
    userGoal: string
  ): Promise<ProfileImprovementResult> {
    return this.callAI<ProfileImprovementResult>(
      'profile_improve',
      userGoal || 'Make my profile stand out to Indian tech startups and clients',
      profileContext
    );
  }

  /**
   * Generates or improves STAR-formatted resume bullet points tailored to a role
   */
  async assistResume(
    candidateContext: {
      role?: string;
      skills?: string[];
      currentBullets?: string[];
      portfolioTitle?: string;
    },
    targetJobOrDescription: string
  ): Promise<ResumeAssistResult> {
    return this.callAI<ResumeAssistResult>(
      'resume_assist',
      targetJobOrDescription,
      candidateContext
    );
  }

  /**
   * Expands an outline into a complete freelance project post with INR estimates
   */
  async generateProjectDescription(
    brief: string,
    clientContext?: { clientName?: string; category?: string }
  ): Promise<ProjectDescriptionResult> {
    return this.callAI<ProjectDescriptionResult>(
      'project_desc',
      brief,
      clientContext
    );
  }

  /**
   * Crafts an internship/job description with realistic Indian stipend
   */
  async generateJobDescription(
    brief: string,
    companyContext?: { companyName?: string; industry?: string }
  ): Promise<JobDescriptionResult> {
    return this.callAI<JobDescriptionResult>(
      'job_desc',
      brief,
      companyContext
    );
  }

  /**
   * Matches candidate profile against a startup idea and calculates synergy
   */
  async matchTeamUp(
    userProfile: any,
    idea: any
  ): Promise<TeamUpMatchResult> {
    return this.callAI<TeamUpMatchResult>(
      'teamup_match',
      'Analyze synergy and complement between candidate and startup idea',
      { user: userProfile, idea }
    );
  }

  /**
   * Translates a natural language query into database filters
   */
  async parseOpportunitySearch(query: string): Promise<OpportunitySearchResult> {
    return this.callAI<OpportunitySearchResult>(
      'opportunity_search',
      query
    );
  }

  /**
   * Assists applicant in generating a tailored pitch for a freelance, job, or teamup listing
   */
  async assistApplicationPitch(
    applicantProfile: any,
    opportunity: any,
    customNotes?: string
  ): Promise<ApplicationAssistResult> {
    return this.callAI<ApplicationAssistResult>(
      'application_assist',
      customNotes || 'Highlight my key strengths and past execution',
      { profile: applicantProfile, opportunity }
    );
  }
}

export const aiService = new AIService();
