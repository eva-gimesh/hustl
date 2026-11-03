import React, { useState } from 'react';
import { SAMPLE_OPPORTUNITIES } from '../data/mockData';
import { Opportunity, OpportunityCategory } from '../types';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { OpportunityModal } from '../components/opportunities/OpportunityModal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | OpportunityCategory>('all');
  const [workType, setWorkType] = useState<string>('all');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const filtered = SAMPLE_OPPORTUNITIES.filter((opp) => {
    const matchesCategory = category === 'all' || opp.category === category;
    const matchesWorkType = workType === 'all' || opp.type === workType;
    const matchesSearch =
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.organization.toLowerCase().includes(search.toLowerCase()) ||
      opp.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesWorkType && matchesSearch;
  });

  return (
    <div className="w-full py-12 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#273128] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A] rotate-45" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A]">
              Live Opportunity Radar
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F4F7F1]">
            Unified Exploration
          </h1>
          <p className="text-sm text-[#A0AAA0] mt-1">
            Search all open freelance briefs, startup recruitments, and co-founder teams in one view.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#A0AAA0]">
          <span>
            <strong className="text-[#B6FF4A]">{filtered.length}</strong> Results
          </span>
          <span>·</span>
          <span>Verified listings only</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-[#141B15] border border-[#273128] p-4 sm:p-6 rounded-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <Input
              placeholder="Search by keywords, tech stack, or organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Category Tabs */}
          <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All Vectors' },
                { id: 'freelance', label: 'Freelance' },
                { id: 'recruit', label: 'Recruit' },
                { id: 'teamup', label: 'TeamUp' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xs border transition-colors cursor-pointer shrink-0 ${
                  category === cat.id
                    ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
                    : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Work Type selector */}
          <div className="md:col-span-2">
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full bg-[#101510] border border-[#273128] text-xs font-mono text-[#F4F7F1] rounded-sm py-2.5 px-3 focus:outline-none focus:border-[#B6FF4A]"
            >
              <option value="all">Any Location</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-Site</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onApply={(selected) => setSelectedOpp(selected)}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-[#141B15] border border-[#273128] rounded-sm space-y-4">
          <p className="font-display font-semibold text-lg text-[#F4F7F1]">
            No matching opportunities found
          </p>
          <p className="text-xs font-mono text-[#A0AAA0] max-w-sm mx-auto">
            Try adjusting your search criteria or resetting the vector filters.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSearch('');
              setCategory('all');
              setWorkType('all');
            }}
          >
            Reset All Filters
          </Button>
        </div>
      )}

      {/* Application Modal */}
      <OpportunityModal
        opportunity={selectedOpp}
        onClose={() => setSelectedOpp(null)}
      />
    </div>
  );
};
