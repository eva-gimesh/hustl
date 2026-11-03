import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StorageUploadResult {
  success: boolean;
  publicUrl?: string;
  filePath?: string;
  error?: string;
}

export const storageService = {
  /**
   * Upload user profile avatar to the 'avatars' storage bucket
   */
  async uploadAvatar(userId: string, file: File): Promise<StorageUploadResult> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase storage is not configured' };
    }

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return {
        success: true,
        publicUrl,
        filePath: data.path,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Avatar upload failed' };
    }
  },

  /**
   * Upload portfolio project screenshot or asset to 'portfolio' bucket
   */
  async uploadPortfolioAsset(userId: string, file: File): Promise<StorageUploadResult> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase storage is not configured' };
    }

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(data.path);

      return {
        success: true,
        publicUrl,
        filePath: data.path,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Portfolio upload failed' };
    }
  },

  /**
   * Upload private application attachment (e.g. resume or deliverable)
   */
  async uploadAttachment(userId: string, file: File, folder: string = 'general'): Promise<StorageUploadResult> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase storage is not configured' };
    }

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userId}/${folder}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Generate signed URL valid for 1 hour or public URL depending on bucket policy
      const { data: signedData, error: signedError } = await supabase.storage
        .from('attachments')
        .createSignedUrl(data.path, 3600);

      return {
        success: true,
        publicUrl: signedData?.signedUrl,
        filePath: data.path,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Attachment upload failed' };
    }
  },

  /**
   * Helper to retrieve a public URL for a file in any public bucket
   */
  getPublicUrl(bucket: string, path: string): string {
    if (!isSupabaseConfigured || !supabase) return '';
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};
