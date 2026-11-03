import React, { useState } from 'react';
import {
  TalentProfile,
  SkillItem,
  ExperienceItem,
  EducationItem,
  PortfolioProject,
  ProficiencyLevel,
} from '../../types';
import { useTalent } from '../../context/TalentContext';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Sliders,
} from 'lucide-react';
import { PORTFOLIO_COVERS } from '../../data/mockData';

interface EditProfileModalProps {
  profile: TalentProfile;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, onClose }) => {
  const {
    updateTalentProfile,
    addSkillToProfile,
    removeSkillFromProfile,
    addExperienceToProfile,
    deleteExperienceFromProfile,
    addEducationToProfile,
    deleteEducationFromProfile,
    addPortfolioProject,
    deletePortfolioProject,
  } = useTalent();

  const [activeTab, setActiveTab] = useState<'general' | 'skills' | 'experience' | 'education' | 'portfolio'>('general');

  // General fields
  const [headline, setHeadline] = useState(profile.headline || profile.title);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [institution, setInstitution] = useState(profile.institution || '');
  const [availability, setAvailability] = useState(profile.availability);
  const [yearsOfExp, setYearsOfExp] = useState(profile.yearsOfExperience || 2);

  // New Skill Form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<ProficiencyLevel>('Advanced');

  // New Experience Form
  const [expPosition, setExpPosition] = useState('');
  const [expOrg, setExpOrg] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [expCurrent, setExpCurrent] = useState(false);

  // New Education Form
  const [eduInst, setEduInst] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduYear, setEduYear] = useState('');

  // New Portfolio Project Form
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projCategory, setProjCategory] = useState('Web Application');
  const [projUrl, setProjUrl] = useState('');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateTalentProfile(profile.id, {
      headline,
      bio,
      location,
      institution,
      availability,
      yearsOfExperience: Number(yearsOfExp),
    });
    onClose();
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    addSkillToProfile(profile.id, {
      id: `sk_${Date.now()}`,
      name: newSkillName.trim(),
      proficiency: newSkillProficiency,
    });
    setNewSkillName('');
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expPosition.trim() || !expOrg.trim()) return;
    addExperienceToProfile(profile.id, {
      position: expPosition.trim(),
      organisation: expOrg.trim(),
      description: expDesc.trim(),
      startDate: expStart.trim() || '2025',
      endDate: expCurrent ? 'Present' : expEnd.trim() || '2026',
      current: expCurrent,
    });
    setExpPosition('');
    setExpOrg('');
    setExpDesc('');
    setExpStart('');
    setExpEnd('');
    setExpCurrent(false);
  };

  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduInst.trim() || !eduDegree.trim()) return;
    addEducationToProfile(profile.id, {
      institution: eduInst.trim(),
      degree: eduDegree.trim(),
      fieldOfStudy: eduField.trim(),
      graduationYear: eduYear.trim() || '2026',
    });
    setEduInst('');
    setEduDegree('');
    setEduField('');
    setEduYear('');
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const techArray = projTech.split(',').map((t) => t.trim()).filter(Boolean);
    addPortfolioProject(profile.id, {
      title: projTitle.trim(),
      description: projDesc.trim(),
      category: projCategory,
      coverImage: PORTFOLIO_COVERS.designSystem,
      technologies: techArray.length ? techArray : ['React', 'TypeScript'],
      projectUrl: projUrl.trim() || 'https://github.com',
    });
    setProjTitle('');
    setProjDesc('');
    setProjTech('');
    setProjUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B09]/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#141B15] border border-[#273128] rounded-sm shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-6 border-b border-[#273128] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#B6FF4A]" />
            <h3 className="font-display font-bold text-xl text-[#F4F7F1]">
              Edit Profile & Credentials
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#A0AAA0] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#273128] overflow-x-auto text-xs font-mono">
          {[
            { id: 'general', label: 'General Info' },
            { id: 'skills', label: 'Skillset' },
            { id: 'experience', label: 'Experience' },
            { id: 'education', label: 'Education' },
            { id: 'portfolio', label: 'Portfolio' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#B6FF4A] text-[#B6FF4A]'
                  : 'border-transparent text-[#A0AAA0] hover:text-[#F4F7F1]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <Input
                label="Professional Headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Full-stack Developer | Student Entrepreneur"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Waterloo, ON / Remote"
                  required
                />
                <Input
                  label="College or Organisation"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="University of Waterloo"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-[#A0AAA0] block">
                    Availability Status
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full bg-[#101510] text-[#F4F7F1] border border-[#273128] focus:border-[#B6FF4A] p-2.5 rounded-xs font-mono text-xs focus:outline-none"
                  >
                    <option value="Available now">Available now</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Not currently available">Not currently available</option>
                  </select>
                </div>

                <Input
                  label="Years of Experience"
                  type="number"
                  min="0"
                  max="40"
                  value={yearsOfExp}
                  onChange={(e) => setYearsOfExp(Number(e.target.value))}
                />
              </div>

              <Textarea
                label="Short Introduction / Bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Building digital products and turning ideas into working solutions."
                required
              />

              <div className="pt-4 flex justify-end gap-3 border-t border-[#273128]">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save General Info
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Existing Skills */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-[#A0AAA0] block">
                  Current Skills Listed:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(profile.skillsDetailed?.length
                    ? profile.skillsDetailed
                    : profile.skills.map((s, idx) => ({
                        id: `sk_gen_${idx}`,
                        name: s,
                        proficiency: 'Intermediate' as ProficiencyLevel,
                      }))
                  ).map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-[#101510] border border-[#273128] text-xs font-mono text-[#F4F7F1] rounded-xs"
                    >
                      <span>{skill.name}</span>
                      {skill.proficiency && (
                        <span className="text-[10px] text-[#B6FF4A] bg-[#141B15] px-1 rounded-none">
                          {skill.proficiency}
                        </span>
                      )}
                      <button
                        onClick={() => removeSkillFromProfile(profile.id, skill.id)}
                        className="text-[#A0AAA0] hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Add Skill Form */}
              <form onSubmit={handleAddSkill} className="p-4 bg-[#101510] border border-[#273128] rounded-xs space-y-4">
                <span className="text-xs font-mono uppercase text-[#B6FF4A] font-bold block">
                  Add New Skill
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Skill name (e.g. Next.js, Rust, Figma)..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                  />
                  <select
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(e.target.value as ProficiencyLevel)}
                    className="w-full bg-[#141B15] text-[#F4F7F1] border border-[#273128] focus:border-[#B6FF4A] p-2.5 rounded-xs font-mono text-xs focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <Button type="submit" size="sm" variant="secondary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Append Skill
                </Button>
              </form>
            </div>
          )}

          {/* TAB 3: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              {/* Existing Experience List */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-[#A0AAA0] block">
                  Listed Positions ({profile.experiences?.length || 0}):
                </span>
                {profile.experiences?.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-[#101510] border border-[#273128] rounded-xs flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                          {exp.position}
                        </h4>
                        <span className="text-xs font-mono text-[#B6FF4A]">
                          @{exp.organisation}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p className="text-xs text-[#A0AAA0] mt-1.5 line-clamp-2">
                        {exp.description}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteExperienceFromProfile(profile.id, exp.id)}
                      className="text-[#A0AAA0] hover:text-red-400 p-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Experience Form */}
              <form onSubmit={handleAddExperience} className="p-4 bg-[#101510] border border-[#273128] rounded-xs space-y-4">
                <span className="text-xs font-mono uppercase text-[#B6FF4A] font-bold block">
                  Add Professional or Freelance Experience
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Position (e.g. Lead Frontend Engineer)"
                    value={expPosition}
                    onChange={(e) => setExpPosition(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Organisation / Client"
                    value={expOrg}
                    onChange={(e) => setExpOrg(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
                  <Input
                    placeholder="Start Date (e.g. 2024)"
                    value={expStart}
                    onChange={(e) => setExpStart(e.target.value)}
                  />
                  <Input
                    placeholder="End Date"
                    value={expEnd}
                    disabled={expCurrent}
                    onChange={(e) => setExpEnd(e.target.value)}
                  />
                  <label className="flex items-center gap-2 text-xs font-mono text-[#A0AAA0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={expCurrent}
                      onChange={(e) => setExpCurrent(e.target.checked)}
                      className="accent-[#B6FF4A]"
                    />
                    <span>Current Position</span>
                  </label>
                </div>
                <Textarea
                  placeholder="Key accomplishments and technologies..."
                  rows={2}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                />
                <Button type="submit" size="sm" variant="secondary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Save Position
                </Button>
              </form>
            </div>
          )}

          {/* TAB 4: EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-[#A0AAA0] block">
                  Education & Qualifications:
                </span>
                {profile.educations?.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 bg-[#101510] border border-[#273128] rounded-xs flex items-start justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                        {edu.institution}
                      </h4>
                      <p className="text-xs font-mono text-[#B6FF4A] mt-0.5">
                        {edu.degree} · {edu.fieldOfStudy}
                      </p>
                      <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                        Graduation: {edu.graduationYear}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEducationFromProfile(profile.id, edu.id)}
                      className="text-[#A0AAA0] hover:text-red-400 p-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Education Form */}
              <form onSubmit={handleAddEducation} className="p-4 bg-[#101510] border border-[#273128] rounded-xs space-y-4">
                <span className="text-xs font-mono uppercase text-[#B6FF4A] font-bold block">
                  Add Education Entry
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Institution (e.g. IIT Madras)"
                    value={eduInst}
                    onChange={(e) => setEduInst(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Degree (e.g. B.S.)"
                    value={eduDegree}
                    onChange={(e) => setEduDegree(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Field of Study"
                    value={eduField}
                    onChange={(e) => setEduField(e.target.value)}
                  />
                  <Input
                    placeholder="Graduation Year"
                    value={eduYear}
                    onChange={(e) => setEduYear(e.target.value)}
                  />
                </div>
                <Button type="submit" size="sm" variant="secondary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Save Education
                </Button>
              </form>
            </div>
          )}

          {/* TAB 5: PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase text-[#A0AAA0] block">
                  Uploaded Portfolio Projects ({profile.portfolioProjects?.length || 0}):
                </span>
                {profile.portfolioProjects?.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 bg-[#101510] border border-[#273128] rounded-xs flex items-start justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                        {proj.title}
                      </h4>
                      <span className="text-xs font-mono text-[#B6FF4A]">
                        {proj.category}
                      </span>
                      <p className="text-xs text-[#A0AAA0] mt-1 line-clamp-2">
                        {proj.description}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePortfolioProject(profile.id, proj.id)}
                      className="text-[#A0AAA0] hover:text-red-400 p-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Project Form */}
              <form onSubmit={handleAddProject} className="p-4 bg-[#101510] border border-[#273128] rounded-xs space-y-4">
                <span className="text-xs font-mono uppercase text-[#B6FF4A] font-bold block">
                  Add New Portfolio Showcase
                </span>
                <Input
                  placeholder="Project Title (e.g. Decentralized Invariant Engine)"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Technologies (comma separated)"
                    value={projTech}
                    onChange={(e) => setProjTech(e.target.value)}
                  />
                  <Input
                    placeholder="External Project URL / GitHub"
                    value={projUrl}
                    onChange={(e) => setProjUrl(e.target.value)}
                  />
                </div>
                <Textarea
                  placeholder="Project description, architecture, and results..."
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                />
                <Button type="submit" size="sm" variant="secondary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add to Portfolio
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
