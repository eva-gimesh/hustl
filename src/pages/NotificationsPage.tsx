import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCommunication } from '../context/CommunicationContext';
import { NotificationCategory, NotificationItem } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Bell,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Settings,
  Sparkles,
  Inbox,
  Filter,
  CheckCheck,
  Check,
  Layers,
  Briefcase,
  Users,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || 'usr_demo_8829';

  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useCommunication();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Filter notifications for current user and active category
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (notif.recipientId !== currentUserId) return false;
      if (activeCategory !== 'all' && notif.category !== activeCategory) return false;
      return true;
    });
  }, [notifications, currentUserId, activeCategory]);

  // Group notifications into Today, Yesterday, and Earlier
  const groupedNotifications = useMemo(() => {
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const earlier: NotificationItem[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    filteredNotifications.forEach((n) => {
      const time = new Date(n.createdAt).getTime();
      if (time >= startOfToday) {
        today.push(n);
      } else if (time >= startOfYesterday) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  }, [filteredNotifications]);

  const getCategoryBadge = (cat: NotificationCategory) => {
    switch (cat) {
      case 'freelance':
        return 'border-[#B6FF4A]/40 text-[#B6FF4A] bg-[#B6FF4A]/10';
      case 'recruit':
        return 'border-cyan-400/40 text-cyan-400 bg-cyan-400/10';
      case 'teamup':
        return 'border-purple-400/40 text-purple-400 bg-purple-400/10';
      case 'messaging':
        return 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10';
      case 'account':
        return 'border-amber-400/40 text-amber-400 bg-amber-400/10';
      default:
        return 'border-[#273128] text-[#A0AAA0] bg-[#141B15]';
    }
  };

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'freelance':
        return <Briefcase className="w-4 h-4 text-[#B6FF4A]" />;
      case 'recruit':
        return <Briefcase className="w-4 h-4 text-cyan-400" />;
      case 'teamup':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'messaging':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'account':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-[#A0AAA0]" />;
    }
  };

  const renderNotificationItem = (notif: NotificationItem) => (
    <div
      key={notif.id}
      className={`p-4 border rounded-xs transition-colors flex items-start justify-between gap-4 ${
        notif.isRead
          ? 'bg-[#101510] border-[#273128] hover:border-[#273128]/80'
          : 'bg-[#141B15] border-[#B6FF4A]/40 shadow-[0_4px_20px_rgba(182,255,74,0.03)]'
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="mt-0.5 p-2 bg-[#080B09] border border-[#273128] rounded-xs shrink-0">
          {getCategoryIcon(notif.category)}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold border rounded-xs ${getCategoryBadge(notif.category)}`}>
              {notif.category}
            </span>
            <span className="font-display font-bold text-sm text-[#F4F7F1]">
              {notif.title}
            </span>
            {!notif.isRead && (
              <span className="w-2 h-2 rounded-full bg-[#B6FF4A] shrink-0" title="Unread notification"></span>
            )}
          </div>

          <p className="text-xs font-mono text-[#A0AAA0] leading-relaxed">
            {notif.body}
          </p>

          <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-[#A0AAA0]">
            <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>·</span>
            <span>{new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start">
        {notif.linkUrl && (
          <Link
            to={notif.linkUrl}
            onClick={() => {
              if (!notif.isRead) markNotificationAsRead(notif.id);
            }}
            className="px-2.5 py-1 bg-[#141B15] hover:bg-[#B6FF4A] hover:text-[#080B09] border border-[#273128] text-xs font-mono text-[#F4F7F1] transition-colors flex items-center gap-1.5"
          >
            <span>Open</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}

        {!notif.isRead && (
          <button
            onClick={() => markNotificationAsRead(notif.id)}
            className="p-1.5 text-[#A0AAA0] hover:text-[#B6FF4A] transition-colors cursor-pointer"
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => deleteNotification(notif.id)}
          className="p-1.5 text-[#A0AAA0] hover:text-rose-400 transition-colors cursor-pointer"
          title="Dismiss notification"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#080B09] text-[#F4F7F1] pb-24">
      {/* Top Header Bar */}
      <div className="border-b border-[#273128] bg-[#101510]/90 px-4 sm:px-6 py-4 sticky top-18 z-30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#B6FF4A] font-bold tracking-wider uppercase">
              HUSTL // NOTIFICATION_HUB
            </span>
            <span className="text-[#273128]">/</span>
            <span className="font-mono text-xs text-[#A0AAA0]">
              {unreadNotificationsCount} Unread
            </span>
          </div>

          <div className="flex items-center gap-3">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="px-3 py-1.5 bg-[#141B15] hover:bg-[#1a231b] border border-[#273128] hover:border-[#B6FF4A] text-xs font-mono text-[#B6FF4A] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}

            <Link
              to="/settings/notifications"
              className="px-3 py-1.5 bg-[#141B15] hover:bg-[#1a231b] border border-[#273128] text-xs font-mono text-[#A0AAA0] hover:text-[#F4F7F1] transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Category Filters Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 p-1.5 bg-[#101510] border border-[#273128] rounded-xs">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'freelance', label: 'Freelance' },
            { id: 'recruit', label: 'Recruit' },
            { id: 'teamup', label: 'TeamUp' },
            { id: 'messaging', label: 'Messages' },
            { id: 'account', label: 'Account' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#B6FF4A] text-[#080B09] font-bold'
                  : 'text-[#A0AAA0] hover:text-[#F4F7F1]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grouped Notifications */}
        {filteredNotifications.length === 0 ? (
          <div className="p-12 bg-[#141B15] border border-[#273128] rounded-sm text-center space-y-3">
            <Inbox className="w-10 h-10 text-[#A0AAA0]/40 mx-auto" />
            <h3 className="font-display font-bold text-base text-[#F4F7F1]">
              No Notifications Found
            </h3>
            <p className="text-xs font-mono text-[#A0AAA0] max-w-sm mx-auto">
              {activeCategory === 'all'
                ? "You're completely caught up. Opportunities and updates will appear here in real-time."
                : `No notifications in the ${activeCategory} category.`}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* TODAY */}
            {groupedNotifications.today.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#B6FF4A] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#B6FF4A]"></span>
                  <span>Today</span>
                </div>
                <div className="space-y-3">
                  {groupedNotifications.today.map(renderNotificationItem)}
                </div>
              </div>
            )}

            {/* YESTERDAY */}
            {groupedNotifications.yesterday.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#A0AAA0] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#A0AAA0]"></span>
                  <span>Yesterday</span>
                </div>
                <div className="space-y-3">
                  {groupedNotifications.yesterday.map(renderNotificationItem)}
                </div>
              </div>
            )}

            {/* EARLIER */}
            {groupedNotifications.earlier.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#A0AAA0]/80 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#273128]"></span>
                  <span>Earlier</span>
                </div>
                <div className="space-y-3">
                  {groupedNotifications.earlier.map(renderNotificationItem)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
