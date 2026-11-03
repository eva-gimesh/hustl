import React, { useState } from 'react';
import { StartupIdea, IdeaOpenRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTeamUp } from '../../context/TeamUpContext';
import { Button } from '../ui/Button';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface ApplyTeamModalProps {
  idea: StartupIdea;
  initialRoleId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyTeamModal: React.FC<ApplyTeamModalProps> = ({
  idea,
  initialRoleId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { applyToRole, hasAppliedToRole } = useTeamUp();

  const openRoles = idea.openRoles.filter((r) => r.isOpen);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    initialRoleId || (openRoles.length > 0 ? openRoles[0].id : '')
  );

  const [introduction, setIntroduction] = useState('');
  const [motivation, setMotivation] = useState('');
  const [relevantExperience, setRelevantExperience] = useState(
    user?.experience?.previousExperience || ''
  );
  const [portfolioUrl, setPortfolioUrl] = useState(
    user?.preferences?.portfolioUrl || user?.preferences?.githubUrl || 'https://github.com/hamlin-jaiju'
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentUserId = user?.id || 'usr_demo_8829';
  const isOwner = idea.ownerId === currentUserId;
  const alreadyApplied = selectedRoleId ? hasAppliedToRole(selectedRoleId, currentUserId) : false;

  const selectedRole = idea.openRoles.find((r) => r.id === selectedRoleId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isOwner) {
      setError('You are the founder of this venture and cannot apply to your own opening.');
      return;
    }

    if (!selectedRoleId || !selectedRole) {
      setError('Please choose a role you want to join as.');
      return;
    }

    if (!introduction.trim()) {
      setError('Please provide a brief introduction about yourself.');
      return;
    }

    if (!motivation.trim()) {
      setError('Please describe what excites you about this problem statement.');
      return;
    }

    setIsSubmitting(true);

    const result = applyToRole({
      ideaId: idea.id,
      ideaTitle: idea.title,
      roleId: selectedRole.id,
      roleTitle: selectedRole.roleTitle,
      applicantId: currentUserId,
      applicantName: user?.fullName || 'Hamlin Jaiju',
      applicantEmail: user?.email || 'hamlin.jaiju@gmail.com',
      applicantAvatar: user?.avatarUrl,
      applicantHeadline: user?.bio || user?.experience?.previousExperience || 'Student Systems Engineer',
      applicantSkills: user?.skills || ['React', 'TypeScript', 'Rust'],
      introduction: introduction.trim(),
      motivation: motivation.trim(),
      relevantExperience: relevantExperience.trim(),
      portfolioUrl: portfolioUrl.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1800);
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 my-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A0AAA0] hover:text-[#F4F7F1] p-1.5 border border-[#273128] rounded-sm cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pb-4 border-b border-[#273128]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#B6FF4A]">
              TeamUp Collaboration Dossier · {idea.title}
            </span>
          </div>
          <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
            Apply to Join {idea.title}
          </h2>
          <p className="text-xs font-mono text-[#A0AAA0] mt-1">
            Founder: {idea.ownerName} ({idea.ownerCollege || 'Collegiate Builder'}) · {idea.developmentStage}
          </p>
        </div>

        {/* Guards */}
        {isOwner ? (
          <div className="py-8 text-center space-y-3 font-mono">
            <AlertCircle className="w-8 h-8 text-[#B6FF4A] mx-auto" />
            <h3 className="font-display font-bold text-lg text-[#F4F7F1]">Venture Founder Notice</h3>
            <p className="text-xs text-[#A0AAA0] max-w-md mx-auto">
              You created this venture. To manage applicants, team roles, or invitations, visit the team management workspace.
            </p>
            <div className="pt-2">
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        ) : isSubmitted ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#B6FF4A]/10 border border-[#B6FF4A] text-[#B6FF4A] flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl text-[#F4F7F1] tracking-tight">
                Collaboration Proposal Dispatched
              </h3>
              <p className="text-sm font-mono text-[#A0AAA0] max-w-md mx-auto mt-2 leading-relaxed">
                Your credentials, experience, and motivation note have been routed directly to {idea.ownerName}’s team management dashboard.
              </p>
            </div>
            <div className="pt-4 flex justify-center">
              <Button onClick={onClose} variant="primary">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[#7CCB37] mb-2">
                Select Open Founding Role <span className="text-rose-400">*</span>
              </label>

              {openRoles.length === 0 ? (
                <div className="p-4 bg-[#141B15] border border-[#273128] text-xs font-mono text-[#A0AAA0]">
                  No open roles currently active on this venture.
                </div>
              ) : (
                <div className="space-y-2">
                  {openRoles.map((role) => {
                    const isSelected = selectedRoleId === role.id;
                    const isApplied = hasAppliedToRole(role.id, currentUserId);

                    return (
                      <div
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`p-3.5 border rounded-sm cursor-pointer transition-all flex items-center justify-between text-xs font-mono ${
                          isSelected
                            ? 'bg-[#141B15] border-[#B6FF4A] shadow-[0_0_15px_-3px_rgba(182,255,74,0.12)]'
                            : 'bg-[#101510] border-[#273128] hover:border-[#7CCB37]/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#F4F7F1]">{role.roleTitle}</span>
                            {isApplied && (
                              <span className="text-[10px] text-[#B6FF4A] bg-[#B6FF4A]/10 px-1.5 py-0.5 border border-[#B6FF4A]/30">
                                Applied
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#A0AAA0] mt-0.5">
                            {role.timeCommitment} · {role.compensationModel}
                          </p>
                        </div>

                        <span className="text-[11px] text-[#A0AAA0]">
                          Skills: {role.requiredSkills.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Applicant Profile preview */}
            <div className="p-3.5 bg-[#141B15] border border-[#273128] rounded-sm text-xs font-mono space-y-1">
              <span className="text-[10px] uppercase text-[#A0AAA0] block">Applicant Profile Information</span>
              <div className="flex items-center justify-between text-[#F4F7F1]">
                <span className="font-bold">{user?.fullName || 'Hamlin Jaiju'}</span>
                <span className="text-[#A0AAA0]">{user?.email || 'hamlin.jaiju@gmail.com'}</span>
              </div>
              <p className="text-[11px] text-[#A0AAA0] truncate">
                {user?.institution || 'Institution not added'} · {user?.skills?.slice(0, 4).join(', ')}
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Brief Introduction & Background <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="Introduce yourself, your technical craft, and what you build..."
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Why do you want to build {idea.title}? <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="What excites you about solving this specific problem statement? Why now?"
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Relevant Experience Highlights
                </label>
                <textarea
                  rows={2}
                  value={relevantExperience}
                  onChange={(e) => setRelevantExperience(e.target.value)}
                  placeholder="Summarize key projects, repos, or hackathon sprints directly relevant to this role..."
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Portfolio URL or GitHub Repo
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>
            </div>

            {/* Notice */}
            <p className="text-[10px] font-mono text-[#A0AAA0]/70 leading-relaxed border-t border-[#273128] pt-3">
              Notice: TeamUp facilitates peer-to-peer collaboration between founders and contributors. Any equity vesting, IP assignments, or compensation terms are independently agreed upon by founders and collaborators.
            </p>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>

              {alreadyApplied ? (
                <div className="px-4 py-2 bg-[#B6FF4A]/10 border border-[#B6FF4A]/30 text-[#B6FF4A] text-xs font-mono rounded-sm">
                  Already Applied to this Role
                </div>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !selectedRoleId}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Collaboration Request'}
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
