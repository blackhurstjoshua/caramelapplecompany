import { supabase } from '$lib/supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param folder - Optional folder path (e.g., 'hero', 'products', 'story')
 * @returns Promise with upload result
 */
export async function uploadImage(file: File, folder: string = ''): Promise<ImageUploadResult> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)'
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image must be smaller than 5MB'
      };
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Failed to upload image'
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param path - The file path in storage
 * @returns Promise with deletion result
 */
export async function deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: 'Failed to delete image'
    };
  }
}

/**
 * Get public URL for an image
 * @param path - The file path in storage
 * @returns Public URL string
 */
export function getImageUrl(path: string): string {
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * List all images in a folder
 * @param folder - Optional folder path
 * @returns Promise with list of image files
 */
export async function listImages(folder: string = '') {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('List error:', error);
      return { success: false, images: [], error: error.message };
    }

    const images = data?.map(file => ({
      name: file.name,
      path: folder ? `${folder}/${file.name}` : file.name,
      url: getImageUrl(folder ? `${folder}/${file.name}` : file.name),
      size: file.metadata?.size,
      createdAt: file.created_at,
      updatedAt: file.updated_at
    })) || [];

    return { success: true, images, error: null };
  } catch (error) {
    console.error('List error:', error);
    return { success: false, images: [], error: 'Failed to list images' };
  }
}
