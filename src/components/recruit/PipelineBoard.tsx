import React, { useState } from 'react';
import { JobListing, JobApplication, JobApplicationStatus } from '../../types';
import { useRecruit } from '../../context/RecruitContext';
import {
  FileText,
  User,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Send,
  Calendar,
  Clock,
  Shield,
  Briefcase,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface PipelineBoardProps {
  job: JobListing;
}

const PIPELINE_STAGES: {
  id: JobApplicationStatus;
  label: string;
  countKey?: string;
  accentColor: string;
}[] = [
  { id: 'Submitted', label: '1. New Applications', accentColor: 'border-blue-500/50 text-blue-400' },
  { id: 'Under Review', label: '2. Under Review', accentColor: 'border-yellow-500/50 text-yellow-400' },
  { id: 'Shortlisted', label: '3. Shortlisted', accentColor: 'border-[#B6FF4A]/50 text-[#B6FF4A]' },
  { id: 'Interview', label: '4. Interview', accentColor: 'border-purple-500/50 text-purple-400' },
  { id: 'Selected', label: '5. Selected', accentColor: 'border-emerald-500/50 text-emerald-400' },
  { id: 'Rejected', label: '6. Rejected', accentColor: 'border-rose-500/50 text-rose-400' },
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ job }) => {
  const {
    getApplicationsForJob,
    updateApplicationStatus,
    getApplicationNotes,
    addApplicationNote,
  } = useRecruit();

  const applications = getApplicationsForJob(job.id);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Active notes for selected candidate
  const notes = selectedApp ? getApplicationNotes(selectedApp.id) : [];

  const handleStageChange = (appId: string, newStatus: JobApplicationStatus) => {
    updateApplicationStatus(appId, newStatus);
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleConfirmRejection = (appId: string) => {
    updateApplicationStatus(appId, 'Rejected', rejectionReasonInput || 'Candidate qualifications did not meet current role specifications.');
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp((prev) =>
        prev
          ? {
              ...prev,
              status: 'Rejected',
              rejectionReason:
                rejectionReasonInput || 'Candidate qualifications did not meet current role specifications.',
            }
          : null
      );
    }
    setIsRejecting(false);
    setRejectionReasonInput('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newNoteText.trim()) return;
    addApplicationNote(selectedApp.id, newNoteText.trim(), 'Lead Recruiter', 'Hiring Panel');
    setNewNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Pipeline Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = applications.filter((a) => a.status === stage.id).length;
          return (
            <div
              key={stage.id}
              className="p-3 bg-[#101510] border border-[#273128] rounded-sm text-xs font-mono"
            >
              <span className="text-[10px] text-[#A0AAA0] uppercase block tracking-wider truncate">
                {stage.label.split('. ')[1]}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold text-[#F4F7F1]">{count}</span>
                <span className={`w-2 h-2 rounded-full ${count > 0 ? 'bg-[#B6FF4A]' : 'bg-[#273128]'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 6-Column Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto min-h-[500px]">
        {PIPELINE_STAGES.map((stage) => {
          const stageApps = applications.filter((a) => a.status === stage.id);

          return (
            <div
              key={stage.id}
              className="bg-[#101510] border border-[#273128] rounded-sm flex flex-col min-w-[260px] md:min-w-0"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-[#273128] flex items-center justify-between bg-[#141B15]">
                <span className="text-xs font-mono font-bold text-[#F4F7F1] truncate">
                  {stage.label}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 bg-[#080B09] border border-[#273128] rounded-sm text-[#B6FF4A] font-bold">
                  {stageApps.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[650px]">
                {stageApps.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-[#A0AAA0]/50">
                    No candidates
                  </div>
                ) : (
                  stageApps.map((app) => {
                    const candidateNotes = getApplicationNotes(app.id);
                    const isSelected = selectedApp?.id === app.id;

                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`p-3 rounded-sm border cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'bg-[#141B15] border-[#B6FF4A] shadow-[0_0_15px_-3px_rgba(182,255,74,0.15)]'
                            : 'bg-[#101510] hover:bg-[#141B15] border-[#273128] hover:border-[#7CCB37]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-xs font-mono font-bold text-[#F4F7F1] truncate hover:text-[#B6FF4A]">
                            {app.applicantName}
                          </h4>
                          <span className="text-[10px] font-mono text-[#A0AAA0] shrink-0">
                            {new Date(app.appliedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {app.applicantHeadline && (
                          <p className="text-[11px] text-[#A0AAA0] line-clamp-1 mb-2 font-mono">
                            {app.applicantHeadline}
                          </p>
                        )}

                        {/* Education snippet */}
                        {app.applicantEducation && (
                          <p className="text-[10px] text-[#A0AAA0]/70 truncate mb-2">
                            🎓 {app.applicantEducation}
                          </p>
                        )}

                        {/* Skills preview */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {app.applicantSkills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="text-[9px] font-mono px-1.5 py-0.2 bg-[#080B09] border border-[#273128] text-[#A0AAA0]"
                            >
                              {s}
                            </span>
                          ))}
                          {app.applicantSkills.length > 3 && (
                            <span className="text-[9px] font-mono text-[#7CCB37]/70">
                              +{app.applicantSkills.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Footer: Notes & Quick Move */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#273128]/70 text-[10px] font-mono text-[#A0AAA0]">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-[#7CCB37]" />
                            <span>{candidateNotes.length} notes</span>
                          </span>

                          <span className="text-[#B6FF4A] flex items-center gap-0.5 hover:underline">
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Inspection Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl h-full bg-[#101510] border-l border-[#273128] flex flex-col p-6 sm:p-8 overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#273128] mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B6FF4A] bg-[#B6FF4A]/10 px-2 py-0.5 border border-[#B6FF4A]/30">
                    STAGE: {selectedApp.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-[#A0AAA0]">
                    Applied {new Date(selectedApp.appliedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
                  {selectedApp.applicantName}
                </h3>
                <p className="text-xs font-mono text-[#A0AAA0] mt-0.5">
                  {selectedApp.applicantHeadline || 'Applicant for ' + job.title}
                </p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 border border-[#273128] text-[#A0AAA0] hover:text-[#F4F7F1] rounded-sm transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stage Transition Actions */}
            <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm mb-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A0AAA0] block mb-2">
                Move Candidate Across Pipeline
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PIPELINE_STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStageChange(selectedApp.id, s.id)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-sm border transition-colors cursor-pointer ${
                      selectedApp.status === s.id
                        ? 'bg-[#B6FF4A] text-[#080B09] border-[#B6FF4A] font-bold'
                        : 'bg-[#101510] text-[#A0AAA0] border-[#273128] hover:text-[#F4F7F1] hover:border-[#7CCB37]'
                    }`}
                  >
                    {s.label.split('. ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Content Body */}
            <div className="space-y-6 flex-1 text-xs font-mono">
              {/* Contact & Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#141B15] border border-[#273128] rounded-sm">
                <div>
                  <span className="text-[10px] uppercase text-[#A0AAA0] block">Contact Email</span>
                  <a
                    href={`mailto:${selectedApp.applicantEmail}`}
                    className="text-[#B6FF4A] hover:underline"
                  >
                    {selectedApp.applicantEmail}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#A0AAA0] block">Education</span>
                  <span className="text-[#F4F7F1]">
                    {selectedApp.applicantEducation || 'Not provided'}
                  </span>
                </div>
                {selectedApp.portfolioUrl && (
                  <div className="col-span-full">
                    <span className="text-[10px] uppercase text-[#A0AAA0] block">Portfolio / GitHub</span>
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#B6FF4A] hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{selectedApp.portfolioUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Resume Document Link */}
              <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#B6FF4A]" />
                  <div>
                    <span className="text-xs font-bold text-[#F4F7F1] block">
                      {selectedApp.resumeFileName || 'Applicant_Resume.pdf'}
                    </span>
                    <span className="text-[10px] text-[#A0AAA0]">Formatted for recruiter review</span>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Simulating PDF preview for: ${selectedApp.resumeFileName || 'Resume.pdf'}`)}
                  className="px-3 py-1.5 bg-[#101510] hover:bg-[#1f2920] border border-[#273128] text-xs text-[#B6FF4A] rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Resume</span>
                </button>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-[#7CCB37] mb-2">
                  Verified Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.applicantSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 bg-[#141B15] border border-[#273128] text-[#F4F7F1]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider text-[#7CCB37] mb-2">
                    Applicant Cover Note
                  </h4>
                  <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm text-[#F4F7F1] leading-relaxed whitespace-pre-wrap">
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}

              {/* Relevant Experience */}
              {selectedApp.relevantExperience && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider text-[#7CCB37] mb-2">
                    Relevant Project Experience
                  </h4>
                  <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm text-[#F4F7F1] leading-relaxed whitespace-pre-wrap">
                    {selectedApp.relevantExperience}
                  </div>
                </div>
              )}

              {/* Custom Screening Answers */}
              {selectedApp.answers && selectedApp.answers.length > 0 && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider text-[#7CCB37] mb-2">
                    Screening Question Responses
                  </h4>
                  <div className="space-y-2">
                    {selectedApp.answers.map((ans, idx) => (
                      <div key={idx} className="p-3 bg-[#141B15] border border-[#273128] rounded-sm">
                        <span className="text-[10px] text-[#A0AAA0] block mb-1">
                          {idx + 1}. {ans.question}
                        </span>
                        <p className="text-xs text-[#F4F7F1] font-semibold">{ans.answer || '(None)'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection notice if status is Rejected */}
              {selectedApp.status === 'Rejected' && selectedApp.rejectionReason && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <span className="font-bold block uppercase text-[10px]">Rejection Rationale:</span>
                  <p className="mt-1">{selectedApp.rejectionReason}</p>
                </div>
              )}

              {/* Internal Recruiter Notes */}
              <div className="pt-4 border-t border-[#273128]">
                <h4 className="text-[11px] uppercase tracking-wider text-[#7CCB37] mb-3 flex items-center justify-between">
                  <span>Internal Recruiter Notes ({notes.length})</span>
                  <span className="text-[10px] text-[#A0AAA0]">Only visible to hiring panel</span>
                </h4>

                <div className="space-y-2 mb-4">
                  {notes.length === 0 ? (
                    <p className="text-xs text-[#A0AAA0] italic p-3 bg-[#141B15] border border-[#273128] rounded-sm">
                      No internal notes recorded yet. Add evaluation feedback below.
                    </p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="p-3 bg-[#141B15] border border-[#273128] rounded-sm">
                        <div className="flex items-center justify-between mb-1 text-[10px] text-[#A0AAA0]">
                          <span className="font-bold text-[#F4F7F1]">{n.authorName} ({n.authorRole})</span>
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-[#F4F7F1] leading-relaxed">{n.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add interview feedback or notes..."
                    className="flex-1 bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-xs text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                  />
                  <Button type="submit" variant="secondary" size="sm" rightIcon={<Send className="w-3.5 h-3.5" />}>
                    Save Note
                  </Button>
                </form>
              </div>
            </div>

            {/* Bottom Actions Drawer */}
            <div className="pt-6 border-t border-[#273128] flex items-center justify-between gap-3 mt-6">
              {isRejecting ? (
                <div className="w-full space-y-2">
                  <textarea
                    rows={2}
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Reason for rejection (e.g. requires more PostgreSQL production experience)..."
                    className="w-full bg-[#141B15] border border-[#273128] text-xs text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsRejecting(false)}>
                      Cancel
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleConfirmRejection(selectedApp.id)}
                      className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 rounded-sm text-xs font-mono transition-colors cursor-pointer"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="px-3 py-1.5 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 rounded-sm text-xs font-mono transition-colors cursor-pointer"
                    >
                      Reject Candidate
                    </button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => alert(`Simulating email invitation sent to ${selectedApp.applicantEmail}`)}
                    >
                      Send Message
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedApp.status !== 'Selected' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStageChange(selectedApp.id, 'Selected')}
                        rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Select Candidate
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
