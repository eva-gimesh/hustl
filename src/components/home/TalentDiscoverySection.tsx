import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_TALENT } from '../../data/mockData';
import { TalentProfile } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Star,
  Sparkles,
  Send,
} from 'lucide-react';
import { motion } from 'motion/react';

export const TalentDiscoverySection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [connectModalTalent, setConnectModalTalent] = useState<TalentProfile | null>(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectedSuccess, setConnectedSuccess] = useState(false);

  const roles = ['All', 'Full-stack Developer', 'UI/UX Designer', 'Growth Marketer', 'Video Editor'];

  const filteredTalent =
    selectedRole === 'All'
      ? SAMPLE_TALENT
      : SAMPLE_TALENT.filter((t) => t.role === selectedRole);

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConnectedSuccess(true);
    setTimeout(() => {
      setConnectedSuccess(false);
      setConnectModalTalent(null);
      setConnectMessage('');
    }, 1500);
  };

  return (
    <section className="py-20 md:py-28 bg-[#101510] border-y border-[#273128] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#273128] pb-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141B15] border border-[#273128] rounded-xs">
              <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                MEET THE TALENT
              </span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#F4F7F1] tracking-tight leading-[1.08] [text-wrap:balance]">
              THE NEXT BIG THING COULD BE BUILT BY SOMEONE HERE.
            </h2>

            <p className="text-base text-[#A0AAA0] leading-relaxed [text-wrap:pretty]">
              Discover ambitious individuals with skills, ideas and the drive to make things happen.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141B15] border border-[#273128] text-xs font-mono text-[#A0AAA0] rounded-xs self-start md:self-auto">
            <Info className="w-3.5 h-3.5 text-[#B6FF4A]" />
            <span>Demonstration Profiles</span>
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs border transition-colors cursor-pointer shrink-0 ${
                selectedRole === r
                  ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
                  : 'bg-[#141B15] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Talent Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTalent.map((talent) => (
            <Card
              key={talent.id}
              variant="interactive"
              className="p-6 bg-[#141B15] border-[#273128] flex flex-col justify-between group space-y-5"
            >
              <div className="space-y-4">
                {/* Avatar & Demo Tag */}
                <div className="flex items-start justify-between">
                  {/* Geometric Monogram Avatar */}
                  <div className="w-14 h-14 bg-[#101510] border-2 border-[#273128] group-hover:border-[#B6FF4A] text-[#B6FF4A] font-display font-extrabold text-lg flex items-center justify-center transition-colors shadow-inner">
                    {talent.avatarInitials}
                  </div>

                  <span className="text-[10px] font-mono text-[#A0AAA0] bg-[#101510] border border-[#273128] px-2 py-0.5">
                    Demo Profile
                  </span>
                </div>

                {/* Name & Role */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-lg text-[#F4F7F1] group-hover:text-white transition-colors">
                      {talent.name}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-[#B6FF4A]" />
                  </div>
                  <p className="text-xs font-mono text-[#B6FF4A] mt-0.5 font-medium">
                    {talent.role}
                  </p>
                </div>

                {/* Availability Badge */}
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#F4F7F1] bg-[#101510] border border-[#273128] px-2.5 py-1 rounded-xs">
                  <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
                  <span>{talent.availability}</span>
                </div>

                {/* Short Bio */}
                <p className="text-xs text-[#A0AAA0] leading-relaxed line-clamp-3">
                  {talent.bio}
                </p>

                {/* Skills */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#A0AAA0] block">
                    Core Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] font-mono px-2 py-0.5 bg-[#101510] border border-[#273128] text-[#F4F7F1] rounded-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#273128] space-y-2">
                <Button
                  size="sm"
                  variant="primary"
                  fullWidth
                  rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  onClick={() => setConnectModalTalent(talent)}
                >
                  Connect with {talent.name.split(' ')[0]}
                </Button>
                <Link to="/recruit" className="block w-full">
                  <Button size="sm" variant="ghost" fullWidth>
                    View in Talent Pool
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Section Footer Link */}
        <div className="pt-4 flex justify-center">
          <Link to="/recruit">
            <Button
              size="lg"
              variant="outline"
              rightIcon={<ArrowUpRight className="w-4 h-4 text-[#B6FF4A]" />}
            >
              Browse Complete Talent Pool
            </Button>
          </Link>
        </div>
      </div>

      {/* Connect Modal */}
      {connectModalTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B09]/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#141B15] border border-[#273128] p-6 sm:p-8 rounded-sm shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-4 border-b border-[#273128]">
              <div>
                <span className="text-[10px] font-mono text-[#B6FF4A] uppercase tracking-wider">
                  Outreach Dispatch
                </span>
                <h4 className="font-display font-bold text-xl text-[#F4F7F1]">
                  Connect with {connectModalTalent.name}
                </h4>
                <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                  {connectModalTalent.role} · {connectModalTalent.availability}
                </p>
              </div>
              <button
                onClick={() => setConnectModalTalent(null)}
                className="text-[#A0AAA0] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {connectedSuccess ? (
              <div className="p-6 bg-[#101510] border border-[#B6FF4A]/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#B6FF4A] mx-auto" />
                <h5 className="font-display font-bold text-sm text-[#F4F7F1]">
                  Connection Request Dispatched
                </h5>
                <p className="text-xs font-mono text-[#A0AAA0]">
                  {connectModalTalent.name} has been notified of your inquiry.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConnectSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#A0AAA0] uppercase">
                    Your Opportunity Pitch
                  </label>
                  <textarea
                    rows={4}
                    value={connectMessage}
                    onChange={(e) => setConnectMessage(e.target.value)}
                    placeholder={`Hi ${connectModalTalent.name.split(' ')[0]}, we are building an early-stage venture and love your work with ${connectModalTalent.skills[0]}...`}
                    className="w-full bg-[#101510] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-3 rounded-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setConnectModalTalent(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    rightIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Send Invitation
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
