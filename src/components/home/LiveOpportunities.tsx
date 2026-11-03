import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_OPPORTUNITIES } from '../../data/mockData';
import { Opportunity, OpportunityCategory } from '../../types';
import { OpportunityCard } from '../opportunities/OpportunityCard';
import { OpportunityModal } from '../opportunities/OpportunityModal';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { ArrowUpRight } from 'lucide-react';

export const LiveOpportunities: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | OpportunityCategory>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  const filteredOpportunities =
    activeCategory === 'all'
      ? SAMPLE_OPPORTUNITIES
      : SAMPLE_OPPORTUNITIES.filter((opp) => opp.category === activeCategory);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#273128] pb-8">
          <SectionHeader
            kicker="Live Radar"
            title="Fresh briefs, open roles, and venture sprints."
            subtitle="Explore high-paying freelance development milestones, high-growth startup recruitments, and co-founder opportunities updated in real-time."
          />

          {/* Interactive filter controls - buttons per §1.A */}
          <div className="flex items-center gap-1.5 p-1 bg-[#101510] border border-[#273128] rounded-sm self-start">
            {(
              [
                { id: 'all', label: 'All (6)' },
                { id: 'freelance', label: 'Freelance' },
                { id: 'recruit', label: 'Recruit' },
                { id: 'teamup', label: 'TeamUp' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#B6FF4A] text-[#080B09] font-bold shadow-sm'
                    : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onApply={(opp) => setSelectedOpportunity(opp)}
            />
          ))}
        </div>

        <div className="pt-4 flex items-center justify-center">
          <Link to="/explore">
            <Button variant="secondary" size="md" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Open Full Opportunity Radar
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Modal */}
      <OpportunityModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </section>
  );
};
