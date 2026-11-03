import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunication } from '../context/CommunicationContext';
import { NotificationPreferences } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  ShieldAlert,
  Info
} from 'lucide-react';

export const NotificationSettingsPage: React.FC = () => {
  const { notificationPreferences, updateNotificationPreferences } = useCommunication();

  const [prefs, setPrefs] = useState<NotificationPreferences>(notificationPreferences);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const res = await updateNotificationPreferences(prefs);
    setSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      setSaveError(res.error || 'Failed to save notification preferences.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#080B09] text-[#F4F7F1] pb-24">
      {/* Top Header Bar */}
      <div className="border-b border-[#273128] bg-[#101510]/90 px-4 sm:px-6 py-4 sticky top-18 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="p-1 text-[#A0AAA0] hover:text-[#F4F7F1] transition-colors"
              title="Return to notifications"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-mono text-xs text-[#B6FF4A] font-bold tracking-wider uppercase">
              HUSTL // NOTIFICATION_PREFERENCES
            </span>
          </div>

          <Link
            to="/notifications"
            className="text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1]"
          >
            Back to Notifications
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Banner about configured delivery systems */}
        <div className="p-4 bg-[#141B15] border border-[#273128] rounded-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F4F7F1]">
            <Info className="w-4 h-4 text-[#B6FF4A]" />
            <span>Delivery Channel Diagnostics</span>
          </div>
          <p className="text-xs font-mono text-[#A0AAA0] leading-relaxed">
            In-app direct notifications and real-time alerts are <strong className="text-[#B6FF4A]">ACTIVE</strong> and persistent. Email relaying requires user-configured transactional SMTP credentials or Supabase Auth webhooks; toggle preferences below to control both delivery pipelines.
          </p>
        </div>

        {/* Feedback Messages */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 rounded-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        {saveError && (
          <div className="p-3 bg-rose-950/20 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2 rounded-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-[#141B15] border border-[#273128] rounded-sm divide-y divide-[#273128]">
            {/* Table Header */}
            <div className="p-4 bg-[#101510] flex items-center justify-between text-xs font-mono text-[#A0AAA0]">
              <span>Event Category</span>
              <div className="flex items-center gap-8 sm:gap-16">
                <span className="w-16 text-center">In-App</span>
                <span className="w-16 text-center">Email</span>
              </div>
            </div>

            {/* Row 1: Direct Messages */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                  Direct Messages & Channels
                </h4>
                <p className="text-xs font-mono text-[#A0AAA0]">
                  When a client, applicant, or co-founder sends you a message.
                </p>
              </div>

              <div className="flex items-center gap-8 sm:gap-16 shrink-0">
                <label className="w-16 flex justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.newMessagesInApp}
                    onChange={() => toggle('newMessagesInApp')}
                    className="w-4 h-4 rounded-xs accent-[#B6FF4A] cursor-pointer"
                  />
                </label>
                <label className="w-16 flex justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.newMessagesEmail}
                    onChange={() => toggle('newMessagesEmail')}
                    className="w-4 h-4 rounded-xs accent-[#B6FF4A] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Row 2: Freelance Updates */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                  Freelance Applications & Gigs
                </h4>
                <p className="text-xs font-mono text-[#A0AAA0]">
                  Proposals submitted, client shortlisting, milestone contracts, and reviews.
                </p>
              </div>

              <div className="flex items-center gap-8 sm:gap-16 shrink-0">
                <label className="w-16 flex justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.freelanceUpdatesInApp}
                    onChange={() => toggle('freelanceUpdatesInApp')}
                    className="w-4 h-4 rounded-xs accent-[#B6FF4A] cursor-pointer"
                  />
                </label>
                <label className="w-16 flex justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.freelanceUpdatesEmail}
                    onChange={() => toggle('freelanceUpdatesEmail')}
                    className="w-4 h-4 rounded-xs accent-[#B6FF4A] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Row 3: Recruit Updates */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                  Recruitment & Job Openings
                </h4>
                <p className="text-xs font-mono text-[#A0AAA0]">
                  Candidate applications, interview invitations, stage advancements, and hiring status.
                </p>
              </div>

              <div className="flex items-center gap-8 sm:gap-16 shrink-0">
                <label className="w-16 flex justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.recruitUpdatesInApp}
                    onChange={() => toggle('recruitUpdatesInApp')}
                    className="w-4 h-4 rounded-xs accent-[#B6FF4A] cursor-pointer"
                  />
                </label>
                <label className="w-16 flex justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.recruitUpdatesEmail}
                    onChange={() => toggle('recruitUpdatesEmail')}
                    className="w-4 h-4 rounded-xs accent-[#B6FF4A] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Row 4: TeamUp Invites & Applications */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                  TeamUp Ventures & Invitations
                </h4>
                <p className="text-xs font-mono text-[#A0AAA0]">
                  Co-founder invitations, teammate applications, and squad status changes.
                </p>
              </div>

              <div className="flex items-center gap-8 sm:gap-16 shrink-0">
                <label className="w-16 flex justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.teamUpInvitesInApp}
                    onChange={() => toggle('teamUpInvitesInApp')}
                    className="w-4 h-4 rounded-xs accent-[#B6FF4A] cursor-pointer"
                  />
                </label>
                <label className="w-16 flex justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.teamUpInvitesEmail}
                    onChange={() => toggle('teamUpInvitesEmail')}
                    className="w-4 h-4 rounded-xs accent-[#B6FF4A] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Row 5: Account & Security */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-sm text-[#F4F7F1]">
                  Account & Security Alerts
                </h4>
                <p className="text-xs font-mono text-[#A0AAA0]">
                  Profile completeness updates, authentication warnings, and verification audits.
                </p>
              </div>

              <div className="flex items-center gap-8 sm:gap-16 shrink-0">
                <label className="w-16 flex justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.accountAlertsInApp}
                    onChange={() => toggle('accountAlertsInApp')}
                    className="w-4 h-4 rounded-xs accent-[#B6FF4A] cursor-pointer"
                  />
                </label>
                <label className="w-16 flex justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.accountAlertsEmail}
                    onChange={() => toggle('accountAlertsEmail')}
                    className="w-4 h-4 rounded-xs accent-[#B6FF4A] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              variant="primary"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
