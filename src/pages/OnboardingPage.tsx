import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, PlatformRole } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import {
  GraduationCap,
  Briefcase,
  UserCheck,
  Rocket,
  Building2,
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Plus,
  CheckCircle2,
  Star,
  MapPin,
  Globe,
  Github,
  Linkedin,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SUGGESTED_SKILLS = [
  'Web Development',
  'App Development',
  'UI/UX Design',
  'Graphic Design',
  'Video Editing',
  'Content Writing',
  'Digital Marketing',
  'Business Development',
  'Data Analytics',
  'Photography',
  'Finance',
  'Sales',
  'React',
  'TypeScript',
  'Rust',
  'Python',
];

const LOOKING_FOR_OPTIONS = [
  'Freelance projects',
  'Internships',
  'Full-time opportunities',
  'Part-time work',
  'Co-founders',
  'Startup teammates',
  'Collaborations',
  'Networking',
];

const AVAILABILITY_OPTIONS = [
  'Available now',
  'Part-time',
  'Weekends',
  'Not currently available',
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, saveRoles, updateProfileData, completeOnboarding } = useAuth();

  // Phase: 'roles' (Initial) or 1..5
  const [phase, setPhase] = useState<'roles' | 1 | 2 | 3 | 4 | 5>(
    user?.roles && user.roles.length > 0 ? 1 : 'roles'
  );

  // Form State
  const [selectedRoles, setSelectedRoles] = useState<PlatformRole[]>(
    user?.roles?.length ? user.roles : ['student', 'freelancer']
  );

  // Step 1: Basic Info
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [location, setLocation] = useState(user?.location || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [bio, setBio] = useState(
    user?.bio ||
      'Collegiate software engineer and systems architect passionate about high-velocity web apps and competitive digital products.'
  );

  // Step 2: Skills
  const [skills, setSkills] = useState<string[]>(
    user?.skills?.length ? user.skills : ['Web Development', 'UI/UX Design', 'React']
  );
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Step 3: Experience & Qualifications
  const [educationStatus, setEducationStatus] = useState(
    user?.education?.degree ? 'Undergraduate Student' : 'Student / Recent Graduate'
  );
  const [degree, setDegree] = useState(user?.education?.degree || 'B.S. Computer Science');
  const [graduationYear, setGraduationYear] = useState(user?.education?.graduationYear || '2026');
  const [experienceLevel, setExperienceLevel] = useState(user?.experience?.level || 'Intermediate (1-3 yrs)');
  const [previousExperience, setPreviousExperience] = useState(
    user?.experience?.previousExperience || 'Shipped frontend features for collegiate hackathon and local startup MVP.'
  );
  const [startupDetails, setStartupDetails] = useState(
    user?.experience?.startupDetails || 'Building a real-time developer telemetry radar.'
  );
  const [portfolioUrl, setPortfolioUrl] = useState(user?.preferences?.portfolioUrl || 'https://hamlin.dev');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.preferences?.linkedinUrl || 'https://linkedin.com');
  const [githubUrl, setGithubUrl] = useState(user?.preferences?.githubUrl || 'https://github.com/hamlin-dev');

  // Step 4: Availability & Interests
  const [lookingFor, setLookingFor] = useState<string[]>(
    user?.preferences?.lookingFor?.length
      ? user.preferences.lookingFor
      : ['Freelance projects', 'Co-founders']
  );
  const [availability, setAvailability] = useState<string>(
    user?.preferences?.availability || 'Available now'
  );

  const [saving, setSaving] = useState(false);

  // Role toggle
  const toggleRole = (role: PlatformRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Image upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Skills management
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const toggleLookingFor = (item: string) => {
    setLookingFor((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Submit and Complete Onboarding
  const handleFinalLaunch = async () => {
    setSaving(true);
    await saveRoles(selectedRoles);
    await updateProfileData({
      fullName,
      displayName,
      avatarUrl: avatarPreview,
      location,
      institution,
      bio,
      roles: selectedRoles,
      skills,
      education: {
        degree,
        graduationYear,
        institution,
      },
      experience: {
        level: experienceLevel,
        previousExperience,
        startupDetails: selectedRoles.includes('founder') ? startupDetails : undefined,
      },
      preferences: {
        lookingFor,
        availability,
        portfolioUrl,
        linkedinUrl,
        githubUrl,
      },
    });
    await completeOnboarding();
    setSaving(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* ============================================================ */}
      {/* ROLE SELECTION PHASE */}
      {/* ============================================================ */}
      {phase === 'roles' ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101510] border border-[#273128] rounded-xs">
              <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                STEP 01 // MULTI-ROLE SELECTION
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#F4F7F1] tracking-tight">
              WHAT BRINGS YOU TO HUSTL?
            </h1>

            <p className="text-base text-[#A0AAA0] leading-relaxed">
              Choose how you want to use the platform. You can select multiple roles and change them later.
            </p>
          </div>

          {/* 5 Selectable Role Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {[
              {
                id: 'student' as PlatformRole,
                title: 'STUDENT',
                description: 'I want to showcase my skills, discover opportunities and gain experience.',
                icon: <GraduationCap className="w-6 h-6" />,
              },
              {
                id: 'freelancer' as PlatformRole,
                title: 'FREELANCER',
                description: 'I want to offer services, find projects and work with clients.',
                icon: <Briefcase className="w-6 h-6" />,
              },
              {
                id: 'recruiter' as PlatformRole,
                title: 'RECRUITER',
                description: 'I want to discover talented people and recruit for my organisation.',
                icon: <UserCheck className="w-6 h-6" />,
              },
              {
                id: 'founder' as PlatformRole,
                title: 'STARTUP FOUNDER',
                description: 'I want to build a startup, find co-founders and assemble a team.',
                icon: <Rocket className="w-6 h-6" />,
              },
              {
                id: 'business_owner' as PlatformRole,
                title: 'BUSINESS OWNER',
                description: 'I want to find people for projects, services and business requirements.',
                icon: <Building2 className="w-6 h-6" />,
              },
            ].map((role) => {
              const isSelected = selectedRoles.includes(role.id);
              return (
                <div
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className={`p-6 bg-[#141B15] border rounded-sm transition-all duration-200 cursor-pointer select-none flex items-start gap-4 ${
                    isSelected
                      ? 'border-[#B6FF4A] shadow-[0_0_24px_-6px_rgba(182,255,74,0.18)] bg-[#172218]'
                      : 'border-[#273128] hover:border-[#A0AAA0]'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xs border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A]'
                        : 'bg-[#101510] text-[#A0AAA0] border-[#273128]'
                    }`}
                  >
                    {role.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-base text-[#F4F7F1]">
                        {role.title}
                      </h3>
                      {isSelected && (
                        <span className="w-5 h-5 bg-[#B6FF4A] text-[#080B09] flex items-center justify-center rounded-none shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#A0AAA0] mt-1 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Action */}
          <div className="pt-6 border-t border-[#273128] flex items-center justify-between">
            <span className="text-xs font-mono text-[#A0AAA0]">
              {selectedRoles.length} role{selectedRoles.length === 1 ? '' : 's'} selected
            </span>
            <Button
              size="lg"
              variant="primary"
              disabled={selectedRoles.length === 0}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                saveRoles(selectedRoles);
                setPhase(1);
              }}
            >
              Continue to Profile Setup
            </Button>
          </div>
        </motion.div>
      ) : (
        /* ============================================================ */
        /* MULTI-STEP PROFILE ONBOARDING */
        /* ============================================================ */
        <div className="space-y-8">
          {/* Top Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#B6FF4A] font-bold">
                STEP 0{phase} OF 05
              </span>
              <span className="text-[#A0AAA0]">
                {phase === 1 && 'Basic Information'}
                {phase === 2 && 'Skill Stack'}
                {phase === 3 && 'Experience & Credentials'}
                {phase === 4 && 'Availability & Intent'}
                {phase === 5 && 'Profile Preview'}
              </span>
            </div>

            {/* Progress segmented track */}
            <div className="grid grid-cols-5 gap-2 h-1.5 bg-[#101510] border border-[#273128] p-0.5 rounded-none">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`h-full transition-all duration-300 ${
                    step <= phase ? 'bg-[#B6FF4A]' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {phase === 1 && (
            <Card className="p-6 sm:p-10 bg-[#141B15] border-[#273128] space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#F4F7F1]">
                  BASIC INFORMATION
                </h2>
                <p className="text-xs font-mono text-[#A0AAA0] mt-1">
                  Tell the community who you are and where you build.
                </p>
              </div>

              {/* Photo Upload */}
              <div className="flex items-center gap-6 pb-4 border-b border-[#273128]">
                <div className="relative group">
                  <div className="w-20 h-20 bg-[#101510] border-2 border-[#273128] overflow-hidden flex items-center justify-center font-display font-extrabold text-2xl text-[#B6FF4A]">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      fullName.substring(0, 2).toUpperCase() || 'HU'
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A] text-xs font-mono text-[#F4F7F1] cursor-pointer rounded-xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#B6FF4A]" />
                    <span>Upload Profile Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] font-mono text-[#A0AAA0]">
                    PNG, JPG or WebP (max 4MB).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Elena Rostova"
                  required
                />
                <Input
                  label="Display Name / Handle"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="elena_dev"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Pune, Maharashtra, India"
                  required
                />
                <Input
                  label={
                    selectedRoles.includes('student')
                      ? 'College or University'
                      : selectedRoles.includes('recruiter')
                      ? 'Hiring Company / Organisation'
                      : 'Institution or Organisation'
                  }
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. IIT Madras, VIT Vellore, Nova Labs"
                  required
                />
              </div>

              <Textarea
                label="Short Bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Summarize your focus, stack, and what you are building."
                required
              />

              <div className="pt-4 border-t border-[#273128] flex justify-between">
                <Button size="md" variant="ghost" onClick={() => setPhase('roles')}>
                  Back to Roles
                </Button>
                <Button size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => setPhase(2)}>
                  Next: Add Skills
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Skills */}
          {phase === 2 && (
            <Card className="p-6 sm:p-10 bg-[#141B15] border-[#273128] space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#F4F7F1]">
                  SKILLS & EXPERTISE
                </h2>
                <p className="text-xs font-mono text-[#A0AAA0] mt-1">
                  Tag the tools, languages, and abilities you bring to projects.
                </p>
              </div>

              {/* Selected Skills */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-[#A0AAA0]">
                  Your Selected Skills ({skills.length}):
                </span>
                <div className="p-4 bg-[#101510] border border-[#273128] rounded-xs min-h-[70px] flex flex-wrap gap-2 items-center">
                  {skills.length > 0 ? (
                    skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141B15] border border-[#B6FF4A]/50 text-[#F4F7F1] text-xs font-mono rounded-xs"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(s)}
                          className="hover:text-red-400 focus:outline-none"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-mono text-[#A0AAA0]">
                      No skills added yet. Select from suggestions below or type a custom skill.
                    </span>
                  )}
                </div>
              </div>

              {/* Custom Skill Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type a custom skill (e.g. Solidity, Docker, Motion Graphic)..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(customSkillInput);
                    }
                  }}
                />
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => addSkill(customSkillInput)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add
                </Button>
              </div>

              {/* Suggested Skills */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono uppercase text-[#A0AAA0]">
                  Suggested Skills:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.map((suggested) => {
                    const isAdded = skills.includes(suggested);
                    return (
                      <button
                        key={suggested}
                        type="button"
                        onClick={() => (isAdded ? removeSkill(suggested) : addSkill(suggested))}
                        className={`px-3 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                          isAdded
                            ? 'bg-[#B6FF4A]/10 border-[#B6FF4A] text-[#B6FF4A]'
                            : 'bg-[#101510] border-[#273128] text-[#A0AAA0] hover:text-[#F4F7F1]'
                        }`}
                      >
                        {suggested} {isAdded ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#273128] flex justify-between">
                <Button size="md" variant="ghost" onClick={() => setPhase(1)}>
                  Back
                </Button>
                <Button size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => setPhase(3)}>
                  Next: Experience
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Experience & Qualifications */}
          {phase === 3 && (
            <Card className="p-6 sm:p-10 bg-[#141B15] border-[#273128] space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#F4F7F1]">
                  EXPERIENCE & CREDENTIALS
                </h2>
                <p className="text-xs font-mono text-[#A0AAA0] mt-1">
                  All fields are optional. Add relevant repositories or past projects.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Degree or Qualification"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.S. Computer Science / Self-Taught"
                />
                <Input
                  label="Graduation Year"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="e.g. 2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0] block">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-[#101510] text-sm text-[#F4F7F1] border border-[#273128] focus:border-[#B6FF4A] rounded-xs p-2.5 focus:outline-none font-mono"
                >
                  <option value="Beginner (0-1 yrs)">Beginner (0-1 yrs)</option>
                  <option value="Intermediate (1-3 yrs)">Intermediate (1-3 yrs)</option>
                  <option value="Advanced (3-5 yrs)">Advanced (3-5 yrs)</option>
                  <option value="Lead / Staff Builder (5+ yrs)">Lead / Staff Builder (5+ yrs)</option>
                </select>
              </div>

              {selectedRoles.includes('founder') && (
                <Textarea
                  label="Startup Vision & Target Market"
                  rows={2}
                  value={startupDetails}
                  onChange={(e) => setStartupDetails(e.target.value)}
                  placeholder="Describe the problem your venture solves and who you want to build it with."
                />
              )}

              <Textarea
                label="Prior Experience or Notable Output"
                rows={2}
                value={previousExperience}
                onChange={(e) => setPreviousExperience(e.target.value)}
                placeholder="Mention hackathon wins, shipped applications, client milestones or internships."
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Portfolio URL"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  leftIcon={<Globe className="w-4 h-4" />}
                />
                <Input
                  label="GitHub URL"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/handle"
                  leftIcon={<Github className="w-4 h-4" />}
                />
                <Input
                  label="LinkedIn URL"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/handle"
                  leftIcon={<Linkedin className="w-4 h-4" />}
                />
              </div>

              <div className="pt-4 border-t border-[#273128] flex justify-between">
                <Button size="md" variant="ghost" onClick={() => setPhase(2)}>
                  Back
                </Button>
                <Button size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => setPhase(4)}>
                  Next: Availability
                </Button>
              </div>
            </Card>
          )}

          {/* Step 4: Availability & Interests */}
          {phase === 4 && (
            <Card className="p-6 sm:p-10 bg-[#141B15] border-[#273128] space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-2xl text-[#F4F7F1]">
                  AVAILABILITY & INTENT
                </h2>
                <p className="text-xs font-mono text-[#A0AAA0] mt-1">
                  Specify what kinds of opportunities you want to unlock.
                </p>
              </div>

              {/* What are you looking for */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-[#A0AAA0] block">
                  What are you currently looking for? (Select multiple)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {LOOKING_FOR_OPTIONS.map((opt) => {
                    const selected = lookingFor.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleLookingFor(opt)}
                        className={`p-3 text-xs font-mono text-left rounded-xs border transition-colors cursor-pointer ${
                          selected
                            ? 'bg-[#B6FF4A]/10 border-[#B6FF4A] text-[#F4F7F1]'
                            : 'bg-[#101510] border-[#273128] text-[#A0AAA0] hover:border-[#A0AAA0]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {selected && <Check className="w-3.5 h-3.5 text-[#B6FF4A]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-3 pt-4 border-t border-[#273128]">
                <span className="text-xs font-mono uppercase text-[#A0AAA0] block">
                  What is your primary bandwidth?
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {AVAILABILITY_OPTIONS.map((avail) => (
                    <button
                      type="button"
                      key={avail}
                      onClick={() => setAvailability(avail)}
                      className={`p-3 text-xs font-mono text-left rounded-xs border transition-colors cursor-pointer ${
                        availability === avail
                          ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
                          : 'bg-[#101510] border-[#273128] text-[#A0AAA0] hover:text-[#F4F7F1]'
                      }`}
                    >
                      {avail}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#273128] flex justify-between">
                <Button size="md" variant="ghost" onClick={() => setPhase(3)}>
                  Back
                </Button>
                <Button size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => setPhase(5)}>
                  Review Profile
                </Button>
              </div>
            </Card>
          )}

          {/* Step 5: Profile Preview */}
          {phase === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-[#F4F7F1]">
                    PROFILE PREVIEW
                  </h2>
                  <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                    This is how other builders, founders, and scouts will view your profile.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setPhase(1)}>
                  Edit Information
                </Button>
              </div>

              {/* High-Impact Preview Card */}
              <Card className="p-8 bg-[#141B15] border-[#273128] space-y-6 glow-green-subtle">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#273128]">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#101510] border-2 border-[#B6FF4A] overflow-hidden flex items-center justify-center font-display font-extrabold text-2xl text-[#B6FF4A]">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        fullName.substring(0, 2).toUpperCase() || 'HU'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-2xl text-[#F4F7F1]">
                          {fullName}
                        </h3>
                        <span className="w-4 h-4 bg-[#B6FF4A] text-[#080B09] flex items-center justify-center rounded-none">
                          <Check className="w-3 h-3" />
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#A0AAA0]">@{displayName}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedRoles.map((r) => (
                      <span
                        key={r}
                        className="px-2.5 py-1 text-xs font-mono uppercase bg-[#101510] border border-[#B6FF4A]/40 text-[#B6FF4A] rounded-xs"
                      >
                        {r.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-[#A0AAA0]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B6FF4A]" /> {location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#A0AAA0]" /> {institution}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" /> {availability}
                  </div>
                </div>

                <p className="text-sm text-[#F4F7F1] leading-relaxed">
                  {bio}
                </p>

                {/* Skills tags */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase text-[#A0AAA0] block">
                    Demonstrated Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-mono px-2.5 py-1 bg-[#101510] border border-[#273128] text-[#F4F7F1] rounded-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Looking for strip */}
                <div className="p-3 bg-[#101510] border border-[#273128] rounded-xs flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A0AAA0]">Actively Seeking:</span>
                  <span className="text-[#B6FF4A] font-bold">
                    {lookingFor.join(', ') || 'Opportunities'}
                  </span>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <Button size="lg" variant="ghost" onClick={() => setPhase(4)}>
                  Back to Availability
                </Button>
                <Button
                  size="lg"
                  variant="primary"
                  isLoading={saving}
                  rightIcon={<Rocket className="w-4 h-4" />}
                  onClick={handleFinalLaunch}
                >
                  Launch My Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
