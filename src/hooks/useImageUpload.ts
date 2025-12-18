import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, userId: string, type: 'avatar' | 'cover'): Promise<string | null> => {
    try {
      setUploading(true);
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = url.split('/user-content/');
      if (urlParts.length < 2) {
        throw new Error('Invalid image URL');
      }

      const filePath = urlParts[1];

      const { error: deleteError } = await supabase.storage
        .from('user-content')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      return true;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    error,
  };
};
