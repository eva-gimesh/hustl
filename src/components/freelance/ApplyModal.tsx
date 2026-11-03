import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FreelanceProject } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useFreelance } from '../../context/FreelanceContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  X,
  Send,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AIPitchAssistant } from '../ai/AIPitchAssistant';
import { motion, AnimatePresence } from 'motion/react';
import { formatMoney, formatMoneyRange } from '../../utils/currency';

interface ApplyModalProps {
  project: FreelanceProject | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ project, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { applyToProject, hasApplied } = useFreelance();

  const [coverLetter, setCoverLetter] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [proposedBudget, setProposedBudget] = useState(
    project ? formatMoney(project.budgetMax, project.currency) : ''
  );
  const [estimatedDuration, setEstimatedDuration] = useState(
    project ? project.duration : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!project) return null;

  const applicantId = user?.id || 'guest-applicant';
  const alreadyApplied = hasApplied(project.id, applicantId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!coverLetter.trim() || coverLetter.trim().length < 30) {
      setError('Please provide a meaningful proposal of at least 30 characters.');
      return;
    }

    if (!proposedBudget.trim()) {
      setError('Please specify your proposed compensation.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = applyToProject({
        projectId: project.id,
        projectTitle: project.title,
        clientName: project.clientName,
        applicantId,
        applicantName: user?.fullName || 'Ambitious Freelancer',
        applicantAvatar: user?.avatarUrl,
        applicantRole: user?.roles?.[0] || 'Autonomous Builder',
        applicantSkills: user?.skills || ['React', 'TypeScript'],
        applicantExperience: relevantExperience,
        coverLetter: coverLetter.trim(),
        relevantExperience: relevantExperience.trim(),
        portfolioUrl: portfolioUrl.trim(),
        proposedBudget: proposedBudget.trim(),
        estimatedDuration: estimatedDuration.trim() || project.duration,
      });

      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2200);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to submit application. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080B09]/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-[#141B15] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl relative my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#273128] pb-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              Direct Proposal Submission
            </span>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#F4F7F1]">
              Apply for {project.title}
            </h2>
            <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
              <span className="flex items-center gap-1 text-[#F4F7F1]">
                <Building2 className="w-3.5 h-3.5 text-[#7CCB37]" />
                {project.clientName}
              </span>
              <span className="text-[#273128]">·</span>
              <span>
                Target: {formatMoneyRange(project.budgetMin, project.budgetMax, project.currency)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#101510] border border-transparent hover:border-[#273128] rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#B6FF4A]/10 border border-[#B6FF4A] flex items-center justify-center text-[#B6FF4A]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#F4F7F1]">
              Proposal Dispatched
            </h3>
            <p className="text-xs font-mono text-[#A0AAA0] max-w-md mx-auto leading-relaxed">
              Your proposal has been logged with {project.clientName}. You can track status updates in your{' '}
              <span className="text-[#B6FF4A]">My Applications</span> dashboard.
            </p>
          </div>
        ) : alreadyApplied ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
              Active Application on Record
            </h3>
            <p className="text-xs font-mono text-[#A0AAA0] max-w-md mx-auto">
              You have already submitted an active proposal for this project. Track its review stage in My Applications.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button size="sm" variant="outline" onClick={onClose}>
                Close Window
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isAuthenticated && (
              <div className="p-3 bg-[#101510] border border-[#273128] text-xs font-mono text-[#A0AAA0] rounded-xs flex items-center justify-between">
                <span>Applying as guest builder. Want faster review?</span>
                <Link to="/login" className="text-[#B6FF4A] hover:underline flex items-center gap-1 font-bold">
                  Log in <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* AI Pitch Assistant */}
            <AIPitchAssistant
              opportunity={{
                title: project.title,
                description: project.description,
                category: project.category,
                requiredSkills: project.requiredSkills,
                compensation: formatMoneyRange(project.budgetMin, project.budgetMax, project.currency),
              }}
              onApplyPitch={(pitchText) => setCoverLetter(pitchText)}
            />

            {/* Proposal / Cover Letter */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1] flex justify-between">
                <span>Cover Letter & Technical Approach *</span>
                <span className="text-[10px] text-[#A0AAA0]">Min. 30 characters</span>
              </label>
              <textarea
                required
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you are the best fit, your concrete execution plan, and specific technical milestones..."
                className="w-full bg-[#101510] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3.5 py-2.5 text-xs text-[#F4F7F1] placeholder-[#A0AAA0]/50 focus:outline-none transition-colors font-sans leading-relaxed"
              />
            </div>

            {/* Relevant Experience */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                Relevant Work & Evidence
              </label>
              <Input
                value={relevantExperience}
                onChange={(e) => setRelevantExperience(e.target.value)}
                placeholder="e.g. Built 3 similar React stores, audited smart contracts, shipped production APIs..."
              />
            </div>

            {/* Portfolio Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                Portfolio / GitHub Repository Link
              </label>
              <Input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/yourhandle or https://portfolio.dev"
              />
            </div>

            {/* Two Column: Proposed Budget & Estimated Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Proposed Compensation *
                </label>
                <Input
                  required
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(e.target.value)}
                  placeholder={`e.g. ${formatMoney(project.budgetMax, project.currency)}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Estimated Completion Time *
                </label>
                <Input
                  required
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="e.g. 2 weeks, 10 business days"
                />
              </div>
            </div>

            {/* Footer Trust Strip */}
            <div className="pt-2 border-t border-[#273128] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#A0AAA0]">
                <ShieldCheck className="w-4 h-4 text-[#B6FF4A]" />
                <span>Zero platform commission on first ₹80,000 earned.</span>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <Button size="sm" variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  {isSubmitting ? 'Transmitting...' : 'Submit Application'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
