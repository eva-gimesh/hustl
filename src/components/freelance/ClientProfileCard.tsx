import React from 'react';
import { FreelanceProject } from '../../types';
import { Card } from '../ui/Card';
import {
  Building2,
  MapPin,
  Globe,
  Calendar,
  CheckCircle2,
  FolderGit2,
  ExternalLink,
} from 'lucide-react';

interface ClientProfileCardProps {
  project: FreelanceProject;
}

export const ClientProfileCard: React.FC<ClientProfileCardProps> = ({ project }) => {
  return (
    <Card className="p-6 bg-[#141B15] border border-[#273128] space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#101510] border border-[#273128] text-[#B6FF4A] font-display font-bold text-lg flex items-center justify-center rounded-xs shrink-0">
          {project.clientName.substring(0, 2).toUpperCase()}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-display font-bold text-base text-[#F4F7F1] truncate">
              {project.clientName}
            </h3>
            {project.clientVerified && (
              <span title="Verified Client Organization">
                <CheckCircle2 className="w-4 h-4 text-[#B6FF4A] shrink-0" />
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-[#A0AAA0] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#7CCB37]" />
            {project.clientLocation}
          </p>
        </div>
      </div>

      <p className="text-xs text-[#A0AAA0] leading-relaxed">
        {project.clientDescription}
      </p>

      <div className="pt-3 border-t border-[#273128] space-y-2.5 text-xs font-mono text-[#A0AAA0]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#7CCB37]" />
            Member Since
          </span>
          <span className="text-[#F4F7F1]">{project.clientJoinedDate}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-[#7CCB37]" />
            Projects Published
          </span>
          <span className="text-[#F4F7F1] font-bold tabular-nums">
            {project.clientPublishedProjectsCount} active briefs
          </span>
        </div>

        {project.clientWebsite && (
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#7CCB37]" />
              Website
            </span>
            <a
              href={project.clientWebsite}
              target="_blank"
              rel="noreferrer"
              className="text-[#B6FF4A] hover:underline flex items-center gap-1 truncate max-w-[140px]"
            >
              {project.clientWebsite.replace(/^https?:\/\//, '')}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        )}
      </div>
    </Card>
  );
};
