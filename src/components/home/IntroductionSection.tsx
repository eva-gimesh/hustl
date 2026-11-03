import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import {
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Code2,
  Sparkles,
  Zap,
  Briefcase,
  GitPullRequest,
  Check,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';

export const IntroductionSection: React.FC = () => {
  const [activeSprintTab, setActiveSprintTab] = useState<'details' | 'milestones'>('details');

  return (
    <section className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101510] border border-[#273128] rounded-xs">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              WHAT IS HUSTL?
            </span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#F4F7F1] tracking-tight leading-[1.08] [text-wrap:balance]">
            ONE PLACE. THREE WAYS TO MOVE FORWARD.
          </h2>

          <p className="text-lg text-[#A0AAA0] leading-relaxed [text-wrap:pretty]">
            Your next opportunity could be a project, a new career or the people you build something with. HUSTL connects all three.
          </p>
        </div>

        {/* ============================================================ */}
        {/* PILLAR 1: FREELANCE (Editorial Project Preview) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#B6FF4A]">
              <span>PILLAR 01</span>
              <span>·</span>
              <span className="uppercase tracking-wider">FREELANCE</span>
            </div>

            <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight leading-tight">
              MAKE YOUR SKILLS COUNT.
            </h3>

            <p className="text-base text-[#A0AAA0] leading-relaxed">
              Discover projects, showcase your expertise and turn your abilities into real opportunities.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-[#F4F7F1]">
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 bg-[#B6FF4A]/10 text-[#B6FF4A] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Vetted milestone-based briefs with upfront escrow funding</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 bg-[#B6FF4A]/10 text-[#B6FF4A] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Set your own price — no minimum budget</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 bg-[#B6FF4A]/10 text-[#B6FF4A] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Direct client messaging and cryptographically verifiable portfolio proofs</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link to="/freelance">
                <Button
                  size="md"
                  variant="primary"
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Explore Freelance
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual: Editorial Project Preview */}
          <div className="lg:col-span-6">
            <div className="bg-[#141B15] border border-[#273128] p-6 sm:p-8 rounded-sm shadow-[0_16px_40px_rgba(0,0,0,0.7)] space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#273128]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#101510] border border-[#273128] font-mono text-[10px] text-[#A0AAA0] uppercase">
                    EDITORIAL SPRINT BRIEF
                  </span>
                  <span className="text-[10px] font-mono text-[#B6FF4A]">#SP-4902</span>
                </div>
                <div className="font-mono font-bold text-lg text-[#B6FF4A] tabular-nums">
                  ₹7,500
                </div>
              </div>

              <div>
                <h4 className="font-display font-bold text-xl text-[#F4F7F1]">
                  Component System & Motion Tokens for Dark Gaming Portal
                </h4>
                <div className="flex items-center gap-2 text-xs font-mono text-[#A0AAA0] mt-1.5">
                  <span className="text-[#F4F7F1]">Vanguard Gaming Labs</span>
                  <span>·</span>
                  <span>Remote (Global)</span>
                  <span>·</span>
                  <span className="text-[#B6FF4A]">100% Escrow Secured</span>
                </div>
              </div>

              <p className="text-xs text-[#A0AAA0] leading-relaxed">
                Design and implement 14 atomic components adhering to strict anti-slop guidelines: high-density cards, modal dialogs, and smooth settling micro-animations.
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['React 19', 'Tailwind CSS v4', 'Framer Motion', 'TypeScript'].map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-mono px-2.5 py-1 bg-[#101510] border border-[#273128] text-[#F4F7F1] rounded-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Milestone breakdown strip */}
              <div className="p-3.5 bg-[#101510] border border-[#273128] rounded-xs space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#A0AAA0]">Milestone 1: Atoms & Design Tokens (₹3,750)</span>
                  <span className="text-[#B6FF4A]">Agreed</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#A0AAA0]">Milestone 2: Organisms & Integration (₹3,750)</span>
                  <span className="text-[#A0AAA0]">Pending</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-mono text-[#A0AAA0]">
                  Target Deadline: 14 Days
                </span>
                <Link to="/freelance">
                  <Button size="sm" variant="secondary" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    View Brief Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PILLAR 2: RECRUIT (Talent Discovery Interface) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8">
          {/* Visual: Talent Discovery Interface (Left on desktop) */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-[#141B15] border border-[#273128] p-6 sm:p-8 rounded-sm shadow-[0_16px_40px_rgba(0,0,0,0.7)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#273128]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#7CCB37] rotate-45" />
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F4F7F1]">
                    SCOUT_RADAR // ACTIVE POOL
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#B6FF4A]">
                  48H INTERVIEW PIPELINE
                </span>
              </div>

              {/* Sample Profile 1 inside scout interface */}
              <div className="p-4 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A]/50 transition-colors rounded-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#141B15] border border-[#B6FF4A] text-[#B6FF4A] font-display font-bold text-sm flex items-center justify-center shrink-0">
                      AS
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-display font-bold text-sm text-[#F4F7F1]">
                          Aarav Sharma
                        </h5>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B6FF4A]" />
                      </div>
                      <span className="text-xs font-mono text-[#A0AAA0]">
                        Full-stack Developer · Waterloo
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#B6FF4A] bg-[#B6FF4A]/10 px-2 py-0.5 rounded-none border border-[#B6FF4A]/30">
                    Open to Opportunities
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['React', 'Node.js', 'PostgreSQL', 'WebSockets'].map((s) => (
                    <span key={s} className="text-[10px] font-mono px-2 py-0.5 bg-[#141B15] text-[#A0AAA0] border border-[#273128]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Profile 2 inside scout interface */}
              <div className="p-4 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A]/50 transition-colors rounded-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#141B15] border border-[#7CCB37] text-[#7CCB37] font-display font-bold text-sm flex items-center justify-center shrink-0">
                      AR
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-display font-bold text-sm text-[#F4F7F1]">
                          Ananya Rao
                        </h5>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B6FF4A]" />
                      </div>
                      <span className="text-xs font-mono text-[#A0AAA0]">
                        UI/UX Designer · Design Academy
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#7CCB37] bg-[#7CCB37]/10 px-2 py-0.5 rounded-none border border-[#7CCB37]/30">
                    Freelance Projects
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['Figma', 'Prototyping', 'Design Systems', 'Micro-interactions'].map((s) => (
                    <span key={s} className="text-[10px] font-mono px-2 py-0.5 bg-[#141B15] text-[#A0AAA0] border border-[#273128]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-mono">
                <span className="text-[#A0AAA0]">Verified GitHub & production repos</span>
                <Link to="/recruit" className="text-[#B6FF4A] hover:underline flex items-center gap-1 font-semibold">
                  Browse All Talent <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Text: RECRUIT (Right on desktop) */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#7CCB37]">
              <span>PILLAR 02</span>
              <span>·</span>
              <span className="uppercase tracking-wider">RECRUIT</span>
            </div>

            <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight leading-tight">
              FIND THE RIGHT PEOPLE.
            </h3>

            <p className="text-base text-[#A0AAA0] leading-relaxed">
              Discover emerging talent and connect with students who have the skills and ambition your business needs.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-[#F4F7F1]">
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 bg-[#7CCB37]/10 text-[#7CCB37] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Evaluate live code commits and demonstrated problem-solving over resumes</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 bg-[#7CCB37]/10 text-[#7CCB37] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Direct 48-hour interview pipelines without agency middlemen or markup</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 bg-[#7CCB37]/10 text-[#7CCB37] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Seamless flexible transitions: summer internships, contract-to-hire, or full-time</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link to="/recruit">
                <Button
                  size="md"
                  variant="primary"
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Discover Talent
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PILLAR 3: TEAMUP (Abstract Team-Building Composition) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#B6FF4A]">
              <span>PILLAR 03</span>
              <span>·</span>
              <span className="uppercase tracking-wider">TEAMUP</span>
            </div>

            <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F4F7F1] tracking-tight leading-tight">
              BUILD SOMETHING TOGETHER.
            </h3>

            <p className="text-base text-[#A0AAA0] leading-relaxed">
              Meet ambitious people, find complementary skills and bring your ideas to life with the right team.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-[#F4F7F1]">
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 bg-[#B6FF4A]/10 text-[#B6FF4A] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Algorithm-assisted complementary matching (Engineers + Designers + GTM)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 bg-[#B6FF4A]/10 text-[#B6FF4A] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>14-day prototype trial sprint framework before formal equity incorporation</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-4 h-4 bg-[#B6FF4A]/10 text-[#B6FF4A] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span>Standardized 4-year vesting schedules, IP agreements, and demo day fast-tracks</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link to="/teamup">
                <Button
                  size="md"
                  variant="primary"
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Find Your Team
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual: Abstract Team-Building Composition */}
          <div className="lg:col-span-6">
            <div className="bg-[#141B15] border border-[#273128] p-6 sm:p-8 rounded-sm shadow-[0_16px_40px_rgba(0,0,0,0.7)] relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#273128]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#B6FF4A] rotate-45" />
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F4F7F1]">
                    VENTURE_SQUAD_FORMATION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#B6FF4A]">
                  MATCH MATRIX: 98%
                </span>
              </div>

              {/* Interconnected Node Diagrams */}
              <div className="py-6 space-y-4">
                {/* Node 1: Technical Founder */}
                <div className="flex items-center gap-4 p-3.5 bg-[#101510] border border-[#273128] rounded-xs">
                  <div className="w-10 h-10 bg-[#141B15] border border-[#B6FF4A] flex items-center justify-center text-[#B6FF4A] font-mono text-xs font-bold shrink-0">
                    TECH
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="font-display font-bold text-sm text-[#F4F7F1] truncate">
                        Technical Co-Founder (Founding CTO)
                      </h5>
                      <span className="text-[10px] font-mono text-[#B6FF4A]">35% Equity</span>
                    </div>
                    <p className="text-xs font-mono text-[#A0AAA0]">
                      Systems architecture, ML pipelines & low-latency backends
                    </p>
                  </div>
                </div>

                {/* Connecting Vector */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#080B09] border border-[#273128] font-mono text-[10px] text-[#A0AAA0]">
                    <Sparkles className="w-3 h-3 text-[#B6FF4A]" />
                    <span>COMPLEMENTARY SKILL COUPLING</span>
                    <Sparkles className="w-3 h-3 text-[#B6FF4A]" />
                  </div>
                </div>

                {/* Node 2: Commercial & GTM Founder */}
                <div className="flex items-center gap-4 p-3.5 bg-[#101510] border border-[#273128] rounded-xs">
                  <div className="w-10 h-10 bg-[#141B15] border border-[#7CCB37] flex items-center justify-center text-[#7CCB37] font-mono text-xs font-bold shrink-0">
                    GTM
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="font-display font-bold text-sm text-[#F4F7F1] truncate">
                        Commercial Co-Founder (Founding CEO)
                      </h5>
                      <span className="text-[10px] font-mono text-[#7CCB37]">35% Equity</span>
                    </div>
                    <p className="text-xs font-mono text-[#A0AAA0]">
                      Enterprise pilots, growth loops & venture fundraising
                    </p>
                  </div>
                </div>
              </div>

              {/* Status and Action */}
              <div className="pt-3 border-t border-[#273128] flex items-center justify-between text-xs font-mono">
                <span className="text-[#A0AAA0]">14-Day Sprint Sandbox Ready</span>
                <Link to="/teamup">
                  <Button size="sm" variant="secondary" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    Join Venture Squad
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
