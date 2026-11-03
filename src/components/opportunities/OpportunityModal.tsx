import React, { useState } from 'react';
import { Opportunity } from '../../types';
import { Button } from '../ui/Button';
import { MetaTag, InlineMeta } from '../ui/Badge';
import { Input, Textarea } from '../ui/Input';
import { X, CheckCircle2, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  opportunity,
  onClose,
}) => {
  const [pitch, setPitch] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!opportunity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setPitch('');
    setPortfolioUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B09]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#141B15] border border-[#273128] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-[#273128] flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MetaTag label={opportunity.category.toUpperCase()} indicator="accent" />
                <span className="text-xs font-mono text-[#A0AAA0]">
                  REF: {opportunity.id}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl md:text-2xl text-[#F4F7F1]">
                {opportunity.title}
              </h3>
              <p className="text-xs font-mono text-[#B6FF4A] mt-1">
                {opportunity.organization}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#A0AAA0] hover:text-white hover:bg-[#101510] border border-transparent hover:border-[#273128] rounded-sm transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Compensation & Logistics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#101510] border border-[#273128] rounded-sm">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A0AAA0]">
                  Compensation
                </span>
                <p className="font-mono font-bold text-[#B6FF4A] text-sm tabular-nums mt-0.5">
                  {opportunity.compensation}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A0AAA0]">
                  Location
                </span>
                <p className="text-xs text-[#F4F7F1] mt-0.5 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#B6FF4A]" /> {opportunity.location}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A0AAA0]">
                  Timeline
                </span>
                <p className="text-xs text-[#F4F7F1] mt-0.5 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#A0AAA0]" /> {opportunity.timeline}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A0AAA0]">
                  Applicants
                </span>
                <p className="text-xs text-[#F4F7F1] mt-0.5 font-medium flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#A0AAA0]" /> {opportunity.applicantCount} active
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0]">
                Scope & Requirements
              </h4>
              <p className="text-sm text-[#F4F7F1] leading-relaxed">
                {opportunity.summary}
              </p>
            </div>

            {/* Required Stack */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0]">
                Demonstrated Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 text-xs font-mono border border-[#273128] bg-[#101510] text-[#B6FF4A] rounded-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Application Section */}
            {submitted ? (
              <div className="p-6 bg-[#101510] border border-[#B6FF4A]/40 rounded-sm text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#B6FF4A] mx-auto" />
                <h4 className="font-display font-bold text-lg text-[#F4F7F1]">
                  Application Dispatched
                </h4>
                <p className="text-xs text-[#A0AAA0] max-w-sm mx-auto leading-relaxed">
                  Your verified profile and proposal have been logged to the client review desk. Target response window: 48 hours.
                </p>
                <div className="pt-2">
                  <Button size="sm" variant="outline" onClick={handleReset}>
                    Close & Return to Radar
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-[#273128]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#F4F7F1]">
                  Fast-Track Submission (Proof of Work)
                </h4>
                <Input
                  label="GitHub / Portfolio Proof URL"
                  placeholder="https://github.com/yourhandle or portfolio link"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  required
                />
                <Textarea
                  label="Brief Pitch & Why You're Built For This"
                  placeholder="Summarize relevant systems you built, timeline availability, and initial thoughts on the architecture."
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  rows={3}
                  required
                />
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={submitting}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Transmit Application
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
