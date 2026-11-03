import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PILLARS } from '../../constants/theme';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SectionHeader, GeometricDivider } from '../ui/SectionHeader';
import { ArrowUpRight, Check, ShieldCheck, Zap, Users, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const PillarsSection: React.FC = () => {
  const [activeRole, setActiveRole] = useState<'student' | 'founder' | 'recruiter'>('student');

  const roleBenefits = {
    student: {
      title: 'For Students & Young Builders',
      subtitle: 'Earn while learning, build proven portfolio proof, and match with peers to launch ventures.',
      points: [
        'Apply for vetted freelance sprints with milestone escrow payments.',
        'Get recruited directly by high-growth startups skip the generic hiring queues.',
        'Discover co-founders on campus and worldwide to hack on startups.',
      ],
      primaryPillar: 'Freelance & TeamUp',
    },
    founder: {
      title: 'For Startup Founders & Hackers',
      subtitle: 'Assemble your core technical team and outsource rapid feature development to skilled student engineers.',
      points: [
        'Find technical or growth co-founders with complementary skill-sets.',
        'Post specialized freelance bounties for rapid product prototyping.',
        'Hire top student talent before larger corporations discover them.',
      ],
      primaryPillar: 'TeamUp & Recruit',
    },
    recruiter: {
      title: 'For Growth Companies & Scouts',
      subtitle: 'Access the top 1% of collegiate developers, designers, and systems architects.',
      points: [
        'Review verified code contributions and live deployed applications.',
        'Launch 48-hour hiring sprints directly with pre-screened talent.',
        'Flexible engagement: contract-to-hire, summer internships, or full-time.',
      ],
      primaryPillar: 'Recruit Platform',
    },
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#273128] pb-8">
          <SectionHeader
            kicker="The Tri-Pillar Architecture"
            title="Three vectors. One unified talent network."
            subtitle="HUSTL dissolves artificial silos. Whether you are executing a paid development sprint, recruiting an engineering intern, or building a startup team, you operate from one profile."
            size="lg"
          />
          <div className="shrink-0 flex items-center gap-3">
            <Link to="/explore">
              <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                Explore Opportunities
              </Button>
            </Link>
          </div>
        </div>

        {/* The 3 Pillars Bento / Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PILLARS.map((pillar, idx) => {
            const isCenter = idx === 1;
            return (
              <Card
                key={pillar.id}
                variant="interactive"
                accentBorder={isCenter}
                className={`flex flex-col justify-between p-8 relative overflow-hidden group ${
                  isCenter ? 'bg-[#151e16] border-[#7CCB37]/40' : 'bg-[#141B15]'
                }`}
              >
                {/* Subtle corner index */}
                <div className="flex items-center justify-between pb-6 border-b border-[#273128]">
                  <span className="text-xs font-mono text-[#A0AAA0]">
                    PILLAR 0{idx + 1}
                  </span>
                  <span className="font-mono text-xs text-[#B6FF4A] tracking-wider font-semibold">
                    {pillar.id.toUpperCase()}
                  </span>
                </div>

                {/* Main Content */}
                <div className="py-6 space-y-4">
                  <h3 className="font-display font-extrabold text-2xl md:text-3xl text-[#F4F7F1] tracking-tight group-hover:text-white transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-mono text-[#B6FF4A] font-medium">
                    {pillar.tagline}
                  </p>
                  <p className="text-sm text-[#A0AAA0] leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 pt-2">
                    {pillar.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-[#F4F7F1]">
                        <span className="w-3.5 h-3.5 mt-0.5 rounded-none flex items-center justify-center shrink-0 bg-[#B6FF4A]/10 text-[#B6FF4A]">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metric & Action Footer */}
                <div className="pt-6 border-t border-[#273128] space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="font-mono font-extrabold text-2xl text-[#F4F7F1] tabular-nums">
                        {pillar.metric}
                      </div>
                      <div className="text-[11px] font-mono text-[#A0AAA0]">
                        {pillar.metricLabel}
                      </div>
                    </div>
                    <Link to={pillar.href}>
                      <Button
                        size="sm"
                        variant={isCenter ? 'primary' : 'secondary'}
                        rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                      >
                        Enter
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Interactive Multi-Role Architecture Showcase */}
        <div className="mt-16 bg-[#101510] border border-[#273128] p-6 sm:p-10 rounded-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#273128]">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                Multi-Role Architecture
              </span>
              <h3 className="font-display font-bold text-2xl text-[#F4F7F1] mt-1">
                One identity. Zero boundaries.
              </h3>
              <p className="text-xs text-[#A0AAA0] mt-1">
                Select your primary orientation to see how HUSTL powers your journey:
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#080B09] border border-[#273128] rounded-sm self-start">
              {(['student', 'founder', 'recruiter'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeRole === role
                      ? 'bg-[#B6FF4A] text-[#080B09] font-bold shadow-sm'
                      : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <h4 className="font-display font-bold text-xl text-[#F4F7F1]">
                {roleBenefits[activeRole].title}
              </h4>
              <p className="text-sm text-[#A0AAA0] leading-relaxed">
                {roleBenefits[activeRole].subtitle}
              </p>
              <div className="space-y-3 pt-2">
                {roleBenefits[activeRole].points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45 mt-2 shrink-0" />
                    <p className="text-xs md:text-sm text-[#F4F7F1] leading-relaxed">
                      {pt}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-5 bg-[#141B15] border border-[#273128] p-6 rounded-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#A0AAA0]">
                  Core Alignment
                </span>
                <span className="text-xs font-mono text-[#B6FF4A] font-semibold">
                  {roleBenefits[activeRole].primaryPillar}
                </span>
              </div>
              <div className="p-3 bg-[#080B09] border border-[#273128] rounded-xs space-y-1">
                <span className="text-[10px] font-mono text-[#A0AAA0]">Ready to deploy?</span>
                <p className="text-xs text-[#F4F7F1] font-mono">
                  Sign up once and switch modes anytime from your dashboard.
                </p>
              </div>
              <Link to="/signup" className="block w-full">
                <Button fullWidth size="md" variant="primary">
                  Activate {activeRole.toUpperCase()} Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
