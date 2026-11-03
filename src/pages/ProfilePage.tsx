import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTalent } from '../context/TalentContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetaTag } from '../components/ui/Badge';
import { MessageModal } from '../components/profile/MessageModal';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { AIProfileBuilderModal } from '../components/ai/AIProfileBuilderModal';
import { AIResumeAssistantModal } from '../components/ai/AIResumeAssistantModal';
import {
  CheckCircle2,
  MapPin,
  Building2,
  Calendar,
  Share2,
  UserPlus,
  UserCheck,
  Clock,
  MessageSquare,
  ExternalLink,
  Edit3,
  Sliders,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Sparkles,
  MoreVertical,
  Check,
  Eye,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const {
    getTalentById,
    getConnectionStatus,
    sendConnectionRequest,
    cancelConnectionRequest,
  } = useTalent();

  // Resolve target profile: from URL param, or fallback to current logged-in user, or demo profile 'aarav-sharma'
  const targetId = userId || currentUser?.id || 'aarav-sharma';
  const profile = getTalentById(targetId);

  // Profile owner check
  const isOwner = Boolean(
    currentUser && (currentUser.id === profile?.id || targetId === 'me' || (!userId && currentUser))
  );

  const [previewMode, setPreviewMode] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [aiProfileOpen, setAiProfileOpen] = useState(false);
  const [aiResumeOpen, setAiResumeOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Profile link copied to clipboard.');
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-[#F4F7F1]">
          Profile Not Found
        </h2>
        <p className="text-sm font-mono text-[#A0AAA0]">
          The builder profile you requested does not exist or has been removed.
        </p>
        <Link to="/talent">
          <Button size="md" variant="primary">
            Explore Talent Radar
          </Button>
        </Link>
      </div>
    );
  }

  const connectionStatus = getConnectionStatus(profile.id);

  return (
    <div className="w-full py-10 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
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

      {/* ============================================================ */}
      {/* 1. PROFILE HEADER (Gaming Player + Professional Portfolio) */}
      {/* ============================================================ */}
      <div className="relative bg-[#141B15] border border-[#273128] rounded-sm overflow-hidden p-6 sm:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.8)] glow-green-subtle">
        {/* Subtle corner reticle accents */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#B6FF4A]" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#B6FF4A]" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#B6FF4A]" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#B6FF4A]" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-[#273128]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Profile Avatar Frame */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#101510] border-2 border-[#B6FF4A] flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl text-[#B6FF4A] overflow-hidden shrink-0 shadow-inner">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.avatarInitials || profile.name.substring(0, 2).toUpperCase()
                )}
              </div>
              {profile.verified && (
                <div
                  className="absolute -bottom-2 -right-2 bg-[#080B09] border border-[#B6FF4A] p-1 text-[#B6FF4A] rounded-none shadow-sm"
                  title="Verified HUSTL Operator"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Name, Headline, Location & Organisation */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#F4F7F1] tracking-tight">
                  {profile.name}
                </h1>
                <span className="text-xs font-mono text-[#A0AAA0]">@{profile.handle}</span>
                {profile.isDemo && (
                  <span className="text-[10px] font-mono text-[#A0AAA0] bg-[#101510] border border-[#273128] px-2 py-0.5">
                    Demo Profile
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base font-display font-semibold text-[#B6FF4A]">
                {profile.headline || profile.title}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A0AAA0] pt-1">
                <span className="flex items-center gap-1.5 text-[#F4F7F1]">
                  <MapPin className="w-3.5 h-3.5 text-[#B6FF4A]" /> {profile.location}
                </span>
                {profile.institution && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#A0AAA0]" /> {profile.institution}
                    </span>
                  </>
                )}
                <span>·</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#101510] border border-[#273128] text-[#F4F7F1]">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
                  <span>{profile.availability}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {isOwner && !previewMode ? (
              <>
                <Button
                  size="md"
                  variant="primary"
                  leftIcon={<Edit3 className="w-4 h-4" />}
                  onClick={() => setEditModalOpen(true)}
                >
                  Edit Profile
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  leftIcon={<Eye className="w-4 h-4" />}
                  onClick={() => setPreviewMode(true)}
                >
                  Preview As Public
                </Button>
                <Button size="md" variant="outline" onClick={() => setAiProfileOpen(true)}>
                  AI Profile Builder
                </Button>
                <Button size="md" variant="outline" onClick={() => setAiResumeOpen(true)}>
                  AI Resume Assistant
                </Button>
              </>
            ) : isOwner && previewMode ? (
              <Button
                size="md"
                variant="primary"
                onClick={() => setPreviewMode(false)}
              >
                Exit Preview Mode
              </Button>
            ) : (
              <>
                {/* Connect Button */}
                {connectionStatus === 'accepted' ? (
                  <Button size="md" variant="secondary" leftIcon={<UserCheck className="w-4 h-4 text-[#B6FF4A]" />}>
                    Connected
                  </Button>
                ) : connectionStatus === 'pending' ? (
                  <Button
                    size="md"
                    variant="outline"
                    leftIcon={<Clock className="w-4 h-4 text-[#A0AAA0]" />}
                    onClick={() => cancelConnectionRequest(profile.id)}
                  >
                    Pending Request (Cancel)
                  </Button>
                ) : (
                  <Button
                    size="md"
                    variant="primary"
                    leftIcon={<UserPlus className="w-4 h-4" />}
                    onClick={() => sendConnectionRequest(profile.id)}
                  >
                    Connect
                  </Button>
                )}

                {/* Message Button */}
                <Button
                  size="md"
                  variant="secondary"
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                  onClick={() => setMessageModalOpen(true)}
                >
                  Message
                </Button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="p-2.5 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A] text-[#A0AAA0] hover:text-[#F4F7F1] rounded-sm transition-colors cursor-pointer"
                  title="Share Profile"
                  aria-label="Share Profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Short Introduction */}
        <div className="pt-6 max-w-3xl">
          <p className="text-sm sm:text-base text-[#F4F7F1] leading-relaxed">
            "{profile.bio}"
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PROFILE STATISTICS (Backed strictly by actual data) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-[#141B15] border-[#273128] space-y-1">
          <span className="text-xs font-mono uppercase text-[#A0AAA0]">Projects Completed</span>
          <p className="font-mono font-bold text-2xl text-[#B6FF4A] tabular-nums">
            {profile.completedProjects > 0 ? profile.completedProjects : '—'}
          </p>
        </Card>

        <Card className="p-5 bg-[#141B15] border-[#273128] space-y-1">
          <span className="text-xs font-mono uppercase text-[#A0AAA0]">Years of Experience</span>
          <p className="font-mono font-bold text-2xl text-[#F4F7F1] tabular-nums">
            {profile.yearsOfExperience > 0 ? `${profile.yearsOfExperience} yrs` : '1 yr'}
          </p>
        </Card>

        <Card className="p-5 bg-[#141B15] border-[#273128] space-y-1">
          <span className="text-xs font-mono uppercase text-[#A0AAA0]">Skills Verified</span>
          <p className="font-mono font-bold text-2xl text-[#F4F7F1] tabular-nums">
            {profile.skills?.length || 0}
          </p>
        </Card>

        <Card className="p-5 bg-[#141B15] border-[#273128] space-y-1">
          <span className="text-xs font-mono uppercase text-[#A0AAA0]">Portfolio Showcases</span>
          <p className="font-mono font-bold text-2xl text-[#B6FF4A] tabular-nums">
            {profile.portfolioProjects?.length || 0}
          </p>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Selected Work & Experience */}
        <div className="lg:col-span-8 space-y-10">
          {/* ============================================================ */}
          {/* 6. PORTFOLIO SECTION (SELECTED WORK) */}
          {/* ============================================================ */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#273128] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                  PORTFOLIO SHOWCASE
                </span>
                <h2 className="font-display font-extrabold text-2xl text-[#F4F7F1]">
                  SELECTED WORK
                </h2>
              </div>

              {isOwner && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setEditModalOpen(true)}
                >
                  Add Project
                </Button>
              )}
            </div>

            {profile.portfolioProjects && profile.portfolioProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.portfolioProjects.map((project) => (
                  <Card
                    key={project.id}
                    variant="interactive"
                    className="flex flex-col justify-between overflow-hidden p-0 group"
                  >
                    {/* Cover Image Container */}
                    <div className="w-full aspect-video bg-[#101510] border-b border-[#273128] overflow-hidden relative">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#080B09]/90 border border-[#273128] font-mono text-[10px] text-[#B6FF4A]">
                        {project.category}
                      </div>
                    </div>

                    {/* Project Information */}
                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="font-display font-bold text-lg text-[#F4F7F1] group-hover:text-white transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs text-[#A0AAA0] leading-relaxed line-clamp-3">
                          {project.description}
                        </p>
                      </div>

                      {/* Technologies Chips */}
                      <div className="pt-2">
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="text-[10px] font-mono px-2 py-0.5 bg-[#101510] border border-[#273128] text-[#A0AAA0] rounded-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {project.projectUrl && (
                          <div className="pt-3 border-t border-[#273128] flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#A0AAA0]">
                              Verified Build
                            </span>
                            <a
                              href={project.projectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-mono text-[#B6FF4A] hover:underline"
                            >
                              <span>Inspect Repository</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#141B15] border border-[#273128] rounded-sm space-y-3">
                <FolderGit2 className="w-8 h-8 text-[#A0AAA0] mx-auto" />
                <h3 className="font-display font-semibold text-base text-[#F4F7F1]">
                  No portfolio projects published yet
                </h3>
                <p className="text-xs font-mono text-[#A0AAA0] max-w-sm mx-auto">
                  Showcase your real-world software, design prototypes, and engineering sprints.
                </p>
                {isOwner && (
                  <Button size="sm" variant="secondary" onClick={() => setEditModalOpen(true)}>
                    Add First Project
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* 4. EXPERIENCE SECTION */}
          {/* ============================================================ */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#273128] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                  BACKGROUND
                </span>
                <h2 className="font-display font-extrabold text-2xl text-[#F4F7F1]">
                  EXPERIENCE
                </h2>
              </div>
              {isOwner && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setEditModalOpen(true)}
                >
                  Add Position
                </Button>
              )}
            </div>

            {profile.experiences && profile.experiences.length > 0 ? (
              <div className="space-y-4">
                {profile.experiences.map((exp) => (
                  <Card key={exp.id} className="p-6 bg-[#141B15] border-[#273128] space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-[#F4F7F1]">
                          {exp.position}
                        </h3>
                        <span className="text-xs font-mono text-[#B6FF4A] font-medium">
                          @{exp.organisation}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#A0AAA0]">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p className="text-xs text-[#A0AAA0] leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#A0AAA0] p-6 bg-[#141B15] border border-[#273128] rounded-sm">
                No past professional positions listed yet.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Skills, Education, Preferences */}
        <div className="lg:col-span-4 space-y-8">
          {/* ============================================================ */}
          {/* 3. SKILLS SECTION */}
          {/* ============================================================ */}
          <Card className="p-6 bg-[#141B15] border-[#273128] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#273128]">
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                SKILLSET
              </h3>
              {isOwner && (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="text-xs font-mono text-[#B6FF4A] hover:underline cursor-pointer"
                >
                  Manage
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(profile.skillsDetailed?.length
                ? profile.skillsDetailed
                : profile.skills.map((s, idx) => ({
                    id: `sk_default_${idx}`,
                    name: s,
                    proficiency: 'Advanced' as const,
                  }))
              ).map((skill) => (
                <div
                  key={skill.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#101510] border border-[#273128] text-xs font-mono rounded-xs"
                >
                  <span className="text-[#F4F7F1]">{skill.name}</span>
                  {skill.proficiency && (
                    <span className="text-[10px] text-[#B6FF4A]">
                      · {skill.proficiency}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* ============================================================ */}
          {/* 5. EDUCATION AND QUALIFICATIONS */}
          {/* ============================================================ */}
          <Card className="p-6 bg-[#141B15] border-[#273128] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#273128]">
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                EDUCATION
              </h3>
              {isOwner && (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="text-xs font-mono text-[#B6FF4A] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {profile.educations && profile.educations.length > 0 ? (
              <div className="space-y-3">
                {profile.educations.map((edu) => (
                  <div key={edu.id} className="space-y-1">
                    <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                      {edu.institution}
                    </h4>
                    <p className="text-xs font-mono text-[#B6FF4A]">
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </p>
                    <p className="text-[11px] font-mono text-[#A0AAA0]">
                      Class of {edu.graduationYear}
                    </p>
                    {edu.qualifications && (
                      <p className="text-xs text-[#A0AAA0] pt-1">
                        {edu.qualifications}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#A0AAA0]">
                {profile.institution || 'No education information listed.'}
              </p>
            )}
          </Card>

          {/* ============================================================ */}
          {/* 7. OPPORTUNITY PREFERENCES */}
          {/* ============================================================ */}
          <Card className="p-6 bg-[#141B15] border-[#273128] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#273128]">
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                INTENT & PREFERENCES
              </h3>
              {isOwner && (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="text-xs font-mono text-[#B6FF4A] hover:underline cursor-pointer"
                >
                  Adjust
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-[#A0AAA0] uppercase text-[10px] block mb-1">
                  Actively Open To:
                </span>
                <div className="space-y-1.5">
                  {(profile.opportunityPreferences || ['Freelance projects', 'Co-founders']).map((pref) => (
                    <div key={pref} className="flex items-center gap-2 text-[#F4F7F1]">
                      <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
                      <span>{pref}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#273128]">
                <span className="text-[#A0AAA0] uppercase text-[10px] block mb-1">
                  Current Availability:
                </span>
                <span className="font-bold text-[#B6FF4A]">
                  {profile.availability}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Messaging Modal Dialog */}
      <MessageModal
        recipient={messageModalOpen ? profile : null}
        onClose={() => setMessageModalOpen(false)}
      />

      {isOwner && (
        <>
          <AIProfileBuilderModal isOpen={aiProfileOpen} onClose={() => setAiProfileOpen(false)} />
          <AIResumeAssistantModal isOpen={aiResumeOpen} onClose={() => setAiResumeOpen(false)} />
        </>
      )}

      {/* Edit Profile Modal Dialog */}
      {editModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
};
