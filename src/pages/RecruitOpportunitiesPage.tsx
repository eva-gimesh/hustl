import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRecruit } from '../context/RecruitContext';
import { JobListing, JobCategory, JobEmploymentType, JobWorkMode, JobExperienceLevel } from '../types';
import { JobCard } from '../components/recruit/JobCard';
import { ApplyJobModal } from '../components/recruit/ApplyJobModal';
import { Button } from '../components/ui/Button';
import {
  Search,
  Filter,
  Briefcase,
  IndianRupee as DollarSign,
  MapPin,
  ArrowUpDown,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

const CATEGORIES: JobCategory[] = [
  'Engineering',
  'Design',
  'Marketing',
  'Product',
  'Operations',
  'Data & AI',
  'Sales',
  'Other',
];

const EMPLOYMENT_TYPES: JobEmploymentType[] = [
  'Internship',
  'Full-time',
  'Part-time',
  'Contract',
];

const WORK_MODES: JobWorkMode[] = ['Remote', 'Hybrid', 'On-site'];

const EXPERIENCE_LEVELS: JobExperienceLevel[] = [
  'Student / Fresher',
  '0-1 years',
  '1-3 years',
  '3+ years',
];

export const RecruitOpportunitiesPage: React.FC = () => {
  const { jobs } = useRecruit();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'comp-high' | 'comp-low' | 'relevant'>('relevant');
  const [paidOnly, setPaidOnly] = useState(false);

  // Modal apply state
  const [applyingJob, setApplyingJob] = useState<JobListing | null>(null);

  // Derive unique skills across all jobs
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      j.requiredSkills.forEach((s) => set.add(s));
    });
    return Array.from(set);
  }, [jobs]);

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      // Search query across title, company, skills, overview
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.companyName.toLowerCase().includes(q);
        const matchesSkills = job.requiredSkills.some((s) => s.toLowerCase().includes(q));
        const matchesOverview = job.overview.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesOverview) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && job.category !== selectedCategory) {
        return false;
      }

      // Employment type
      if (selectedType !== 'all' && job.employmentType !== selectedType) {
        return false;
      }

      // Work mode
      if (selectedWorkMode !== 'all' && job.workMode !== selectedWorkMode) {
        return false;
      }

      // Experience level
      if (selectedExperience !== 'all' && job.experienceLevel !== selectedExperience) {
        return false;
      }

      // Skill
      if (selectedSkill !== 'all' && !job.requiredSkills.includes(selectedSkill)) {
        return false;
      }

      // Paid only
      if (paidOnly && job.compensationType !== 'Paid') {
        return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
      if (sortBy === 'comp-high') {
        const valA = a.compensationMin || 0;
        const valB = b.compensationMin || 0;
        return valB - valA;
      }
      if (sortBy === 'comp-low') {
        const valA = a.compensationMin || 0;
        const valB = b.compensationMin || 0;
        return valA - valB;
      }
      // relevant: featured first, then newest
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    });

    return result;
  }, [
    jobs,
    searchTerm,
    selectedCategory,
    selectedType,
    selectedWorkMode,
    selectedExperience,
    selectedSkill,
    paidOnly,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedWorkMode('all');
    setSelectedExperience('all');
    setSelectedSkill('all');
    setPaidOnly(false);
    setSortBy('relevant');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    selectedWorkMode !== 'all' ||
    selectedExperience !== 'all' ||
    selectedSkill !== 'all' ||
    paidOnly;

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#273128] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              Recruitment · Opportunities Engine
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight">
            Discover Roles & Internships
          </h1>
          <p className="text-sm font-mono text-[#A0AAA0] mt-1">
            Verified opportunities from fast-growing tech teams, venture-backed startups, and research labs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/recruit/talent">
            <Button variant="secondary" size="md">
              Scout Builders
            </Button>
          </Link>
          <Link to="/recruit/create">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Post an Opening
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Category Chips Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors cursor-pointer ${
            selectedType === 'all'
              ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
              : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
          }`}
        >
          All Types ({jobs.length})
        </button>

        {EMPLOYMENT_TYPES.map((type) => {
          const count = jobs.filter((j) => j.employmentType === type).length;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors cursor-pointer ${
                selectedType === type
                  ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
                  : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
              }`}
            >
              {type}s ({count})
            </button>
          );
        })}

        <div className="w-px h-5 bg-[#273128] mx-1 shrink-0" />

        {WORK_MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => setSelectedWorkMode(selectedWorkMode === mode ? 'all' : mode)}
            className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors cursor-pointer ${
              selectedWorkMode === mode
                ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
                : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Search & Advanced Filters */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-5 space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A0AAA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles, companies or skills..."
            className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] pl-10 pr-4 py-3 rounded-sm outline-none font-mono"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Job Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Experience Level</label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="all">All Levels</option>
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Required Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="all">All Skills</option>
              {allSkills.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="relevant">Most Relevant</option>
              <option value="recent">Most Recent</option>
              <option value="comp-high">Compensation: High to Low</option>
              <option value="comp-low">Compensation: Low to High</option>
            </select>
          </div>
        </div>

        {/* Paid only & Active filters summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#273128] text-xs font-mono">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={paidOnly}
                onChange={(e) => setPaidOnly(e.target.checked)}
                className="accent-[#B6FF4A]"
              />
              <span className="text-[#A0AAA0]">Paid Compensation Only</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[#B6FF4A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="text-xs font-mono text-[#A0AAA0]">
            Found <strong className="text-[#F4F7F1] font-bold">{filteredJobs.length}</strong> active openings
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredJobs.length === 0 ? (
        <div className="py-16 text-center bg-[#101510] border border-[#273128] rounded-sm space-y-4">
          <p className="text-sm font-mono text-[#A0AAA0]">
            No recruitment openings match the selected filters.
          </p>
          <Button variant="secondary" size="sm" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApplyClick={(selected) => setApplyingJob(selected)}
            />
          ))}
        </div>
      )}

      {/* Apply Modal */}
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
