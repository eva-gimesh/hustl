import React from 'react';
import { Link } from 'react-router-dom';
import { JobListing } from '../../types';
import { useRecruit } from '../../context/RecruitContext';
import { Bookmark, Building2, MapPin, IndianRupee as DollarSign, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface JobCardProps {
  job: JobListing;
  onApplyClick?: (job: JobListing) => void;
  showActions?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApplyClick, showActions = true }) => {
  const { isJobSaved, toggleSaveJob } = useRecruit();
  const saved = isJobSaved(job.id);

  // Calculate days remaining
  const calculateDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Closed';
    if (days === 0) return 'Last day today';
    if (days === 1) return '1 day remaining';
    return `${days} days left`;
  };

  const daysLeft = calculateDaysRemaining(job.applicationDeadline);
  const isClosed = job.status === 'closed' || daysLeft === 'Closed';

  return (
    <div className="group relative bg-[#101510] border border-[#273128] hover:border-[#7CCB37]/50 rounded-sm p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-[0_4px_24px_-4px_rgba(182,255,74,0.08)]">
      {/* Top Bar: Company info, Demo badge, Save button */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/company/${job.companyId}`}
              className="w-10 h-10 rounded-sm bg-[#141B15] border border-[#273128] flex items-center justify-center font-display font-black text-sm text-[#B6FF4A] shrink-0 hover:border-[#B6FF4A] transition-colors"
            >
              {job.companyName.substring(0, 2).toUpperCase()}
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/company/${job.companyId}`}
                  className="text-xs font-mono font-medium text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors truncate"
                >
                  {job.companyName}
                </Link>
                {job.companyVerified && (
                  <span className="inline-flex items-center text-[#7CCB37]" title="Verified Organisation">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                )}
                {job.isDemo && (
                  <span className="text-[10px] font-mono tracking-widest text-[#7CCB37] bg-[#7CCB37]/10 px-1.5 py-0.5 border border-[#7CCB37]/30 uppercase">
                    DEMO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#A0AAA0]/70 truncate">{job.companyIndustry}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSaveJob(job.id);
              }}
              className={`p-2 rounded-sm border transition-colors cursor-pointer ${
                saved
                  ? 'border-[#B6FF4A] text-[#B6FF4A] bg-[#B6FF4A]/10'
                  : 'border-[#273128] text-[#A0AAA0] hover:text-[#F4F7F1] hover:border-[#A0AAA0]/50'
              }`}
              title={saved ? 'Remove from saved' : 'Save opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#B6FF4A]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <Link to={`/recruit/opportunities/${job.id}`} className="block group-hover:text-[#B6FF4A] transition-colors">
          <h3 className="font-display font-bold text-lg text-[#F4F7F1] tracking-tight line-clamp-1 mb-2">
            {job.title}
          </h3>
        </Link>

        {/* Metadata Line without pill capsule bloat */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-[#A0AAA0] mb-3">
          <span className="text-[#F4F7F1] font-semibold">{job.employmentType}</span>
          <span className="text-[#273128]">·</span>
          <span>{job.workMode}</span>
          <span className="text-[#273128]">·</span>
          <span className="truncate max-w-[150px]">{job.location}</span>
        </div>

        {/* Compensation and Deadline */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#141B15] border border-[#273128] rounded-sm mb-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#A0AAA0] uppercase block tracking-wider">Comp / Stipend</span>
            <span className="text-[#B6FF4A] font-bold text-sm tracking-tight">{job.compensation}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#A0AAA0] uppercase block tracking-wider">Deadline</span>
            <span className={isClosed ? 'text-rose-400 font-bold' : 'text-[#F4F7F1]'}>
              {daysLeft}
            </span>
          </div>
        </div>

        {/* Overview snippet */}
        <p className="text-xs text-[#A0AAA0] line-clamp-2 leading-relaxed mb-4">
          {job.overview}
        </p>

        {/* Required Skills (Unboxed clean tags) */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {job.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-mono px-2 py-0.5 bg-[#141B15] border border-[#273128] text-[#A0AAA0]"
            >
              {skill}
            </span>
          ))}
          {job.bonusSkills && job.bonusSkills.length > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 text-[#7CCB37]/70">
              +{job.bonusSkills.length} bonus
            </span>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      {showActions && (
        <div className="pt-3 border-t border-[#273128] flex items-center justify-between gap-3 text-xs font-mono">
          <span className="text-[#A0AAA0]">
            <strong className="text-[#F4F7F1]">{job.applicantCount}</strong> applicants
          </span>

          <div className="flex items-center gap-2">
            <Link
              to={`/recruit/opportunities/${job.id}`}
              className="px-3 py-1.5 text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] border border-[#273128] hover:border-[#7CCB37]/50 rounded-sm transition-colors"
            >
              Details
            </Link>

            {onApplyClick && !isClosed ? (
              <button
                onClick={() => onApplyClick(job)}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-[#B6FF4A] text-[#080B09] hover:bg-[#a3f033] rounded-sm transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                to={`/recruit/opportunities/${job.id}`}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-[#B6FF4A] text-[#080B09] hover:bg-[#a3f033] rounded-sm transition-colors flex items-center gap-1"
              >
                <span>{isClosed ? 'View' : 'Apply'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
