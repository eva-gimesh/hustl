import React from 'react';
import { HustlLogo } from '../brand/HustlLogo';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row w-full bg-[#080B09]">
      {/* ============================================================ */}
      {/* LEFT SIDE: Branded Visual Panel (Desktop) */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#101510] border-r border-[#273128] p-12 xl:p-16 flex-col justify-between overflow-hidden bg-grid-pattern">
        {/* Subtle acid-green ambient glow */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] bg-[#B6FF4A]/10 rounded-full blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-0 w-[400px] h-[400px] bg-[#7CCB37]/5 rounded-full blur-[130px]"
          aria-hidden="true"
        />

        {/* Top: HUSTL Logo */}
        <div className="relative z-10">
          <HustlLogo size="lg" />
        </div>

        {/* Middle: Custom Abstract Graphical Cyber-Esports Composition */}
        <div className="relative z-10 my-auto py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141B15] border border-[#273128] rounded-xs">
              <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                UNIFIED TALENT PROTOCOL
              </span>
            </div>

            <h1 className="font-display font-extrabold text-4xl xl:text-5xl text-[#F4F7F1] tracking-tight leading-[1.08] [text-wrap:balance]">
              YOUR NEXT MOVE
              <br />
              <span className="text-[#B6FF4A]">STARTS HERE.</span>
            </h1>

            <p className="text-base text-[#A0AAA0] max-w-md leading-relaxed [text-wrap:pretty]">
              Join a community of ambitious people turning skills, ideas and opportunities into something real.
            </p>

            {/* Custom Abstract Graphic HUD Canvas */}
            <div className="relative w-full max-w-md bg-[#141B15] border border-[#273128] p-5 rounded-sm shadow-[0_12px_36px_rgba(0,0,0,0.7)] mt-6 glow-green-subtle">
              {/* Corner brackets */}
              <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-[#B6FF4A]" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[#B6FF4A]" />
              <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[#B6FF4A]" />
              <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-[#B6FF4A]" />

              <div className="flex items-center justify-between pb-3 border-b border-[#273128] text-xs font-mono">
                <span className="text-[#F4F7F1]">HUSTL_RADAR // ACTIVE</span>
                <span className="text-[#B6FF4A]">100% ESCROW VERIFIED</span>
              </div>

              {/* Interlocking geometric visualization lines */}
              <div className="py-4 space-y-2.5">
                <div className="flex items-center justify-between p-2.5 bg-[#101510] border border-[#273128] rounded-xs">
                  <span className="text-xs font-mono text-[#F4F7F1]">Freelance Sprints</span>
                  <span className="text-xs font-mono text-[#B6FF4A] font-bold">Student-first pricing</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#101510] border border-[#273128] rounded-xs">
                  <span className="text-xs font-mono text-[#F4F7F1]">Startup Recruitment</span>
                  <span className="text-xs font-mono text-[#7CCB37] font-bold">48h Pipeline</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#101510] border border-[#273128] rounded-xs">
                  <span className="text-xs font-mono text-[#F4F7F1]">TeamUp Ventures</span>
                  <span className="text-xs font-mono text-[#B6FF4A] font-bold">320+ Squads</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] font-mono text-[#A0AAA0] flex items-center justify-between">
                <span>Cryptographic proof-of-work</span>
                <span className="text-[#F4F7F1]">Single Account Identity</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Trust Line */}
        <div className="relative z-10 pt-4 flex items-center gap-6 text-xs font-mono text-[#A0AAA0]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#B6FF4A]" />
            <span>Zero Data Brokerage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#B6FF4A]" />
            <span>Instant Role Switching</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SIDE: Authentication Form (Desktop & Mobile) */}
      {/* ============================================================ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};
