import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_OPPORTUNITIES } from '../../data/mockData';
import { Opportunity, OpportunityWorkType } from '../../types';
import { OpportunityModal } from '../opportunities/OpportunityModal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowUpRight, MapPin, Clock, IndianRupee as DollarSign, Calendar, Info, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FeaturedOpportunitiesSection: React.FC = () => {
  const [filterType, setFilterType] = useState<'All' | OpportunityWorkType>('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  const filterTabs: ('All' | OpportunityWorkType)[] = [
    'All',
    'Freelance',
    'Internship',
    'Full-time',
    'Part-time',
    'Collaboration',
  ];

  const filteredList =
    filterType === 'All'
      ? SAMPLE_OPPORTUNITIES
      : SAMPLE_OPPORTUNITIES.filter((opp) => opp.opportunityType === filterType);

  return (
    <section className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#273128] pb-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101510] border border-[#273128] rounded-xs">
              <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
                OPPORTUNITY BOARD
              </span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#F4F7F1] tracking-tight leading-[1.08] [text-wrap:balance]">
              THERE'S SOMETHING OUT THERE FOR YOU.
            </h2>

            <p className="text-base text-[#A0AAA0] leading-relaxed [text-wrap:pretty]">
              Explore opportunities across projects, internships, jobs and collaborations.
            </p>
          </div>

          {/* Demo disclaimer notice */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141B15] border border-[#273128] text-xs font-mono text-[#A0AAA0] rounded-xs self-start md:self-auto">
            <Info className="w-3.5 h-3.5 text-[#B6FF4A]" />
            <span>Sample Demonstration Content</span>
          </div>
        </div>

        {/* Working Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {filterTabs.map((tab) => {
            const count =
              tab === 'All'
                ? SAMPLE_OPPORTUNITIES.length
                : SAMPLE_OPPORTUNITIES.filter((o) => o.opportunityType === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xs border transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
                  filterType === tab
                    ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold shadow-sm'
                    : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1] hover:border-[#A0AAA0]'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-none ${
                    filterType === tab ? 'bg-[#080B09] text-[#B6FF4A]' : 'bg-[#141B15] text-[#A0AAA0]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Opportunity Listings Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredList.map((opp) => (
              <motion.div
                key={opp.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <Card
                  variant="interactive"
                  className="p-6 bg-[#141B15] border-[#273128] h-full flex flex-col justify-between group space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header: Type, Demo Notice & Compensation */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#B6FF4A] bg-[#B6FF4A]/10 px-2 py-0.5 border border-[#B6FF4A]/30">
                          {opp.opportunityType}
                        </span>
                        <div className="text-[10px] font-mono text-[#A0AAA0]/70 flex items-center gap-1">
                          <span>Demo Listing</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-sm sm:text-base text-[#F4F7F1] group-hover:text-[#B6FF4A] transition-colors tabular-nums">
                          {opp.compensation}
                        </span>
                        <div className="text-[10px] font-mono text-[#A0AAA0]">
                          {opp.compensationType}
                        </div>
                      </div>
                    </div>

                    {/* Title & Company */}
                    <div>
                      <h3 className="font-display font-bold text-lg sm:text-xl text-[#F4F7F1] group-hover:text-white transition-colors leading-snug">
                        {opp.title}
                      </h3>
                      <p className="text-xs font-mono text-[#A0AAA0] mt-1 font-medium">
                        {opp.organization}
                      </p>
                    </div>

                    {/* Required Skills */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#A0AAA0] block">
                        Required Skills:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {opp.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs font-mono px-2 py-0.5 bg-[#101510] border border-[#273128] text-[#F4F7F1] rounded-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Strip: Work mode & Posted Date */}
                    <div className="pt-2 flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#B6FF4A]" /> {opp.workMode}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#A0AAA0]" /> {opp.postedDate || 'Recent'}
                      </span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-4 border-t border-[#273128] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#A0AAA0]">
                      {opp.applicantCount} candidates applied
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedOpportunity(opp)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Opportunities CTA */}
        <div className="pt-6 flex justify-center">
          <Link to="/explore">
            <Button
              size="lg"
              variant="outline"
              rightIcon={<ArrowUpRight className="w-4 h-4 text-[#B6FF4A]" />}
            >
              View All Opportunities
            </Button>
          </Link>
        </div>
      </div>

      {/* Details & Fast-Track Application Modal */}
      <OpportunityModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </section>
  );
};
