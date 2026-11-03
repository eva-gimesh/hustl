import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiService, TeamUpMatchResult } from '../../services/aiService';

interface Props {
  user: { fullName?: string; skills?: string[]; bio?: string; headline?: string } | null;
  idea: { title?: string; industry?: string; requiredSkills?: string[]; openRoles?: { roleTitle: string; requiredSkills: string[] }[] };
}

/** Explains how the signed-in user's real profile fits an idea. Shows no numeric score. */
export const AIMatchCard: React.FC<Props> = ({ user, idea }) => {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<TeamUpMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setRes(
        await aiService.matchTeamUp(
          { skills: user?.skills, bio: user?.bio, headline: user?.headline },
          {
            title: idea.title,
            industry: idea.industry,
            requiredSkills: idea.requiredSkills,
            openRoles: idea.openRoles?.map((r) => ({ roleTitle: r.roleTitle, requiredSkills: r.requiredSkills })),
          }
        )
      );
    } catch (e: any) {
      setError(
        e?.message?.includes('GEMINI_API_KEY') || e?.message?.includes('UNAVAILABLE')
          ? 'AI is not configured yet (GEMINI_API_KEY missing on the server).'
          : 'Could not analyse the match right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-[#273128] bg-[#101510] rounded-xs p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B6FF4A]">
        <Sparkles className="w-4 h-4" /> How well do I fit?
      </div>
      {!res && (
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 text-xs font-mono uppercase tracking-wider border border-[#B6FF4A] text-[#B6FF4A] rounded-xs hover:bg-[#B6FF4A]/10 disabled:opacity-60 cursor-pointer"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Analysing…' : 'Analyse my fit with AI'}
        </button>
      )}
      {error && <p className="text-xs text-[#A0AAA0]">{error}</p>}
      {res && (
        <div className="space-y-2 text-sm text-[#A0AAA0]">
          <p>{res.synergySummary}</p>
          {res.complementarySkills?.length > 0 && (
            <p>
              <span className="text-[#F4F7F1]">Overlapping skills:</span> {res.complementarySkills.join(', ')}
            </p>
          )}
          {res.recommendedPitchAngle && (
            <p>
              <span className="text-[#F4F7F1]">Pitch angle:</span> {res.recommendedPitchAngle}
            </p>
          )}
          <p className="text-xs">AI-generated from your profile and this listing. Verify before relying on it.</p>
        </div>
      )}
    </div>
  );
};
