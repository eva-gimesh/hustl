import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiService, ResumeAssistResult } from '../../services/aiService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Sparkles,
  X,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  FileText,
  Target,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIResumeAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRoleInitial?: string;
}

export const AIResumeAssistantModal: React.FC<AIResumeAssistantModalProps> = ({
  isOpen,
  onClose,
  targetRoleInitial = '',
}) => {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState(targetRoleInitial || '');
  const [rawExperience, setRawExperience] = useState(
    user?.experience?.previousExperience || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeAssistResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await aiService.assistResume(
        {
          role: user?.headline || '',
          skills: user?.skills,
          currentBullets: rawExperience.trim() ? [rawExperience] : [],
        },
        targetRole
      );

      setResult(data);
    } catch (err: any) {
      console.error('Resume AI error:', err);
      setError(
        err?.message?.includes('GEMINI_API_KEY')
          ? 'Gemini API key is not yet configured in environment secrets.'
          : 'Failed to generate tailored resume bullets. Please retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080B09]/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-2xl bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 shadow-2xl my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#273128]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-[#7CCB37]/10 border border-[#7CCB37]/30 flex items-center justify-center text-[#7CCB37]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-[#F4F7F1]">HUSTL AI Resume Assistant</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#7CCB37]/10 text-[#7CCB37] border border-[#7CCB37]/30 rounded-xs uppercase">
                  STAR Framework
                </span>
              </div>
              <p className="text-xs text-[#A0AAA0]">
                Convert informal project tasks into high-impact, metrics-driven bullet points tailored to your target role.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#141B15] border border-transparent hover:border-[#273128] rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#B6FF4A]" />
              <span>Target Role / Job Specification</span>
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend React Engineer at Fintech Startup"
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3.5 py-2 text-xs text-[#F4F7F1] focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0]">
              Raw Task / Work Description (What you actually built or accomplished)
            </label>
            <textarea
              rows={3}
              value={rawExperience}
              onChange={e => setRawExperience(e.target.value)}
              placeholder="Briefly describe what you did without worrying about corporate wording..."
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] rounded-xs p-3 text-xs text-[#F4F7F1] focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-[11px] font-mono text-[#A0AAA0]">
              Enforces action verbs & quantified outcomes without invented credentials.
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={handleGenerate}
              disabled={isLoading || !rawExperience.trim()}
              className="text-xs font-mono flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting STAR Bullets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{result ? 'Refine Bullets' : 'Craft STAR Bullets'}</span>
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4 pt-4 border-t border-[#273128]"
              >
                {/* Executive Summary */}
                {result.summary && (
                  <div className="p-3.5 bg-[#141B15] border border-[#273128] rounded-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B6FF4A] block">
                      Target Executive Summary
                    </span>
                    <p className="text-xs text-[#F4F7F1] leading-relaxed font-mono">
                      {result.summary}
                    </p>
                  </div>
                )}

                {/* Bullets List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#B6FF4A]">
                      High-Impact Bullet Points (Ready for CV & Applications)
                    </label>
                    <span className="text-[11px] font-mono text-[#A0AAA0]">Click to copy</span>
                  </div>

                  <div className="space-y-2">
                    {result.bullets.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="group flex items-start justify-between gap-3 p-3 bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A]/40 rounded-xs transition-colors"
                      >
                        <p className="text-xs text-[#F4F7F1] leading-relaxed font-mono">
                          • {bullet}
                        </p>
                        <button
                          onClick={() => copyToClipboard(bullet, idx)}
                          className="p-1.5 text-[#A0AAA0] group-hover:text-[#B6FF4A] hover:bg-[#101510] border border-transparent hover:border-[#273128] rounded-xs transition-colors cursor-pointer shrink-0"
                          title="Copy bullet"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-[#B6FF4A]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matched Keywords */}
                {result.keywordsMatched && result.keywordsMatched.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    <span className="text-[11px] font-mono text-[#A0AAA0]">Keywords Highlighted:</span>
                    {result.keywordsMatched.map(kw => (
                      <span
                        key={kw}
                        className="text-[10px] font-mono px-2 py-0.5 bg-[#101510] border border-[#273128] text-[#7CCB37] rounded-xs"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button size="sm" variant="ghost" onClick={onClose} className="text-xs font-mono">
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
