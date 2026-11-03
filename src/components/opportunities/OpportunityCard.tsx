import React from 'react';
import { Opportunity } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetaTag, InlineMeta } from '../ui/Badge';
import { ArrowUpRight, IndianRupee as DollarSign, Clock, MapPin, Users } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onApply?: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onApply,
}) => {
  const categoryIndicatorMap = {
    freelance: 'accent' as const,
    recruit: 'default' as const,
    teamup: 'accent' as const,
  };

  const categoryLabelMap = {
    freelance: 'FREELANCE BRIEF',
    recruit: 'RECRUIT ROLE',
    teamup: 'TEAMUP VENTURE',
  };

  return (
    <Card
      variant="interactive"
      className="flex flex-col justify-between h-full group"
      accentBorder={opportunity.featured}
    >
      <div className="space-y-4">
        {/* Top bar with category and compensation */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <MetaTag
            label={categoryLabelMap[opportunity.category]}
            indicator={categoryIndicatorMap[opportunity.category]}
          />

          <div className="text-right">
            <span className="font-mono font-bold text-base md:text-lg text-[#B6FF4A] tabular-nums">
              {opportunity.compensation}
            </span>
          </div>
        </div>

        {/* Opportunity Title & Organization */}
        <div>
          <h3 className="font-display font-bold text-lg md:text-xl text-[#F4F7F1] group-hover:text-white transition-colors leading-snug">
            {opportunity.title}
          </h3>
          <p className="text-xs font-mono text-[#A0AAA0] mt-1">
            {opportunity.organization}
          </p>
        </div>

        {/* Summary */}
        <p className="text-sm text-[#A0AAA0] line-clamp-2 leading-relaxed">
          {opportunity.summary}
        </p>

        {/* Key Logistics Metadata */}
        <InlineMeta
          items={[
            <span key="loc" className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#B6FF4A]" /> {opportunity.location}
            </span>,
            <span key="time" className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#A0AAA0]" /> {opportunity.timeline}
            </span>,
            <span key="app" className="inline-flex items-center gap-1">
              <Users className="w-3 h-3 text-[#A0AAA0]" /> {opportunity.applicantCount} applied
            </span>,
          ]}
        />

        {/* Skills Tag Strip */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {opportunity.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs font-mono px-2 py-0.5 border border-[#273128] bg-[#101510] text-[#A0AAA0] rounded-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 mt-4 border-t border-[#273128] flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-[#A0AAA0]/70">
          Verified Brief
        </span>
        <Button
          size="sm"
          variant="secondary"
          rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          onClick={() => onApply?.(opportunity)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};
