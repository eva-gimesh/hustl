import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, PlatformRole } from '../context/AuthContext';

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const authService = {
  /**
   * Register a new user with Supabase Auth
   */
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse<{ userId: string }>> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase client is not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: fullName.split(' ')[0],
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Registration failed to return user data' };
      }

      return {
        success: true,
        data: { userId: data.user.id },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    }
  },

  /**
   * Authenticate with email & password
   */
  async signIn(email: string, password: string): Promise<AuthResponse<{ user: any; session: any }>> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase client is not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  },

  /**
   * End current auth session
   */
  async signOut(): Promise<AuthResponse<void>> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signout failed' };
    }
  },

  /**
   * Request password reset email
   */
  async resetPassword(email: string): Promise<AuthResponse<void>> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase client is not configured' };
    }

    try {
      const redirectUrl = `${window.location.origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Reset password request failed' };
    }
  },

  /**
   * Retrieve active session
   */
  async getSession() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Retrieve current Supabase user
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /**
   * Register listener for auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured || !supabase) {
      return { unsubscribe: () => {} };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },
};
