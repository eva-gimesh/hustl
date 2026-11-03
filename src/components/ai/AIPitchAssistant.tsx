import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiService, ApplicationAssistResult } from '../../services/aiService';
import { Button } from '../ui/Button';
import { Sparkles, RefreshCw, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIPitchAssistantProps {
  opportunity: {
    title: string;
    description?: string;
    overview?: string;
    category?: string;
    requiredSkills?: string[];
    compensation?: string;
  };
  onApplyPitch: (pitchText: string, proposedRate?: string) => void;
  className?: string;
}

export const AIPitchAssistant: React.FC<AIPitchAssistantProps> = ({
  opportunity,
  onApplyPitch,
  className = '',
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ApplicationAssistResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = await aiService.assistApplicationPitch(
        {
          name: user?.fullName,
          headline: user?.headline,
          skills: user?.skills,
          bio: user?.bio,
          experience: user?.experience,
          education: user?.education,
        },
        opportunity,
        customNote
      );

      setResult(data);
    } catch (err: any) {
      console.error('AI Pitch error:', err);
      setError(
        err?.message?.includes('GEMINI_API_KEY')
          ? 'Gemini API key is not configured in secrets.'
          : 'Could not draft pitch. Please write manually or retry.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApplyPitch(result.coverLetter, result.suggestedRate);
    setIsExpanded(false);
  };

  return (
    <div className={`p-3 bg-[#101510] border border-[#273128] rounded-xs space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xs bg-[#B6FF4A]/10 border border-[#B6FF4A]/30 flex items-center justify-center text-[#B6FF4A]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-mono font-semibold text-[#F4F7F1]">HUSTL AI Pitch Assistant</span>
            <span className="text-[10px] font-mono text-[#A0AAA0] ml-2 hidden sm:inline">
              Draft authentic proposal from your verified profile
            </span>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-mono py-1 px-2.5 h-auto flex items-center gap-1 border-[#273128]"
        >
          <span>{isExpanded ? 'Hide AI' : 'Draft with AI'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-2 border-t border-[#273128]"
          >
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#A0AAA0] block">
                Custom angle or relevant highlight (Optional):
              </label>
              <input
                type="text"
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                placeholder="e.g. Highlight my experience building real-time dashboards with WebSockets"
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-2.5 py-1.5 text-xs text-[#F4F7F1] focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-[#A0AAA0]">
                Matches your profile skills with this specific listing.
              </span>
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs font-mono py-1 px-3 h-auto flex items-center gap-1.5"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>{result ? 'Regenerate Draft' : 'Draft Pitch'}</span>
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-2 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] font-mono rounded-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="p-3 bg-[#141B15] border border-[#273128] rounded-xs space-y-2.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#B6FF4A] block">
                    Generated Proposal Draft:
                  </span>
                  <p className="text-xs text-[#F4F7F1] whitespace-pre-line leading-relaxed font-sans bg-[#101510] p-2.5 border border-[#273128] rounded-xs max-h-48 overflow-y-auto">
                    {result.coverLetter}
                  </p>
                </div>

                {result.relevantHighlights && result.relevantHighlights.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#7CCB37] block">Key strengths mapped:</span>
                    <ul className="text-[11px] font-mono text-[#A0AAA0] space-y-0.5 list-disc list-inside">
                      {result.relevantHighlights.map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleApply}
                    className="text-xs font-mono py-1 px-3 h-auto flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Insert into Cover Letter</span>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
