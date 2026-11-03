import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useFreelance } from '../context/FreelanceContext';
import { useAuth } from '../context/AuthContext';
import {
  FreelanceProject,
  FreelanceCategory,
  FreelancePaymentType,
  FreelanceExperienceLevel,
  FreelanceWorkMode,
  FreelanceApplication,
  FreelanceServicePackage,
} from '../types';
import { ProjectCard } from '../components/freelance/ProjectCard';
import { ApplyModal } from '../components/freelance/ApplyModal';
import { ApplicationManagementModal } from '../components/freelance/ApplicationManagementModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AIOpportunitySearch } from '../components/ai/AIOpportunitySearch';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  SlidersHorizontal,
  Bookmark,
  Briefcase,
  Layers,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Zap,
  Star,
  User,
  AlertCircle,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatMoney, formatMoneyRange } from '../utils/currency';

const CATEGORIES: (FreelanceCategory | 'All')[] = [
  'All',
  'Development',
  'Design',
  'Video Editing',
  'Writing',
  'Marketing',
  'Photography',
  'Business',
  'Data and Analytics',
  'Other',
];

export const FreelancePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    projects,
    applications,
    savedProjectIds,
    servicePackages,
    withdrawApplication,
    getUserApplications,
    getUserProjects,
    getAcceptedProjectsForUser,
    isProjectSaved,
    toggleSaveProject,
  } = useFreelance();

  // Active Tab: 'discover' | 'services' | 'applications' | 'my-projects' | 'saved'
  const pathDerivedTab = location.pathname.includes('/applications')
    ? 'applications'
    : location.pathname.includes('/my-projects')
    ? 'my-projects'
    : 'discover';

  const activeTab = searchParams.get('tab') || pathDerivedTab;

  const setActiveTab = (tab: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'discover') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  };

  // Filter States for Project Discovery
  const [searchQuery, setSearchQuery] = useState('');
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('All');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [paidOnly, setPaidOnly] = useState<boolean>(true);
  const [minBudgetFilter, setMinBudgetFilter] = useState<string>('');
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'relevant' | 'recent' | 'budget_desc' | 'budget_asc'
  >('relevant');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal States
  const [activeApplyProject, setActiveApplyProject] =
    useState<FreelanceProject | null>(null);
  const [activeManageProject, setActiveManageProject] =
    useState<FreelanceProject | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Reset discovery filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setAiKeywords([]);
    setSelectedCategory('All');
    setSelectedWorkMode('All');
    setSelectedPaymentType('All');
    setSelectedExperience('All');
    setSelectedDuration('All');
    setPaidOnly(true);
    setMinBudgetFilter('');
    setMaxBudgetFilter('');
    setSortBy('relevant');
  };

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search matches title, description, clientName, or requiredSkills
      const haystack = [p.title, p.clientName, p.description, ...p.requiredSkills]
        .join(' ')
        .toLowerCase();
      const matchesAiKeywords =
        aiKeywords.length === 0 ||
        aiKeywords.some((k) => haystack.includes(k.toLowerCase()));
      const matchesSearch =
        matchesAiKeywords &&
        (!searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.requiredSkills.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        ));

      // Category
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;

      // Work Mode
      const matchesWorkMode =
        selectedWorkMode === 'All' || p.workMode === selectedWorkMode;

      // Payment Type
      const matchesPaymentType =
        selectedPaymentType === 'All' || p.paymentType === selectedPaymentType;

      // Experience Level
      const matchesExperience =
        selectedExperience === 'All' || p.experienceLevel === selectedExperience;

      // Duration
      const matchesDuration =
        selectedDuration === 'All' ||
        (selectedDuration === 'under-1-month' &&
          (p.duration.includes('1–2 weeks') ||
            p.duration.includes('3–4 weeks') ||
            p.duration.includes('week'))) ||
        (selectedDuration === '1-3-months' &&
          (p.duration.includes('month') || p.duration.includes('Sprint'))) ||
        (selectedDuration === '3-months-plus' && p.duration.includes('3+'));

      // Paid or Unpaid
      const matchesPaid = !paidOnly || p.compensationType === 'Paid';

      // Budget Bounds
      const minB = minBudgetFilter ? Number(minBudgetFilter) : 0;
      const maxB = maxBudgetFilter ? Number(maxBudgetFilter) : Infinity;
      const matchesBudget = p.budgetMax >= minB && p.budgetMin <= maxB;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWorkMode &&
        matchesPaymentType &&
        matchesExperience &&
        matchesDuration &&
        matchesPaid &&
        matchesBudget
      );
    }).sort((a, b) => {
      if (sortBy === 'recent') {
        return b.id.localeCompare(a.id);
      }
      if (sortBy === 'budget_desc') {
        return b.budgetMax - a.budgetMax;
      }
      if (sortBy === 'budget_asc') {
        return a.budgetMin - b.budgetMin;
      }
      // 'relevant': featured first, then open status, then applicant count
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.status === 'open' && b.status !== 'open') return -1;
      if (a.status !== 'open' && b.status === 'open') return 1;
      return b.applicantCount - a.applicantCount;
    });
  }, [
    projects,
    searchQuery,
    aiKeywords,
    selectedCategory,
    selectedWorkMode,
    selectedPaymentType,
    selectedExperience,
    selectedDuration,
    paidOnly,
    minBudgetFilter,
    maxBudgetFilter,
    sortBy,
  ]);

  // Derived user tabs data
  const userApplications = user
    ? getUserApplications(user.id)
    : applications.slice(0, 2); // Show demo applications if guest
  const userProjects = user ? getUserProjects(user.id) : [];
  const userAcceptedProjects = user ? getAcceptedProjectsForUser(user.id) : [];
  const savedProjects = projects.filter((p) => savedProjectIds.includes(p.id));

  // Featured project in Hero
  const heroFeaturedProject = projects.find((p) => p.featured) || projects[0];

  const scrollToDiscovery = () => {
    setActiveTab('discover');
    const el = document.getElementById('marketplace-discovery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#101510] border border-[#273128] rounded-sm p-8 sm:p-12 lg:p-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B6FF4A]/5 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                Pillar 01 · Freelance Marketplace
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#F4F7F1] tracking-tight leading-[1.15]">
              YOUR SKILLS.{' '}
              <span className="text-[#B6FF4A]">REAL PROJECTS.</span>{' '}
              REAL OPPORTUNITIES.
            </h1>

            <p className="text-base text-[#A0AAA0] max-w-xl leading-relaxed">
              Find freelance projects, connect with clients and turn your skills into meaningful work.
              Verified briefs, transparent compensation milestones, and zero platform commission on your first ₹80,000 earned.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={scrollToDiscovery}
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                Find Projects
              </Button>

              <Link to="/freelance/create">
                <Button size="lg" variant="outline" rightIcon={<Plus className="w-4 h-4" />}>
                  Post a Project
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-[#A0AAA0]">
              <span className="flex items-center gap-1.5 text-[#F4F7F1]">
                <ShieldCheck className="w-4 h-4 text-[#B6FF4A]" />
                100% Escrow Protection
              </span>
              <span>·</span>
              <span>Avg. Sprint: ₹12,500</span>
              <span>·</span>
              <span>Direct Client Channels</span>
            </div>
          </div>

          {/* Right Column: Hero Featured Project Showcase */}
          {heroFeaturedProject && (
            <div className="lg:col-span-5">
              <div className="p-1 bg-gradient-to-br from-[#273128] via-[#141B15] to-[#B6FF4A]/30 rounded-xs">
                <div className="bg-[#141B15] p-6 rounded-xs space-y-5 border border-[#273128]">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#B6FF4A] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Featured Commission
                    </span>
                    <span className="text-amber-400 font-semibold uppercase text-[10px]">
                      Demonstration
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      to={`/freelance/${heroFeaturedProject.id}`}
                      className="hover:text-[#B6FF4A] transition-colors"
                    >
                      <h3 className="font-display font-bold text-xl text-[#F4F7F1] line-clamp-1">
                        {heroFeaturedProject.title}
                      </h3>
                    </Link>
                    <p className="text-xs font-mono text-[#A0AAA0]">
                      {heroFeaturedProject.clientName} · {heroFeaturedProject.location}
                    </p>
                  </div>

                  <p className="text-xs text-[#A0AAA0] leading-relaxed line-clamp-3">
                    {heroFeaturedProject.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {heroFeaturedProject.requiredSkills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-mono px-2 py-0.5 border border-[#273128] bg-[#101510] text-[#A0AAA0] rounded-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#273128] flex items-center justify-between">
                    <div>
                      <div className="text-base font-display font-bold text-[#F4F7F1] tabular-nums">
                        {formatMoneyRange(heroFeaturedProject.budgetMin, heroFeaturedProject.budgetMax, heroFeaturedProject.currency)}
                      </div>
                      <span className="text-[11px] font-mono text-[#A0AAA0]">
                        {heroFeaturedProject.paymentType} · {heroFeaturedProject.duration}
                      </span>
                    </div>

                    <Link to={`/freelance/${heroFeaturedProject.id}`}>
                      <Button size="sm" variant="secondary">
                        View Brief
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. MARKETPLACE SECONDARY NAVIGATION BAR */}
      <div
        id="marketplace-discovery"
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#273128] pb-3"
      >
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'discover', label: 'Discover Projects', count: projects.length },
            { id: 'services', label: 'Explore Services', count: servicePackages.length },
            {
              id: 'applications',
              label: 'My Applications',
              count: userApplications.length,
            },
            {
              id: 'my-projects',
              label: 'My Projects',
              count: userProjects.length,
            },
            { id: 'saved', label: 'Saved Projects', count: savedProjects.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#B6FF4A] text-[#080B09] font-bold shadow-sm'
                    : 'bg-transparent text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#141B15]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] tabular-nums ${
                    isActive ? 'text-[#080B09]' : 'text-[#A0AAA0]'
                  }`}
                >
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Link to="/freelance/create">
            <Button size="sm" variant="primary" rightIcon={<Plus className="w-3.5 h-3.5" />}>
              Post a Project
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. TAB CONTENT VIEWS */}

      {/* TAB 1: DISCOVER PROJECTS */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search, Categories, and Mobile Filter Toggle */}
          <div className="space-y-4">
            <AIOpportunitySearch
              onFilterChange={(f) => {
                setSearchQuery('');
                setAiKeywords(f.keywords || []);
                if (f.workMode) setSelectedWorkMode(f.workMode === 'On-site' ? 'On-site' : f.workMode);
                setMinBudgetFilter(f.minBudget ? String(f.minBudget) : '');
                setMaxBudgetFilter(f.maxBudget ? String(f.maxBudget) : '');
                setPaidOnly(false);
              }}
              onReset={handleResetFilters}
            />
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, skills or clients..."
                  leftIcon={<Search className="w-4 h-4 text-[#A0AAA0]" />}
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as 'relevant' | 'recent' | 'budget_desc' | 'budget_asc'
                    )
                  }
                  className="bg-[#101510] border border-[#273128] text-xs font-mono text-[#F4F7F1] px-3 py-2.5 rounded-xs focus:outline-none focus:border-[#B6FF4A] shrink-0"
                >
                  <option value="relevant">Sort: Most Relevant</option>
                  <option value="recent">Sort: Recently Posted</option>
                  <option value="budget_desc">Sort: Budget: High to Low</option>
                  <option value="budget_asc">Sort: Budget: Low to High</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="md:hidden shrink-0"
                  leftIcon={<Filter className="w-3.5 h-3.5" />}
                >
                  Filters
                </Button>
              </div>
            </div>

            {/* Category Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs border transition-colors cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#141B15] border-[#B6FF4A] text-[#B6FF4A] font-bold'
                      : 'bg-[#101510] border-[#273128] text-[#A0AAA0] hover:text-[#F4F7F1]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Granular Filter Row (Collapsible on mobile, always visible on desktop) */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-[#141B15] border border-[#273128] rounded-xs ${
              showMobileFilters ? 'block' : 'hidden md:grid'
            }`}
          >
            {/* Work Mode */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A0AAA0]">
                Work Mode
              </label>
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="w-full bg-[#101510] border border-[#273128] text-xs font-mono text-[#F4F7F1] px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-[#B6FF4A]"
              >
                <option value="All">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* Payment Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A0AAA0]">
                Payment Structure
              </label>
              <select
                value={selectedPaymentType}
                onChange={(e) => setSelectedPaymentType(e.target.value)}
                className="w-full bg-[#101510] border border-[#273128] text-xs font-mono text-[#F4F7F1] px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-[#B6FF4A]"
              >
                <option value="All">All Types</option>
                <option value="Fixed Price">Fixed Price</option>
                <option value="Hourly">Hourly</option>
                <option value="Per Deliverable">Per Deliverable</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A0AAA0]">
                Experience
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full bg-[#101510] border border-[#273128] text-xs font-mono text-[#F4F7F1] px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-[#B6FF4A]"
              >
                <option value="All">All Levels</option>
                <option value="Entry">Entry (Student)</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert Lead</option>
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A0AAA0]">
                Duration
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full bg-[#101510] border border-[#273128] text-xs font-mono text-[#F4F7F1] px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-[#B6FF4A]"
              >
                <option value="All">Any Duration</option>
                <option value="under-1-month">&lt; 1 month</option>
                <option value="1-3-months">1–3 months</option>
                <option value="3-months-plus">3+ months</option>
              </select>
            </div>

            {/* Min Budget */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#A0AAA0]">
                Min Budget (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={minBudgetFilter}
                onChange={(e) => setMinBudgetFilter(e.target.value)}
                className="w-full bg-[#101510] border border-[#273128] text-xs font-mono text-[#F4F7F1] px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-[#B6FF4A]"
              />
            </div>

            {/* Reset Action */}
            <div className="space-y-1 flex flex-col justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-1.5 px-3 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A] text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips & Results Count */}
          <div className="flex items-center justify-between text-xs font-mono text-[#A0AAA0] pt-1">
            <span>
              Displaying <strong className="text-[#F4F7F1]">{filteredProjects.length}</strong>{' '}
              verified project briefs
            </span>

            {(selectedCategory !== 'All' ||
              selectedWorkMode !== 'All' ||
              searchQuery ||
              minBudgetFilter ||
              maxBudgetFilter) && (
              <button
                onClick={handleResetFilters}
                className="text-[#B6FF4A] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onApplyClick={(p) => setActiveApplyProject(p)}
                />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-[#141B15] border border-[#273128] rounded-sm space-y-4">
              <Briefcase className="w-10 h-10 text-[#A0AAA0] mx-auto" />
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                No Projects Match Your Filter Parameters
              </h3>
              <p className="text-xs font-mono text-[#A0AAA0] max-w-sm mx-auto">
                Try widening your budget range, clearing specific category filters, or searching for alternative tech tags.
              </p>
              <Button size="sm" variant="outline" onClick={handleResetFilters}>
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPLORE SERVICES */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="p-6 bg-[#141B15] border border-[#273128] rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-[#F4F7F1]">
                Fixed-Scope Sprints & Commission Packages
              </h2>
              <p className="text-xs text-[#A0AAA0] mt-1">
                Skip lengthy scoping. Hire verified student specialists for turnkey deliverables with escrow assurance.
              </p>
            </div>

            <Link to="/talent">
              <Button size="sm" variant="secondary" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                Browse Full Talent Pool
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {servicePackages.map((srv) => (
              <Card
                key={srv.id}
                variant="interactive"
                className="p-6 bg-[#141B15] border border-[#273128] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono uppercase text-[#B6FF4A]">
                        {srv.category}
                      </span>
                      <h3 className="font-display font-bold text-lg text-[#F4F7F1] mt-0.5">
                        {srv.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-display font-bold text-[#F4F7F1] tabular-nums">
                        {formatMoney(srv.priceStarting, srv.currency)}
                      </span>
                      <span className="text-[10px] font-mono text-[#A0AAA0] block">
                        starting price
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#A0AAA0] leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {srv.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] font-mono px-2 py-0.5 border border-[#273128] bg-[#101510] text-[#A0AAA0] rounded-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#273128] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
                    <span className="flex items-center gap-1 text-[#F4F7F1]">
                      <Star className="w-3.5 h-3.5 text-[#B6FF4A] fill-[#B6FF4A]" />
                      <span className="font-bold">{srv.rating}</span>
                      <span>({srv.reviewsCount})</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#7CCB37]" /> {srv.deliveryDays}d delivery
                    </span>
                  </div>

                  <Link to={`/profile/${srv.freelancerId}`}>
                    <Button size="sm" variant="primary">
                      Commission Specialist
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#F4F7F1]">
              My Application Tracker
            </h2>
            <span className="text-xs font-mono text-[#A0AAA0]">
              {userApplications.length} proposals on record
            </span>
          </div>

          {userApplications.length > 0 ? (
            <div className="space-y-4">
              {userApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 bg-[#141B15] border border-[#273128] rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/freelance/${app.projectId}`}
                        className="font-display font-bold text-base text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors"
                      >
                        {app.projectTitle}
                      </Link>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 border rounded-xs uppercase ${
                          app.status === 'Accepted'
                            ? 'text-[#B6FF4A] bg-[#B6FF4A]/10 border-[#B6FF4A]/40'
                            : app.status === 'Shortlisted'
                            ? 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30'
                            : app.status === 'Rejected'
                            ? 'text-red-400 bg-red-950/30 border-red-500/30'
                            : app.status === 'Withdrawn'
                            ? 'text-[#A0AAA0] bg-[#101510] border-[#273128]'
                            : 'text-amber-300 bg-amber-950/30 border-amber-500/30'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
                      <span className="flex items-center gap-1 text-[#F4F7F1]">
                        <Building2 className="w-3.5 h-3.5 text-[#7CCB37]" />
                        {app.clientName}
                      </span>
                      <span>·</span>
                      <span>Proposed: {app.proposedBudget}</span>
                      <span>·</span>
                      <span>Timeline: {app.estimatedDuration}</span>
                      <span>·</span>
                      <span>Submitted: {app.createdAt}</span>
                    </div>

                    <p className="text-xs text-[#A0AAA0] line-clamp-1 italic pt-1">
                      "{app.coverLetter}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/freelance/${app.projectId}`}>
                      <Button size="sm" variant="outline">
                        View Brief
                      </Button>
                    </Link>

                    {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          withdrawApplication(app.id);
                          showToast('Application withdrawn.');
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-[#141B15] border border-[#273128] rounded-sm space-y-4">
              <Briefcase className="w-10 h-10 text-[#A0AAA0] mx-auto" />
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                No Applications Submitted Yet
              </h3>
              <p className="text-xs font-mono text-[#A0AAA0] max-w-sm mx-auto">
                Explore open project briefs and submit direct technical proposals to turn your abilities into income.
              </p>
              <Button size="sm" variant="primary" onClick={() => setActiveTab('discover')}>
                Discover Projects
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MY PROJECTS */}
      {activeTab === 'my-projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-[#F4F7F1]">
                My Client Project Briefs
              </h2>
              <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                Manage commissions you have posted and review proposals.
              </p>
            </div>

            <Link to="/freelance/create">
              <Button size="sm" variant="primary" rightIcon={<Plus className="w-3.5 h-3.5" />}>
                Post a New Project
              </Button>
            </Link>
          </div>

          {userProjects.length > 0 ? (
            <div className="space-y-4">
              {userProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-5 bg-[#141B15] border border-[#273128] rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/freelance/${p.id}`}
                        className="font-display font-bold text-base text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors truncate"
                      >
                        {p.title}
                      </Link>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 border rounded-xs uppercase ${
                          p.status === 'open'
                            ? 'text-[#B6FF4A] border-[#B6FF4A]/30 bg-[#B6FF4A]/10'
                            : 'text-[#A0AAA0] border-[#273128] bg-[#101510]'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
                      <span>Category: {p.category}</span>
                      <span>·</span>
                      <span>
                        Budget: {formatMoneyRange(p.budgetMin, p.budgetMax, p.currency)}
                      </span>
                      <span>·</span>
                      <span>Duration: {p.duration}</span>
                      <span>·</span>
                      <span className="text-[#B6FF4A] font-bold">
                        {p.applicantCount} proposals submitted
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setActiveManageProject(p)}
                    >
                      Manage Proposals ({p.applicantCount})
                    </Button>
                    <Link to={`/freelance/${p.id}`}>
                      <Button size="sm" variant="outline">
                        View Brief
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-[#141B15] border border-[#273128] rounded-sm space-y-4">
              <Building2 className="w-10 h-10 text-[#A0AAA0] mx-auto" />
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                No Projects Commissioned
              </h3>
              <p className="text-xs font-mono text-[#A0AAA0] max-w-sm mx-auto">
                Need talent for an MVP, brand identity, or engineering sprint? Commission your first brief in minutes.
              </p>
              <Link to="/freelance/create">
                <Button size="sm" variant="primary">
                  Commission a Project
                </Button>
              </Link>
            </div>
          )}

          {/* Freelancer Accepted Projects (if any) */}
          {userAcceptedProjects.length > 0 && (
            <div className="pt-8 border-t border-[#273128] space-y-4">
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                Projects You Are Delivering
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userAcceptedProjects.map((p) => (
                  <Card key={p.id} className="p-5 bg-[#141B15] border border-[#B6FF4A]/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-display font-bold text-base text-[#F4F7F1]">{p.title}</h4>
                      <span className="text-xs font-mono text-[#B6FF4A] font-bold">Active Sprint</span>
                    </div>
                    <p className="text-xs font-mono text-[#A0AAA0]">Client: {p.clientName}</p>
                    <Link to={`/freelance/${p.id}`}>
                      <Button size="sm" variant="outline">Open Workspace</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SAVED PROJECTS */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#F4F7F1]">
              Saved Projects ({savedProjects.length})
            </h2>
            <span className="text-xs font-mono text-[#A0AAA0]">
              Bookmarked briefs for review and submission
            </span>
          </div>

          {savedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onApplyClick={(p) => setActiveApplyProject(p)}
                />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-[#141B15] border border-[#273128] rounded-sm space-y-4">
              <Bookmark className="w-10 h-10 text-[#A0AAA0] mx-auto" />
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                No Saved Projects
              </h3>
              <p className="text-xs font-mono text-[#A0AAA0] max-w-sm mx-auto">
                Bookmark projects using the bookmark icon on any project card to review and apply later.
              </p>
              <Button size="sm" variant="primary" onClick={() => setActiveTab('discover')}>
                Explore Marketplace
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Global Modals */}
      <ApplyModal
        project={activeApplyProject}
        onClose={() => setActiveApplyProject(null)}
        onSuccess={() => showToast('Proposal transmitted successfully.')}
      />

      {activeManageProject && (
        <ApplicationManagementModal
          project={activeManageProject}
          onClose={() => setActiveManageProject(null)}
        />
      )}
    </div>
  );
};
