import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FreelanceProject, FreelanceApplication, FreelanceApplicationStatus } from '../../types';
import { useFreelance } from '../../context/FreelanceContext';
import { Button } from '../ui/Button';
import { MessageModal } from '../profile/MessageModal';
import {
  X,
  User,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Shield,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatMoneyRange } from '../../utils/currency';

interface ApplicationManagementModalProps {
  project: FreelanceProject;
  onClose: () => void;
}

export const ApplicationManagementModal: React.FC<ApplicationManagementModalProps> = ({
  project,
  onClose,
}) => {
  const { getApplicationsForProject, updateApplicationStatus } = useFreelance();
  const applications = getApplicationsForProject(project.id);

  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    applications[0]?.id || null
  );
  const [messagingTarget, setMessagingTarget] = useState<{
    id: string;
    name: string;
    role?: string;
  } | null>(null);

  const activeApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const handleStatusChange = (appId: string, status: FreelanceApplicationStatus) => {
    updateApplicationStatus(appId, status);
  };

  const getStatusBadgeClass = (status: FreelanceApplicationStatus) => {
    switch (status) {
      case 'Accepted':
        return 'text-[#B6FF4A] bg-[#B6FF4A]/10 border-[#B6FF4A]/40';
      case 'Shortlisted':
        return 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30';
      case 'Under Review':
        return 'text-amber-300 bg-amber-950/30 border-amber-500/30';
      case 'Rejected':
        return 'text-red-400 bg-red-950/30 border-red-500/30';
      case 'Withdrawn':
        return 'text-[#A0AAA0] bg-[#101510] border-[#273128]';
      default:
        return 'text-[#F4F7F1] bg-[#101510] border-[#273128]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080B09]/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-5xl bg-[#141B15] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#273128] pb-5 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                Client Applicant Command
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#F4F7F1] mt-1">
              Applications for {project.title}
            </h2>
            <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
              Reviewing {applications.length} submitted proposals · Budget: {formatMoneyRange(project.budgetMin, project.budgetMax, project.currency)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#101510] border border-transparent hover:border-[#273128] rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split Screen */}
        {applications.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#101510] border border-[#273128] rounded-xs">
            <User className="w-10 h-10 text-[#A0AAA0] mx-auto" />
            <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
              No Proposals Submitted Yet
            </h3>
            <p className="text-xs font-mono text-[#A0AAA0] max-w-sm mx-auto">
              Your project is currently open and visible to builders on the marketplace.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
            {/* Left Column: Applicant List */}
            <div className="md:col-span-5 border border-[#273128] bg-[#101510] rounded-xs overflow-y-auto space-y-1 p-2">
              <div className="px-3 py-2 text-[11px] font-mono uppercase text-[#A0AAA0] tracking-wider border-b border-[#273128]">
                Proposals ({applications.length})
              </div>
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`w-full text-left p-3 rounded-xs border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    activeApp?.id === app.id
                      ? 'bg-[#141B15] border-[#B6FF4A] text-[#F4F7F1]'
                      : 'bg-transparent border-transparent hover:bg-[#141B15]/70 text-[#A0AAA0]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold text-sm text-[#F4F7F1] truncate">
                      {app.applicantName}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 border rounded-xs uppercase ${getStatusBadgeClass(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-[#A0AAA0] truncate">
                    {app.applicantRole || 'Autonomous Builder'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#A0AAA0] pt-1">
                    <span className="text-[#F4F7F1] font-bold">{app.proposedBudget}</span>
                    <span>{app.estimatedDuration}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Column: Detailed Proposal Inspection */}
            {activeApp && (
              <div className="md:col-span-7 border border-[#273128] bg-[#101510] rounded-xs p-5 overflow-y-auto space-y-6 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-[#273128] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#141B15] border border-[#273128] text-[#B6FF4A] font-display font-bold text-base flex items-center justify-center rounded-xs shrink-0">
                        {activeApp.applicantName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                            {activeApp.applicantName}
                          </h3>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 border rounded-xs uppercase ${getStatusBadgeClass(
                              activeApp.status
                            )}`}
                          >
                            {activeApp.status}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#A0AAA0]">
                          {activeApp.applicantRole} · Applied {activeApp.createdAt}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/profile/${activeApp.applicantId}`}
                      target="_blank"
                      className="text-xs font-mono text-[#B6FF4A] hover:underline flex items-center gap-1 shrink-0"
                    >
                      Profile <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Proposed Compensation and Timeline */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-[#141B15] border border-[#273128] rounded-xs text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#A0AAA0] uppercase block">
                        Proposed Price
                      </span>
                      <span className="font-bold text-sm text-[#F4F7F1]">
                        {activeApp.proposedBudget}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A0AAA0] uppercase block">
                        Estimated Delivery
                      </span>
                      <span className="font-bold text-sm text-[#F4F7F1]">
                        {activeApp.estimatedDuration}
                      </span>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                      Proposal & Strategy
                    </h4>
                    <p className="text-xs text-[#F4F7F1] leading-relaxed whitespace-pre-wrap bg-[#141B15] p-3.5 border border-[#273128] rounded-xs font-sans">
                      {activeApp.coverLetter}
                    </p>
                  </div>

                  {/* Relevant Experience & Portfolio */}
                  {activeApp.relevantExperience && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0]">
                        Relevant Experience
                      </h4>
                      <p className="text-xs text-[#A0AAA0] leading-relaxed">
                        {activeApp.relevantExperience}
                      </p>
                    </div>
                  )}

                  {activeApp.portfolioUrl && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0]">
                        Verified Repository / Showcase
                      </h4>
                      <a
                        href={activeApp.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-[#B6FF4A] hover:underline flex items-center gap-1 truncate"
                      >
                        {activeApp.portfolioUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Skills tags */}
                  {activeApp.applicantSkills?.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0]">
                        Applicant Skillset
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {activeApp.applicantSkills.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] font-mono px-2 py-0.5 border border-[#273128] bg-[#141B15] text-[#A0AAA0] rounded-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions for Client */}
                <div className="pt-4 mt-6 border-t border-[#273128] flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setMessagingTarget({
                          id: activeApp.applicantId,
                          name: activeApp.applicantName,
                          role: activeApp.applicantRole,
                        })
                      }
                      leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                    >
                      Message
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusChange(activeApp.id, 'Rejected')}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Reject
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleStatusChange(activeApp.id, 'Shortlisted')}
                      className="text-xs font-mono"
                    >
                      Shortlist
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusChange(activeApp.id, 'Accepted')}
                      className="text-xs font-mono"
                    >
                      Accept Proposal
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Direct Messaging Modal */}
        {messagingTarget && (
          <MessageModal
            recipient={{
              id: messagingTarget.id,
              name: messagingTarget.name,
              role: messagingTarget.role || 'Freelance Builder',
              institution: 'HUSTL Network',
            }}
            onClose={() => setMessagingTarget(null)}
          />
        )}
      </motion.div>
    </div>
  );
};
