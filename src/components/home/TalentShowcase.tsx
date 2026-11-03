import React from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_TALENT } from '../../data/mockData';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SectionHeader } from '../ui/SectionHeader';
import { ArrowUpRight, CheckCircle2, Star, Code2, Briefcase } from 'lucide-react';

export const TalentShowcase: React.FC = () => {
  return (
    <section className="py-20 bg-[#101510] border-y border-[#273128]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeader
            kicker="Collegiate & Indie Vanguard"
            title="Demonstrated proof. Not padded resumes."
            subtitle="HUSTL builders are actively shipping products, winning global hackathons, and developing next-generation protocols. Inspect their verified repositories and work history."
          />
          <Link to="/talent" className="shrink-0">
            <Button variant="secondary" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Browse Full Talent Pool
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_TALENT.map((talent) => (
            <Card
              key={talent.id}
              variant="interactive"
              className="flex flex-col justify-between p-6 bg-[#141B15]"
            >
              <div className="space-y-4">
                {/* Talent Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-lg text-[#F4F7F1]">
                        {talent.name}
                      </h3>
                      {talent.verified && (
                        <CheckCircle2 className="w-4 h-4 text-[#B6FF4A]" />
                      )}
                    </div>
                    <span className="text-xs font-mono text-[#A0AAA0]">
                      {talent.handle}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#B6FF4A] bg-[#101510] px-2.5 py-1 border border-[#273128] rounded-xs tabular-nums">
                    {talent.hourlyRate}
                  </span>
                </div>

                {/* Subtitle & School */}
                <div>
                  <p className="text-xs font-medium text-[#F4F7F1]">
                    {talent.title}
                  </p>
                  <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                    {talent.institution}
                  </p>
                </div>

                {/* Bio */}
                <p className="text-xs text-[#A0AAA0] leading-relaxed line-clamp-3">
                  {talent.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {talent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-mono px-2 py-0.5 border border-[#273128] bg-[#101510] text-[#A0AAA0] rounded-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics & Actions */}
              <div className="pt-6 mt-6 border-t border-[#273128] flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
                  <span className="flex items-center gap-1 text-[#F4F7F1]">
                    <Star className="w-3.5 h-3.5 text-[#B6FF4A] fill-[#B6FF4A]" />
                    <span className="tabular-nums font-bold">{talent.rating}</span>
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">{talent.completedProjects} projects</span>
                </div>

                <Link to={`/profile/${talent.id}`}>
                  <span className="text-xs font-mono text-[#B6FF4A] hover:underline flex items-center gap-1 cursor-pointer">
                    View Profile <ArrowUpRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
