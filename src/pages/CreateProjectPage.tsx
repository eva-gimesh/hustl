import { AIDraftPanel } from '../components/ai/AIDraftPanel';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFreelance } from '../context/FreelanceContext';
import {
  FreelanceCategory,
  FreelancePaymentType,
  FreelanceCompensationType,
  FreelanceExperienceLevel,
  FreelanceWorkMode,
} from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ProjectCard } from '../components/freelance/ProjectCard';
import {
  ArrowLeft,
  Plus,
  X,
  Eye,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES: FreelanceCategory[] = [
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

const DRAFT_STORAGE_KEY = 'hustl_freelance_draft_v2';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { createProject } = useFreelance();

  // Basic Information
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FreelanceCategory>('Development');
  const [description, setDescription] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([
    'Functional responsive UI with modular components',
    'Cleanly documented code repository and build script',
  ]);

  // Skills & Experience
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['React', 'TypeScript']);
  const [experienceLevel, setExperienceLevel] =
    useState<FreelanceExperienceLevel>('Intermediate');

  // Compensation
  const [compensationType, setCompensationType] =
    useState<FreelanceCompensationType>('Paid');
  const [paymentType, setPaymentType] =
    useState<FreelancePaymentType>('Fixed Price');
  const [currency, setCurrency] = useState('₹');
  const [budgetMin, setBudgetMin] = useState<number>(10000);
  const [budgetMax, setBudgetMax] = useState<number>(15000);

  // Timeline
  const [duration, setDuration] = useState('2–3 weeks');
  const [applicationDeadline, setApplicationDeadline] = useState('2026-11-30');
  const [startDate, setStartDate] = useState('Immediate');

  // Work Details
  const [workMode, setWorkMode] = useState<FreelanceWorkMode>('Remote');
  const [location, setLocation] = useState('Remote (IST)');
  const [freelancersCount, setFreelancersCount] = useState<number>(1);
  const [preferredCommunication, setPreferredCommunication] = useState('HUSTL Messages & Discord');

  // Status & Modes
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.title) setTitle(d.title);
        if (d.category) setCategory(d.category);
        if (d.description) setDescription(d.description);
        if (d.deliverables) setDeliverables(d.deliverables);
        if (d.requiredSkills) setRequiredSkills(d.requiredSkills);
        if (d.budgetMin) setBudgetMin(d.budgetMin);
        if (d.budgetMax) setBudgetMax(d.budgetMax);
        if (d.duration) setDuration(d.duration);
      }
    } catch (e) {
      console.error('Failed to load draft', e);
    }
  }, []);

  const saveDraft = () => {
    try {
      const draft = {
        title,
        category,
        description,
        deliverables,
        requiredSkills,
        budgetMin,
        budgetMax,
        duration,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 2200);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleAddDeliverable = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = deliverableInput.trim();
    if (trimmed && !deliverables.includes(trimmed)) {
      setDeliverables([...deliverables, trimmed]);
      setDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.length < 10) {
      setError('Please provide a descriptive project title (minimum 10 characters).');
      return;
    }

    if (!description.trim() || description.length < 30) {
      setError('Please provide an in-depth project description (minimum 30 characters).');
      return;
    }

    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill tag.');
      return;
    }

    if (budgetMax < budgetMin) {
      setError('Maximum budget cannot be less than minimum budget.');
      return;
    }

    const newProject = createProject({
      ownerId: user?.id || 'demo-client-user',
      clientName: user?.fullName || 'Ambitious Founder Co.',
      clientDescription:
        user?.bio || 'Early-stage technology venture building on the HUSTL ecosystem.',
      clientLocation: user?.location || location,
      clientJoinedDate: 'Active Operator',
      clientVerified: false,
      clientPublishedProjectsCount: 1,
      title: title.trim(),
      description: description.trim(),
      category,
      requiredSkills,
      deliverables,
      requirements: [
        `Demonstrated experience in ${requiredSkills.slice(0, 2).join(' & ')}`,
        'Proven record of delivering to sprint deadlines',
        'Transparent async communication',
      ],
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      currency,
      paymentType,
      compensationType,
      experienceLevel,
      duration,
      workMode,
      location,
      freelancersCount: Number(freelancersCount),
      applicationDeadline,
      startDate,
      preferredCommunication,
      status: 'open',
      isDemo: false,
    });

    // Clear draft
    localStorage.removeItem(DRAFT_STORAGE_KEY);

    navigate(`/freelance/${newProject.id}`);
  };

  return (
    <div className="w-full py-10 space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Toast Notice */}
      <AnimatePresence>
        {draftSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50 bg-[#141B15] border border-[#B6FF4A] text-xs font-mono text-[#F4F7F1] px-4 py-3 rounded-xs shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#B6FF4A]" />
            <span>Draft saved to local workspace.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273128] pb-4">
        <Link
          to="/freelance"
          className="flex items-center gap-2 text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={saveDraft}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>

          <Button
            size="sm"
            variant={previewMode ? 'secondary' : 'outline'}
            onClick={() => setPreviewMode(!previewMode)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            {previewMode ? 'Edit Mode' : 'Preview Brief'}
          </Button>
        </div>
      </div>

      {/* Title banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
            Project Creation Engine
          </span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight">
          Commission a High-Velocity Project.
        </h1>
        <p className="text-sm text-[#A0AAA0]">
          Post your technical brief to the verified student and specialized freelance vanguard.
        </p>
      </div>

      {/* Auth Banner if Guest */}
      {!isAuthenticated && (
        <div className="p-4 bg-[#141B15] border border-amber-500/30 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#A0AAA0]">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>You are creating as a guest. Authenticate to claim full ownership of this project.</span>
          </div>
          <Link to="/login" className="shrink-0">
            <Button size="sm" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      )}

      {/* Live Preview Mode or Form */}
      {previewMode ? (
        <div className="space-y-6">
          <div className="p-3 bg-[#101510] border border-[#273128] text-xs font-mono text-[#A0AAA0] flex items-center justify-between">
            <span>Live Marketplace Card Preview:</span>
            <span className="text-[#B6FF4A]">How builders will see your listing</span>
          </div>

          <div className="max-w-xl mx-auto">
            <ProjectCard
              project={{
                id: 'preview-id',
                ownerId: user?.id || 'preview-user',
                clientName: user?.fullName || 'Your Organization',
                clientDescription: user?.bio || 'Hiring on HUSTL',
                clientLocation: location,
                clientJoinedDate: 'Active',
                clientVerified: false,
                clientPublishedProjectsCount: 1,
                title: title || 'Untitled Project Brief',
                description: description || 'No description provided yet.',
                category,
                requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['React'],
                deliverables,
                requirements: [],
                budgetMin: Number(budgetMin) || 0,
                budgetMax: Number(budgetMax) || 0,
                currency,
                paymentType,
                compensationType,
                experienceLevel,
                duration,
                workMode,
                location,
                freelancersCount,
                applicationDeadline,
                status: 'open',
                applicantCount: 0,
                postedDate: 'Just now',
                isDemo: false,
              }}
            />
          </div>

          <div className="flex justify-center pt-4">
            <Button size="md" variant="primary" onClick={handleSubmit}>
              Publish This Project Now
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AIDraftPanel
            kind="project"
            onApply={(r) => {
              if (r.title) setTitle(r.title);
              if (r.description) setDescription(r.description);
              if (r.deliverables?.length) setDeliverables(r.deliverables);
              if (r.recommendedSkills?.length) setRequiredSkills(r.recommendedSkills);
              if (r.suggestedDuration) setDuration(r.suggestedDuration);
            }}
          />

          {/* Section 1: Basic Information */}
          <Card className="p-6 sm:p-8 bg-[#141B15] border border-[#273128] space-y-6">
            <h2 className="font-display font-bold text-lg text-[#F4F7F1] flex items-center gap-2">
              <span className="text-xs font-mono text-[#B6FF4A]">01</span>
              <span>Basic Information</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Project Title *
                </label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build a Responsive E-commerce Website, Smart Contract Audit..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FreelanceCategory)}
                    className="w-full bg-[#101510] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3.5 py-2.5 text-xs text-[#F4F7F1] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#141B15]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                    Work Mode *
                  </label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as FreelanceWorkMode)}
                    className="w-full bg-[#101510] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3.5 py-2.5 text-xs text-[#F4F7F1] focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Detailed Project Description *
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide clear technical scope, architecture context, business objectives, and performance expectations..."
                  className="w-full bg-[#101510] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3.5 py-2.5 text-xs text-[#F4F7F1] placeholder-[#A0AAA0]/50 focus:outline-none font-sans leading-relaxed"
                />
              </div>

              {/* Deliverables Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Key Deliverables
                </label>
                <div className="flex gap-2">
                  <Input
                    value={deliverableInput}
                    onChange={(e) => setDeliverableInput(e.target.value)}
                    placeholder="e.g. Deployed Vercel frontend, automated GitHub CI workflow..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => handleAddDeliverable()}
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {deliverables.map((deliv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-[#101510] border border-[#273128] rounded-xs text-xs font-mono text-[#F4F7F1]"
                    >
                      <span className="truncate pr-2">{deliv}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-[#A0AAA0] hover:text-red-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Skills & Experience */}
          <Card className="p-6 sm:p-8 bg-[#141B15] border border-[#273128] space-y-6">
            <h2 className="font-display font-bold text-lg text-[#F4F7F1] flex items-center gap-2">
              <span className="text-xs font-mono text-[#B6FF4A]">02</span>
              <span>Skills & Experience Requirements</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Required Skills *
                </label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. React, Node.js, Figma, Premiere Pro..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => handleAddSkill()}
                  >
                    Add Skill
                  </Button>
                </div>

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#101510] border border-[#273128] text-xs font-mono text-[#F4F7F1] rounded-xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-[#A0AAA0] hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                    Experience Level Required
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) =>
                      setExperienceLevel(e.target.value as FreelanceExperienceLevel)
                    }
                    className="w-full bg-[#101510] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3.5 py-2.5 text-xs text-[#F4F7F1] focus:outline-none"
                  >
                    <option value="Entry">Entry (Student / Emerging Builder)</option>
                    <option value="Intermediate">Intermediate (Demonstrated Products)</option>
                    <option value="Expert">Expert (Lead Architect / Specialist)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                    Freelancers Required
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={freelancersCount}
                    onChange={(e) => setFreelancersCount(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Compensation & Budget */}
          <Card className="p-6 sm:p-8 bg-[#141B15] border border-[#273128] space-y-6">
            <h2 className="font-display font-bold text-lg text-[#F4F7F1] flex items-center gap-2">
              <span className="text-xs font-mono text-[#B6FF4A]">03</span>
              <span>Compensation & Budget</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Payment Structure
                </label>
                <select
                  value={paymentType}
                  onChange={(e) =>
                    setPaymentType(e.target.value as FreelancePaymentType)
                  }
                  className="w-full bg-[#101510] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3.5 py-2.5 text-xs text-[#F4F7F1] focus:outline-none"
                >
                  <option value="Fixed Price">Fixed Price (Milestones)</option>
                  <option value="Hourly">Hourly Rate</option>
                  <option value="Per Deliverable">Per Deliverable</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#101510] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3.5 py-2.5 text-xs text-[#F4F7F1] focus:outline-none"
                >
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD) — international</option>
                  <option value="€">€ (EUR)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Compensation Type
                </label>
                <select
                  value={compensationType}
                  onChange={(e) =>
                    setCompensationType(e.target.value as FreelanceCompensationType)
                  }
                  className="w-full bg-[#101510] border border-[#273128] focus:border-[#B6FF4A] rounded-xs px-3.5 py-2.5 text-xs text-[#F4F7F1] focus:outline-none"
                >
                  <option value="Paid">Paid Project</option>
                  <option value="Unpaid">Unpaid / Pro-bono</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Minimum Budget ({currency}) *
                </label>
                <Input
                  type="number"
                  required
                  min={0}
                  step={500}
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Maximum Budget ({currency}) *
                </label>
                <Input
                  type="number"
                  required
                  min={0}
                  step={500}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

          {/* Section 4: Timeline & Details */}
          <Card className="p-6 sm:p-8 bg-[#141B15] border border-[#273128] space-y-6">
            <h2 className="font-display font-bold text-lg text-[#F4F7F1] flex items-center gap-2">
              <span className="text-xs font-mono text-[#B6FF4A]">04</span>
              <span>Timeline & Collaboration</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Estimated Duration
                </label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2–3 weeks, 1 month"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Application Deadline
                </label>
                <Input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Project Start Date
                </label>
                <Input
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="e.g. Immediate, Dec 1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Location / Timezone
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote (IST friendly) or Bangalore"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Preferred Communication
                </label>
                <Input
                  value={preferredCommunication}
                  onChange={(e) => setPreferredCommunication(e.target.value)}
                  placeholder="e.g. HUSTL Chat, Discord, Slack"
                />
              </div>
            </div>
          </Card>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#273128] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-[#A0AAA0]">
              All briefs undergo escrow validation prior to sprint dispatch.
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="md"
                variant="outline"
                type="button"
                onClick={() => setPreviewMode(true)}
              >
                Preview Brief
              </Button>
              <Button
                size="md"
                variant="primary"
                type="submit"
                rightIcon={<Send className="w-4 h-4" />}
              >
                Publish Project
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
