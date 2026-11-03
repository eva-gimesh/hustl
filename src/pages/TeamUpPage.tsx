import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTeamUp } from '../context/TeamUpContext';
import { StartupIdea } from '../types';
import { IdeaCard } from '../components/teamup/IdeaCard';
import { ApplyTeamModal } from '../components/teamup/ApplyTeamModal';
import { Button } from '../components/ui/Button';
import {
  Rocket,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Lightbulb,
  UserPlus,
  Layers,
  ChevronRight,
  Search,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

export const TeamUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ideas, teamMembers } = useTeamUp();

  const [activeApplyIdea, setActiveApplyIdea] = useState<StartupIdea | null>(null);

  // Extract open co-founder roles across all active ideas
  const openCoFounderRoles = ideas.flatMap((idea) =>
    idea.openRoles
      .filter((r) => r.isOpen && r.roleTitle.toLowerCase().includes('founder'))
      .map((role) => ({ idea, role }))
  );

  return (
    <div className="w-full py-10 space-y-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. HERO SECTION */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-8 md:p-14 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B6FF4A]/10 blur-[130px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#B6FF4A] rotate-45" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                Pillar 03 · Co-Founder Discovery & Team Building
              </span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-[#F4F7F1] tracking-tight leading-[1.05]">
              GOOD IDEAS NEED THE RIGHT PEOPLE.
            </h1>

            <p className="text-base sm:text-lg font-mono text-[#A0AAA0] leading-relaxed max-w-2xl">
              Find co-founders. Build teams. Make ideas happen.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/teamup/discover">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore opportunities
                </Button>
              </Link>

              <Link to="/teamup/create">
                <Button size="lg" variant="secondary" leftIcon={<Rocket className="w-4 h-4" />}>
                  Start building a team
                </Button>
              </Link>

              <Link to="/teamup/invitations">
                <Button size="lg" variant="ghost" leftIcon={<Users className="w-4 h-4" />}>
                  My Invitations
                </Button>
              </Link>
            </div>

            {/* Real Proof Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-[#A0AAA0]">
              <span className="text-[#B6FF4A] font-bold">Standardized Equity & Sweat Frameworks</span>
              <span>·</span>
              <span>100% Peer-to-Peer</span>
              <span>·</span>
              <span>Hackathon & Seed Sprints</span>
            </div>
          </div>

          {/* Right Visual Composition: Live Co-founder Teaser Card */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-5 bg-[#141B15] border border-[#273128] rounded-sm space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#273128] pb-2 text-xs font-mono">
                <span className="text-[#B6FF4A] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Founding Teaser</span>
                </span>
                <span className="text-[10px] text-[#A0AAA0] bg-[#101510] px-2 py-0.5 border border-[#273128]">
                  DEMO DATA
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#7CCB37]">AI & Systems</span>
                <h4 className="font-display font-bold text-lg text-[#F4F7F1]">Aetheria Protocol</h4>
                <p className="text-xs font-mono text-[#A0AAA0] mt-1">
                  Decentralized peer-to-peer compute orchestration for open-source AI models.
                </p>
              </div>

              <div className="p-3 bg-[#101510] border border-[#273128] rounded-sm text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-[#A0AAA0] text-[10px] uppercase">
                  <span>Open Co-Founder Role</span>
                  <span className="text-[#B6FF4A]">Equity-based</span>
                </div>
                <p className="font-bold text-[#F4F7F1]">Founding Rust Systems Engineer</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#141B15] border border-[#273128] text-[#A0AAA0]">
                    Rust
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#141B15] border border-[#273128] text-[#A0AAA0]">
                    libp2p
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#141B15] border border-[#273128] text-[#A0AAA0]">
                    WebAssembly
                  </span>
                </div>
              </div>

              <Link
                to="/teamup/ideas/idea-01-aetheria"
                className="w-full py-2 bg-[#B6FF4A] text-[#080B09] font-bold text-xs font-mono rounded-sm flex items-center justify-center gap-1.5 hover:bg-[#a3f033] transition-colors"
              >
                <span>View Venture & Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DUAL PROMINENT USER JOURNEYS */}
      <div className="space-y-6">
        <div className="border-b border-[#273128] pb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
            Two High-Velocity Pathways
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#F4F7F1] tracking-tight mt-1">
            How TeamUp Accelerates Ventures
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* JOURNEY A — I HAVE AN IDEA */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-8 space-y-5 flex flex-col justify-between hover:border-[#7CCB37]/50 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-sm bg-[#141B15] border border-[#273128] flex items-center justify-center text-[#B6FF4A]">
                <Lightbulb className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7CCB37]">
                  Path A · For Ideators & Founders
                </span>
                <h3 className="font-display font-bold text-2xl text-[#F4F7F1] mt-1">
                  "I HAVE AN IDEA."
                </h3>
              </div>

              <p className="text-xs font-mono text-[#A0AAA0] leading-relaxed">
                You have a compelling problem statement and solution architecture, but need engineering, design, or growth counterparts to turn it into reality.
              </p>

              <ul className="space-y-2.5 text-xs font-mono text-[#A0AAA0] pt-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45 mt-1.5 shrink-0" />
                  <span>Publish your startup idea with problem statement and milestones.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45 mt-1.5 shrink-0" />
                  <span>List granular open roles (e.g. Founding Frontend Engineer).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45 mt-1.5 shrink-0" />
                  <span>Scout complementary builders and transmit direct team invitations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45 mt-1.5 shrink-0" />
                  <span>Review applications and build your founding team dashboard.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#273128]">
              <Link to="/teamup/create" className="block">
                <Button className="w-full" variant="primary" rightIcon={<Rocket className="w-4 h-4" />}>
                  Publish Your Venture Idea
                </Button>
              </Link>
            </div>
          </div>

          {/* JOURNEY B — I WANT TO JOIN A TEAM */}
          <div className="bg-[#101510] border border-[#273128] rounded-sm p-8 space-y-5 flex flex-col justify-between hover:border-[#7CCB37]/50 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-sm bg-[#141B15] border border-[#273128] flex items-center justify-center text-[#B6FF4A]">
                <UserPlus className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7CCB37]">
                  Path B · For Developers & Co-Founders
                </span>
                <h3 className="font-display font-bold text-2xl text-[#F4F7F1] mt-1">
                  "I WANT TO JOIN A TEAM."
                </h3>
              </div>

              <p className="text-xs font-mono text-[#A0AAA0] leading-relaxed">
                You have strong technical or design skills and want to contribute equity sweat or part-time hours into high-conviction early-stage projects.
              </p>

              <ul className="space-y-2.5 text-xs font-mono text-[#A0AAA0] pt-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45 mt-1.5 shrink-0" />
                  <span>Explore curated ideas across AI, Climate, Fintech, and Software.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45 mt-1.5 shrink-0" />
                  <span>Inspect founder credentials, college backgrounds, and progress.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45 mt-1.5 shrink-0" />
                  <span>Submit 1-click collaboration requests with your HUSTL profile.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45 mt-1.5 shrink-0" />
                  <span>Receive direct founder invitations and manage team acceptances.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#273128]">
              <Link to="/teamup/discover" className="block">
                <Button className="w-full" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Discover Collaboration Opportunities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OPEN CO-FOUNDER ROLES STRIP */}
      {openCoFounderRoles.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                High-Conviction Equity Roles
              </span>
              <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
                Featured Co-Founder Openings
              </h2>
            </div>
            <Link
              to="/teamup/discover"
              className="text-xs font-mono text-[#B6FF4A] hover:underline flex items-center gap-1"
            >
              <span>View All ({ideas.length} ideas)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {openCoFounderRoles.map(({ idea, role }) => (
              <div
                key={role.id}
                className="p-5 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A]/50 rounded-sm space-y-3 transition-colors font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#7CCB37] uppercase bg-[#7CCB37]/10 px-2 py-0.5 border border-[#7CCB37]/30">
                    {role.compensationModel}
                  </span>
                  <span className="text-[10px] text-[#A0AAA0]">{role.timeCommitment}</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#F4F7F1] line-clamp-1">{role.roleTitle}</h4>
                  <Link
                    to={`/teamup/ideas/${idea.id}`}
                    className="text-[#B6FF4A] text-xs hover:underline mt-0.5 block"
                  >
                    At {idea.title}
                  </Link>
                </div>

                <div className="flex flex-wrap gap-1">
                  {role.requiredSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-[9px] px-1.5 py-0.5 bg-[#141B15] border border-[#273128] text-[#A0AAA0]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#273128] flex items-center justify-between">
                  <span className="text-[#A0AAA0]">Founder: {idea.ownerName}</span>
                  <Link
                    to={`/teamup/ideas/${idea.id}`}
                    className="text-[#B6FF4A] hover:underline flex items-center gap-0.5"
                  >
                    <span>Apply</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FEATURED IDEAS GRID */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              Venture Discovery
            </span>
            <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
              Featured Startup Projects & Teams
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/teamup/discover">
              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Filter All Ideas
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.slice(0, 6).map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onApplyClick={(selected) => setActiveApplyIdea(selected)}
            />
          ))}
        </div>
      </div>

      {/* 5. CALL TO ACTION BANNER */}
      <div className="p-8 md:p-12 bg-[#141B15] border border-[#273128] rounded-sm text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7CCB37]/5 blur-3xl pointer-events-none" />
        <h3 className="font-display font-black text-2xl sm:text-3xl text-[#F4F7F1] tracking-tight relative z-10">
          Have an idea that deserves to exist?
        </h3>
        <p className="text-xs sm:text-sm font-mono text-[#A0AAA0] max-w-xl mx-auto relative z-10 leading-relaxed">
          Do not build in isolation. Connect with collegiate developers, systems engineers, and designers eager to collaborate on real prototypes.
        </p>
        <div className="pt-2 flex justify-center relative z-10">
          <Link to="/teamup/create">
            <Button size="lg" variant="primary" leftIcon={<Rocket className="w-4 h-4" />}>
              Create a TeamUp Venture
            </Button>
          </Link>
        </div>
      </div>

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
