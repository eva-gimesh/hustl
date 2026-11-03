import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFreelance } from '../context/FreelanceContext';
import { useAuth } from '../context/AuthContext';
import { ClientProfileCard } from '../components/freelance/ClientProfileCard';
import { ApplyModal } from '../components/freelance/ApplyModal';
import { ApplicationManagementModal } from '../components/freelance/ApplicationManagementModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Flag,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Check,
  Sliders,
  IndianRupee as DollarSign,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatMoneyRange } from '../utils/currency';

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getProjectById,
    isProjectSaved,
    toggleSaveProject,
    closeProject,
    reopenProject,
    hasApplied,
  } = useFreelance();

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const project = projectId ? getProjectById(projectId) : undefined;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Project link copied to clipboard.');
  };

  const handleReport = () => {
    setReportModalOpen(false);
    showToast('Listing flagged for compliance audit.');
  };

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-[#F4F7F1]">
          Project Brief Not Found
        </h2>
        <p className="text-sm font-mono text-[#A0AAA0]">
          The freelance project you requested does not exist or may have expired.
        </p>
        <Link to="/freelance">
          <Button size="md" variant="primary">
            Return to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const saved = isProjectSaved(project.id);
  const isOwner = Boolean(user && user.id === project.ownerId);
  const isOpen = project.status === 'open';
  const userHasApplied = user ? hasApplied(project.id, user.id) : false;

  return (
    <div className="w-full py-10 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50 bg-[#141B15] border border-[#B6FF4A] text-xs font-mono text-[#F4F7F1] px-4 py-3 rounded-xs shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-[#B6FF4A]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Link & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273128] pb-4">
        <Link
          to="/freelance"
          className="flex items-center gap-2 text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace Radar</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSaveProject(project.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A] text-xs font-mono text-[#F4F7F1] rounded-xs transition-colors cursor-pointer"
          >
            {saved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-[#B6FF4A] fill-[#B6FF4A]" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-[#A0AAA0]" />
                <span>Save Project</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A] text-xs font-mono text-[#F4F7F1] rounded-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#A0AAA0]" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="p-1.5 bg-[#141B15] border border-[#273128] hover:border-red-400 text-xs text-[#A0AAA0] hover:text-red-400 rounded-xs transition-colors cursor-pointer"
            title="Report this listing"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Project Status Warning Banner if not Open */}
      {!isOpen && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs font-mono text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              This project is currently marked as <strong className="uppercase">{project.status}</strong> and is no longer accepting new proposals.
            </span>
          </div>

          {isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => reopenProject(project.id)}
              className="text-xs shrink-0"
            >
              Reopen Project
            </Button>
          )}
        </div>
      )}

      {/* Main Grid: Content (8 Cols) vs Sticky Sidebar (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Brief Specifications */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Title Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-[#B6FF4A] font-bold uppercase">{project.category}</span>
              <span className="text-[#273128]">·</span>
              <span className="text-[#A0AAA0]">{project.workMode}</span>
              <span className="text-[#273128]">·</span>
              <span className="text-[#A0AAA0]">Posted {project.postedDate}</span>
              {project.isDemo && (
                <>
                  <span className="text-[#273128]">·</span>
                  <span className="text-amber-400 font-semibold uppercase text-[10px]">
                    Demonstration Listing
                  </span>
                </>
              )}
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#F4F7F1] tracking-tight">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A0AAA0] pt-1">
              <span className="flex items-center gap-1.5 text-[#F4F7F1]">
                <Clock className="w-3.5 h-3.5 text-[#7CCB37]" />
                Duration: {project.duration}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-[#F4F7F1]">
                <MapPin className="w-3.5 h-3.5 text-[#7CCB37]" />
                {project.location}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-[#F4F7F1]">
                <Users className="w-3.5 h-3.5 text-[#7CCB37]" />
                {project.applicantCount} proposals submitted
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3 bg-[#141B15] border border-[#273128] p-6 rounded-sm">
            <h2 className="font-display font-bold text-lg text-[#F4F7F1]">
              Project Overview
            </h2>
            <p className="text-sm text-[#A0AAA0] leading-relaxed whitespace-pre-wrap font-sans">
              {project.description}
            </p>
          </div>

          {/* Deliverables */}
          {project.deliverables?.length > 0 && (
            <div className="space-y-4 bg-[#141B15] border border-[#273128] p-6 rounded-sm">
              <h2 className="font-display font-bold text-lg text-[#F4F7F1]">
                Key Deliverables & Milestones
              </h2>
              <ul className="space-y-2.5">
                {project.deliverables.map((deliv, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-mono text-[#F4F7F1]">
                    <span className="w-5 h-5 bg-[#101510] border border-[#273128] text-[#B6FF4A] rounded-xs flex items-center justify-center shrink-0 text-[10px] font-bold">
                      0{idx + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements & Criteria */}
          {project.requirements?.length > 0 && (
            <div className="space-y-4 bg-[#141B15] border border-[#273128] p-6 rounded-sm">
              <h2 className="font-display font-bold text-lg text-[#F4F7F1]">
                Candidate Qualifications & Requirements
              </h2>
              <ul className="space-y-2">
                {project.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#A0AAA0]">
                    <CheckCircle2 className="w-4 h-4 text-[#B6FF4A] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Tagset */}
          <div className="space-y-3 bg-[#141B15] border border-[#273128] p-6 rounded-sm">
            <h2 className="font-display font-bold text-lg text-[#F4F7F1]">
              Required Skillset
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-mono px-3 py-1 border border-[#273128] bg-[#101510] text-[#F4F7F1] rounded-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action & Client Profile */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Action Box */}
          <Card className="p-6 bg-[#141B15] border border-[#273128] space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0]">
                Budget / Compensation
              </span>
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#B6FF4A] tabular-nums">
                {formatMoneyRange(project.budgetMin, project.budgetMax, project.currency)}
              </div>
              <p className="text-xs font-mono text-[#A0AAA0]">
                Payment Type: <strong className="text-[#F4F7F1]">{project.paymentType}</strong>
              </p>
            </div>

            <div className="pt-4 border-t border-[#273128] space-y-3 text-xs font-mono text-[#A0AAA0]">
              <div className="flex justify-between">
                <span>Experience Level</span>
                <span className="text-[#F4F7F1] font-bold">{project.experienceLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>Application Deadline</span>
                <span className="text-[#F4F7F1]">{project.applicationDeadline || 'Rolling Sprint'}</span>
              </div>
              <div className="flex justify-between">
                <span>Escrow Status</span>
                <span className="text-[#B6FF4A] flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Protected
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              {isOwner ? (
                <>
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    onClick={() => setManageModalOpen(true)}
                    rightIcon={<Sliders className="w-4 h-4" />}
                  >
                    Manage Proposals ({project.applicantCount})
                  </Button>

                  {isOpen ? (
                    <Button
                      fullWidth
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        closeProject(project.id);
                        showToast('Project closed to new applications.');
                      }}
                    >
                      Close Project
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        reopenProject(project.id);
                        showToast('Project reopened.');
                      }}
                    >
                      Reopen Project
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {userHasApplied ? (
                    <div className="p-3 bg-[#101510] border border-[#B6FF4A]/40 text-center rounded-xs space-y-1">
                      <p className="text-xs font-mono text-[#B6FF4A] font-bold">
                        Proposal Submitted
                      </p>
                      <p className="text-[11px] font-mono text-[#A0AAA0]">
                        Reviewing your submission
                      </p>
                    </div>
                  ) : isOpen ? (
                    <Button
                      fullWidth
                      size="lg"
                      variant="primary"
                      onClick={() => setApplyModalOpen(true)}
                      rightIcon={<Send className="w-4 h-4" />}
                    >
                      Apply Now
                    </Button>
                  ) : (
                    <Button fullWidth size="lg" variant="outline" disabled>
                      Applications Closed
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Client Profile Card */}
          <ClientProfileCard project={project} />
        </div>
      </div>

      {/* Modals */}
      <ApplyModal
        project={applyModalOpen ? project : null}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={() => showToast('Proposal submitted successfully.')}
      />

      {manageModalOpen && (
        <ApplicationManagementModal
          project={project}
          onClose={() => setManageModalOpen(false)}
        />
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B09]/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
              Report Listing
            </h3>
            <p className="text-xs text-[#A0AAA0] leading-relaxed">
              If this listing contains misleading specifications, non-compliant payment terms, or suspicious activity, our security review team will investigate.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button size="sm" variant="outline" onClick={() => setReportModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleReport}>
                Confirm Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
