import React from 'react';
import { Link } from 'react-router-dom';
import { StartupIdea } from '../../types';
import { useTeamUp } from '../../context/TeamUpContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bookmark,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  Compass,
  Briefcase,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface IdeaCardProps {
  idea: StartupIdea;
  onApplyClick?: (idea: StartupIdea) => void;
  showMatchScore?: boolean;
}

const STAGE_COLORS: Record<string, string> = {
  'Just an Idea': 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30',
  Researching: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  Validating: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Building MVP': 'text-[#B6FF4A] bg-[#B6FF4A]/10 border-[#B6FF4A]/30',
  Launched: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Growing: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onApplyClick, showMatchScore = true }) => {
  const { isIdeaSaved, toggleSaveIdea, calculateMatchScore } = useTeamUp();
  const { user } = useAuth();

  const saved = isIdeaSaved(idea.id);
  const match = showMatchScore ? calculateMatchScore(idea, user?.skills) : null;
  const stageColor = STAGE_COLORS[idea.developmentStage] || 'text-[#A0AAA0] bg-[#141B15] border-[#273128]';

  const openRolesCount = idea.openRoles.filter((r) => r.isOpen).length;

  return (
    <div className="group relative bg-[#101510] border border-[#273128] hover:border-[#7CCB37]/50 rounded-sm p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-[0_4px_24px_-4px_rgba(182,255,74,0.08)]">
      {/* Top row: Stage, Industry, Demo Badge, Save Button */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 border rounded-sm uppercase tracking-wider ${stageColor}`}
            >
              {idea.developmentStage}
            </span>
            <span className="text-[10px] font-mono text-[#A0AAA0] px-2 py-0.5 bg-[#141B15] border border-[#273128] uppercase">
              {idea.industry}
            </span>
            {idea.isDemo && (
              <span className="text-[10px] font-mono text-[#7CCB37] bg-[#7CCB37]/10 px-1.5 py-0.5 border border-[#7CCB37]/30 uppercase">
                DEMO
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaveIdea(idea.id);
            }}
            className={`p-1.5 rounded-sm border transition-colors cursor-pointer shrink-0 ${
              saved
                ? 'border-[#B6FF4A] text-[#B6FF4A] bg-[#B6FF4A]/10'
                : 'border-[#273128] text-[#A0AAA0] hover:text-[#F4F7F1]'
            }`}
            title={saved ? 'Remove saved idea' : 'Save idea'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#B6FF4A]' : ''}`} />
          </button>
        </div>

        {/* Title & Tagline */}
        <Link to={`/teamup/ideas/${idea.id}`} className="block group-hover:text-[#B6FF4A] transition-colors">
          <h3 className="font-display font-bold text-xl text-[#F4F7F1] tracking-tight mb-1">
            {idea.title}
          </h3>
          <p className="text-xs font-mono text-[#B6FF4A] line-clamp-1 mb-3">
            {idea.tagline}
          </p>
        </Link>

        {/* Founder & Metadata Line */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-[#A0AAA0] mb-4">
          <span className="text-[#F4F7F1]">By {idea.ownerName}</span>
          {idea.ownerCollege && (
            <>
              <span className="text-[#273128]">·</span>
              <span className="truncate max-w-[130px]">{idea.ownerCollege}</span>
            </>
          )}
          <span className="text-[#273128]">·</span>
          <span>{idea.workMode}</span>
        </div>

        {/* Problem & Solution Snippet */}
        <p className="text-xs text-[#A0AAA0] line-clamp-2 leading-relaxed mb-4">
          {idea.problemStatement}
        </p>

        {/* Open Roles Pillbox */}
        <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm mb-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#A0AAA0] uppercase tracking-wider">Seeking Roles ({openRolesCount})</span>
            <span className="text-[#B6FF4A]">{idea.compensationModel}</span>
          </div>

          <div className="space-y-1">
            {idea.openRoles.slice(0, 2).map((role) => (
              <div
                key={role.id}
                className="text-xs font-mono text-[#F4F7F1] flex items-center justify-between truncate"
              >
                <span className="truncate">• {role.roleTitle}</span>
                <span className="text-[10px] text-[#A0AAA0] shrink-0">{role.timeCommitment}</span>
              </div>
            ))}
            {idea.openRoles.length > 2 && (
              <span className="text-[10px] font-mono text-[#7CCB37]/80 block">
                +{idea.openRoles.length - 2} more roles open
              </span>
            )}
          </div>
        </div>

        {/* Match score if available */}
        {match && match.matchedSkills.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#B6FF4A] mb-4 bg-[#B6FF4A]/5 border border-[#B6FF4A]/20 px-2.5 py-1 rounded-sm">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{match.reason}</span>
          </div>
        )}

        {/* Required Skills unboxed tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {idea.requiredSkills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-mono px-2 py-0.5 bg-[#141B15] border border-[#273128] text-[#A0AAA0]"
            >
              {skill}
            </span>
          ))}
          {idea.requiredSkills.length > 4 && (
            <span className="text-[10px] font-mono text-[#7CCB37]/70">
              +{idea.requiredSkills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="pt-3 border-t border-[#273128] flex items-center justify-between gap-3 text-xs font-mono">
        <span className="text-[#A0AAA0] flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#7CCB37]" />
          <span>{idea.teamSize} member{idea.teamSize === 1 ? '' : 's'}</span>
        </span>

        <div className="flex items-center gap-2">
          <Link
            to={`/teamup/ideas/${idea.id}`}
            className="px-3 py-1.5 text-xs text-[#A0AAA0] hover:text-[#F4F7F1] border border-[#273128] hover:border-[#7CCB37]/40 rounded-sm transition-colors"
          >
            Explore Team
          </Link>

          {onApplyClick && openRolesCount > 0 && (
            <button
              onClick={() => onApplyClick(idea)}
              className="px-3 py-1.5 text-xs font-bold bg-[#B6FF4A] text-[#080B09] hover:bg-[#a3f033] rounded-sm transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Join</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
