import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTeamUp } from '../context/TeamUpContext';
import {
  StartupIdea,
  IdeaCategory,
  DevelopmentStage,
  RecruitmentStatus,
  TeamCompensationModel,
} from '../types';
import { IdeaCard } from '../components/teamup/IdeaCard';
import { ApplyTeamModal } from '../components/teamup/ApplyTeamModal';
import { Button } from '../components/ui/Button';
import {
  Search,
  Filter,
  Rocket,
  Users,
  X,
  Sparkles,
  ArrowUpDown,
  Plus,
} from 'lucide-react';

const INDUSTRIES: IdeaCategory[] = [
  'Technology',
  'Artificial Intelligence',
  'Design',
  'Education',
  'Sustainability',
  'Healthcare',
  'Finance',
  'Social Impact',
  'E-commerce',
  'Media and Content',
  'Other',
];

const STAGES: DevelopmentStage[] = [
  'Just an Idea',
  'Researching',
  'Validating',
  'Building MVP',
  'Launched',
  'Growing',
];

const STATUSES: RecruitmentStatus[] = [
  'Recruiting',
  'Building',
  'Active',
  'Paused',
  'Completed',
];

const COMPENSATION_MODELS: TeamCompensationModel[] = [
  'Paid',
  'Equity-based',
  'Unpaid',
  'Volunteer',
  'Open to discussion',
];

export const DiscoverIdeasPage: React.FC = () => {
  const { ideas } = useTeamUp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedComp, setSelectedComp] = useState<string>('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'relevant' | 'updated'>('relevant');

  const [activeApplyIdea, setActiveApplyIdea] = useState<StartupIdea | null>(null);

  // Derive unique skills across ideas
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach((i) => {
      i.requiredSkills.forEach((s) => set.add(s));
      i.openRoles.forEach((r) => r.requiredSkills.forEach((s) => set.add(s)));
    });
    return Array.from(set);
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    let result = ideas.filter((idea) => {
      // Search across title, tagline, description, problem, founder name, required skills
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = idea.title.toLowerCase().includes(q);
        const matchesTagline = idea.tagline.toLowerCase().includes(q);
        const matchesDesc = idea.description.toLowerCase().includes(q);
        const matchesProblem = idea.problemStatement.toLowerCase().includes(q);
        const matchesOwner = idea.ownerName.toLowerCase().includes(q);
        const matchesSkills =
          idea.requiredSkills.some((s) => s.toLowerCase().includes(q)) ||
          idea.openRoles.some((r) =>
            r.requiredSkills.some((s) => s.toLowerCase().includes(q))
          );
        if (
          !matchesTitle &&
          !matchesTagline &&
          !matchesDesc &&
          !matchesProblem &&
          !matchesOwner &&
          !matchesSkills
        ) {
          return false;
        }
      }

      // Industry
      if (selectedIndustry !== 'all' && idea.industry !== selectedIndustry) {
        return false;
      }

      // Stage
      if (selectedStage !== 'all' && idea.developmentStage !== selectedStage) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && idea.recruitmentStatus !== selectedStatus) {
        return false;
      }

      // Compensation model
      if (selectedComp !== 'all' && idea.compensationModel !== selectedComp) {
        return false;
      }

      // Work mode
      if (selectedWorkMode !== 'all' && idea.workMode !== selectedWorkMode) {
        return false;
      }

      // Skill
      if (selectedSkill !== 'all') {
        const hasSkill =
          idea.requiredSkills.includes(selectedSkill) ||
          idea.openRoles.some((r) => r.requiredSkills.includes(selectedSkill));
        if (!hasSkill) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      // relevant: open roles count and recent
      const aRoles = a.openRoles.filter((r) => r.isOpen).length;
      const bRoles = b.openRoles.filter((r) => r.isOpen).length;
      if (aRoles !== bRoles) return bRoles - aRoles;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [
    ideas,
    searchTerm,
    selectedIndustry,
    selectedStage,
    selectedStatus,
    selectedComp,
    selectedWorkMode,
    selectedSkill,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('all');
    setSelectedStage('all');
    setSelectedStatus('all');
    setSelectedComp('all');
    setSelectedWorkMode('all');
    setSelectedSkill('all');
    setSortBy('relevant');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedIndustry !== 'all' ||
    selectedStage !== 'all' ||
    selectedStatus !== 'all' ||
    selectedComp !== 'all' ||
    selectedWorkMode !== 'all' ||
    selectedSkill !== 'all';

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#273128] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              TeamUp · Venture Exploration Engine
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight">
            Discover Ventures & Teams
          </h1>
          <p className="text-sm font-mono text-[#A0AAA0] mt-1">
            Browse early-stage ideas, inspect required skills, and find co-founders to build with.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/teamup/invitations">
            <Button variant="secondary" size="md">
              My Invitations
            </Button>
          </Link>
          <Link to="/teamup/create">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Start a Team
            </Button>
          </Link>
        </div>
      </div>

      {/* Stage Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
        <button
          onClick={() => setSelectedStage('all')}
          className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors cursor-pointer ${
            selectedStage === 'all'
              ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
              : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
          }`}
        >
          All Stages ({ideas.length})
        </button>

        {STAGES.map((stg) => {
          const count = ideas.filter((i) => i.developmentStage === stg).length;
          return (
            <button
              key={stg}
              onClick={() => setSelectedStage(stg)}
              className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors cursor-pointer ${
                selectedStage === stg
                  ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
                  : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
              }`}
            >
              {stg} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Multi-Filters Panel */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-5 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A0AAA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project name, description, founder or skill..."
            className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] pl-10 pr-4 py-3 rounded-sm outline-none font-mono"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          <div>
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="all">All Industries</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
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
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Compensation</label>
            <select
              value={selectedComp}
              onChange={(e) => setSelectedComp(e.target.value)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="all">All Compensation Models</option>
              {COMPENSATION_MODELS.map((cmp) => (
                <option key={cmp} value={cmp}>
                  {cmp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Work Mode</label>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="all">All Work Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
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
              <option value="newest">Newest First</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Bottom Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#273128] text-xs font-mono">
          <div className="flex items-center gap-3">
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
            Displaying <strong className="text-[#F4F7F1] font-bold">{filteredIdeas.length}</strong> active ventures
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="py-16 text-center bg-[#101510] border border-[#273128] rounded-sm space-y-4">
          <p className="text-sm font-mono text-[#A0AAA0]">
            No startup ideas match your specific filter criteria.
          </p>
          <Button variant="secondary" size="sm" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onApplyClick={(selected) => setActiveApplyIdea(selected)}
            />
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {activeApplyIdea && (
        <ApplyTeamModal
          idea={activeApplyIdea}
          isOpen={!!activeApplyIdea}
          onClose={() => setActiveApplyIdea(null)}
        />
      )}
    </div>
  );
};
