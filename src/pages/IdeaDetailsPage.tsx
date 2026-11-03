import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTeamUp } from '../context/TeamUpContext';
import { useAuth } from '../context/AuthContext';
import { ApplyTeamModal } from '../components/teamup/ApplyTeamModal';
import { InviteUserModal } from '../components/teamup/InviteUserModal';
import { Button } from '../components/ui/Button';
import { AIMatchCard } from '../components/ai/AIMatchCard';
import {
  ArrowLeft,
  Rocket,
  Users,
  Clock,
  MapPin,
  Bookmark,
  Share2,
  Flag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  Settings,
  UserPlus,
} from 'lucide-react';

export const IdeaDetailsPage: React.FC = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getIdeaById,
    getTeamMembers,
    isIdeaSaved,
    toggleSaveIdea,
    hasAppliedToIdea,
    calculateMatchScore,
  } = useTeamUp();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedRoleForApply, setSelectedRoleForApply] = useState<string | undefined>(undefined);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const idea = ideaId ? getIdeaById(ideaId) : undefined;
  const teamMembers = ideaId ? getTeamMembers(ideaId) : [];

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-black text-2xl text-[#F4F7F1]">Venture Idea Not Found</h2>
        <p className="text-sm font-mono text-[#A0AAA0]">
          The opportunity you are looking for may have been archived or removed by its founder.
        </p>
        <Link to="/teamup/discover">
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to All Ventures
          </Button>
        </Link>
      </div>
    );
  }

  const currentUserId = user?.id || 'usr_demo_8829';
  const isOwner = idea.ownerId === currentUserId;
  const saved = isIdeaSaved(idea.id);
  const hasApplied = hasAppliedToIdea(idea.id, currentUserId);
  const match = calculateMatchScore(idea, user?.skills);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReport = () => {
    setReportSubmitted(true);
    setTimeout(() => setReportSubmitted(false), 3000);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setIsContactModalOpen(false);
      setContactMessage('');
    }, 1500);
  };

  return (
    <div className="min-h-screen py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Nav Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/teamup/discover"
          className="text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover Ideas</span>
        </Link>

        {isOwner && (
          <Link to={`/teamup/teams/${idea.id}`}>
            <Button size="sm" variant="secondary" rightIcon={<Settings className="w-4 h-4" />}>
              Manage Team & Applications
            </Button>
          </Link>
        )}
      </div>

      {/* Main Header Card */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7CCB37]/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-3xl">
            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#B6FF4A] bg-[#B6FF4A]/10 px-2 py-0.5 border border-[#B6FF4A]/30 uppercase">
                {idea.industry}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#A0AAA0] bg-[#141B15] px-2 py-0.5 border border-[#273128] uppercase">
                {idea.developmentStage}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#A0AAA0] bg-[#141B15] px-2 py-0.5 border border-[#273128] uppercase">
                {idea.recruitmentStatus}
              </span>
              {idea.isDemo && (
                <span className="text-[10px] font-mono tracking-widest text-[#7CCB37] bg-[#7CCB37]/10 px-2 py-0.5 border border-[#7CCB37]/30 uppercase">
                  DEMONSTRATION VENTURE
                </span>
              )}
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-[#F4F7F1] tracking-tight">
                {idea.title}
              </h1>
              <p className="text-base font-mono text-[#B6FF4A] mt-1.5">{idea.tagline}</p>
            </div>

            {/* Founder meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#A0AAA0]">
              <Link
                to={`/profile/${idea.ownerId}`}
                className="text-[#F4F7F1] font-bold hover:text-[#B6FF4A] transition-colors flex items-center gap-1"
              >
                <span>Initiated by {idea.ownerName}</span>
                <span title="Verified Profile">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7CCB37]" />
                </span>
              </Link>
              <span>·</span>
              <span>{idea.location}</span>
              <span>·</span>
              <span>Posted {new Date(idea.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Column */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            {isOwner ? (
              <div className="space-y-2">
                <Link to={`/teamup/teams/${idea.id}`}>
                  <Button variant="primary" size="lg" className="w-full">
                    Founder Team Dashboard
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsInviteModalOpen(true)}
                  leftIcon={<UserPlus className="w-4 h-4" />}
                >
                  Invite Collaborator
                </Button>
              </div>
            ) : hasApplied ? (
              <div className="px-5 py-2.5 bg-[#B6FF4A]/10 border border-[#B6FF4A]/40 text-[#B6FF4A] text-xs font-mono rounded-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Application Submitted</span>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setSelectedRoleForApply(undefined);
                  setIsApplyModalOpen(true);
                }}
              >
                Apply to Join Venture
              </Button>
            )}

            {!isOwner && user && (
              <div className="w-full max-w-xl">
                <AIMatchCard user={user} idea={idea} />
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSaveIdea(idea.id)}
                className={`flex-1 py-2 px-3 text-xs font-mono border rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  saved
                    ? 'border-[#B6FF4A] text-[#B6FF4A] bg-[#B6FF4A]/10'
                    : 'border-[#273128] text-[#A0AAA0] hover:text-[#F4F7F1]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#B6FF4A]' : ''}`} />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex-1 py-2 px-3 text-xs font-mono border border-[#273128] hover:border-[#7CCB37]/50 text-[#A0AAA0] hover:text-[#F4F7F1] rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Highlight Grid (Commitment, Work Mode, Compensation, Team Size) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-[#273128] text-xs font-mono">
          <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm">
            <span className="text-[10px] text-[#A0AAA0] uppercase block">Time Commitment</span>
            <span className="text-[#F4F7F1] font-bold text-sm block mt-0.5">{idea.timeCommitment}</span>
          </div>
          <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm">
            <span className="text-[10px] text-[#A0AAA0] uppercase block">Work Mode</span>
            <span className="text-[#F4F7F1] font-semibold text-sm block mt-0.5">{idea.workMode}</span>
          </div>
          <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm">
            <span className="text-[10px] text-[#A0AAA0] uppercase block">Compensation</span>
            <span className="text-[#B6FF4A] font-bold text-sm block mt-0.5">{idea.compensationModel}</span>
          </div>
          <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm">
            <span className="text-[10px] text-[#A0AAA0] uppercase block">Current Team</span>
            <span className="text-[#F4F7F1] font-semibold text-sm block mt-0.5">
              {teamMembers.length} Collaborator{teamMembers.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Overview, Problem/Solution, Open Roles, Existing Team */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION A: PROJECT OVERVIEW */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#B6FF4A]">
              Section A · Venture Architecture & Overview
            </h2>

            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-[#A0AAA0] block">Mission Statement</span>
              <p className="text-sm text-[#F4F7F1] leading-relaxed whitespace-pre-wrap font-sans">
                {idea.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm space-y-2">
                <span className="text-xs font-mono uppercase text-rose-400 block font-bold">
                  The Problem
                </span>
                <p className="text-xs text-[#A0AAA0] leading-relaxed">
                  {idea.problemStatement}
                </p>
              </div>

              <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm space-y-2">
                <span className="text-xs font-mono uppercase text-[#B6FF4A] block font-bold">
                  Proposed Solution
                </span>
                <p className="text-xs text-[#A0AAA0] leading-relaxed">
                  {idea.proposedSolution}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm text-xs font-mono space-y-1">
              <span className="text-[10px] text-[#A0AAA0] uppercase block">Current Velocity & Progress</span>
              <p className="text-[#F4F7F1] font-semibold">{idea.currentProgress}</p>
            </div>

            {idea.websiteUrl && (
              <div className="pt-2">
                <a
                  href={idea.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-[#B6FF4A] hover:underline flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>External Prototype / Documentation: {idea.websiteUrl}</span>
                </a>
              </div>
            )}
          </div>

          {/* SECTION D: WHO WE NEED (OPEN ROLES) */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                  Section D · Founding Roles
                </span>
                <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
                  Who We Need ({idea.openRoles.filter((r) => r.isOpen).length} Open Positions)
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {idea.openRoles.map((role) => (
                <div
                  key={role.id}
                  className="p-5 bg-[#141B15] border border-[#273128] rounded-sm space-y-3 font-mono text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#273128] pb-3">
                    <div>
                      <h4 className="font-display font-bold text-base text-[#F4F7F1]">
                        {role.roleTitle}
                      </h4>
                      <div className="flex items-center gap-2 text-[#A0AAA0] text-[11px] mt-0.5">
                        <span>{role.timeCommitment}</span>
                        <span>·</span>
                        <span className="text-[#B6FF4A]">{role.compensationModel}</span>
                        <span>·</span>
                        <span>{role.openings} opening{role.openings === 1 ? '' : 's'}</span>
                      </div>
                    </div>

                    {!isOwner && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedRoleForApply(role.id);
                          setIsApplyModalOpen(true);
                        }}
                      >
                        Apply for this Role
                      </Button>
                    )}
                  </div>

                  {/* Responsibilities */}
                  {role.responsibilities && role.responsibilities.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase text-[#A0AAA0] block mb-1">
                        Responsibilities
                      </span>
                      <ul className="space-y-1.5 text-[#A0AAA0]">
                        {role.responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#B6FF4A]">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Skills */}
                  <div>
                    <span className="text-[10px] uppercase text-[#A0AAA0] block mb-1">
                      Required Stack & Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {role.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 bg-[#101510] border border-[#273128] text-[#F4F7F1]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION C: THE TEAM */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-5">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              Section C · The Existing Team
            </span>
            <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
              Active Collaborators ({teamMembers.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 bg-[#141B15] border border-[#273128] rounded-sm flex items-start gap-3 font-mono text-xs"
                >
                  <div className="w-10 h-10 rounded-sm bg-[#101510] border border-[#273128] flex items-center justify-center font-display font-bold text-sm text-[#B6FF4A] shrink-0">
                    {member.userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/profile/${member.userId}`}
                        className="font-bold text-[#F4F7F1] hover:text-[#B6FF4A] truncate"
                      >
                        {member.userName}
                      </Link>
                      {member.isOwner && (
                        <span className="text-[9px] text-[#B6FF4A] bg-[#B6FF4A]/10 px-1 py-0.2 border border-[#B6FF4A]/30">
                          FOUNDER
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A0AAA0] mt-0.5">{member.roleTitle}</p>
                    <span className="text-[10px] text-[#A0AAA0]/60 block mt-1">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: SECTION B (The Founder) & Terms */}
        <div className="space-y-6">
          {/* SECTION B: THE FOUNDER */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7CCB37]">
              Section B · The Founder
            </span>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-sm bg-[#141B15] border border-[#273128] flex items-center justify-center font-display font-black text-lg text-[#B6FF4A]">
                {idea.ownerName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <Link
                  to={`/profile/${idea.ownerId}`}
                  className="font-display font-bold text-base text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors flex items-center gap-1"
                >
                  <span>{idea.ownerName}</span>
                  <span title="Verified Profile">
                    <ShieldCheck className="w-4 h-4 text-[#7CCB37]" />
                  </span>
                </Link>
                <p className="text-xs font-mono text-[#A0AAA0]">{idea.ownerCollege || 'Collegiate Builder'}</p>
              </div>
            </div>

            {idea.ownerHeadline && (
              <p className="text-xs font-mono text-[#A0AAA0] leading-relaxed">
                "{idea.ownerHeadline}"
              </p>
            )}

            {/* Skills */}
            {idea.ownerSkills && idea.ownerSkills.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-[#A0AAA0] uppercase block mb-1.5">
                  Founder Competencies
                </span>
                <div className="flex flex-wrap gap-1">
                  {idea.ownerSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] font-mono px-2 py-0.5 bg-[#141B15] border border-[#273128] text-[#F4F7F1]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[#273128] space-y-2">
              <Link
                to={`/profile/${idea.ownerId}`}
                className="block w-full py-2 text-center text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] border border-[#273128] hover:border-[#7CCB37]/50 rounded-sm transition-colors"
              >
                View HUSTL Public Profile
              </Link>

              {!isOwner && (
                <Button
                  className="w-full"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsContactModalOpen(true)}
                  leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  Message Founder
                </Button>
              )}
            </div>
          </div>

          {/* Collaboration Terms & Disclaimer */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 space-y-3 font-mono text-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#7CCB37] block">
              Collaboration Terms
            </span>
            <p className="text-[#A0AAA0] text-[11px] leading-relaxed">
              HUSTL provides co-founder discovery and team coordination tools. Any equity arrangements, milestone vesting, or intellectual property transfers must be independently agreed upon in writing between team members.
            </p>
            <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm text-[11px] text-[#B6FF4A]">
              Standardized FAST / Founder Advisor agreements can be customized upon team formation.
            </div>
          </div>

          {/* Report Button */}
          <div className="text-center font-mono">
            {reportSubmitted ? (
              <span className="text-xs text-[#7CCB37]">Flagged for review</span>
            ) : (
              <button
                onClick={handleReport}
                className="text-[11px] text-[#A0AAA0]/60 hover:text-rose-400 flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
              >
                <Flag className="w-3 h-3" />
                <span>Report this opportunity</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <ApplyTeamModal
          idea={idea}
          initialRoleId={selectedRoleForApply}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}

      {/* Invite Modal for Founder */}
      {isInviteModalOpen && (
        <InviteUserModal
          idea={idea}
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      {/* Contact Founder Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#101510] border border-[#273128] rounded-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#273128]">
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                Message {idea.ownerName}
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1 text-[#A0AAA0] hover:text-[#F4F7F1] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {contactSent ? (
              <div className="py-6 text-center space-y-2 font-mono">
                <CheckCircle2 className="w-8 h-8 text-[#B6FF4A] mx-auto" />
                <p className="text-xs text-[#F4F7F1]">Message Transmitted to Founder</p>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="space-y-3 font-mono text-xs">
                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={`Hi ${idea.ownerName.split(' ')[0]}, saw ${idea.title} and wanted to ask about...`}
                  required
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-[#F4F7F1] p-2.5 rounded-sm outline-none"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsContactModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
