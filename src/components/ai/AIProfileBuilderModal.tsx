import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiService, ProfileImprovementResult } from '../../services/aiService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  Sparkles,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIProfileBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProfile?: (updates: { headline?: string; bio?: string; skills?: string[] }) => void;
}

export const AIProfileBuilderModal: React.FC<AIProfileBuilderModalProps> = ({
  isOpen,
  onClose,
  onApplyProfile,
}) => {
  const { user, updateProfileData } = useAuth();
  const [goal, setGoal] = useState('Stand out for high-impact Indian startup roles and freelance gigs');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProfileImprovementResult | null>(null);
  const [applied, setApplied] = useState(false);

  // Editable suggestions before applying
  const [editedHeadline, setEditedHeadline] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setApplied(false);

    try {
      const data = await aiService.improveProfile(
        {
          name: user?.fullName,
          headline: user?.headline,
          skills: user?.skills,
          bio: user?.bio,
          experience: user?.experience,
          education: user?.education,
        },
        goal
      );

      setResult(data);
      setEditedHeadline(data.headline || user?.headline || '');
      setEditedBio(data.bio || user?.bio || '');
      setSelectedSkills(data.skillSuggestions?.slice(0, 4) || []);
    } catch (err: any) {
      console.error('AI Profile error:', err);
      setError(
        err?.message?.includes('GEMINI_API_KEY')
          ? 'Gemini API key is not yet configured in environment secrets. You can still manually update your profile details.'
          : 'Failed to generate profile suggestions. Please check your connection and retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    const newSkills = Array.from(new Set([...(user?.skills || []), ...selectedSkills]));
    const updates = {
      headline: editedHeadline || undefined,
      bio: editedBio || undefined,
      skills: newSkills,
    };

    if (onApplyProfile) {
      onApplyProfile(updates);
    } else {
      await updateProfileData(updates);
    }

    setApplied(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
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
            <div className="w-9 h-9 rounded-sm bg-[#B6FF4A]/10 border border-[#B6FF4A]/30 flex items-center justify-center text-[#B6FF4A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-[#F4F7F1]">HUSTL AI Profile Builder</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#B6FF4A]/10 text-[#B6FF4A] border border-[#B6FF4A]/30 rounded-xs uppercase">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-[#A0AAA0]">
                Elevate your bio, headline, and skills with authentic, impact-driven suggestions.
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

        {/* Goal Selector & Generator */}
        <div className="py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0]">
              What is your primary career target right now?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              {[
                'High-growth startup roles in India',
                'High-ticket freelance clients',
                'Technical co-founder / TeamUp',
              ].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setGoal(opt)}
                  className={`p-2.5 text-left border rounded-xs transition-colors cursor-pointer ${
                    goal === opt
                      ? 'border-[#B6FF4A] bg-[#B6FF4A]/10 text-[#F4F7F1]'
                      : 'border-[#273128] bg-[#141B15] text-[#A0AAA0] hover:text-[#F4F7F1]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-[11px] font-mono text-[#A0AAA0]">
              Uses your current verified skills & experience as ground truth.
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={handleGenerate}
              disabled={isLoading}
              className="text-xs font-mono flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{result ? 'Regenerate Suggestions' : 'Generate Suggestions'}</span>
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
                className="space-y-5 pt-4 border-t border-[#273128]"
              >
                {/* Proposed Headline */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B6FF4A] flex items-center justify-between">
                    <span>Suggested Headline</span>
                    <span className="text-[10px] text-[#A0AAA0]">Editable</span>
                  </label>
                  <input
                    type="text"
                    value={editedHeadline}
                    onChange={e => setEditedHeadline(e.target.value)}
                    className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3.5 py-2 text-xs text-[#F4F7F1] focus:outline-none font-mono"
                  />
                </div>

                {/* Proposed Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#B6FF4A] flex items-center justify-between">
                    <span>Suggested Bio</span>
                    <span className="text-[10px] text-[#A0AAA0]">Editable</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editedBio}
                    onChange={e => setEditedBio(e.target.value)}
                    className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] rounded-xs p-3 text-xs text-[#F4F7F1] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Skill Recommendations */}
                {result.skillSuggestions && result.skillSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0] block">
                      Recommended Skills to Add to Profile
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {result.skillSuggestions.map(skill => {
                        const isSelected = selectedSkills.includes(skill);
                        const alreadyHas = user?.skills?.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            disabled={alreadyHas}
                            className={`text-xs font-mono px-2.5 py-1 border rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                              alreadyHas
                                ? 'bg-[#141B15] border-[#273128] text-[#A0AAA0]/50 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#B6FF4A]/10 border-[#B6FF4A] text-[#B6FF4A]'
                                : 'bg-[#141B15] border-[#273128] text-[#A0AAA0] hover:text-[#F4F7F1]'
                            }`}
                          >
                            <span>{skill}</span>
                            {alreadyHas ? (
                              <span className="text-[9px] text-[#A0AAA0]">(Already added)</span>
                            ) : isSelected ? (
                              <Check className="w-3 h-3 text-[#B6FF4A]" />
                            ) : (
                              <span className="text-xs text-[#7CCB37]">+</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Experience Tips */}
                {result.experienceTips && result.experienceTips.length > 0 && (
                  <div className="p-3 bg-[#141B15] border border-[#273128] rounded-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#7CCB37]">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span className="font-semibold uppercase tracking-wider">Tactical Profile Tips</span>
                    </div>
                    <ul className="space-y-1 text-xs text-[#A0AAA0] list-disc list-inside">
                      {result.experienceTips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Apply Button */}
                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button size="sm" variant="ghost" onClick={onClose} className="text-xs font-mono">
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleApply}
                    disabled={applied}
                    className="text-xs font-mono flex items-center gap-1.5"
                  >
                    {applied ? (
                      <>
                        <Check className="w-4 h-4 text-[#080B09]" />
                        <span>Profile Updated!</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        <span>Apply to My Profile</span>
                      </>
                    )}
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
