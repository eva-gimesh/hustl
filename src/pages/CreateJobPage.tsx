import { AIDraftPanel } from '../components/ai/AIDraftPanel';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRecruit } from '../context/RecruitContext';
import {
  JobCategory,
  JobEmploymentType,
  JobWorkMode,
  JobExperienceLevel,
  CustomQuestion,
} from '../types';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  IndianRupee as DollarSign,
  Calendar,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  AlertCircle,
  ShieldCheck,
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

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, saveRoles } = useAuth();
  const { companies, createJob, createCompany, getUserCompanies } = useRecruit();

  // Role check & seamless recruiter activation
  const isRecruiterOrFounder =
    user?.roles?.includes('recruiter') || user?.roles?.includes('founder');

  // Preview state
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Section A: Organisation
  const userCompanies = user ? getUserCompanies(user.id) : [];
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    userCompanies.length > 0 ? userCompanies[0].id : companies[0]?.id || ''
  );
  const [createNewCompany, setCreateNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('Deep-Tech & Software');
  const [newCompanySize, setNewCompanySize] = useState('1-10');
  const [newCompanyLocation, setNewCompanyLocation] = useState('Bengaluru, Karnataka');
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('');
  const [newCompanyTagline, setNewCompanyTagline] = useState('');

  // Section B: Role Details
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<JobCategory>('Engineering');
  const [employmentType, setEmploymentType] = useState<JobEmploymentType>('Internship');
  const [workMode, setWorkMode] = useState<JobWorkMode>('Remote');
  const [location, setLocation] = useState('Remote (India & Global)');
  const [openingsCount, setOpeningsCount] = useState<number>(1);
  const [experienceLevel, setExperienceLevel] = useState<JobExperienceLevel>('Student / Fresher');
  const [education, setEducation] = useState('Enrolled in CS, Engineering, Design or related discipline');
  const [overview, setOverview] = useState('');
  
  // Responsibilities (list)
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Design and develop high-performance product features with high autonomy.',
    'Participate in daily engineering reviews and architectural planning.',
  ]);
  const [newRespInput, setNewRespInput] = useState('');

  // Qualifications (list)
  const [qualifications, setQualifications] = useState<string[]>([
    'Demonstrated passion through personal or open-source software projects.',
    'Ability to debug independently and communicate technical tradeoffs.',
  ]);
  const [newQualInput, setNewQualInput] = useState('');

  // Skills
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['TypeScript', 'React']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [bonusSkills, setBonusSkills] = useState<string[]>(['Docker', 'PostgreSQL']);
  const [newBonusInput, setNewBonusInput] = useState('');

  // Section C: Compensation & Perks
  const [compensationType, setCompensationType] = useState<'Paid' | 'Unpaid'>('Paid');
  const [compensation, setCompensation] = useState('₹10,000 - ₹15,000 / month');
  const [benefits, setBenefits] = useState<string[]>([
    'Competitive paid monthly stipend',
    '1-on-1 mentorship with senior leadership',
    'Flexible remote hours',
  ]);
  const [newBenefitInput, setNewBenefitInput] = useState('');

  // Section D: Work Details & Timeline
  const [startDate, setStartDate] = useState('Immediate / Next Month');
  const [duration, setDuration] = useState('3 - 6 Months');
  const [applicationDeadline, setApplicationDeadline] = useState(
    new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [hiringProcess, setHiringProcess] = useState<string[]>([
    'Application review (48 hours)',
    'Technical walkthrough & discussion',
    'Offer extended',
  ]);
  const [newProcessInput, setNewProcessInput] = useState('');

  // Section E: Application Settings
  const [requiresResume, setRequiresResume] = useState(true);
  const [requiresCoverLetter, setRequiresCoverLetter] = useState(false);
  const [requiresPortfolio, setRequiresPortfolio] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([
    {
      id: 'q1',
      question: 'Link to a code repository or design portfolio you are proud of.',
      required: true,
    },
  ]);
  const [newQuestionInput, setNewQuestionInput] = useState('');

  // Load draft from localStorage
  useEffect(() => {
    try {
      const draft = localStorage.getItem('hustl_job_creation_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.overview) setOverview(parsed.overview);
        if (parsed.compensation) setCompensation(parsed.compensation);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveDraft = () => {
    try {
      localStorage.setItem(
        'hustl_job_creation_draft',
        JSON.stringify({ title, overview, compensation, category, employmentType })
      );
      alert('Draft saved to browser storage!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleActivateRecruiterRole = async () => {
    if (!user) return;
    const currentRoles = user.roles || [];
    if (!currentRoles.includes('recruiter')) {
      await saveRoles([...currentRoles, 'recruiter']);
    }
  };

  const addResponsibility = () => {
    if (newRespInput.trim()) {
      setResponsibilities([...responsibilities, newRespInput.trim()]);
      setNewRespInput('');
    }
  };

  const removeResponsibility = (idx: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== idx));
  };

  const addQualification = () => {
    if (newQualInput.trim()) {
      setQualifications([...qualifications, newQualInput.trim()]);
      setNewQualInput('');
    }
  };

  const removeQualification = (idx: number) => {
    setQualifications(qualifications.filter((_, i) => i !== idx));
  };

  const addSkill = () => {
    if (newSkillInput.trim() && !requiredSkills.includes(newSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const removeSkill = (sk: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== sk));
  };

  const addBonusSkill = () => {
    if (newBonusInput.trim() && !bonusSkills.includes(newBonusInput.trim())) {
      setBonusSkills([...bonusSkills, newBonusInput.trim()]);
      setNewBonusInput('');
    }
  };

  const removeBonusSkill = (sk: string) => {
    setBonusSkills(bonusSkills.filter((s) => s !== sk));
  };

  const addBenefit = () => {
    if (newBenefitInput.trim()) {
      setBenefits([...benefits, newBenefitInput.trim()]);
      setNewBenefitInput('');
    }
  };

  const removeBenefit = (idx: number) => {
    setBenefits(benefits.filter((_, i) => i !== idx));
  };

  const addHiringStep = () => {
    if (newProcessInput.trim()) {
      setHiringProcess([...hiringProcess, newProcessInput.trim()]);
      setNewProcessInput('');
    }
  };

  const removeHiringStep = (idx: number) => {
    setHiringProcess(hiringProcess.filter((_, i) => i !== idx));
  };

  const addCustomQuestion = () => {
    if (newQuestionInput.trim()) {
      setCustomQuestions([
        ...customQuestions,
        {
          id: `cq-${Date.now()}`,
          question: newQuestionInput.trim(),
          required: true,
        },
      ]);
      setNewQuestionInput('');
    }
  };

  const removeCustomQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== id));
  };

  const validate = () => {
    setError(null);
    if (!title.trim()) {
      setError('Job title is required');
      return false;
    }
    if (!overview.trim()) {
      setError('Role overview and description is required');
      return false;
    }
    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill');
      return false;
    }
    if (!compensation.trim()) {
      setError('Compensation or stipend details are required');
      return false;
    }
    if (createNewCompany && !newCompanyName.trim()) {
      setError('Company name is required');
      return false;
    }
    return true;
  };

  const handlePublish = async () => {
    if (!validate()) return;

    setIsPublishing(true);
    try {
      let finalCompanyId = selectedCompanyId;
      let finalCompanyName = '';

      if (createNewCompany) {
        const createdComp = createCompany({
          name: newCompanyName.trim(),
          tagline: newCompanyTagline || `${newCompanyIndustry} startup`,
          description: `An innovative ${newCompanyIndustry} team building in ${newCompanyLocation}.`,
          industry: newCompanyIndustry,
          location: newCompanyLocation,
          website: newCompanyWebsite || undefined,
          size: newCompanySize,
          foundedYear: '2024',
          verified: true,
          ownerId: user?.id || 'usr_demo_8829',
          isDemo: false,
        });
        finalCompanyId = createdComp.id;
        finalCompanyName = createdComp.name;
      } else {
        const matched = companies.find((c) => c.id === selectedCompanyId);
        finalCompanyName = matched ? matched.name : 'Startup';
      }

      const newJob = createJob({
        companyId: finalCompanyId,
        companyName: finalCompanyName,
        creatorId: user?.id || 'usr_demo_8829',
        companyIndustry: newCompanyIndustry,
        companySize: newCompanySize,
        companyLocation: location,
        companyVerified: true,
        title: title.trim(),
        category,
        employmentType,
        workMode,
        location,
        compensation,
        compensationType,
        experienceLevel,
        education,
        requiredSkills,
        bonusSkills,
        overview,
        responsibilities,
        qualifications,
        benefits,
        hiringProcess,
        openingsCount,
        applicationDeadline: new Date(applicationDeadline).toISOString(),
        startDate,
        duration,
        requiresResume,
        requiresCoverLetter,
        requiresPortfolio,
        customQuestions,
        status: 'open',
        isDemo: false,
      });

      // Clear draft
      localStorage.removeItem('hustl_job_creation_draft');

      navigate(`/recruit/opportunities/${newJob.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to publish opening');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/recruit"
          className="text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recruitment</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={saveDraft}>
            Save Draft
          </Button>
          <Button
            variant={isPreview ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            {isPreview ? 'Edit Form' : 'Preview Listing'}
          </Button>
        </div>
      </div>

      {/* Recruiter Role Banner if user isn't recruiter yet */}
      {!isRecruiterOrFounder && (
        <div className="p-4 bg-[#141B15] border border-[#B6FF4A]/40 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-[#B6FF4A] font-bold uppercase tracking-wider block">
              Recruiter Mode Activation
            </span>
            <p className="text-[#A0AAA0]">
              Posting this opening will instantly enable recruiter management tools on your profile.
            </p>
          </div>
          <button
            onClick={handleActivateRecruiterRole}
            className="px-3 py-1.5 bg-[#B6FF4A] text-[#080B09] font-bold rounded-sm shrink-0 hover:bg-[#a3f033] transition-colors cursor-pointer"
          >
            Activate Now
          </button>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview View or Form View */}
      {isPreview ? (
        <div className="space-y-6">
          <div className="p-4 bg-[#B6FF4A]/10 border border-[#B6FF4A]/30 text-xs font-mono text-[#B6FF4A]">
            You are in preview mode. This is how candidates will view your recruitment opening.
          </div>

          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#B6FF4A] bg-[#B6FF4A]/10 px-2 py-0.5 border border-[#B6FF4A]/30 uppercase">
                {category}
              </span>
              <span className="text-[10px] font-mono text-[#A0AAA0] bg-[#141B15] px-2 py-0.5 border border-[#273128] uppercase">
                {employmentType}
              </span>
              <span className="text-[10px] font-mono text-[#A0AAA0] bg-[#141B15] px-2 py-0.5 border border-[#273128] uppercase">
                {workMode}
              </span>
            </div>

            <h1 className="font-display font-black text-3xl text-[#F4F7F1]">
              {title || 'Untitled Opening'}
            </h1>

            <div className="text-xs font-mono text-[#A0AAA0]">
              <span>{location}</span> · <span className="text-[#B6FF4A] font-bold">{compensation}</span> · <span>{openingsCount} Openings</span>
            </div>

            <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm text-xs font-mono space-y-2">
              <span className="text-[10px] text-[#A0AAA0] uppercase block">Overview</span>
              <p className="text-[#F4F7F1] leading-relaxed whitespace-pre-wrap">
                {overview || 'No description provided yet.'}
              </p>
            </div>

            <div>
              <span className="text-xs font-mono text-[#A0AAA0] block mb-2 uppercase">Required Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.map((sk) => (
                  <span key={sk} className="text-xs font-mono px-2.5 py-1 bg-[#141B15] border border-[#273128] text-[#F4F7F1]">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#273128] flex justify-between">
              <Button variant="secondary" onClick={() => setIsPreview(false)}>
                Back to Editing
              </Button>
              <Button variant="primary" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? 'Publishing...' : 'Confirm & Publish'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="space-y-8">
          <div>
            <h1 className="font-display font-black text-3xl text-[#F4F7F1] tracking-tight">
              Publish an Opening
            </h1>
            <p className="text-sm font-mono text-[#A0AAA0] mt-1">
              Connect with top student talent, engineers, and apprentices across colleges.
            </p>
          </div>

          {/* Section A: Organisation Information */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#273128] pb-3">
              <Building2 className="w-4 h-4 text-[#B6FF4A]" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#F4F7F1]">
                Section A · Organisation Identity
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-[#A0AAA0]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="companyChoice"
                  checked={!createNewCompany}
                  onChange={() => setCreateNewCompany(false)}
                  className="accent-[#B6FF4A]"
                />
                <span>Select Existing Organisation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="companyChoice"
                  checked={createNewCompany}
                  onChange={() => setCreateNewCompany(true)}
                  className="accent-[#B6FF4A]"
                />
                <span>Create New Company Profile</span>
              </label>
            </div>

            {!createNewCompany ? (
              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Organisation Name
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.industry})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                    Company Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Apex AI Labs"
                    className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={newCompanyIndustry}
                    onChange={(e) => setNewCompanyIndustry(e.target.value)}
                    placeholder="e.g. Fintech & AI"
                    className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                    Headquarters / Location
                  </label>
                  <input
                    type="text"
                    value={newCompanyLocation}
                    onChange={(e) => setNewCompanyLocation(e.target.value)}
                    placeholder="e.g. Pune, Maharashtra or Remote"
                    className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={newCompanyWebsite}
                    onChange={(e) => setNewCompanyWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <AIDraftPanel
            kind="job"
            onApply={(r) => {
              if (r.title) setTitle(r.title);
              if (r.overview) setOverview(r.overview);
              if (r.responsibilities?.length) setResponsibilities(r.responsibilities);
              if (r.qualifications?.length) setQualifications(r.qualifications);
              if (r.requiredSkills?.length) setRequiredSkills(r.requiredSkills);
              if (r.bonusSkills?.length) setBonusSkills(r.bonusSkills);
            }}
          />

          {/* Section B: Role Details */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 border-b border-[#273128] pb-3">
              <Briefcase className="w-4 h-4 text-[#B6FF4A]" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#F4F7F1]">
                Section B · Role Specifications
              </h2>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                Job Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Systems Intern"
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as JobCategory)}
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as JobEmploymentType)}
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as JobWorkMode)}
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                >
                  {WORK_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote or Hyderabad, Telangana"
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Openings Count</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={openingsCount}
                  onChange={(e) => setOpeningsCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as JobExperienceLevel)}
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                >
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                Role Overview <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="Explain the mission, tech stack, and what the applicant will build..."
                className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
              />
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                Required Technical Skills <span className="text-rose-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 bg-[#141B15] border border-[#273128] text-[#F4F7F1]"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(sk)}
                      className="text-[#A0AAA0] hover:text-rose-400 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Type skill & press Enter or Add (e.g. Node.js)"
                  className="flex-1 bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                />
                <Button type="button" size="sm" variant="secondary" onClick={addSkill}>
                  Add Skill
                </Button>
              </div>
            </div>

            {/* Responsibilities list builder */}
            <div>
              <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                Key Responsibilities
              </label>
              <div className="space-y-2 mb-2">
                {responsibilities.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-[#141B15] border border-[#273128] rounded-sm text-xs font-mono text-[#F4F7F1]">
                    <span>• {r}</span>
                    <button
                      type="button"
                      onClick={() => removeResponsibility(idx)}
                      className="text-[#A0AAA0] hover:text-rose-400 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRespInput}
                  onChange={(e) => setNewRespInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                  placeholder="Add responsibility item..."
                  className="flex-1 bg-[#141B15] border border-[#273128] text-xs text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                />
                <Button type="button" size="sm" variant="secondary" onClick={addResponsibility}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Section C: Compensation & Perks */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#273128] pb-3">
              <DollarSign className="w-4 h-4 text-[#B6FF4A]" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#F4F7F1]">
                Section C · Compensation & Perks
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Compensation Specification <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={compensation}
                  onChange={(e) => setCompensation(e.target.value)}
                  placeholder="e.g. ₹10,000 - ₹15,000 / month, ₹4.5 LPA, or Unpaid"
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Type</label>
                <select
                  value={compensationType}
                  onChange={(e) => setCompensationType(e.target.value as 'Paid' | 'Unpaid')}
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                >
                  <option value="Paid">Paid (Recommended)</option>
                  <option value="Unpaid">Unpaid / College Credit Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Benefits / Perks</label>
              <div className="space-y-2 mb-2">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-[#141B15] border border-[#273128] rounded-sm text-xs font-mono text-[#F4F7F1]">
                    <span>✓ {b}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(idx)}
                      className="text-[#A0AAA0] hover:text-rose-400 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBenefitInput}
                  onChange={(e) => setNewBenefitInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  placeholder="e.g. ₹5,000 internet reimbursement"
                  className="flex-1 bg-[#141B15] border border-[#273128] text-xs text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                />
                <Button type="button" size="sm" variant="secondary" onClick={addBenefit}>
                  Add Perk
                </Button>
              </div>
            </div>
          </div>

          {/* Section D: Work Details & Timeline */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#273128] pb-3">
              <Calendar className="w-4 h-4 text-[#B6FF4A]" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#F4F7F1]">
                Section D · Work Details & Timeline
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Start Date</label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="e.g. Immediate or Summer 2026"
                  className="w-full bg-[#141B15] border border-[#273128] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 3 Months or Permanent"
                  className="w-full bg-[#141B15] border border-[#273128] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">Application Deadline</label>
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  className="w-full bg-[#141B15] border border-[#273128] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section E: Application Settings */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 border-b border-[#273128] pb-3">
              <Settings className="w-4 h-4 text-[#B6FF4A]" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#F4F7F1]">
                Section E · Application Requirements & Screening Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <label className="flex items-center gap-2 p-3 bg-[#141B15] border border-[#273128] rounded-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresResume}
                  onChange={(e) => setRequiresResume(e.target.checked)}
                  className="accent-[#B6FF4A]"
                />
                <span className="text-[#F4F7F1]">Resume Mandatory</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-[#141B15] border border-[#273128] rounded-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresCoverLetter}
                  onChange={(e) => setRequiresCoverLetter(e.target.checked)}
                  className="accent-[#B6FF4A]"
                />
                <span className="text-[#F4F7F1]">Cover Note Mandatory</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-[#141B15] border border-[#273128] rounded-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresPortfolio}
                  onChange={(e) => setRequiresPortfolio(e.target.checked)}
                  className="accent-[#B6FF4A]"
                />
                <span className="text-[#F4F7F1]">Portfolio Mandatory</span>
              </label>
            </div>

            {/* Custom Questions List */}
            <div>
              <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                Custom Candidate Screening Questions
              </label>
              <div className="space-y-2 mb-2">
                {customQuestions.map((q, idx) => (
                  <div key={q.id} className="flex items-center justify-between p-2.5 bg-[#141B15] border border-[#273128] rounded-sm text-xs font-mono text-[#F4F7F1]">
                    <span>{idx + 1}. {q.question}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomQuestion(q.id)}
                      className="text-[#A0AAA0] hover:text-rose-400 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestionInput}
                  onChange={(e) => setNewQuestionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomQuestion())}
                  placeholder="Add custom question (e.g. Share a link to a project you built)..."
                  className="flex-1 bg-[#141B15] border border-[#273128] text-xs text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                />
                <Button type="button" size="sm" variant="secondary" onClick={addCustomQuestion}>
                  Add Question
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/recruit')}>
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setIsPreview(true)}>
                Preview First
              </Button>
              <Button variant="primary" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? 'Publishing...' : 'Publish Opening'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
