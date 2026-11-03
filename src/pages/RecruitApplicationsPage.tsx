import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRecruit } from '../context/RecruitContext';
import { JobApplication, JobApplicationStatus } from '../types';
import { Button } from '../components/ui/Button';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  XCircle,
} from 'lucide-react';

const STATUS_BADGES: Record<
  JobApplicationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  Submitted: {
    label: 'Submitted',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  Shortlisted: {
    label: 'Shortlisted',
    bg: 'bg-[#B6FF4A]/10',
    text: 'text-[#B6FF4A]',
    border: 'border-[#B6FF4A]/40',
  },
  Interview: {
    label: 'Interview Round',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  Selected: {
    label: 'Offer / Selected',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  Rejected: {
    label: 'Not Selected',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
  Withdrawn: {
    label: 'Withdrawn',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    border: 'border-zinc-500/30',
  },
};

export const RecruitApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const { getUserApplications, withdrawApplication, getJobById } = useRecruit();

  const currentUserId = user?.id || 'usr_demo_8829';
  const applications = getUserApplications(currentUserId);

  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleConfirmWithdraw = (appId: string) => {
    withdrawApplication(appId);
    setWithdrawingId(null);
  };

  return (
    <div className="min-h-screen py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273128] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              Candidate Dossier
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight">
            My Job Applications
          </h1>
          <p className="text-sm font-mono text-[#A0AAA0] mt-1">
            Track real-time hiring stage progression, recruiter reviews, and interview statuses.
          </p>
        </div>

        <Link to="/recruit/opportunities">
          <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore More Openings
          </Button>
        </Link>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="p-16 text-center bg-[#101510] border border-[#273128] rounded-sm space-y-4">
          <FileText className="w-12 h-12 text-[#A0AAA0]/40 mx-auto" />
          <h3 className="font-display font-bold text-xl text-[#F4F7F1]">No Active Applications</h3>
          <p className="text-sm font-mono text-[#A0AAA0] max-w-md mx-auto">
            You haven’t submitted any applications yet. Explore verified engineering, design, and growth roles open now.
          </p>
          <div className="pt-2">
            <Link to="/recruit/opportunities">
              <Button variant="primary">Browse Openings</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusConfig = STATUS_BADGES[app.status] || STATUS_BADGES.Submitted;
            const job = getJobById(app.jobId);

            return (
              <div
                key={app.id}
                className="bg-[#101510] border border-[#273128] rounded-sm p-6 hover:border-[#7CCB37]/40 transition-colors space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-0.5 border rounded-sm uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                      >
                        {statusConfig.label}
                      </span>
                      <span className="text-xs font-mono text-[#A0AAA0]">
                        Applied on {new Date(app.appliedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <Link
                      to={`/recruit/opportunities/${app.jobId}`}
                      className="font-display font-black text-xl text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors block"
                    >
                      {app.jobTitle}
                    </Link>

                    <Link
                      to={`/company/${app.companyId}`}
                      className="text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors"
                    >
                      {app.companyName}
                    </Link>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/recruit/opportunities/${app.jobId}`}
                      className="px-3 py-1.5 text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] border border-[#273128] rounded-sm transition-colors"
                    >
                      View Role Details
                    </Link>

                    {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                      <button
                        onClick={() => setWithdrawingId(app.id)}
                        className="px-3 py-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded-sm transition-colors cursor-pointer"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* Rejection Note or Details */}
                {app.status === 'Rejected' && app.rejectionReason && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-sm text-xs font-mono text-rose-300">
                    <span className="font-bold block uppercase text-[10px] mb-0.5">Recruiter Feedback:</span>
                    <p>{app.rejectionReason}</p>
                  </div>
                )}

                {/* Application Details Summary */}
                <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-[#A0AAA0]">
                  <div>
                    <span className="text-[10px] uppercase block">Resume Attached</span>
                    <span className="text-[#F4F7F1] font-semibold">
                      {app.resumeFileName || 'Resume_Dossier.pdf'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block">Contact Email</span>
                    <span className="text-[#F4F7F1] truncate block">{app.applicantEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block">Last Status Update</span>
                    <span className="text-[#F4F7F1]">
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Withdraw confirmation dialog */}
                {withdrawingId === app.id && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-sm space-y-2 text-xs font-mono">
                    <p className="text-rose-300 font-bold">
                      Are you sure you want to withdraw your application for {app.jobTitle}?
                    </p>
                    <p className="text-[#A0AAA0]">
                      This will remove your submission from active recruiter consideration.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setWithdrawingId(null)}
                      >
                        Cancel
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleConfirmWithdraw(app.id)}
                        className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 rounded-sm text-xs font-mono transition-colors cursor-pointer"
                      >
                        Confirm Withdrawal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
