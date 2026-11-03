import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTeamUp } from '../context/TeamUpContext';
import {
  IdeaCategory,
  DevelopmentStage,
  TeamCompensationModel,
  IdeaOpenRole,
} from '../types';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Layers,
  Users,
  IndianRupee as DollarSign,
  Eye,
  Plus,
  Trash2,
  Sparkles,
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

const COMPENSATION_MODELS: TeamCompensationModel[] = [
  'Paid',
  'Equity-based',
  'Unpaid',
  'Volunteer',
  'Open to discussion',
];

export const CreateIdeaPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createIdea } = useTeamUp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // STEP 1: Basic Information
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [industry, setIndustry] = useState<IdeaCategory>('Technology');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');

  // STEP 2: Project Details
  const [developmentStage, setDevelopmentStage] = useState<DevelopmentStage>('Building MVP');
  const [targetAudience, setTargetAudience] = useState('');
  const [currentProgress, setCurrentProgress] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // STEP 3: Team Requirements (Multiple open roles)
  const [openRoles, setOpenRoles] = useState<
    Omit<IdeaOpenRole, 'id' | 'ideaId' | 'applicantCount'>[]
  >([
    {
      roleTitle: 'Founding Full-Stack Engineer',
      openings: 1,
      requiredSkills: ['React', 'Node.js', 'PostgreSQL'],
      responsibilities: ['Build MVP components and database models.'],
      experiencePreference: 'Proven portfolio or hackathon track record.',
      timeCommitment: '12 - 15 hrs / week',
      compensationModel: 'Equity-based',
      isOpen: true,
    },
  ]);

  // Temporary inputs for adding a new role
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleOpenings, setNewRoleOpenings] = useState(1);
  const [newRoleSkills, setNewRoleSkills] = useState('TypeScript, React, Tailwind CSS');
  const [newRoleCommitment, setNewRoleCommitment] = useState('10 - 15 hrs / week');
  const [newRoleComp, setNewRoleComp] = useState<TeamCompensationModel>('Equity-based');
  const [newRoleResp, setNewRoleResp] = useState('Architect core features and ship prototypes.');

  // STEP 4: Collaboration Terms
  const [compensationModel, setCompensationModel] = useState<TeamCompensationModel>('Equity-based');
  const [timeCommitment, setTimeCommitment] = useState('12 - 15 hrs / week');
  const [workMode, setWorkMode] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [location, setLocation] = useState('India / Remote');
  const [startDate, setStartDate] = useState('Immediate');

  const addRoleToIdea = () => {
    if (!newRoleTitle.trim()) return;
    const skillsArray = newRoleSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setOpenRoles([
      ...openRoles,
      {
        roleTitle: newRoleTitle.trim(),
        openings: newRoleOpenings,
        requiredSkills: skillsArray.length > 0 ? skillsArray : ['General Engineering'],
        responsibilities: [newRoleResp.trim() || 'Collaborate with the founding team.'],
        experiencePreference: 'Collegiate or independent builder background.',
        timeCommitment: newRoleCommitment,
        compensationModel: newRoleComp,
        isOpen: true,
      },
    ]);

    // Reset inputs
    setNewRoleTitle('');
    setNewRoleSkills('TypeScript, React');
  };

  const removeRole = (index: number) => {
    setOpenRoles(openRoles.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!title.trim()) {
        setError('Project or startup title is required.');
        return false;
      }
      if (!tagline.trim()) {
        setError('A concise tagline is required.');
        return false;
      }
      if (!description.trim()) {
        setError('Project description is required.');
        return false;
      }
      if (!problemStatement.trim()) {
        setError('Please explain the problem being solved.');
        return false;
      }
      if (!proposedSolution.trim()) {
        setError('Please explain your proposed solution.');
        return false;
      }
    }

    if (step === 2) {
      if (!targetAudience.trim()) {
        setError('Target audience description is required.');
        return false;
      }
      if (!currentProgress.trim()) {
        setError('Current progress status is required.');
        return false;
      }
    }

    if (step === 3) {
      if (openRoles.length === 0) {
        setError('Please add at least one open founding role.');
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalPublish = async () => {
    setError(null);
    setIsPublishing(true);

    try {
      // Gather all required skills across all roles
      const allSkillsSet = new Set<string>();
      openRoles.forEach((r) => r.requiredSkills.forEach((s) => allSkillsSet.add(s)));

      const created = createIdea({
        ownerId: user?.id || 'usr_demo_8829',
        ownerName: user?.fullName || 'Hamlin Jaiju',
        ownerAvatar: user?.avatarUrl,
        ownerHeadline: user?.bio || 'Collegiate Builder',
        ownerSkills: user?.skills || ['React', 'TypeScript', 'Rust'],
        ownerCollege: user?.institution || '',
        title: title.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        problemStatement: problemStatement.trim(),
        proposedSolution: proposedSolution.trim(),
        targetAudience: targetAudience.trim(),
        industry,
        developmentStage,
        currentProgress: currentProgress.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        workMode,
        location: location.trim(),
        timeCommitment,
        compensationModel,
        recruitmentStatus: 'Recruiting',
        requiredSkills: Array.from(allSkillsSet),
        openRoles: openRoles as any,
        isDemo: false,
      });

      navigate(`/teamup/ideas/${created.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to publish venture idea.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/teamup"
          className="text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to TeamUp</span>
        </Link>
        <span className="text-xs font-mono text-[#7CCB37]">
          Step {currentStep} of 5
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-[#141B15] border border-[#273128] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#B6FF4A] transition-all duration-300"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>

      {/* Title */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
          Venture Genesis Flow
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight mt-1">
          {currentStep === 1 && 'Step 1 · Basic Information'}
          {currentStep === 2 && 'Step 2 · Project Details & Velocity'}
          {currentStep === 3 && 'Step 3 · Team Requirements & Open Roles'}
          {currentStep === 4 && 'Step 4 · Collaboration Terms & Commitment'}
          {currentStep === 5 && 'Step 5 · Review & Confirm Publish'}
        </h1>
        <p className="text-xs font-mono text-[#A0AAA0] mt-1">
          Define your problem statement, needed technical capabilities, and collaboration structure.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Basic Information */}
      {currentStep === 1 && (
        <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-5 font-mono text-xs">
          <div>
            <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
              Project / Startup Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aetheria Protocol"
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
              Short Punchy Tagline <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Decentralized peer-to-peer compute orchestration for open AI models"
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
              Industry Category <span className="text-rose-400">*</span>
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as IdeaCategory)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
              Project Description & Mission <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the overarching vision, architectural stack, and what the venture accomplishes..."
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
                The Problem Statement <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="What critical friction or inefficiency does the market currently face?"
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
                Proposed Solution Architecture <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={proposedSolution}
                onChange={(e) => setProposedSolution(e.target.value)}
                placeholder="How does your technology or product specifically solve this problem?"
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Project Details */}
      {currentStep === 2 && (
        <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-5 font-mono text-xs">
          <div>
            <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
              Development Stage <span className="text-rose-400">*</span>
            </label>
            <select
              value={developmentStage}
              onChange={(e) => setDevelopmentStage(e.target.value as DevelopmentStage)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
            >
              {STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
              Target Audience / Users <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Collegiate AI researchers and independent ML labs"
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
              Current Progress / What has been built so far? <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={currentProgress}
              onChange={(e) => setCurrentProgress(e.target.value)}
              placeholder="e.g. Core P2P networking daemon compiles in Rust; initial 10-node testnet working..."
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
              Project Website, GitHub or Documentation URL (Optional)
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://github.com/your-project"
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
            />
          </div>
        </div>
      )}

      {/* STEP 3: Team Requirements (Multiple open roles) */}
      {currentStep === 3 && (
        <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-6 font-mono text-xs">
          <div>
            <span className="text-[10px] text-[#B6FF4A] uppercase block">Roster Blueprint</span>
            <h3 className="font-display font-bold text-xl text-[#F4F7F1]">
              Open Positions You Need to Fill ({openRoles.length})
            </h3>
          </div>

          {/* Existing Roles list */}
          <div className="space-y-3">
            {openRoles.map((role, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#141B15] border border-[#273128] rounded-sm flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F4F7F1]">{role.roleTitle}</span>
                    <span className="text-[10px] text-[#B6FF4A] bg-[#B6FF4A]/10 px-1.5 py-0.5 border border-[#B6FF4A]/30">
                      {role.compensationModel}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A0AAA0] mt-1">{role.timeCommitment}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {role.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="text-[9px] px-1.5 py-0.5 bg-[#101510] border border-[#273128] text-[#A0AAA0]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeRole(idx)}
                  className="p-1.5 text-[#A0AAA0] hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove Role"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Role Subsection */}
          <div className="p-4 bg-[#141B15]/60 border border-[#273128] rounded-sm space-y-3">
            <span className="text-[10px] uppercase text-[#7CCB37] font-bold block">
              + Add Another Open Position
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#A0AAA0] block mb-1">Role Title</label>
                <input
                  type="text"
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  placeholder="e.g. Founding Rust Systems Engineer"
                  className="w-full bg-[#101510] border border-[#273128] text-xs text-[#F4F7F1] p-2 rounded-sm outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A0AAA0] block mb-1">Time Commitment</label>
                <input
                  type="text"
                  value={newRoleCommitment}
                  onChange={(e) => setNewRoleCommitment(e.target.value)}
                  placeholder="e.g. 10 - 15 hrs / week"
                  className="w-full bg-[#101510] border border-[#273128] text-xs text-[#F4F7F1] p-2 rounded-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#A0AAA0] block mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  value={newRoleSkills}
                  onChange={(e) => setNewRoleSkills(e.target.value)}
                  placeholder="Rust, libp2p, WebAssembly"
                  className="w-full bg-[#101510] border border-[#273128] text-xs text-[#F4F7F1] p-2 rounded-sm outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A0AAA0] block mb-1">Compensation Model</label>
                <select
                  value={newRoleComp}
                  onChange={(e) => setNewRoleComp(e.target.value as TeamCompensationModel)}
                  className="w-full bg-[#101510] border border-[#273128] text-xs text-[#F4F7F1] p-2 rounded-sm outline-none"
                >
                  {COMPENSATION_MODELS.map((cmp) => (
                    <option key={cmp} value={cmp}>
                      {cmp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <Button type="button" size="sm" variant="secondary" onClick={addRoleToIdea}>
                Add Role to Roster
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Collaboration Terms */}
      {currentStep === 4 && (
        <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-5 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
                Venture Compensation Model <span className="text-rose-400">*</span>
              </label>
              <select
                value={compensationModel}
                onChange={(e) => setCompensationModel(e.target.value as TeamCompensationModel)}
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
              >
                {COMPENSATION_MODELS.map((cmp) => (
                  <option key={cmp} value={cmp}>
                    {cmp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
                Expected Weekly Hours <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={timeCommitment}
                onChange={(e) => setTimeCommitment(e.target.value)}
                placeholder="e.g. 10 - 15 hrs / week"
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka or Remote"
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A0AAA0] uppercase tracking-wider mb-1.5">
                Expected Start Date
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="e.g. Immediate / Next Sprint"
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none"
              />
            </div>
          </div>

          {/* Legal Disclaimer Box */}
          <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm space-y-2 text-[#A0AAA0] text-[11px] leading-relaxed">
            <span className="text-[#B6FF4A] uppercase font-bold block">
              Important Terms & Governance Notice
            </span>
            <p>
              Compensation and equity terms are supplied directly by the project owner and must be independently agreed upon in writing between collaborators. HUSTL does not guarantee equity ownership, cash payments, or employment relationships.
            </p>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Publish */}
      {currentStep === 5 && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-4 bg-[#B6FF4A]/10 border border-[#B6FF4A]/30 text-[#B6FF4A]">
            Review your startup opportunity before dispatching it to the public discovery feed.
          </div>

          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-[#B6FF4A] bg-[#B6FF4A]/10 px-2 py-0.5 border border-[#B6FF4A]/30 uppercase">
                {industry}
              </span>
              <span className="text-[10px] text-[#A0AAA0] bg-[#141B15] px-2 py-0.5 border border-[#273128] uppercase">
                {developmentStage}
              </span>
              <span className="text-[10px] text-[#A0AAA0] bg-[#141B15] px-2 py-0.5 border border-[#273128] uppercase">
                {workMode}
              </span>
            </div>

            <div>
              <h2 className="font-display font-black text-3xl text-[#F4F7F1]">{title}</h2>
              <p className="text-[#B6FF4A] text-sm mt-1">{tagline}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase text-[#A0AAA0] block">Mission Overview</span>
              <p className="text-[#F4F7F1] leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-[#141B15] border border-[#273128] rounded-sm">
              <div>
                <span className="text-[10px] text-[#A0AAA0] uppercase block">The Problem</span>
                <p className="text-[#F4F7F1] mt-1">{problemStatement}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#A0AAA0] uppercase block">Proposed Solution</span>
                <p className="text-[#F4F7F1] mt-1">{proposedSolution}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-[#A0AAA0] block mb-2">
                Open Founding Roles ({openRoles.length})
              </span>
              <div className="space-y-2">
                {openRoles.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#141B15] border border-[#273128] rounded-sm flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-[#F4F7F1]">{r.roleTitle}</span>
                      <p className="text-[#A0AAA0] text-[11px]">
                        {r.timeCommitment} · {r.compensationModel}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#B6FF4A]">
                      Skills: {r.requiredSkills.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-[#273128] flex items-center justify-between">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrevStep}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous Step
          </Button>
        ) : (
          <Link to="/teamup">
            <Button variant="ghost">Cancel</Button>
          </Link>
        )}

        {currentStep < 5 ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleNextStep}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue to Step {currentStep + 1}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            disabled={isPublishing}
            onClick={handleFinalPublish}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isPublishing ? 'Publishing Venture...' : 'Publish TeamUp Venture'}
          </Button>
        )}
      </div>
    </div>
  );
};
