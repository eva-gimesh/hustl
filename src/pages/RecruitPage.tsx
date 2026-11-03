import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRecruit } from '../context/RecruitContext';
import { useTalent } from '../context/TalentContext';
import { JobListing, TalentProfile } from '../types';
import { JobCard } from '../components/recruit/JobCard';
import { ApplyJobModal } from '../components/recruit/ApplyJobModal';
import { Button } from '../components/ui/Button';
import {
  Compass,
  Briefcase,
  Users,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText,
  UserCheck,
} from 'lucide-react';

export const RecruitPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, saveRoles } = useAuth();
  const { jobs, getUserJobs, getUserApplications } = useRecruit();
  const { talentList, getConnectionStatus, sendConnectionRequest } = useTalent();

  // Navigation tabs:
  // - Find Opportunities
  // - Discover Talent
  // - My Applications
  // - My Job Posts
  // - Manage Candidates
  const [activeTab, setActiveTab] = useState<
    'opportunities' | 'talent' | 'applications' | 'my-posts'
  >('opportunities');

  // Quick apply modal
  const [applyingJob, setApplyingJob] = useState<JobListing | null>(null);

  const currentUserId = user?.id || 'usr_demo_8829';
  const isRecruiterOrFounder =
    user?.roles?.includes('recruiter') || user?.roles?.includes('founder');

  const userApplications = getUserApplications(currentUserId);
  const userJobs = getUserJobs(currentUserId);

  const handleActivateRecruiter = async () => {
    if (!user) return;
    const currentRoles = user.roles || [];
    if (!currentRoles.includes('recruiter')) {
      await saveRoles([...currentRoles, 'recruiter']);
    }
    setActiveTab('my-posts');
  };

  return (
    <div className="w-full py-10 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. HERO SECTION */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-8 md:p-14 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7CCB37]/10 blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#B6FF4A] rotate-45" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                Pillar 02 · Recruitment and Talent Hiring Platform
              </span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-[#F4F7F1] tracking-tight leading-[1.05]">
              FIND THE PEOPLE WHO MOVE THINGS FORWARD.
            </h1>

            <p className="text-base sm:text-lg font-mono text-[#A0AAA0] leading-relaxed max-w-2xl">
              Discover emerging talent, connect with skilled students and build a team that brings your vision to life.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/recruit/opportunities">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Opportunities
                </Button>
              </Link>

              <Link to="/recruit/talent">
                <Button size="lg" variant="secondary" leftIcon={<Users className="w-4 h-4" />}>
                  Find Talent
                </Button>
              </Link>

              {isRecruiterOrFounder ? (
                <Link to="/recruit/create">
                  <Button size="lg" variant="ghost" leftIcon={<Plus className="w-4 h-4" />}>
                    Post an Opening
                  </Button>
                </Link>
              ) : (
                <button
                  onClick={handleActivateRecruiter}
                  className="px-4 py-2.5 text-xs font-mono border border-[#273128] hover:border-[#B6FF4A] text-[#A0AAA0] hover:text-[#B6FF4A] rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Post an Opening (Hiring)</span>
                </button>
              )}
            </div>

            {/* Value metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-[#A0AAA0]">
              <span className="text-[#B6FF4A] font-bold">48h Avg. First Interview</span>
              <span>·</span>
              <span>Verified GitHub Code Proof</span>
              <span>·</span>
              <span>Direct Student-Founder Matching</span>
            </div>
          </div>

          {/* Right Hero Composition: Visual Talent & Opportunity Radar Box */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm space-y-3 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-[#273128] pb-2 text-xs font-mono">
                <span className="text-[#B6FF4A] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-time Talent Radar</span>
                </span>
                <span className="text-[#A0AAA0]">Matching 98.4%</span>
              </div>

              {/* Sample Talent Match Item */}
              <div className="p-3 bg-[#101510] border border-[#273128] rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-sm bg-[#141B15] border border-[#273128] flex items-center justify-center font-display font-bold text-xs text-[#B6FF4A]">
                    AS
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-[#F4F7F1] block">
                      Aarav Sharma
                    </span>
                    <span className="text-[10px] font-mono text-[#A0AAA0]">
                      Systems Dev · IIT Bombay
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#7CCB37] bg-[#7CCB37]/10 px-2 py-0.5 border border-[#7CCB37]/30">
                  Ready for Interview
                </span>
              </div>

              {/* Sample Job Listing Item */}
              <div className="p-3 bg-[#101510] border border-[#273128] rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#A0AAA0] block">
                    Nova Labs · Remote
                  </span>
                  <span className="text-xs font-mono font-bold text-[#F4F7F1]">
                    Backend Developer Intern
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#B6FF4A]">
                  ₹12,000/mo
                </span>
              </div>

              {/* Mini Pipeline Preview */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1">
                <div className="p-2 bg-[#080B09] border border-[#273128] rounded-sm">
                  <span className="text-[#A0AAA0] block">New Apps</span>
                  <span className="text-[#F4F7F1] font-bold text-sm">14</span>
                </div>
                <div className="p-2 bg-[#080B09] border border-[#273128] rounded-sm">
                  <span className="text-[#A0AAA0] block">Shortlisted</span>
                  <span className="text-[#B6FF4A] font-bold text-sm">6</span>
                </div>
                <div className="p-2 bg-[#080B09] border border-[#273128] rounded-sm">
                  <span className="text-[#A0AAA0] block">Interviews</span>
                  <span className="text-purple-400 font-bold text-sm">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECRUIT SECONDARY NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#273128] pb-4 gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#101510] border border-[#273128] rounded-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'opportunities'
                ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
            }`}
          >
            Find Opportunities ({jobs.length})
          </button>

          <button
            onClick={() => setActiveTab('talent')}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'talent'
                ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
            }`}
          >
            Discover Talent ({talentList.length})
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'applications'
                ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
            }`}
          >
            My Applications ({userApplications.length})
          </button>

          <button
            onClick={() => setActiveTab('my-posts')}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'my-posts'
                ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
            }`}
          >
            My Job Posts ({userJobs.length})
          </button>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <Link
            to="/recruit/opportunities"
            className="text-xs font-mono text-[#B6FF4A] hover:underline flex items-center gap-1"
          >
            <span>All Opportunities Search</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: FIND OPPORTUNITIES */}
      {activeTab === 'opportunities' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
                Featured Openings
              </h2>
              <p className="text-xs font-mono text-[#A0AAA0] mt-1">
                Engineering internships, growth associates, and product roles with verified compensation.
              </p>
            </div>

            <Link to="/recruit/opportunities">
              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Filter All Openings
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApplyClick={(selected) => setApplyingJob(selected)}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DISCOVER TALENT */}
      {activeTab === 'talent' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
                Candidate Radar
              </h2>
              <p className="text-xs font-mono text-[#A0AAA0] mt-1">
                Directly scout collegiate developers and full-stack builders.
              </p>
            </div>

            <Link to="/recruit/talent">
              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Launch Deep Talent Search
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talentList.slice(0, 6).map((talent) => {
              const connStatus = getConnectionStatus(talent.id);

              return (
                <div
                  key={talent.id}
                  className="bg-[#101510] border border-[#273128] hover:border-[#7CCB37]/40 rounded-sm p-6 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-[#141B15] border border-[#273128] flex items-center justify-center font-display font-black text-sm text-[#B6FF4A]">
                          {talent.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/profile/${talent.id}`}
                              className="font-display font-bold text-sm text-[#F4F7F1] hover:text-[#B6FF4A]"
                            >
                              {talent.name}
                            </Link>
                            {talent.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-[#7CCB37]" />
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-[#A0AAA0]">
                            {talent.institution || 'University'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs font-mono text-[#A0AAA0] line-clamp-2 mb-3">
                      {talent.bio}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {talent.skills?.slice(0, 3).map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] font-mono px-2 py-0.5 bg-[#141B15] border border-[#273128] text-[#A0AAA0]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#273128] flex items-center justify-between text-xs font-mono">
                    <Link
                      to={`/profile/${talent.id}`}
                      className="text-[#A0AAA0] hover:text-[#F4F7F1]"
                    >
                      View Profile
                    </Link>

                    {connStatus === 'accepted' ? (
                      <span className="text-[#B6FF4A]">Connected</span>
                    ) : connStatus === 'pending' ? (
                      <span className="text-[#A0AAA0]">Pending</span>
                    ) : (
                      <button
                        onClick={() => sendConnectionRequest(talent.id)}
                        className="px-2.5 py-1 bg-[#B6FF4A] text-[#080B09] font-bold rounded-sm hover:bg-[#a3f033] cursor-pointer"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
                My Applications ({userApplications.length})
              </h2>
              <p className="text-xs font-mono text-[#A0AAA0] mt-1">
                Your submitted job and internship applications.
              </p>
            </div>

            <Link to="/recruit/applications">
              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Tracker
              </Button>
            </Link>
          </div>

          {userApplications.length === 0 ? (
            <div className="p-12 text-center bg-[#101510] border border-[#273128] rounded-sm space-y-3 font-mono">
              <p className="text-sm text-[#A0AAA0]">You haven't submitted any applications yet.</p>
              <Link to="/recruit/opportunities">
                <Button size="sm" variant="primary">
                  Explore Openings
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-[#101510] border border-[#273128] rounded-sm flex items-center justify-between gap-4 font-mono text-xs"
                >
                  <div>
                    <span className="text-[#B6FF4A] text-[10px] uppercase block">
                      {app.status}
                    </span>
                    <Link
                      to={`/recruit/opportunities/${app.jobId}`}
                      className="text-sm font-bold text-[#F4F7F1] hover:text-[#B6FF4A]"
                    >
                      {app.jobTitle}
                    </Link>
                    <span className="text-[#A0AAA0] block">{app.companyName}</span>
                  </div>

                  <Link to="/recruit/applications">
                    <Button size="sm" variant="secondary">
                      Track Stage
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MY JOB POSTS & MANAGE CANDIDATES */}
      {activeTab === 'my-posts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
                Recruiter Command & Job Posts ({userJobs.length})
              </h2>
              <p className="text-xs font-mono text-[#A0AAA0] mt-1">
                Manage your published roles and evaluate applicant pipelines.
              </p>
            </div>

            <Link to="/recruit/create">
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Post New Opening
              </Button>
            </Link>
          </div>

          {userJobs.length === 0 ? (
            <div className="p-12 text-center bg-[#101510] border border-[#273128] rounded-sm space-y-3 font-mono">
              <p className="text-sm text-[#A0AAA0]">
                You haven't posted any recruitment openings yet.
              </p>
              <Link to="/recruit/create">
                <Button size="sm" variant="primary">
                  Post Your First Role
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 bg-[#101510] border border-[#273128] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-[#B6FF4A] bg-[#B6FF4A]/10 px-2 py-0.5 border border-[#B6FF4A]/30">
                        {job.employmentType}
                      </span>
                      <span className="text-[#A0AAA0]">{job.companyName}</span>
                    </div>

                    <Link
                      to={`/recruit/opportunities/${job.id}`}
                      className="text-base font-bold text-[#F4F7F1] hover:text-[#B6FF4A] block"
                    >
                      {job.title}
                    </Link>

                    <div className="text-[#A0AAA0] flex items-center gap-3">
                      <span>{job.workMode}</span>
                      <span>·</span>
                      <span className="text-[#B6FF4A]">{job.compensation}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right pr-2">
                      <span className="text-[10px] text-[#A0AAA0] uppercase block">Applicants</span>
                      <span className="text-lg font-bold text-[#B6FF4A]">{job.applicantCount}</span>
                    </div>

                    <Link to={`/recruit/manage/${job.id}`}>
                      <Button variant="primary" size="sm" rightIcon={<Users className="w-4 h-4" />}>
                        Manage Candidates
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Apply Modal */}
      {applyingJob && (
        <ApplyJobModal
          job={applyingJob}
          isOpen={!!applyingJob}
          onClose={() => setApplyingJob(null)}
        />
      )}
    </div>
  );
};
