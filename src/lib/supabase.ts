import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('xyzcompany')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface SupabaseHealthStatus {
  configured: boolean;
  connected: boolean;
  message: string;
  tablesDetected?: string[];
  latencyMs?: number;
}

/**
 * Health check utility to test connectivity to the remote Supabase project
 */
export async function testSupabaseConnection(): Promise<SupabaseHealthStatus> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase credentials are not configured or still placeholder in .env',
    };
  }

  const startTime = performance.now();
  try {
    // Attempt a lightweight query to test auth / REST endpoint accessibility
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      // If table doesn't exist yet (PGRST205 or 42P01), connection is established but schema needs running
      if (error.code === 'PGRST205' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          configured: true,
          connected: true,
          latencyMs,
          message: 'Connected to Supabase project! Database tables need to be migrated via the SQL editor.',
        };
      }
      return {
        configured: true,
        connected: false,
        latencyMs,
        message: `Supabase returned: ${error.message} (Code: ${error.code})`,
      };
    }

    return {
      configured: true,
      connected: true,
      latencyMs,
      message: 'Successfully connected to Supabase and verified database tables.',
      tablesDetected: ['profiles'],
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      message: err.message || 'Failed to reach Supabase endpoint',
    };
  }
}
