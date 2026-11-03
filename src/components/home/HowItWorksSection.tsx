import React from 'react';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { motion } from 'motion/react';
import { UserCheck, Compass, Rocket, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'SHOW WHAT YOU CAN DO',
      description:
        'Create your profile. Add your skills, experience, qualifications and portfolio.',
      icon: <UserCheck className="w-5 h-5 text-[#B6FF4A]" />,
      detail: 'Proof-of-work repositories, project showcases, and skill credentials verified.',
    },
    {
      num: '02',
      title: 'FIND YOUR OPPORTUNITY',
      description:
        'Explore freelance projects, recruitment openings and collaboration opportunities.',
      icon: <Compass className="w-5 h-5 text-[#B6FF4A]" />,
      detail: 'Filtered by compensation, skills, work mode, and sprint timelines in real time.',
    },
    {
      num: '03',
      title: 'MAKE YOUR MOVE',
      description:
        'Connect with people, apply for opportunities and start building your future.',
      icon: <Rocket className="w-5 h-5 text-[#B6FF4A]" />,
      detail: 'Escrow-protected sprint payouts, 48-hour interview tracks, or equity teams.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#101510] border-y border-[#273128] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141B15] border border-[#273128] rounded-xs">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              THE PROCESS
            </span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#F4F7F1] tracking-tight leading-[1.08] [text-wrap:balance]">
            FROM AMBITION TO ACTION.
          </h2>

          <p className="text-base text-[#A0AAA0] leading-relaxed [text-wrap:pretty]">
            HUSTL replaces bureaucratic recruitment cycles with a streamlined, direct execution engine.
          </p>
        </div>

        {/* Steps: Horizontal on Desktop, Vertical on Mobile */}
        <div className="relative">
          {/* Desktop Connecting Line behind steps */}
          <div
            className="hidden lg:block absolute top-12 left-8 right-8 h-[1px] bg-[#273128] z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col"
              >
                <div className="bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A]/50 transition-all duration-200 p-8 rounded-sm h-full flex flex-col justify-between group shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                  <div className="space-y-6">
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#273128]">
                      <span className="font-display font-extrabold text-4xl sm:text-5xl text-[#B6FF4A] tracking-tighter tabular-nums select-none group-hover:scale-105 transition-transform duration-200">
                        {step.num}
                      </span>
                      <div className="w-10 h-10 bg-[#101510] border border-[#273128] group-hover:border-[#B6FF4A] flex items-center justify-center transition-colors">
                        {step.icon}
                      </div>
                    </div>

                    {/* Step Title & Description */}
                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-xl text-[#F4F7F1] tracking-tight group-hover:text-white transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#A0AAA0] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Micro Detail */}
                  <div className="pt-6 mt-6 border-t border-[#273128]/70 text-xs font-mono text-[#A0AAA0]/80">
                    {step.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
