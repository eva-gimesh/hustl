import React from 'react';
import { motion } from 'motion/react';
import { Check, Layers, Cpu, Flame, Users2 } from 'lucide-react';

export const WhyHustlSection: React.FC = () => {
  const advantages = [
    {
      index: '01',
      title: 'OPPORTUNITIES IN ONE PLACE',
      description:
        'Projects, jobs, internships and collaborations without searching across disconnected platforms.',
      icon: <Layers className="w-5 h-5 text-[#B6FF4A]" />,
      highlight: 'Unified single-account radar',
    },
    {
      index: '02',
      title: 'SKILLS OVER LABELS',
      description:
        'Discover people based on what they can actually do, not just their job titles.',
      icon: <Cpu className="w-5 h-5 text-[#B6FF4A]" />,
      highlight: 'Demonstrated code proofs & live repos',
    },
    {
      index: '03',
      title: 'BUILT FOR AMBITION',
      description:
        'Connect with people who want to learn, create, work and grow.',
      icon: <Flame className="w-5 h-5 text-[#B6FF4A]" />,
      highlight: 'High-velocity builders only',
    },
    {
      index: '04',
      title: 'MORE THAN WORK',
      description:
        'Find collaborators, build teams and turn ideas into something real.',
      icon: <Users2 className="w-5 h-5 text-[#B6FF4A]" />,
      highlight: 'Venture squads & co-founder matching',
    },
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Editorial Headline */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101510] border border-[#273128] rounded-xs">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              THE COMPETITIVE EDGE
            </span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F4F7F1] tracking-tight leading-[1.05] [text-wrap:balance]">
            NOT JUST ANOTHER OPPORTUNITY PLATFORM.
          </h2>

          <p className="text-lg text-[#A0AAA0] leading-relaxed [text-wrap:pretty]">
            Most hiring platforms were built for human resources departments in 2005. HUSTL is engineered for builders, hackers, and ambitious operators who create real value.
          </p>
        </div>

        {/* Asymmetric 4-Advantage Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {advantages.map((item, idx) => (
            <motion.div
              key={item.index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A]/50 transition-all duration-200 p-8 rounded-sm flex flex-col justify-between group shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#273128]">
                  <span className="font-mono font-extrabold text-2xl text-[#B6FF4A] tabular-nums">
                    {item.index}
                  </span>
                  <div className="w-8 h-8 bg-[#101510] border border-[#273128] flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>

                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#F4F7F1] tracking-tight group-hover:text-white transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-[#A0AAA0] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#273128] flex items-center justify-between">
                <span className="text-xs font-mono text-[#B6FF4A]">
                  {item.highlight}
                </span>
                <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
