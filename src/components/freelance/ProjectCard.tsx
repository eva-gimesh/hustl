import React from 'react';
import { Link } from 'react-router-dom';
import { FreelanceProject } from '../../types';
import { useFreelance } from '../../context/FreelanceContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  Clock,
  MapPin,
  Users,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { formatBudgetRange } from '../../utils/currency';

interface ProjectCardProps {
  project: FreelanceProject;
  onApplyClick?: (project: FreelanceProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onApplyClick }) => {
  const { isProjectSaved, toggleSaveProject } = useFreelance();
  const saved = isProjectSaved(project.id);
  const isOpen = project.status === 'open';

  return (
    <Card
      variant="interactive"
      className="p-6 bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A]/50 transition-all flex flex-col justify-between group relative overflow-hidden"
    >
      <div className="space-y-4">
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-[#B6FF4A] font-medium">{project.category}</span>
              <span className="text-[#273128]" aria-hidden="true">·</span>
              <span className="text-[#A0AAA0]">{project.workMode}</span>
              {project.isDemo && (
                <>
                  <span className="text-[#273128]" aria-hidden="true">·</span>
                  <span className="text-amber-400/90 text-[10px] tracking-wider uppercase font-semibold">
                    Demo Listing
                  </span>
                </>
              )}
            </div>

            <Link to={`/freelance/${project.id}`}>
              <h3 className="font-display font-bold text-lg text-[#F4F7F1] group-hover:text-[#B6FF4A] transition-colors line-clamp-1">
                {project.title}
              </h3>
            </Link>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaveProject(project.id);
            }}
            aria-label={saved ? 'Remove from saved' : 'Save project'}
            className="p-2 text-[#A0AAA0] hover:text-[#B6FF4A] hover:bg-[#101510] border border-transparent hover:border-[#273128] rounded-xs transition-colors cursor-pointer shrink-0"
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4 text-[#B6FF4A] fill-[#B6FF4A]" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Client & Location */}
        <div className="flex items-center gap-3 text-xs font-mono text-[#A0AAA0]">
          <span className="flex items-center gap-1.5 text-[#F4F7F1] font-medium truncate max-w-[200px]">
            <Building2 className="w-3.5 h-3.5 text-[#7CCB37] shrink-0" />
            {project.clientName}
          </span>
          <span className="text-[#273128]" aria-hidden="true">·</span>
          <span className="truncate">{project.location}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-[#A0AAA0] leading-relaxed line-clamp-2">
          {project.description}
        </p>

        {/* Required Skills Tags (Clean Unboxed Tags) */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.requiredSkills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-mono px-2 py-0.5 border border-[#273128] bg-[#101510] text-[#A0AAA0] rounded-xs"
            >
              {skill}
            </span>
          ))}
          {project.requiredSkills.length > 4 && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 text-[#A0AAA0]">
              +{project.requiredSkills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Compensation & Actions */}
      <div className="pt-5 mt-5 border-t border-[#273128] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-display font-bold text-[#F4F7F1] tabular-nums">
            {formatBudgetRange(project.budgetMin, project.budgetMax)}
          </div>
          <div className="text-[11px] font-mono text-[#A0AAA0] flex items-center gap-1.5 mt-0.5">
            <span>{project.paymentType}</span>
            <span className="text-[#273128]" aria-hidden="true">·</span>
            <span>{project.duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/freelance/${project.id}`} className="shrink-0">
            <Button size="sm" variant="ghost" className="text-xs font-mono">
              Brief <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>

          {isOpen ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onApplyClick?.(project)}
              className="text-xs font-mono"
            >
              Apply
            </Button>
          ) : (
            <span className="text-xs font-mono px-2.5 py-1 bg-[#101510] border border-[#273128] text-[#A0AAA0] rounded-xs uppercase">
              {project.status}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
