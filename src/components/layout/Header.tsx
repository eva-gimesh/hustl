import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCommunication } from '../../context/CommunicationContext';
import { HustlLogo } from '../brand/HustlLogo';
import { Button } from '../ui/Button';
import { MAIN_NAV } from '../../constants/theme';
import {
  Menu,
  X,
  ArrowUpRight,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
  Briefcase,
  FileText,
  Users,
  MessageSquare,
  Bell,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupabaseStatusBadge } from '../common/SupabaseStatusBadge';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logOut } = useAuth();
  const { unreadMessagesCount, unreadNotificationsCount } = useCommunication();

  // Listen to scroll to adjust background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#080B09]/95 backdrop-blur-xl border-b border-[#273128] shadow-[0_8px_30px_rgba(0,0,0,0.8)]'
            : 'bg-[#080B09]/85 backdrop-blur-md border-b border-[#273128]/70'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: LEFT — HUSTL wordmark */}
          <div className="shrink-0 flex items-center">
            <HustlLogo size="md" />
          </div>

          {/* Zone 2: CENTRE — Home, Freelance, Recruit, TeamUp, Explore */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-display font-medium text-[#A0AAA0]"
            aria-label="Main Navigation"
          >
            {MAIN_NAV.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `transition-colors duration-200 whitespace-nowrap shrink-0 hover:text-[#F4F7F1] relative py-1.5 ${
                    isActive ? 'text-[#B6FF4A] font-semibold' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-indicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B6FF4A]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: RIGHT — Auth state actions + Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Supabase Connection Status Badge */}
            <SupabaseStatusBadge />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {/* Messages Shortcut */}
                <Link
                  to="/messages"
                  className="relative p-2 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A]/50 hover:text-[#B6FF4A] text-[#A0AAA0] rounded-xs transition-colors"
                  title="Messages"
                  aria-label="Messages"
                >
                  <MessageSquare className="w-4 h-4" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#B6FF4A] text-black text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Shortcut */}
                <Link
                  to="/notifications"
                  className="relative p-2 bg-[#101510] border border-[#273128] hover:border-[#B6FF4A]/50 hover:text-[#B6FF4A] text-[#A0AAA0] rounded-xs transition-colors"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#B6FF4A] text-black text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A] rounded-xs transition-colors cursor-pointer select-none"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-7 h-7 bg-[#101510] border border-[#B6FF4A] text-[#B6FF4A] font-display font-bold text-xs flex items-center justify-center shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.fullName.substring(0, 2).toUpperCase() || 'HU'
                      )}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-mono font-bold text-[#F4F7F1] max-w-[110px] truncate">
                      {user.displayName || user.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#A0AAA0]" />
                  </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-[#141B15] border border-[#273128] rounded-xs shadow-2xl p-2 z-50 space-y-1 font-mono text-xs"
                    >
                      <div className="px-3 py-2 border-b border-[#273128] mb-1">
                        <p className="font-bold text-[#F4F7F1] truncate">{user.fullName}</p>
                        <p className="text-[10px] text-[#A0AAA0] truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-[#F4F7F1] hover:bg-[#101510] hover:text-[#B6FF4A] rounded-xs transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-[#F4F7F1] hover:bg-[#101510] hover:text-[#B6FF4A] rounded-xs transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Public Profile</span>
                      </Link>

                      <Link
                        to="/recruit/applications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-[#F4F7F1] hover:bg-[#101510] hover:text-[#B6FF4A] rounded-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Job Applications</span>
                      </Link>

                      <Link
                        to="/recruit"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-[#F4F7F1] hover:bg-[#101510] hover:text-[#B6FF4A] rounded-xs transition-colors"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Recruiter Hub</span>
                      </Link>

                      <Link
                        to="/teamup/invitations"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-[#F4F7F1] hover:bg-[#101510] hover:text-[#B6FF4A] rounded-xs transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Team Invitations</span>
                      </Link>

                      {!user.isOnboarded && (
                        <Link
                          to="/onboarding"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-[#B6FF4A] hover:bg-[#101510] rounded-xs transition-colors"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Complete Onboarding</span>
                        </Link>
                      )}

                      <div className="pt-1 border-t border-[#273128]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-[#101510] rounded-xs transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-mono uppercase tracking-wider text-[#A0AAA0] hover:text-[#F4F7F1] transition-colors px-2.5 py-1.5 rounded-sm"
                >
                  Log In
                </Link>

                <Link to="/signup">
                  <Button
                    size="sm"
                    variant="primary"
                    rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  >
                    Join HUSTL
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#A0AAA0] hover:text-[#F4F7F1] hover:bg-[#141B15] border border-[#273128] rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF4A]"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-18 z-40 bg-[#080B09]/98 backdrop-blur-2xl md:hidden border-t border-[#273128] flex flex-col justify-between p-6 overflow-y-auto"
          >
            <div className="space-y-6 pt-2">
              <div className="text-xs font-mono uppercase text-[#B6FF4A] tracking-widest px-2">
                Navigation Radar
              </div>
              <div className="flex flex-col space-y-2">
                {MAIN_NAV.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                      `flex flex-col px-4 py-3 border border-[#273128] bg-[#141B15] rounded-sm transition-all ${
                        isActive
                          ? 'border-[#B6FF4A] text-[#B6FF4A]'
                          : 'text-[#F4F7F1] hover:border-[#A0AAA0]'
                      }`
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-base">{item.label}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#A0AAA0]" />
                    </div>
                    <span className="text-xs text-[#A0AAA0] mt-0.5 font-sans">
                      {item.description}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-[#273128] mt-6">
              {isAuthenticated && user ? (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Link
                      to="/messages"
                      className="flex items-center justify-center gap-2 py-2.5 bg-[#141B15] border border-[#273128] text-[#F4F7F1] text-xs font-mono rounded-xs"
                    >
                      <MessageSquare className="w-4 h-4 text-[#B6FF4A]" />
                      <span>Messages {unreadMessagesCount > 0 && `(${unreadMessagesCount})`}</span>
                    </Link>
                    <Link
                      to="/notifications"
                      className="flex items-center justify-center gap-2 py-2.5 bg-[#141B15] border border-[#273128] text-[#F4F7F1] text-xs font-mono rounded-xs"
                    >
                      <Bell className="w-4 h-4 text-[#B6FF4A]" />
                      <span>Alerts {unreadNotificationsCount > 0 && `(${unreadNotificationsCount})`}</span>
                    </Link>
                  </div>
                  <Link to="/dashboard" className="block w-full">
                    <Button fullWidth size="lg" variant="primary">
                      Command Dashboard
                    </Button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-[#141B15] border border-[#273128] text-red-400 font-mono text-xs uppercase rounded-xs cursor-pointer"
                  >
                    Log Out ({user.fullName.split(' ')[0]})
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup" className="block w-full">
                    <Button fullWidth size="lg" variant="primary">
                      Join HUSTL
                    </Button>
                  </Link>
                  <Link to="/login" className="block w-full">
                    <Button fullWidth size="lg" variant="outline">
                      Log In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
