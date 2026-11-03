import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecruit } from '../context/RecruitContext';
import { useAuth } from '../context/AuthContext';
import { JobCard } from '../components/recruit/JobCard';
import { Button } from '../components/ui/Button';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Plus,
  Edit3,
  ExternalLink,
  Twitter,
  Linkedin,
  Github,
  X,
} from 'lucide-react';

export const CompanyProfilePage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const { companies, jobs, getCompanyById, updateCompany } = useRecruit();

  const company = companyId ? getCompanyById(companyId) : undefined;
  const currentUserId = user?.id || 'usr_demo_8829';
  const isOwner = company?.ownerId === currentUserId;

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(company?.name || '');
  const [tagline, setTagline] = useState(company?.tagline || '');
  const [description, setDescription] = useState(company?.description || '');
  const [industry, setIndustry] = useState(company?.industry || '');
  const [location, setLocation] = useState(company?.location || '');
  const [website, setWebsite] = useState(company?.website || '');
  const [size, setSize] = useState(company?.size || '11-50');

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-black text-2xl text-[#F4F7F1]">Organisation Not Found</h2>
        <Link to="/recruit/opportunities">
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Opportunities
          </Button>
        </Link>
      </div>
    );
  }

  // Active listings for this company
  const companyJobs = jobs.filter((j) => j.companyId === company.id);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(company.id, {
      name,
      tagline,
      description,
      industry,
      location,
      website: website || undefined,
      size,
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="min-h-screen py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <Link
        to="/recruit/opportunities"
        className="text-xs font-mono text-[#A0AAA0] hover:text-[#B6FF4A] flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Opportunities</span>
      </Link>

      {/* Company Header Card */}
      <div className="bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7CCB37]/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Logo Monogram */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm bg-[#141B15] border border-[#273128] flex items-center justify-center font-display font-black text-2xl sm:text-3xl text-[#B6FF4A] shrink-0">
              {company.name.substring(0, 2).toUpperCase()}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-[#F4F7F1] tracking-tight">
                  {company.name}
                </h1>
                {company.verified && (
                  <span className="inline-flex items-center text-[#7CCB37]" title="Verified Organisation">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                )}
                {company.isDemo && (
                  <span className="text-[10px] font-mono tracking-widest text-[#7CCB37] bg-[#7CCB37]/10 px-2 py-0.5 border border-[#7CCB37]/30 uppercase">
                    DEMO ORGANISATION
                  </span>
                )}
              </div>

              <p className="text-sm font-mono text-[#B6FF4A]">{company.tagline}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-[#A0AAA0] pt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#7CCB37]" />
                  <span>{company.industry}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#7CCB37]" />
                  <span>{company.location}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#7CCB37]" />
                  <span>{company.size} members</span>
                </span>
                {company.website && (
                  <>
                    <span>·</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#B6FF4A] hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{company.website.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {isOwner && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setName(company.name);
                  setTagline(company.tagline);
                  setDescription(company.description);
                  setIndustry(company.industry);
                  setLocation(company.location);
                  setWebsite(company.website || '');
                  setSize(company.size);
                  setIsEditModalOpen(true);
                }}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Organisation
              </Button>
            )}

            <Link to="/recruit/create">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Post Opening
              </Button>
            </Link>
          </div>
        </div>

        {/* Company About */}
        <div className="mt-8 pt-6 border-t border-[#273128] text-sm text-[#A0AAA0] leading-relaxed max-w-4xl">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#B6FF4A] mb-2">
            About {company.name}
          </h2>
          <p className="whitespace-pre-wrap">{company.description}</p>
        </div>

        {/* Social Links */}
        {company.socialLinks && (
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#273128] text-xs font-mono text-[#A0AAA0]">
            {company.socialLinks.twitter && (
              <a
                href={company.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#B6FF4A] transition-colors flex items-center gap-1.5"
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>Twitter / X</span>
              </a>
            )}
            {company.socialLinks.linkedin && (
              <a
                href={company.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#B6FF4A] transition-colors flex items-center gap-1.5"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            )}
            {company.socialLinks.github && (
              <a
                href={company.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#B6FF4A] transition-colors flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Org</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Active Job Openings Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-2xl text-[#F4F7F1] tracking-tight">
              Active Openings ({companyJobs.length})
            </h2>
            <p className="text-xs font-mono text-[#A0AAA0] mt-1">
              Explore opportunities published by {company.name}.
            </p>
          </div>

          <Link to="/recruit/create">
            <Button size="sm" variant="secondary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Publish New Opening
            </Button>
          </Link>
        </div>

        {companyJobs.length === 0 ? (
          <div className="p-12 text-center bg-[#101510] border border-[#273128] rounded-sm space-y-3 font-mono">
            <p className="text-sm text-[#A0AAA0]">No active openings currently open at this organisation.</p>
            <Link to="/recruit/create">
              <Button size="sm" variant="primary">
                Post First Opening
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Company Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#101510] border border-[#273128] rounded-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#273128]">
              <h3 className="font-display font-bold text-xl text-[#F4F7F1]">
                Edit Organisation Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-[#A0AAA0] hover:text-[#F4F7F1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1">Company Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#141B15] border border-[#273128] text-sm text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#141B15] border border-[#273128] text-sm text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A0AAA0] mb-1">About Company</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#141B15] border border-[#273128] text-sm text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#A0AAA0] mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-[#141B15] border border-[#273128] text-sm text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#A0AAA0] mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#141B15] border border-[#273128] text-sm text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#A0AAA0] mb-1">Website URL</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-[#141B15] border border-[#273128] text-sm text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#A0AAA0] mb-1">Team Size</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-[#141B15] border border-[#273128] text-sm text-[#F4F7F1] p-2 rounded-sm outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#273128] flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
