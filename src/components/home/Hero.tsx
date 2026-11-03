import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowUpRight, Compass, ShieldCheck, Zap, Users, Code, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-8 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-grid-pattern">
      {/* Background ambient lighting and animated grid accents */}
      <div
        className="pointer-events-none absolute -top-40 right-10 w-[550px] h-[550px] bg-[#B6FF4A]/5 rounded-full blur-[150px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#7CCB37]/5 rounded-full blur-[140px]"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT SIDE: Typography & Actions */}
          <div className="lg:col-span-6 space-y-8">
            {/* Introductory label */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#101510] border border-[#273128] rounded-xs"
            >
              <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                THE OPPORTUNITY ECOSYSTEM
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter text-[#F4F7F1] leading-[1.03] [text-wrap:balance]"
            >
              YOUR <span className="text-[#B6FF4A]">SKILLS.</span>
              <br />
              YOUR <span className="text-[#B6FF4A]">AMBITION.</span>
              <br />
              YOUR <span className="text-white underline decoration-[#B6FF4A] decoration-4 underline-offset-8">NEXT MOVE.</span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-[#A0AAA0] leading-relaxed max-w-xl [text-wrap:pretty]"
            >
              Find work. Discover talent. Build your team. HUSTL brings ambitious people and real opportunities together.
            </motion.p>

            {/* Primary & Secondary Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <Link to="/explore">
                <Button
                  size="lg"
                  variant="primary"
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                  fullWidth
                  className="sm:w-auto"
                >
                  Explore Opportunities
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  rightIcon={<Sparkles className="w-4 h-4 text-[#B6FF4A]" />}
                  fullWidth
                  className="sm:w-auto"
                >
                  Join HUSTL
                </Button>
              </Link>
            </motion.div>

            {/* Supporting Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="pt-2 flex items-center gap-2.5 text-xs font-mono text-[#A0AAA0]"
            >
              <span className="w-1.5 h-1.5 bg-[#B6FF4A] rounded-none rotate-45" />
              <span>Built for the next generation of builders.</span>
              <span className="text-[#273128]">·</span>
              <span className="text-[#F4F7F1]/80">Built for Indian students</span>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Custom Layered Asymmetric Visual Composition */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full min-h-[480px] sm:min-h-[520px] flex items-center justify-center"
            >
              {/* Underlying Geometric Backdrop Canvas */}
              <div className="absolute inset-0 bg-[#101510]/80 border border-[#273128] rounded-sm overflow-hidden p-6">
                {/* Precision HUD Reticles */}
                <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[10px] text-[#A0AAA0]">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
                  <span>ECOSYSTEM_RADAR // ACTIVE</span>
                </div>
                <div className="absolute top-3 right-3 font-mono text-[10px] text-[#B6FF4A]">
                  48-HR SPRINT ENGINE
                </div>

                {/* Subtle SVG Grid Line Matrix */}
                <svg
                  className="w-full h-full opacity-20 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#273128" strokeDasharray="4 4" />
                  <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#273128" strokeDasharray="4 4" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#273128" strokeDasharray="4 4" />
                </svg>
              </div>

              {/* Layer 1: Featured Freelance Project Preview (Top Left) */}
              <motion.div
                whileHover={{ y: -4, borderColor: '#B6FF4A' }}
                transition={{ duration: 0.2 }}
                className="absolute -top-3 left-2 sm:-left-4 z-20 w-[85%] sm:w-[280px] bg-[#141B15] border border-[#273128] p-4 rounded-sm shadow-[0_12px_30px_rgba(0,0,0,0.8)]"
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="text-[#B6FF4A] uppercase tracking-wider">Freelance Sprint</span>
                  <span className="text-[#F4F7F1] font-bold tabular-nums">₹7,500</span>
                </div>
                <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                  Dark UI Component System
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A0AAA0] mt-1">
                  <span>Vanguard Labs</span>
                  <span>·</span>
                  <span>React / Tailwind</span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#273128] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#A0AAA0]">Escrow Funded</span>
                  <Link to="/freelance" className="text-[#B6FF4A] hover:underline flex items-center gap-0.5">
                    View Brief <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>

              {/* Layer 2: Startup Recruitment Preview (Top Right) */}
              <motion.div
                whileHover={{ y: -4, borderColor: '#B6FF4A' }}
                transition={{ duration: 0.2 }}
                className="absolute top-20 right-2 sm:-right-4 z-20 w-[85%] sm:w-[290px] bg-[#141B15] border border-[#273128] p-4 rounded-sm shadow-[0_14px_34px_rgba(0,0,0,0.85)]"
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="text-[#7CCB37] uppercase tracking-wider">Startup Recruit</span>
                  <span className="text-[#B6FF4A] font-bold tabular-nums">₹12,000/mo</span>
                </div>
                <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                  Frontend Developer Intern
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A0AAA0] mt-1">
                  <span>Nova Labs</span>
                  <span>·</span>
                  <span>Remote</span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#273128] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#A0AAA0]">48h Direct Sprint</span>
                  <Link to="/recruit" className="text-[#B6FF4A] hover:underline flex items-center gap-0.5">
                    Apply Now <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>

              {/* Layer 3: Talent Profile Preview (Center Left) */}
              <motion.div
                whileHover={{ y: -4, borderColor: '#B6FF4A' }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-20 left-4 sm:left-2 z-30 w-[85%] sm:w-[270px] bg-[#141B15] border border-[#273128] p-4 rounded-sm shadow-[0_16px_40px_rgba(0,0,0,0.9)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#101510] border border-[#B6FF4A] text-[#B6FF4A] font-display font-bold text-xs flex items-center justify-center shrink-0">
                    AS
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h5 className="font-display font-bold text-xs text-[#F4F7F1]">Aarav Sharma</h5>
                      <CheckCircle2 className="w-3 h-3 text-[#B6FF4A]" />
                    </div>
                    <span className="text-[10px] font-mono text-[#A0AAA0]">Full-stack Developer</span>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {['React', 'Node.js', 'PostgreSQL'].map((s) => (
                    <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 bg-[#101510] border border-[#273128] text-[#A0AAA0]">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#273128] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#B6FF4A]">Open to opportunities</span>
                  <Link to="/profile" className="text-[#A0AAA0] hover:text-[#F4F7F1]">
                    Profile
                  </Link>
                </div>
              </motion.div>

              {/* Layer 4: Collaboration Opportunity Preview (Bottom Right) */}
              <motion.div
                whileHover={{ y: -4, borderColor: '#B6FF4A' }}
                transition={{ duration: 0.2 }}
                className="absolute -bottom-4 right-4 sm:right-2 z-30 w-[85%] sm:w-[280px] bg-[#141B15] border border-[#B6FF4A]/40 p-4 rounded-sm shadow-[0_18px_44px_rgba(0,0,0,0.95)]"
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                  <span className="text-[#B6FF4A] uppercase tracking-wider">TeamUp Co-Founder</span>
                  <span className="text-[#B6FF4A] font-bold">25% Equity</span>
                </div>
                <h4 className="font-display font-bold text-xs text-[#F4F7F1]">
                  AI Platform Venture Co-Founder
                </h4>
                <p className="text-[10px] text-[#A0AAA0] font-mono mt-0.5">
                  Product Strategy & Commercial Lead
                </p>
                <div className="mt-2 pt-2 border-t border-[#273128] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#A0AAA0]">Flexible / Remote</span>
                  <Link to="/teamup" className="text-[#B6FF4A] hover:underline flex items-center gap-0.5">
                    Connect <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
