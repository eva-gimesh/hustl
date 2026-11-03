import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HustlLogo } from '../brand/HustlLogo';
import { Github, Twitter, MessageSquare, Linkedin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const [socialModalNotice, setSocialModalNotice] = useState<string | null>(null);

  const handleSocialClick = (platform: string) => {
    setSocialModalNotice(`HUSTL ${platform} community channel will open with public launch.`);
    setTimeout(() => {
      setSocialModalNotice(null);
    }, 2800);
  };

  return (
    <footer className="w-full bg-[#080B09] border-t border-[#273128] mt-24">
      {/* Toast notice for placeholder social links */}
      {socialModalNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141B15] border border-[#B6FF4A] text-xs font-mono text-[#F4F7F1] px-4 py-3 rounded-xs shadow-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
          <span>{socialModalNotice}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <HustlLogo size="md" />
            <p className="font-display font-medium text-base text-[#F4F7F1]">
              Your Talent. Your Hustle. Your Opportunity.
            </p>
            <p className="text-xs text-[#A0AAA0] max-w-sm leading-relaxed">
              The high-velocity platform uniting student builders, specialized freelancers, and early-stage startup founders.
            </p>

            {/* Social Placeholders */}
            <div className="pt-2 flex items-center gap-3">
              {[
                { name: 'GitHub', icon: <Github className="w-4 h-4" /> },
                { name: 'X / Twitter', icon: <Twitter className="w-4 h-4" /> },
                { name: 'Discord', icon: <MessageSquare className="w-4 h-4" /> },
                { name: 'LinkedIn', icon: <Linkedin className="w-4 h-4" /> },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSocialClick(item.name)}
                  aria-label={item.name}
                  className="p-2 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A] text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors rounded-xs cursor-pointer"
                  title={`${item.name} (Launch Channel)`}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#F4F7F1]">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm text-[#A0AAA0]">
              <li>
                <Link to="/" className="hover:text-[#B6FF4A] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/freelance" className="hover:text-[#B6FF4A] transition-colors">
                  Freelance
                </Link>
              </li>
              <li>
                <Link to="/recruit" className="hover:text-[#B6FF4A] transition-colors">
                  Recruit
                </Link>
              </li>
              <li>
                <Link to="/teamup" className="hover:text-[#B6FF4A] transition-colors">
                  TeamUp
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-[#B6FF4A] transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/talent" className="text-[#B6FF4A] hover:underline transition-colors font-medium">
                  Talent Radar
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#F4F7F1]">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-[#A0AAA0]">
              <li>
                <Link to="/explore" className="hover:text-[#B6FF4A] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-[#B6FF4A] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#B6FF4A] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#B6FF4A] transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#F4F7F1]">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-[#A0AAA0]">
              <li>
                <Link to="/freelance" className="hover:text-[#B6FF4A] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/freelance" className="hover:text-[#B6FF4A] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-xs font-mono text-[#B6FF4A]">
                  Escrow Verified
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and hairline divider */}
        <div className="mt-14 pt-8 border-t border-[#273128] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#A0AAA0]">
          <div>
            &copy; {new Date().getFullYear()} HUSTL Inc. All rights reserved.
          </div>
          <div className="text-xs text-[#A0AAA0]">
            The competitive opportunity ecosystem for builders.
          </div>
        </div>
      </div>
    </footer>
  );
};
