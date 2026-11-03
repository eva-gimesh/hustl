import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRecruit } from '../context/RecruitContext';
import { useAuth } from '../context/AuthContext';
import { ApplyJobModal } from '../components/recruit/ApplyJobModal';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  Bookmark,
  Share2,
  Flag,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Briefcase,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getJobById, getCompanyById, isJobSaved, toggleSaveJob, hasAppliedToJob } = useRecruit();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const job = jobId ? getJobById(jobId) : undefined;
  const company = job ? getCompanyById(job.companyId) : undefined;

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-black text-2xl text-[#F4F7F1]">Opportunity Not Found</h2>
        <p className="text-sm font-mono text-[#A0AAA0]">
          The recruitment listing you are looking for may have been archived or removed.
        </p>
        <Link to="/recruit/opportunities">
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to All Opportunities
          </Button>
        </Link>
      </div>
    );
  }

  const currentUserId = user?.id || 'usr_demo_8829';
  const saved = isJobSaved(job.id);
  const alreadyApplied = hasAppliedToJob(job.id, currentUserId);
  const isOwner = job.creatorId === currentUserId || (company && company.ownerId === currentUserId);

  // Calculate deadline status
  const calculateDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Closed';
    if (days === 0) return 'Last day today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  const deadlineText = calculateDaysRemaining(job.applicationDeadline);
  const isClosed = job.status === 'closed' || deadlineText === 'Closed';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReport = () => {
    setReportSubmitted(true);
    setTimeout(() => setReportSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/recruit/opportunities"
          className="text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>

        {isOwner && (
          <Link to={`/recruit/manage/${job.id}`}>
            <Button size="sm" variant="secondary" rightIcon={<Users className="w-4 h-4" />}>
              Manage Candidates ({job.applicantCount})
            </Button>
          </Link>
        )}
      </div>

      {/* Main Header Card */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7CCB37]/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-3xl">
            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#B6FF4A] bg-[#B6FF4A]/10 px-2 py-0.5 border border-[#B6FF4A]/30 uppercase">
                {job.category}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#A0AAA0] bg-[#141B15] px-2 py-0.5 border border-[#273128] uppercase">
                {job.employmentType}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#A0AAA0] bg-[#141B15] px-2 py-0.5 border border-[#273128] uppercase">
                {job.workMode}
              </span>
              {job.isDemo && (
                <span className="text-[10px] font-mono tracking-widest text-[#7CCB37] bg-[#7CCB37]/10 px-2 py-0.5 border border-[#7CCB37]/30 uppercase">
                  DEMONSTRATION LISTING
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight">
              {job.title}
            </h1>

            {/* Organisation Link and Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#A0AAA0]">
              <Link
                to={`/company/${job.companyId}`}
                className="text-[#F4F7F1] font-bold hover:text-[#B6FF4A] transition-colors flex items-center gap-1.5"
              >
                <span>{job.companyName}</span>
                {job.companyVerified && (
                  <span title="Verified Organisation">
                    <ShieldCheck className="w-4 h-4 text-[#7CCB37]" />
                  </span>
                )}
              </Link>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#7CCB37]" />
                <span>{job.location}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7CCB37]" />
                <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            {alreadyApplied ? (
              <div className="px-5 py-2.5 bg-[#B6FF4A]/10 border border-[#B6FF4A]/40 text-[#B6FF4A] text-xs font-mono rounded-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Application Submitted</span>
              </div>
            ) : isClosed ? (
              <Button disabled variant="secondary">
                Applications Closed
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsApplyModalOpen(true)}
              >
                Apply for this Role
              </Button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSaveJob(job.id)}
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

        {/* Highlight Grid (Compensation, Duration, Openings, Deadline) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-[#273128] text-xs font-mono">
          <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm">
            <span className="text-[10px] text-[#A0AAA0] uppercase block">Compensation</span>
            <span className="text-[#B6FF4A] font-bold text-sm block mt-0.5">{job.compensation}</span>
          </div>
          <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm">
            <span className="text-[10px] text-[#A0AAA0] uppercase block">Duration / Term</span>
            <span className="text-[#F4F7F1] font-semibold text-sm block mt-0.5">{job.duration || 'Flexible'}</span>
          </div>
          <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm">
            <span className="text-[10px] text-[#A0AAA0] uppercase block">Open Positions</span>
            <span className="text-[#F4F7F1] font-semibold text-sm block mt-0.5">{job.openingsCount} Openings</span>
          </div>
          <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm">
            <span className="text-[10px] text-[#A0AAA0] uppercase block">Deadline</span>
            <span className={isClosed ? 'text-rose-400 font-bold block mt-0.5' : 'text-[#F4F7F1] font-semibold block mt-0.5'}>
              {deadlineText}
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid (Content 2/3, Sidebar 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Spec, Responsibilities, Requirements */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#B6FF4A]">
              Role Overview
            </h2>
            <p className="text-sm text-[#A0AAA0] leading-relaxed whitespace-pre-wrap font-sans">
              {job.overview}
            </p>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#B6FF4A]">
                Key Responsibilities
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#A0AAA0]">
                    <span className="w-1.5 h-1.5 bg-[#7CCB37] rotate-45 mt-2 shrink-0" />
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications & Eligibility */}
          {job.qualifications && job.qualifications.length > 0 && (
            <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#B6FF4A]">
                Qualifications & Eligibility
              </h2>
              <ul className="space-y-3">
                {job.qualifications.map((qual, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#A0AAA0]">
                    <span className="w-1.5 h-1.5 bg-[#7CCB37] rotate-45 mt-2 shrink-0" />
                    <span className="leading-relaxed">{qual}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Required & Bonus */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-5">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#B6FF4A]">
              Skill Requirements
            </h2>
            <div>
              <span className="text-xs font-mono text-[#A0AAA0] block mb-2 uppercase">Required Technical Competencies</span>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="text-xs font-mono px-3 py-1 bg-[#141B15] border border-[#273128] text-[#F4F7F1]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {job.bonusSkills && job.bonusSkills.length > 0 && (
              <div>
                <span className="text-xs font-mono text-[#A0AAA0] block mb-2 uppercase">Bonus / Advantageous Skills</span>
                <div className="flex flex-wrap gap-2">
                  {job.bonusSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-xs font-mono px-3 py-1 bg-[#141B15] border border-[#273128] text-[#7CCB37]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hiring Process */}
          {job.hiringProcess && job.hiringProcess.length > 0 && (
            <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#B6FF4A]">
                Hiring Process Stages
              </h2>
              <div className="space-y-3">
                {job.hiringProcess.map((step, idx) => (
                  <div key={idx} className="p-3 bg-[#141B15] border border-[#273128] rounded-sm flex items-center gap-3 text-xs font-mono">
                    <span className="w-6 h-6 rounded-sm bg-[#080B09] border border-[#273128] text-[#B6FF4A] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[#F4F7F1]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#B6FF4A]">
                Perks & Benefits
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits.map((b, i) => (
                  <li key={i} className="p-3 bg-[#141B15] border border-[#273128] rounded-sm text-xs text-[#A0AAA0] flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#B6FF4A] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Sidebar: Company Card & Application Rules */}
        <div className="space-y-6">
          {/* Company Brief Card */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#7CCB37]">
              Hiring Organisation
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-sm bg-[#141B15] border border-[#273128] flex items-center justify-center font-display font-black text-lg text-[#B6FF4A]">
                {job.companyName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <Link
                  to={`/company/${job.companyId}`}
                  className="font-display font-bold text-base text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors flex items-center gap-1.5"
                >
                  <span>{job.companyName}</span>
                  {job.companyVerified && <ShieldCheck className="w-4 h-4 text-[#7CCB37]" />}
                </Link>
                <p className="text-xs font-mono text-[#A0AAA0]">{job.companyIndustry}</p>
              </div>
            </div>

            {company && (
              <p className="text-xs text-[#A0AAA0] leading-relaxed">
                {company.description}
              </p>
            )}

            <div className="space-y-2 text-xs font-mono text-[#A0AAA0] pt-2 border-t border-[#273128]">
              <div className="flex justify-between">
                <span>Headquarters</span>
                <span className="text-[#F4F7F1]">{job.companyLocation}</span>
              </div>
              <div className="flex justify-between">
                <span>Team Size</span>
                <span className="text-[#F4F7F1]">{job.companySize} members</span>
              </div>
              {company?.website && (
                <div className="flex justify-between">
                  <span>Website</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#B6FF4A] hover:underline flex items-center gap-1"
                  >
                    <span>Visit site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <Link
              to={`/company/${job.companyId}`}
              className="block w-full py-2 text-center text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] border border-[#273128] hover:border-[#7CCB37]/50 rounded-sm transition-colors"
            >
              View Full Company Profile
            </Link>
          </div>

          {/* Application Requirements Checklist */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#7CCB37]">
              Application Requirements
            </h3>
            <ul className="space-y-2 text-xs font-mono text-[#A0AAA0]">
              <li className="flex items-center justify-between">
                <span>Resume / CV</span>
                <span className={job.requiresResume ? 'text-[#B6FF4A]' : 'text-[#A0AAA0]'}>
                  {job.requiresResume ? 'Mandatory' : 'Optional'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Cover Note</span>
                <span className={job.requiresCoverLetter ? 'text-[#B6FF4A]' : 'text-[#A0AAA0]'}>
                  {job.requiresCoverLetter ? 'Mandatory' : 'Optional'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Portfolio / Code Link</span>
                <span className={job.requiresPortfolio ? 'text-[#B6FF4A]' : 'text-[#A0AAA0]'}>
                  {job.requiresPortfolio ? 'Mandatory' : 'Optional'}
                </span>
              </li>
              {job.customQuestions && job.customQuestions.length > 0 && (
                <li className="flex items-center justify-between">
                  <span>Screening Questions</span>
                  <span className="text-[#B6FF4A]">{job.customQuestions.length} questions</span>
                </li>
              )}
            </ul>

            <div className="pt-2">
              {alreadyApplied ? (
                <div className="p-3 bg-[#141B15] border border-[#273128] text-center text-xs font-mono text-[#B6FF4A]">
                  You have applied to this role
                </div>
              ) : isClosed ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-center text-xs font-mono text-rose-300">
                  Applications Closed
                </div>
              ) : (
                <Button
                  className="w-full"
                  variant="primary"
                  onClick={() => setIsApplyModalOpen(true)}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>

          {/* Report Button */}
          <div className="text-center">
            {reportSubmitted ? (
              <span className="text-xs font-mono text-[#7CCB37]">Flagged for review</span>
            ) : (
              <button
                onClick={handleReport}
                className="text-[11px] font-mono text-[#A0AAA0]/60 hover:text-rose-400 flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
              >
                <Flag className="w-3 h-3" />
                <span>Report this listing</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <ApplyJobModal
          job={job}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}
    </div>
  );
};
