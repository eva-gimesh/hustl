import React, { useState } from 'react';
import { StartupIdea, TalentProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTeamUp } from '../../context/TeamUpContext';
import { useTalent } from '../../context/TalentContext';
import { Button } from '../ui/Button';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  Sparkles,
  Search,
} from 'lucide-react';

interface InviteUserModalProps {
  idea: StartupIdea;
  preselectedUser?: TalentProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  idea,
  preselectedUser,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { sendInvitation } = useTeamUp();
  const { talentList } = useTalent();

  const openRoles = idea.openRoles.filter((r) => r.isOpen);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    openRoles.length > 0 ? openRoles[0].id : ''
  );

  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    preselectedUser?.id || (talentList.length > 0 ? talentList[0].id : '')
  );

  const [message, setMessage] = useState(
    `Hey, loved your work on HUSTL. We are building ${idea.title} (${idea.tagline}) and think your skill set would make an exceptional addition to our founding team.`
  );

  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const currentCandidate =
    preselectedUser || talentList.find((t) => t.id === selectedCandidateId);
  const selectedRole = idea.openRoles.find((r) => r.id === selectedRoleId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError('Please select an open founding role.');
      return;
    }

    if (!currentCandidate) {
      setError('Please select a builder to invite.');
      return;
    }

    setIsSending(true);

    const result = sendInvitation({
      teamId: idea.id,
      ideaId: idea.id,
      ideaTitle: idea.title,
      invitedUserId: currentCandidate.id,
      invitedUserName: currentCandidate.name,
      invitedByUserId: user?.id || 'usr_demo_8829',
      invitedByUserName: user?.fullName || 'Hamlin Jaiju',
      roleTitle: selectedRole.roleTitle,
      message: message.trim() || undefined,
    });

    setIsSending(false);

    if (result.success) {
      setIsSent(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1600);
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-5 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A0AAA0] hover:text-[#F4F7F1] p-1.5 border border-[#273128] rounded-sm cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-[#273128] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#B6FF4A] block">
            Team Invitation · {idea.title}
          </span>
          <h3 className="font-display font-black text-2xl text-[#F4F7F1]">
            Invite Collaborator
          </h3>
        </div>

        {isSent ? (
          <div className="py-8 text-center space-y-3 font-mono">
            <CheckCircle2 className="w-10 h-10 text-[#B6FF4A] mx-auto animate-pulse" />
            <h4 className="font-display font-bold text-lg text-[#F4F7F1]">
              Invitation Dispatched
            </h4>
            <p className="text-xs text-[#A0AAA0]">
              Notification routed to {currentCandidate?.name}’s TeamUp invitations inbox.
            </p>
            <div className="pt-2">
              <Button onClick={onClose} variant="primary">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4 text-xs font-mono">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Recipient Selection */}
            {!preselectedUser ? (
              <div>
                <label className="text-[10px] uppercase text-[#A0AAA0] block mb-1">
                  Select Builder to Invite
                </label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                >
                  {talentList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.headline || t.title} ({t.institution || 'University'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-[#101510] border border-[#273128] flex items-center justify-center font-display font-bold text-xs text-[#B6FF4A]">
                  {preselectedUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-[#F4F7F1] block">{preselectedUser.name}</span>
                  <span className="text-[10px] text-[#A0AAA0]">
                    {preselectedUser.institution || 'University'} · {preselectedUser.skills?.slice(0, 3).join(', ')}
                  </span>
                </div>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="text-[10px] uppercase text-[#A0AAA0] block mb-1">
                Offered Founding Role
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
              >
                {openRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.roleTitle} ({role.timeCommitment} · {role.compensationModel})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Invitation Note */}
            <div>
              <label className="text-[10px] uppercase text-[#A0AAA0] block mb-1">
                Personalized Message
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
              />
            </div>

            <div className="pt-2 border-t border-[#273128] flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSending || !selectedRoleId}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                {isSending ? 'Sending...' : 'Transmit Invitation'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
