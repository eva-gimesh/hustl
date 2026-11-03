import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTeamUp } from '../context/TeamUpContext';
import { TeamInvitationStatus } from '../types';
import { Button } from '../components/ui/Button';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const STATUS_BADGES: Record<
  TeamInvitationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  Pending: {
    label: 'Pending Response',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  Accepted: {
    label: 'Accepted / Member',
    bg: 'bg-[#B6FF4A]/10',
    text: 'text-[#B6FF4A]',
    border: 'border-[#B6FF4A]/40',
  },
  Declined: {
    label: 'Declined',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
  Cancelled: {
    label: 'Cancelled',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    border: 'border-zinc-500/30',
  },
};

export const TeamInvitationsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    getUserInvitations,
    getSentInvitations,
    respondToInvitation,
    cancelInvitation,
  } = useTeamUp();

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [notice, setNotice] = useState<string | null>(null);

  const currentUserId = user?.id || 'usr_demo_8829';
  const receivedInvitations = getUserInvitations(currentUserId);
  const sentInvitations = getSentInvitations(currentUserId);

  const handleAccept = (invId: string, ideaTitle: string) => {
    respondToInvitation(invId, 'accept');
    setNotice(`Invitation accepted! You are now a team member of ${ideaTitle}.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleDecline = (invId: string) => {
    respondToInvitation(invId, 'decline');
    setNotice('Invitation declined.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleCancel = (invId: string) => {
    cancelInvitation(invId);
    setNotice('Invitation cancelled.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="min-h-screen py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273128] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A]" />
            <span className="text-xs uppercase tracking-widest text-[#B6FF4A]">
              Collaboration Direct Line
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight">
            Team Invitations
          </h1>
          <p className="text-xs text-[#A0AAA0] mt-1">
            Review founding invitations extended to you or inspect invitations sent to collaborators.
          </p>
        </div>

        <Link to="/teamup/discover">
          <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore More Ventures
          </Button>
        </Link>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3 bg-[#B6FF4A]/10 border border-[#B6FF4A]/40 text-[#B6FF4A] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 rounded-sm border cursor-pointer transition-colors ${
            activeTab === 'received'
              ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
              : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
          }`}
        >
          Received Invitations ({receivedInvitations.length})
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 rounded-sm border cursor-pointer transition-colors ${
            activeTab === 'sent'
              ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
              : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
          }`}
        >
          Sent by Me ({sentInvitations.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'received' ? (
        <div className="space-y-4">
          {receivedInvitations.length === 0 ? (
            <div className="p-16 text-center bg-[#101510] border border-[#273128] rounded-sm space-y-3">
              <Users className="w-10 h-10 text-[#A0AAA0]/40 mx-auto" />
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                No Pending Invitations
              </h3>
              <p className="text-xs text-[#A0AAA0] max-w-sm mx-auto">
                Founders discover talent on HUSTL through your public profile, GitHub repos, and skills.
              </p>
              <div className="pt-2">
                <Link to="/teamup/discover">
                  <Button variant="primary" size="sm">
                    Browse Ventures to Join
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedInvitations.map((invite) => {
                const statusStyle = STATUS_BADGES[invite.status] || STATUS_BADGES.Pending;

                return (
                  <div
                    key={invite.id}
                    className="bg-[#101510] border border-[#273128] rounded-sm p-6 space-y-4 hover:border-[#7CCB37]/40 transition-colors text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 border rounded-sm uppercase ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {statusStyle.label}
                          </span>
                          <span className="text-[#A0AAA0]">
                            Received {new Date(invite.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <Link
                          to={`/teamup/ideas/${invite.ideaId}`}
                          className="font-display font-black text-2xl text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors block"
                        >
                          {invite.ideaTitle}
                        </Link>
                        <p className="text-[#A0AAA0] mt-0.5">
                          Invited by <strong className="text-[#F4F7F1]">{invite.invitedByUserName}</strong>
                        </p>
                      </div>

                      {/* Action buttons if Pending */}
                      {invite.status === 'Pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDecline(invite.id)}
                            className="px-3.5 py-2 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 rounded-sm cursor-pointer transition-colors"
                          >
                            Decline
                          </button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleAccept(invite.id, invite.ideaTitle)}
                            rightIcon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            Accept & Join Team
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 bg-[#141B15] border border-[#273128] rounded-sm space-y-1">
                      <span className="text-[10px] text-[#A0AAA0] uppercase block">
                        Offered Founding Role
                      </span>
                      <p className="text-sm font-bold text-[#F4F7F1]">{invite.roleTitle}</p>
                    </div>

                    {invite.message && (
                      <div className="p-3.5 bg-[#141B15] border border-[#273128] rounded-sm space-y-1">
                        <span className="text-[10px] text-[#A0AAA0] uppercase block">
                          Founder's Message
                        </span>
                        <p className="text-[#F4F7F1] leading-relaxed italic">
                          "{invite.message}"
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#273128] flex items-center justify-between text-[#A0AAA0]">
                      <Link
                        to={`/teamup/ideas/${invite.ideaId}`}
                        className="text-[#B6FF4A] hover:underline flex items-center gap-1"
                      >
                        <span>View Full Venture Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {invite.status === 'Accepted' && (
                        <Link
                          to={`/teamup/teams/${invite.teamId || invite.ideaId}`}
                          className="text-[#F4F7F1] hover:underline"
                        >
                          Go to Team Workspace →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* SENT INVITATIONS */
        <div className="space-y-4">
          {sentInvitations.length === 0 ? (
            <div className="p-16 text-center bg-[#101510] border border-[#273128] rounded-sm space-y-3">
              <Send className="w-10 h-10 text-[#A0AAA0]/40 mx-auto" />
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                No Sent Invitations
              </h3>
              <p className="text-xs text-[#A0AAA0] max-w-sm mx-auto">
                You haven't transmitted any team collaboration invitations yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentInvitations.map((invite) => {
                const statusStyle = STATUS_BADGES[invite.status] || STATUS_BADGES.Pending;

                return (
                  <div
                    key={invite.id}
                    className="bg-[#101510] border border-[#273128] rounded-sm p-6 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[#A0AAA0] text-[10px] uppercase block">
                          Venture: {invite.ideaTitle}
                        </span>
                        <h4 className="font-display font-bold text-lg text-[#F4F7F1]">
                          Invitation to {invite.invitedUserName}
                        </h4>
                        <p className="text-[#B6FF4A] text-xs">Role: {invite.roleTitle}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 border rounded-sm uppercase ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {statusStyle.label}
                        </span>

                        {invite.status === 'Pending' && (
                          <button
                            onClick={() => handleCancel(invite.id)}
                            className="px-2.5 py-1 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded-sm cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {invite.message && (
                      <p className="text-[#A0AAA0] italic p-3 bg-[#141B15] border border-[#273128] rounded-sm">
                        "{invite.message}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
