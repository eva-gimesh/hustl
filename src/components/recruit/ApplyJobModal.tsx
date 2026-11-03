import React, { useState } from 'react';
import { JobListing, CustomQuestionAnswer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRecruit } from '../../context/RecruitContext';
import { X, Upload, CheckCircle2, AlertCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface ApplyJobModalProps {
  job: JobListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({ job, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { applyToJob, hasAppliedToJob } = useRecruit();

  // Step 1: Form Details, Step 2: Review and Submit
  const [step, setStep] = useState<'form' | 'review'>('form');

  // Form Fields prefilled from current user profile
  const [applicantName, setApplicantName] = useState(user?.fullName || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [applicantHeadline, setApplicantHeadline] = useState(user?.bio || user?.experience?.previousExperience || 'Student Software Builder');
  const [applicantEducation, setApplicantEducation] = useState(
    user?.education ? `${user.education.degree || 'Degree'}, ${user.education.institution || 'University'} (${user.education.graduationYear || '2026'})` : 'B.S. Computer Science, UC Berkeley (2026)'
  );
  const [coverLetter, setCoverLetter] = useState('');
  const [relevantExperience, setRelevantExperience] = useState(user?.experience?.previousExperience || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.preferences?.portfolioUrl || user?.preferences?.githubUrl || 'https://github.com/hamlin-jaiju');
  
  // Simulated resume
  const [resumeFileName, setResumeFileName] = useState('Hamlin_Jaiju_Resume_2026.pdf');
  const [resumeSize, setResumeSize] = useState('1.2 MB');
  const [hasResume, setHasResume] = useState(true);

  // Custom question answers
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (job.customQuestions) {
      job.customQuestions.forEach((q) => {
        initial[q.id] = '';
      });
    }
    return initial;
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentUserId = user?.id || 'usr_demo_8829';
  const alreadyApplied = hasAppliedToJob(job.id, currentUserId);

  const handleResumeSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      setResumeSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setHasResume(true);
    }
  };

  const validateForm = () => {
    setError(null);
    if (!applicantName.trim()) {
      setError('Please provide your full name');
      return false;
    }
    if (!applicantEmail.trim() || !applicantEmail.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (job.requiresResume && !hasResume) {
      setError('A resume is required for this role');
      return false;
    }
    if (job.requiresCoverLetter && !coverLetter.trim()) {
      setError('A cover letter or fit explanation is required by the recruiter');
      return false;
    }
    if (job.requiresPortfolio && !portfolioUrl.trim()) {
      setError('A portfolio or GitHub profile URL is required for this opening');
      return false;
    }

    // Check custom questions
    if (job.customQuestions) {
      for (const q of job.customQuestions) {
        if (q.required && (!customAnswers[q.id] || !customAnswers[q.id].trim())) {
          setError(`Please answer the required question: "${q.question}"`);
          return false;
        }
      }
    }

    return true;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('review');
    }
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setError(null);

    const answersList: CustomQuestionAnswer[] = job.customQuestions
      ? job.customQuestions.map((q) => ({
          questionId: q.id,
          question: q.question,
          answer: customAnswers[q.id] || '',
        }))
      : [];

    const result = applyToJob({
      jobId: job.id,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      applicantId: currentUserId,
      applicantName,
      applicantEmail,
      applicantHeadline,
      applicantEducation,
      applicantSkills: user?.skills || ['React', 'TypeScript', 'Node.js'],
      resumeUrl: hasResume ? `https://example.com/resumes/${resumeFileName}` : '',
      resumeFileName: hasResume ? resumeFileName : undefined,
      coverLetter,
      relevantExperience,
      portfolioUrl,
      answers: answersList,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1800);
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 my-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A0AAA0] hover:text-[#F4F7F1] p-1.5 border border-[#273128] rounded-sm cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pb-4 border-b border-[#273128]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 bg-[#B6FF4A]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#B6FF4A]">
              Application Dossier · {job.companyName}
            </span>
          </div>
          <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
            Apply for {job.title}
          </h2>
          <div className="flex items-center gap-2 text-xs font-mono text-[#A0AAA0] mt-1">
            <span>{job.employmentType}</span>
            <span>·</span>
            <span>{job.workMode}</span>
            <span>·</span>
            <span className="text-[#B6FF4A]">{job.compensation}</span>
          </div>
        </div>

        {/* Already Applied Guard */}
        {alreadyApplied ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#B6FF4A]/10 border border-[#B6FF4A] text-[#B6FF4A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#F4F7F1]">Application Already Submitted</h3>
              <p className="text-sm text-[#A0AAA0] max-w-md mx-auto mt-1">
                You already have an active submission under review for this opening at {job.companyName}. You can monitor its progression in your applications tracker.
              </p>
            </div>
            <div className="pt-2">
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        ) : isSubmitted ? (
          /* Submission Confirmation */
          <div className="py-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#B6FF4A]/10 border border-[#B6FF4A] text-[#B6FF4A] flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl text-[#F4F7F1] tracking-tight">Application Dispatched</h3>
              <p className="text-sm text-[#A0AAA0] max-w-md mx-auto mt-2 leading-relaxed">
                Your profile, credentials, and custom responses have been routed directly to the hiring dashboard at {job.companyName}.
              </p>
            </div>
            <div className="p-3 bg-[#141B15] border border-[#273128] rounded-sm text-xs font-mono text-[#A0AAA0] max-w-sm mx-auto">
              Status: <span className="text-[#B6FF4A] font-bold">Submitted / In Review</span>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <Button onClick={onClose} variant="primary">
                Done
              </Button>
            </div>
          </div>
        ) : step === 'form' ? (
          /* Step 1: Form Inputs */
          <form onSubmit={handleProceedToReview} className="space-y-6">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Applicant Bio Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#7CCB37]">
                Applicant Identification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                    Contact Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    required
                    className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Professional Headline / Degree
                </label>
                <input
                  type="text"
                  value={applicantHeadline}
                  onChange={(e) => setApplicantHeadline(e.target.value)}
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                  placeholder="e.g. Systems Engineer & React Builder"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Education Background
                </label>
                <input
                  type="text"
                  value={applicantEducation}
                  onChange={(e) => setApplicantEducation(e.target.value)}
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>
            </div>

            {/* Resume Upload Simulation */}
            <div className="space-y-2 pt-2 border-t border-[#273128]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-widest text-[#7CCB37]">
                  Curriculum Vitae / Resume {job.requiresResume && <span className="text-rose-400">*</span>}
                </label>
                <span className="text-[11px] font-mono text-[#A0AAA0]">PDF or DOCX (max 5MB)</span>
              </div>

              {hasResume ? (
                <div className="flex items-center justify-between p-3 bg-[#141B15] border border-[#273128] rounded-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#B6FF4A]" />
                    <div>
                      <p className="text-xs font-mono font-medium text-[#F4F7F1]">{resumeFileName}</p>
                      <span className="text-[10px] font-mono text-[#A0AAA0]">{resumeSize} · Verified</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasResume(false)}
                    className="text-xs font-mono text-rose-400 hover:underline cursor-pointer"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <label className="border border-dashed border-[#273128] hover:border-[#B6FF4A] p-6 text-center rounded-sm block cursor-pointer transition-colors bg-[#141B15]/50">
                  <Upload className="w-6 h-6 text-[#A0AAA0] mx-auto mb-2" />
                  <span className="text-xs font-mono text-[#F4F7F1] block">
                    Click to attach resume document
                  </span>
                  <span className="text-[10px] font-mono text-[#A0AAA0]">
                    Auto-formatted for applicant tracking pipeline
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeSimulatedUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Links and Portfolio */}
            <div className="space-y-4 pt-2 border-t border-[#273128]">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#7CCB37]">
                Work & Code Proof
              </h4>
              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Portfolio, Personal Site or GitHub URL {job.requiresPortfolio && <span className="text-rose-400">*</span>}
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Relevant Experience Highlights
                </label>
                <textarea
                  rows={2}
                  value={relevantExperience}
                  onChange={(e) => setRelevantExperience(e.target.value)}
                  placeholder="Summarize key projects or internships related to this role..."
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1.5">
                  Cover Letter / Why You Are an Exceptional Fit {job.requiresCoverLetter && <span className="text-rose-400">*</span>}
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Share what excites you about this role and how your skills accelerate the team..."
                  className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                />
              </div>
            </div>

            {/* Custom Screening Questions */}
            {job.customQuestions && job.customQuestions.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-[#273128]">
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#7CCB37]">
                  Company Screening Questions
                </h4>
                {job.customQuestions.map((q, idx) => (
                  <div key={q.id}>
                    <label className="block text-xs font-mono text-[#F4F7F1] mb-1.5">
                      {idx + 1}. {q.question} {q.required && <span className="text-rose-400">*</span>}
                    </label>
                    <textarea
                      rows={2}
                      value={customAnswers[q.id] || ''}
                      onChange={(e) =>
                        setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Your concise answer..."
                      className="w-full bg-[#141B15] border border-[#273128] focus:border-[#B6FF4A] text-sm text-[#F4F7F1] p-2.5 rounded-sm outline-none font-mono"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#273128] flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Review Application
              </Button>
            </div>
          </form>
        ) : (
          /* Step 2: Review Before Final Submission */
          <div className="space-y-6">
            <div className="p-3 bg-[#B6FF4A]/10 border border-[#B6FF4A]/30 text-xs font-mono text-[#B6FF4A]">
              Review your submission details before dispatching to {job.companyName}.
            </div>

            <div className="space-y-4 text-xs font-mono divide-y divide-[#273128]">
              <div className="grid grid-cols-2 gap-4 pb-3">
                <div>
                  <span className="text-[#A0AAA0] block text-[10px] uppercase">Candidate</span>
                  <span className="text-[#F4F7F1] font-bold text-sm">{applicantName}</span>
                </div>
                <div>
                  <span className="text-[#A0AAA0] block text-[10px] uppercase">Email</span>
                  <span className="text-[#F4F7F1]">{applicantEmail}</span>
                </div>
              </div>

              <div className="py-3">
                <span className="text-[#A0AAA0] block text-[10px] uppercase">Education & Headline</span>
                <span className="text-[#F4F7F1]">{applicantEducation}</span>
                <p className="text-[#A0AAA0] text-[11px] mt-0.5">{applicantHeadline}</p>
              </div>

              <div className="py-3">
                <span className="text-[#A0AAA0] block text-[10px] uppercase">Resume</span>
                <span className="text-[#B6FF4A]">{resumeFileName} ({resumeSize})</span>
              </div>

              {portfolioUrl && (
                <div className="py-3">
                  <span className="text-[#A0AAA0] block text-[10px] uppercase">Portfolio URL</span>
                  <a href={portfolioUrl} target="_blank" rel="noreferrer" className="text-[#B6FF4A] hover:underline">
                    {portfolioUrl}
                  </a>
                </div>
              )}

              {coverLetter && (
                <div className="py-3">
                  <span className="text-[#A0AAA0] block text-[10px] uppercase mb-1">Cover Note</span>
                  <p className="text-[#F4F7F1] whitespace-pre-wrap leading-relaxed">{coverLetter}</p>
                </div>
              )}

              {job.customQuestions && job.customQuestions.length > 0 && (
                <div className="py-3 space-y-2">
                  <span className="text-[#A0AAA0] block text-[10px] uppercase">Screening Responses</span>
                  {job.customQuestions.map((q, idx) => (
                    <div key={q.id} className="p-2.5 bg-[#141B15] border border-[#273128] rounded-sm">
                      <p className="text-[11px] text-[#A0AAA0]">{idx + 1}. {q.question}</p>
                      <p className="text-xs text-[#F4F7F1] mt-1 font-semibold">{customAnswers[q.id] || '(None)'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            <div className="pt-4 border-t border-[#273128] flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep('form')}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {isSubmitting ? 'Transmitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
