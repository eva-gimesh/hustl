import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecruit } from '../context/RecruitContext';
import { useAuth } from '../context/AuthContext';
import { PipelineBoard } from '../components/recruit/PipelineBoard';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ExternalLink, ShieldCheck, Users, Briefcase } from 'lucide-react';

export const ManageCandidatesPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const { getJobById, getCompanyById, getApplicationsForJob } = useRecruit();

  const job = jobId ? getJobById(jobId) : undefined;
  const company = job ? getCompanyById(job.companyId) : undefined;
  const applications = job ? getApplicationsForJob(job.id) : [];

  const currentUserId = user?.id || 'usr_demo_8829';
  const isOwnerOrRecruiter =
    job?.creatorId === currentUserId ||
    company?.ownerId === currentUserId ||
    user?.roles?.includes('recruiter') ||
    user?.roles?.includes('founder');

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-black text-2xl text-[#F4F7F1]">Opening Not Found</h2>
        <Link to="/recruit">
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Recruitment Platform
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={`/recruit/opportunities/${job.id}`}
          className="text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Page</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/company/${job.companyId}`}
            className="text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] border border-[#273128] px-3 py-1.5 rounded-sm transition-colors"
          >
            Company Profile
          </Link>
          <Link to="/recruit/create">
            <Button size="sm" variant="secondary">
              Post Another Opening
            </Button>
          </Link>
        </div>
      </div>

      {/* Recruiter Header Card */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7CCB37]/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#B6FF4A]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                Recruiter Command · {job.companyName}
              </span>
              {job.isDemo && (
                <span className="text-[10px] font-mono tracking-widest text-[#7CCB37] bg-[#7CCB37]/10 px-1.5 py-0.5 border border-[#7CCB37]/30 uppercase">
                  DEMO ROLE
                </span>
              )}
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#F4F7F1] tracking-tight">
              Candidate Pipeline: {job.title}
            </h1>
            <p className="text-xs font-mono text-[#A0AAA0] mt-1">
              {job.employmentType} · {job.workMode} · {job.compensation} · {job.openingsCount} Openings
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#141B15] border border-[#273128] p-4 rounded-sm">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-[#A0AAA0] block">Active Applicants</span>
              <span className="text-2xl font-bold font-mono text-[#B6FF4A]">{applications.length}</span>
            </div>
            <div className="w-px h-8 bg-[#273128]" />
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-[#A0AAA0] block">Status</span>
              <span className="text-xs font-mono font-bold text-[#F4F7F1] uppercase">
                {job.status === 'open' ? 'Active / Receiving' : 'Closed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter 6-Stage Pipeline Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-widest text-[#B6FF4A]">
            Recruiter Candidate Workflow (6 Stages)
          </h2>
          <span className="text-xs font-mono text-[#A0AAA0]">
            Select a candidate card to inspect details, add notes, and advance stages.
          </span>
        </div>

        <PipelineBoard job={job} />
      </div>
    </div>
  );
};
