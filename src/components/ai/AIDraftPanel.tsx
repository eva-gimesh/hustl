import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiService, ProjectDescriptionResult, JobDescriptionResult } from '../../services/aiService';
import { formatBudgetRange } from '../../utils/currency';

type Props =
  | {
      kind: 'project';
      onApply: (r: ProjectDescriptionResult) => void;
    }
  | {
      kind: 'job';
      onApply: (r: JobDescriptionResult) => void;
    };

/**
 * Reviewable AI drafting helper. Nothing is written to the form until the user
 * clicks Apply, and suggested pay is shown for reference only (never auto-filled).
 */
export const AIDraftPanel: React.FC<Props> = (props) => {
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectDescriptionResult | null>(null);
  const [job, setJob] = useState<JobDescriptionResult | null>(null);

  const generate = async () => {
    if (brief.trim().length < 10) {
      setError('Describe what you need in at least a sentence.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (props.kind === 'project') setProject(await aiService.generateProjectDescription(brief));
      else setJob(await aiService.generateJobDescription(brief));
    } catch (e: any) {
      setError(
        e?.message?.includes('GEMINI_API_KEY') || e?.message?.includes('UNAVAILABLE')
          ? 'AI is not configured yet (GEMINI_API_KEY missing on the server). You can still fill the form manually.'
          : 'Could not generate a draft right now. Please try again or write it manually.'
      );
    } finally {
      setLoading(false);
    }
  };

  const ready = props.kind === 'project' ? project : job;

  return (
    <div className="border border-[#273128] bg-[#101510] rounded-xs p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B6FF4A]">
        <Sparkles className="w-4 h-4" /> AI draft assistant (optional)
      </div>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={3}
        placeholder={
          props.kind === 'project'
            ? 'e.g. I need a 5-page portfolio website for my photography business'
            : 'e.g. Looking for a 3-month remote React intern for our edtech startup'
        }
        className="w-full bg-[#080B09] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3 py-2 text-sm text-[#F4F7F1] placeholder-[#A0AAA0]/50 focus:outline-none"
      />
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 text-xs font-mono uppercase tracking-wider bg-[#B6FF4A] text-[#080B09] rounded-xs disabled:opacity-60 cursor-pointer"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Drafting…' : 'Generate draft'}
      </button>
      {error && <p className="text-xs text-[#A0AAA0]">{error}</p>}

      {ready && (
        <div className="space-y-2 text-xs text-[#A0AAA0] border-t border-[#273128] pt-3">
          <p className="text-[#F4F7F1] font-semibold">{props.kind === 'project' ? project!.title : job!.title}</p>
          {props.kind === 'project' && (
            <p>
              Reference budget (not applied automatically):{' '}
              {formatBudgetRange(project!.suggestedBudgetMin, project!.suggestedBudgetMax)}
            </p>
          )}
          {props.kind === 'job' && job!.suggestedStipend && (
            <p>Reference pay (not applied automatically): {job!.suggestedStipend}</p>
          )}
          <p>Review before applying — you stay in control of every field.</p>
          <button
            type="button"
            onClick={() => {
              if (props.kind === 'project') props.onApply(project!);
              else props.onApply(job!);
              setProject(null);
              setJob(null);
              setBrief('');
            }}
            className="min-h-[44px] px-4 text-xs font-mono uppercase tracking-wider border border-[#B6FF4A] text-[#B6FF4A] rounded-xs hover:bg-[#B6FF4A]/10 cursor-pointer"
          >
            Apply draft to form
          </button>
        </div>
      )}
    </div>
  );
};
