import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTeamUp } from '../context/TeamUpContext';
import { useAuth } from '../context/AuthContext';
import { RecruitmentStatus } from '../types';
import { InviteUserModal } from '../components/teamup/InviteUserModal';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Rocket,
  Clock,
  Sparkles,
  AlertCircle,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';

export const TeamManagePage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const {
    getIdeaById,
    getTeamMembers,
    getIdeaApplications,
    updateApplicationStatus,
    removeTeamMember,
    leaveTeam,
    updateMemberRole,
    updateIdea,
    toggleRecruitmentStatus,
  } = useTeamUp();

  const [activeTab, setActiveTab] = useState<'roster' | 'applications' | 'settings'>('roster');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [progressInput, setProgressInput] = useState('');
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const idea = teamId ? getIdeaById(teamId) : undefined;
  const members = teamId ? getTeamMembers(teamId) : [];
  const applications = teamId ? getIdeaApplications(teamId) : [];

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-black text-2xl text-[#F4F7F1]">Team Not Found</h2>
        <Link to="/teamup">
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to TeamUp
          </Button>
        </Link>
      </div>
    );
  }

  const currentUserId = user?.id || 'usr_demo_8829';
  const currentMember = members.find((m) => m.userId === currentUserId);
  const isOwner = idea.ownerId === currentUserId || currentMember?.isOwner === true;

  const handleAcceptApp = (appId: string) => {
    updateApplicationStatus(appId, 'Accepted');
    setNotice('Applicant approved and added to active team roster.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDeclineApp = (appId: string) => {
    updateApplicationStatus(appId, 'Declined');
    setNotice('Application declined.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleRemoveMember = (memberId: string) => {
    const res = removeTeamMember(memberId);
    setNotice(res.message);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleLeaveTeam = () => {
    if (confirm('Are you sure you want to step down and leave this team?')) {
      const res = leaveTeam(idea.id, currentUserId);
      setNotice(res.message);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleSaveRole = (memberId: string) => {
    if (newRoleInput.trim()) {
      updateMemberRole(memberId, newRoleInput.trim());
      setEditingMemberId(null);
      setNewRoleInput('');
    }
  };

  const handleUpdateProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (progressInput.trim()) {
      updateIdea(idea.id, { currentProgress: progressInput.trim() });
      setIsEditingProgress(false);
      setNotice('Venture progress updated.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  return (
    <div className="min-h-screen py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={`/teamup/ideas/${idea.id}`}
          className="text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Venture Page</span>
        </Link>

        <div className="flex items-center gap-3">
          {currentMember && !isOwner && (
            <button
              onClick={handleLeaveTeam}
              className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Team</span>
            </button>
          )}

          {isOwner && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsInviteModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Invite Collaborator
            </Button>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3 bg-[#B6FF4A]/10 border border-[#B6FF4A]/40 text-[#B6FF4A] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7CCB37]/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 bg-[#B6FF4A]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                Team Command & Roster Dashboard
              </span>
              {idea.isDemo && (
                <span className="text-[10px] font-mono text-[#7CCB37] bg-[#7CCB37]/10 px-1.5 py-0.5 border border-[#7CCB37]/30 uppercase">
                  DEMO VENTURE
                </span>
              )}
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight">
              {idea.title}
            </h1>
            <p className="text-xs font-mono text-[#A0AAA0] mt-1">{idea.tagline}</p>
          </div>

          <div className="flex items-center gap-4 bg-[#141B15] border border-[#273128] p-4 rounded-sm font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#A0AAA0] uppercase block">Team Members</span>
              <span className="text-xl font-bold text-[#F4F7F1]">{members.length} Active</span>
            </div>
            <div className="w-px h-8 bg-[#273128]" />
            <div>
              <span className="text-[10px] text-[#A0AAA0] uppercase block">Pending Apps</span>
              <span className="text-xl font-bold text-[#B6FF4A]">
                {applications.filter((a) => a.status === 'Submitted' || a.status === 'Reviewing').length}
              </span>
            </div>
            <div className="w-px h-8 bg-[#273128]" />
            <div>
              <span className="text-[10px] text-[#A0AAA0] uppercase block">Status</span>
              <span className="text-xs font-bold text-[#7CCB37] uppercase">{idea.recruitmentStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#273128] pb-3 text-xs font-mono">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-sm border transition-colors cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
              : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
          }`}
        >
          Active Roster ({members.length})
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-sm border transition-colors cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
                : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
            }`}
          >
            Review Applications ({applications.length})
          </button>
        )}

        {isOwner && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-sm border transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
                : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
            }`}
          >
            Venture Settings & Status
          </button>
        )}
      </div>

      {/* TAB 1: ACTIVE ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#B6FF4A]">
              Team Members ({members.length})
            </h2>
            {isOwner && (
              <span className="text-xs font-mono text-[#A0AAA0]">
                Founders can reassign titles or remove members.
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-[#101510] border border-[#273128] rounded-sm p-5 space-y-3 font-mono text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-[#141B15] border border-[#273128] flex items-center justify-center font-display font-bold text-sm text-[#B6FF4A] shrink-0">
                      {member.userName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/profile/${member.userId}`}
                          className="font-bold text-sm text-[#F4F7F1] hover:text-[#B6FF4A]"
                        >
                          {member.userName}
                        </Link>
                        {member.isOwner && (
                          <span className="text-[9px] text-[#B6FF4A] bg-[#B6FF4A]/10 px-1.5 py-0.2 border border-[#B6FF4A]/30 font-bold">
                            OWNER / FOUNDER
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A0AAA0]">{member.userHeadline || 'Collaborator'}</p>
                    </div>
                  </div>

                  {isOwner && !member.isOwner && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1 text-[#A0AAA0] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Role Title with Edit option */}
                <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm flex items-center justify-between">
                  {editingMemberId === member.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={newRoleInput}
                        onChange={(e) => setNewRoleInput(e.target.value)}
                        placeholder="Enter new role title..."
                        className="flex-1 bg-[#101510] border border-[#273128] text-xs text-[#F4F7F1] p-1.5 rounded-sm outline-none"
                      />
                      <Button size="sm" variant="primary" onClick={() => handleSaveRole(member.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingMemberId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="text-[10px] text-[#A0AAA0] uppercase block">Assigned Role</span>
                        <span className="font-bold text-[#F4F7F1]">{member.roleTitle}</span>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => {
                            setEditingMemberId(member.id);
                            setNewRoleInput(member.roleTitle);
                          }}
                          className="text-[#A0AAA0] hover:text-[#B6FF4A] cursor-pointer"
                          title="Edit Role Title"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#A0AAA0] pt-1">
                  <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                  <Link to={`/profile/${member.userId}`} className="text-[#B6FF4A] hover:underline">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATIONS INBOX (Founder Only) */}
      {activeTab === 'applications' && isOwner && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#B6FF4A]">
              Collaboration Applications ({applications.length})
            </h2>
            <span className="text-xs font-mono text-[#A0AAA0]">
              Review applicant experience and motivation.
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center bg-[#101510] border border-[#273128] rounded-sm space-y-2 font-mono">
              <Users className="w-8 h-8 text-[#A0AAA0]/40 mx-auto" />
              <p className="text-sm text-[#A0AAA0]">No pending applications received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-[#101510] border border-[#273128] rounded-sm p-6 space-y-4 font-mono text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#273128] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-[#B6FF4A] bg-[#B6FF4A]/10 px-2 py-0.5 border border-[#B6FF4A]/30">
                          {app.status}
                        </span>
                        <span className="text-[#A0AAA0]">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-[#F4F7F1] mt-1">
                        {app.applicantName}
                      </h3>
                      <p className="text-xs text-[#A0AAA0]">
                        Role applied for: <strong className="text-[#F4F7F1]">{app.roleTitle}</strong>
                      </p>
                    </div>

                    {/* Actions */}
                    {app.status !== 'Accepted' && app.status !== 'Declined' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDeclineApp(app.id)}
                          className="px-3 py-1.5 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 rounded-sm cursor-pointer transition-colors"
                        >
                          Decline
                        </button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAcceptApp(app.id)}
                          rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Accept & Add to Team
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Intro & Motivation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm space-y-1">
                      <span className="text-[10px] text-[#A0AAA0] uppercase block font-bold">
                        Introduction
                      </span>
                      <p className="text-[#F4F7F1] leading-relaxed">{app.introduction}</p>
                    </div>

                    <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm space-y-1">
                      <span className="text-[10px] text-[#A0AAA0] uppercase block font-bold">
                        Motivation / Why Build This
                      </span>
                      <p className="text-[#F4F7F1] leading-relaxed">{app.motivation}</p>
                    </div>
                  </div>

                  {/* Skills & Portfolio */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#273128]">
                    <div className="flex flex-wrap gap-1">
                      {app.applicantSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 bg-[#141B15] border border-[#273128] text-[#A0AAA0]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      {app.portfolioUrl && (
                        <a
                          href={app.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#B6FF4A] hover:underline flex items-center gap-1"
                        >
                          <span>Portfolio / Code</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <Link
                        to={`/profile/${app.applicantId}`}
                        className="text-[#A0AAA0] hover:text-[#F4F7F1] underline"
                      >
                        Full Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VENTURE SETTINGS (Founder Only) */}
      {activeTab === 'settings' && isOwner && (
        <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-6 font-mono text-xs">
          <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
            Venture Controls & Status Management
          </span>

          {/* Recruitment Status */}
          <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm space-y-3">
            <span className="text-xs font-bold text-[#F4F7F1] block">
              Recruitment Status: {idea.recruitmentStatus}
            </span>
            <div className="flex flex-wrap gap-2">
              {(['Recruiting', 'Building', 'Active', 'Paused', 'Completed'] as RecruitmentStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => toggleRecruitmentStatus(idea.id, st)}
                    className={`px-3 py-1.5 rounded-sm border cursor-pointer transition-colors ${
                      idea.recruitmentStatus === st
                        ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
                        : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Progress Update */}
          <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F4F7F1]">Venture Milestone Progress</span>
              <button
                onClick={() => {
                  setProgressInput(idea.currentProgress);
                  setIsEditingProgress(!isEditingProgress);
                }}
                className="text-[#B6FF4A] hover:underline cursor-pointer"
              >
                {isEditingProgress ? 'Cancel' : 'Edit Progress'}
              </button>
            </div>

            {isEditingProgress ? (
              <form onSubmit={handleUpdateProgress} className="space-y-3">
                <textarea
                  rows={3}
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  className="w-full bg-[#101510] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none"
                />
                <Button type="submit" size="sm" variant="primary">
                  Save Progress Update
                </Button>
              </form>
            ) : (
              <p className="text-[#A0AAA0] leading-relaxed">{idea.currentProgress}</p>
            )}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <InviteUserModal
          idea={idea}
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </div>
  );
};
