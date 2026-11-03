import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTalent } from '../context/TalentContext';
import { TalentProfile } from '../types';
import { Button } from '../components/ui/Button';
import {
  Search,
  Filter,
  GraduationCap,
  MapPin,
  Clock,
  Briefcase,
  ExternalLink,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  X,
} from 'lucide-react';

export const RecruitTalentPage: React.FC = () => {
  const { talentList, getConnectionStatus, sendConnectionRequest } = useTalent();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedGradYear, setSelectedGradYear] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [hasPortfolioOnly, setHasPortfolioOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Message modal simulation
  const [messageRecipient, setMessageRecipient] = useState<TalentProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  // Derive unique institutions
  const institutions = useMemo(() => {
    const set = new Set<string>();
    talentList.forEach((t) => {
      if (t.institution) set.add(t.institution);
      if (t.educations) {
        t.educations.forEach((e) => e.institution && set.add(e.institution));
      }
    });
    return Array.from(set);
  }, [talentList]);

  // Derive unique skills
  const skillsList = useMemo(() => {
    const set = new Set<string>();
    talentList.forEach((t) => {
      t.skills?.forEach((s) => set.add(s));
    });
    return Array.from(set);
  }, [talentList]);

  // Filtered talent
  const filteredTalent = useMemo(() => {
    return talentList.filter((talent) => {
      // Search query across name, headline, skills, institution, bio
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = talent.name.toLowerCase().includes(query);
        const matchesHeadline = talent.headline?.toLowerCase().includes(query) || talent.title?.toLowerCase().includes(query);
        const matchesSkills = talent.skills?.some((s) => s.toLowerCase().includes(query));
        const matchesInst = talent.institution?.toLowerCase().includes(query);
        const matchesBio = talent.bio?.toLowerCase().includes(query);
        if (!matchesName && !matchesHeadline && !matchesSkills && !matchesInst && !matchesBio) {
          return false;
        }
      }

      // Role filter
      if (selectedRole !== 'all') {
        if (!talent.roles?.includes(selectedRole as any)) {
          return false;
        }
      }

      // Availability filter
      if (selectedAvailability !== 'all') {
        if (!talent.availability?.toLowerCase().includes(selectedAvailability.toLowerCase())) {
          return false;
        }
      }

      // Institution filter
      if (selectedInstitution !== 'all') {
        const matchesInst =
          talent.institution === selectedInstitution ||
          talent.educations?.some((e) => e.institution === selectedInstitution);
        if (!matchesInst) return false;
      }

      // Skill filter
      if (selectedSkill !== 'all') {
        if (!talent.skills?.includes(selectedSkill)) {
          return false;
        }
      }

      // Verified only
      if (verifiedOnly && !talent.verified) {
        return false;
      }

      // Portfolio only
      if (hasPortfolioOnly) {
        const hasProjects = talent.portfolioProjects && talent.portfolioProjects.length > 0;
        if (!hasProjects) return false;
      }

      return true;
    });
  }, [
    talentList,
    searchTerm,
    selectedRole,
    selectedAvailability,
    selectedInstitution,
    selectedSkill,
    verifiedOnly,
    hasPortfolioOnly,
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessageRecipient(null);
      setMessageText('');
    }, 1500);
  };

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Section */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7CCB37]/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              Recruiter Talent Scouting Engine
            </span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#F4F7F1] tracking-tight">
            THE RIGHT TALENT CHANGES EVERYTHING.
          </h1>

          <p className="text-base font-mono text-[#A0AAA0] leading-relaxed">
            Discover verified student builders, collegiate engineers, and high-velocity contributors ready for internships, part-time sprints, and full-time engineering roles.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-[#A0AAA0]">
            <span className="text-[#B6FF4A] font-bold">100% Direct Contact</span>
            <span>·</span>
            <span>Verified GitHub Code Proof</span>
            <span>·</span>
            <span>Zero Agency Intermediaries</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A0AAA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Find people by skill, qualification or experience..."
            className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] pl-10 pr-4 py-3 rounded-sm outline-none font-mono"
          />
        </div>

        {/* Filter Selects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Role Type</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="freelancer">Freelancers</option>
              <option value="founder">Founders & Builders</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Availability</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="all">All Availabilities</option>
              <option value="available">Available now</option>
              <option value="internship">Looking for internship</option>
              <option value="freelance">Open for freelance</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Institution</label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="all">All Universities</option>
              {institutions.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#A0AAA0] uppercase block mb-1">Filter Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
            >
              <option value="all">All Skills</option>
              {skillsList.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#273128] text-xs font-mono">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPortfolioOnly}
                onChange={(e) => setHasPortfolioOnly(e.target.checked)}
                className="accent-[#B6FF4A]"
              />
              <span className="text-[#A0AAA0]">With Portfolio Projects Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="accent-[#B6FF4A]"
              />
              <span className="text-[#A0AAA0]">Verified Profiles Only</span>
            </label>
          </div>

          <div className="text-xs font-mono text-[#A0AAA0]">
            Displaying <strong className="text-[#B6FF4A]">{filteredTalent.length}</strong> matching candidates
          </div>
        </div>
      </div>

      {/* Talent Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTalent.map((talent) => {
          const connStatus = getConnectionStatus(talent.id);

          return (
            <div
              key={talent.id}
              className="bg-[#101510] border border-[#273128] hover:border-[#7CCB37]/50 rounded-sm p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-[0_4px_24px_-4px_rgba(182,255,74,0.08)]"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-sm bg-[#141B15] border border-[#273128] flex items-center justify-center font-display font-black text-sm text-[#B6FF4A] shrink-0">
                      {talent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          to={`/profile/${talent.id}`}
                          className="font-display font-bold text-base text-[#F4F7F1] hover:text-[#B6FF4A] transition-colors"
                        >
                          {talent.name}
                        </Link>
                        {talent.verified && (
                          <span title="Verified Profile">
                            <ShieldCheck className="w-4 h-4 text-[#7CCB37]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-[#A0AAA0] line-clamp-1">
                        {talent.headline || talent.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* College & Location */}
                <div className="space-y-1 text-xs font-mono text-[#A0AAA0] mb-4">
                  {talent.institution && (
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-[#7CCB37] shrink-0" />
                      <span className="truncate">{talent.institution}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7CCB37] shrink-0" />
                    <span>{talent.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#B6FF4A]">
                    <Clock className="w-3.5 h-3.5 text-[#B6FF4A] shrink-0" />
                    <span>{talent.availability || 'Available'}</span>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-[#A0AAA0] line-clamp-2 leading-relaxed mb-4">
                  {talent.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {talent.skills?.slice(0, 4).map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] font-mono px-2 py-0.5 bg-[#141B15] border border-[#273128] text-[#A0AAA0]"
                    >
                      {sk}
                    </span>
                  ))}
                  {talent.skills && talent.skills.length > 4 && (
                    <span className="text-[10px] font-mono text-[#7CCB37]/80">
                      +{talent.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[#273128] flex items-center justify-between gap-2 text-xs font-mono">
                <Link
                  to={`/profile/${talent.id}`}
                  className="px-3 py-1.5 text-xs text-[#A0AAA0] hover:text-[#F4F7F1] border border-[#273128] hover:border-[#7CCB37]/40 rounded-sm transition-colors"
                >
                  View Profile
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMessageRecipient(talent)}
                    className="p-1.5 border border-[#273128] hover:border-[#B6FF4A] text-[#A0AAA0] hover:text-[#B6FF4A] rounded-sm transition-colors cursor-pointer"
                    title="Send Interview Outreach"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  {connStatus === 'accepted' ? (
                    <span className="px-2.5 py-1 text-[11px] bg-[#B6FF4A]/10 border border-[#B6FF4A]/40 text-[#B6FF4A] rounded-sm">
                      Connected
                    </span>
                  ) : connStatus === 'pending' ? (
                    <span className="px-2.5 py-1 text-[11px] bg-[#141B15] border border-[#273128] text-[#A0AAA0] rounded-sm">
                      Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => sendConnectionRequest(talent.id)}
                      className="px-3 py-1.5 bg-[#B6FF4A] text-[#080B09] font-bold rounded-sm hover:bg-[#a3f033] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recruiter Outreach Modal */}
      {messageRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#273128]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B6FF4A] block">
                  Candidate Outreach
                </span>
                <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                  Direct Message to {messageRecipient.name}
                </h3>
              </div>
              <button
                onClick={() => setMessageRecipient(null)}
                className="p-1 text-[#A0AAA0] hover:text-[#F4F7F1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {messageSent ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#B6FF4A] mx-auto" />
                <p className="text-sm font-mono text-[#F4F7F1]">Outreach Transmitted</p>
                <p className="text-xs font-mono text-[#A0AAA0]">
                  Notification delivered to {messageRecipient.name}’s candidate inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <p className="text-xs font-mono text-[#A0AAA0]">
                  Send a direct invitation or interview inquiry regarding your open positions.
                </p>

                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Hi ${messageRecipient.name.split(' ')[0]}, saw your impressive work on GitHub and wanted to reach out regarding our open engineering role...`}
                  required
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-3 rounded-sm outline-none font-mono"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setMessageRecipient(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Send Outreach
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
