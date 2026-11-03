import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowUpRight, Compass, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#141B15] border border-[#273128] p-8 sm:p-12 lg:p-16 rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
        >
          {/* Subtle acid-green corner glow */}
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-[#B6FF4A]/10 rounded-full blur-[100px]"
            aria-hidden="true"
          />

          {/* Geometric Reticle Accents */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#B6FF4A]" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#B6FF4A]" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#B6FF4A]" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#B6FF4A]" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101510] border border-[#273128] rounded-xs">
              <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                READY TO BUILD?
              </span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F4F7F1] tracking-tight leading-[1.03] [text-wrap:balance]">
              YOU HAVE THE SKILLS.
              <br />
              <span className="text-[#B6FF4A]">NOW MAKE YOUR MOVE.</span>
            </h2>

            <p className="text-lg md:text-xl text-[#A0AAA0] max-w-xl leading-relaxed [text-wrap:pretty]">
              Your next project, opportunity or team could start here.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="primary"
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                  fullWidth
                  className="sm:w-auto"
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  rightIcon={<Compass className="w-4 h-4 text-[#B6FF4A]" />}
                  fullWidth
                  className="sm:w-auto"
                >
                  Explore HUSTL
                </Button>
              </Link>
            </div>

            {/* Quick Proof Strip */}
            <div className="pt-6 border-t border-[#273128] flex flex-wrap items-center gap-6 text-xs font-mono text-[#A0AAA0]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B6FF4A]" />
                Escrow Milestone Security
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#B6FF4A]" />
                Instant Single-Account Activation
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
