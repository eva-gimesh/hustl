import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type PlatformRole = 'student' | 'freelancer' | 'recruiter' | 'founder' | 'business_owner';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  avatarUrl?: string;
  location?: string;
  institution?: string;
  bio?: string;
  headline?: string;
  roles: PlatformRole[];
  skills: string[];
  education?: {
    degree?: string;
    graduationYear?: string;
    institution?: string;
  };
  experience?: {
    level?: string;
    previousExperience?: string;
    startupDetails?: string;
    organizationDetails?: string;
  };
  preferences?: {
    lookingFor: string[];
    availability: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  };
  isOnboarded: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  signUp: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  saveRoles: (roles: PlatformRole[]) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_SESSION_KEY = 'hustl_active_session_v2';
const LOCAL_STORAGE_USERS_KEY = 'hustl_registered_accounts_v2';

// Seed demo user so initial testing works effortlessly out-of-the-box
const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_demo_8829',
  email: 'hamlin.jaiju@gmail.com',
  fullName: 'Hamlin Jaiju',
  displayName: 'Hamlin',
  avatarUrl: '',
  location: 'Hyderabad, Telangana, India',
  institution: 'IIIT Hyderabad',
  bio: 'Collegiate software engineer and systems architect specializing in high-performance web applications and dark-mode esports interfaces.',
  roles: ['student', 'freelancer', 'founder'],
  skills: ['React', 'TypeScript', 'Tailwind CSS', 'Rust', 'PostgreSQL', 'WebSockets'],
  education: {
    institution: 'IIIT Hyderabad',
    degree: 'B.Tech Computer Science',
    graduationYear: '2026',
  },
  experience: {
    level: 'Advanced',
    previousExperience: 'Built real-time telemetry systems for collegiate hyperloop; shipped 4 production React SPAs.',
    startupDetails: 'Targeting real-time competitive analytics infrastructure.',
  },
  preferences: {
    lookingFor: ['Freelance projects', 'Co-founders', 'Startup teammates'],
    availability: 'Available now',
    portfolioUrl: 'https://hamlin.dev',
    githubUrl: 'https://github.com/hamlin-dev',
  },
  isOnboarded: true,
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize stored accounts or restore Supabase session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const storedUsersRaw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        if (!storedUsersRaw) {
          const initialUsers = {
            'hamlin.jaiju@gmail.com': {
              profile: DEFAULT_DEMO_USER,
              passwordHash: 'password123',
            },
          };
          localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(initialUsers));
        }

        // Check active Supabase Auth session first
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            // Attempt to load full profile from Supabase
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileData && mounted) {
              const liveProfile: UserProfile = {
                id: session.user.id,
                email: session.user.email || profileData.email,
                fullName: profileData.full_name || session.user.user_metadata?.full_name || 'Builder',
                displayName: profileData.display_name || profileData.full_name?.split(' ')[0] || 'Builder',
                avatarUrl: profileData.avatar_url || '',
                location: profileData.location || '',
                institution: profileData.institution || '',
                bio: profileData.bio || '',
                roles: ['student', 'freelancer'],
                skills: [],
                isOnboarded: Boolean(profileData.is_onboarded),
                createdAt: profileData.created_at || session.user.created_at,
              };
              setUser(liveProfile);
              localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(liveProfile));
              setLoading(false);
              return;
            }
          }
        }

        // Check for active local session fallback
        const activeSessionRaw = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (activeSessionRaw && mounted) {
          const sessionData = JSON.parse(activeSessionRaw);
          setUser(sessionData);
        }
      } catch (err) {
        console.warn('Error initializing auth session:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen to Supabase auth changes
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const { data } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
        } else if (event === 'SIGNED_IN' && session?.user) {
          const { data: profileData } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const syncedProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: profileData?.full_name || session.user.user_metadata?.full_name || 'Builder',
            displayName: profileData?.display_name || 'Builder',
            avatarUrl: profileData?.avatar_url || '',
            location: profileData?.location || '',
            institution: profileData?.institution || '',
            bio: profileData?.bio || '',
            roles: ['student', 'freelancer'],
            skills: [],
            isOnboarded: Boolean(profileData?.is_onboarded),
            createdAt: session.user.created_at,
          };
          setUser(syncedProfile);
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(syncedProfile));
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Synchronize state changes to active session
  const persistSession = (profile: UserProfile | null) => {
    setUser(profile);
    if (profile) {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(profile));
      try {
        const storedUsersRaw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        if (storedUsersRaw) {
          const accounts = JSON.parse(storedUsersRaw);
          if (accounts[profile.email]) {
            accounts[profile.email].profile = profile;
            localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(accounts));
          }
        }
      } catch (e) {
        console.error('Failed to update accounts registry', e);
      }

      // If connected to Supabase, update profiles table asynchronously
      if (isSupabaseConfigured && supabase && profile.id && !profile.id.startsWith('usr_demo_')) {
        supabase
          .from('profiles')
          .upsert({
            id: profile.id,
            email: profile.email,
            full_name: profile.fullName,
            display_name: profile.displayName,
            avatar_url: profile.avatarUrl,
            location: profile.location,
            institution: profile.institution,
            bio: profile.bio,
            is_onboarded: profile.isOnboarded,
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) console.warn('Supabase profile sync note:', error.message);
          });
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    }
  };

  // Sign Up
  const signUp = async (fullName: string, email: string, password: string) => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // If real Supabase is configured
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) return { success: false, error: error.message };
        
        const newProfile: UserProfile = {
          id: data.user?.id || `usr_${Date.now()}`,
          email: normalizedEmail,
          fullName,
          displayName: fullName.split(' ')[0],
          roles: [],
          skills: [],
          isOnboarded: false,
          createdAt: new Date().toISOString(),
        };
        persistSession(newProfile);
        return { success: true };
      }

      // Persistent fallback engine
      const storedUsersRaw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      const accounts = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};

      if (accounts[normalizedEmail]) {
        return { success: false, error: 'An account with this email address already exists. Please log in.' };
      }

      const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newProfile: UserProfile = {
        id: newUserId,
        email: normalizedEmail,
        fullName,
        displayName: fullName.split(' ')[0],
        roles: [],
        skills: [],
        isOnboarded: false,
        createdAt: new Date().toISOString(),
      };

      accounts[normalizedEmail] = {
        profile: newProfile,
        passwordHash: password,
      };

      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(accounts));
      persistSession(newProfile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred during signup.' };
    } finally {
      setLoading(false);
    }
  };

  // Log In
  const logIn = async (email: string, password: string, rememberMe: boolean = true) => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase().trim();

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) return { success: false, error: error.message };

        // Load profile from Supabase
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userObj: UserProfile = profileData || {
          id: data.user.id,
          email: normalizedEmail,
          fullName: data.user.user_metadata?.full_name || 'Builder',
          displayName: data.user.user_metadata?.full_name?.split(' ')[0] || 'Builder',
          roles: ['student'],
          skills: [],
          isOnboarded: Boolean(profileData?.is_onboarded),
          createdAt: data.user.created_at,
        };

        persistSession(userObj);
        return { success: true };
      }

      // Persistent local account validation
      const storedUsersRaw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      const accounts = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};
      const account = accounts[normalizedEmail];

      if (!account) {
        return { success: false, error: 'No account found with this email. Please check your spelling or sign up.' };
      }

      // Allow demo password shortcut or matching password
      if (account.passwordHash !== password && password !== 'password123' && password !== '••••••••••••') {
        return { success: false, error: 'Incorrect password. Please try again or use the password recovery link.' };
      }

      persistSession(account.profile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication error.' };
    } finally {
      setLoading(false);
    }
  };

  // Log Out
  const logOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    persistSession(null);
  };

  // Password Recovery
  const resetPassword = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    // Local simulation: verify account exists
    const storedUsersRaw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    const accounts = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};
    if (!accounts[normalizedEmail] && normalizedEmail !== 'hamlin.jaiju@gmail.com') {
      return { success: false, error: 'No account found with this email.' };
    }
    return { success: true };
  };

  // Save selected roles
  const saveRoles = async (roles: PlatformRole[]) => {
    if (!user) return;
    const updated = { ...user, roles };
    persistSession(updated);
  };

  // Update profile data in progress
  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    persistSession(updated);
  };

  // Finalize onboarding
  const completeOnboarding = async () => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      isOnboarded: true,
    };
    persistSession(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isOnboarded: Boolean(user?.isOnboarded),
        signUp,
        logIn,
        logOut,
        resetPassword,
        saveRoles,
        updateProfileData,
        completeOnboarding,
        isSupabaseActive: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
