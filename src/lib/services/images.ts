import { supabase } from '$lib/supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

/**
 * Process an image to 800x800px with smart center cropping
 * @param file - The image file to process
 * @returns Promise with processed File object
 */
async function processImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      const targetSize = 800;
      canvas.width = targetSize;
      canvas.height = targetSize;

      // Calculate dimensions for center crop
      const sourceAspect = img.width / img.height;
      const targetAspect = 1; // Square

      let sourceWidth, sourceHeight, sourceX, sourceY;

      if (sourceAspect > targetAspect) {
        // Image is wider than target - crop width
        sourceHeight = img.height;
        sourceWidth = img.height * targetAspect;
        sourceX = (img.width - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Image is taller than target - crop height
        sourceWidth = img.width;
        sourceHeight = img.width / targetAspect;
        sourceX = 0;
        sourceY = (img.height - sourceHeight) / 2;
      }

      // Draw the cropped and resized image
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
        0, 0, targetSize, targetSize // Destination rectangle
      );

      // Convert canvas to blob then to File
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create blob from canvas'));
            return;
          }

          // Create a new file with the same name but force .jpg extension
          const fileName = file.name.replace(/\.[^.]+$/, '.jpg');
          const processedFile = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          resolve(processedFile);
        },
        'image/jpeg',
        0.85 // 85% quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param folder - Optional folder path (e.g., 'hero', 'products', 'story')
 * @returns Promise with upload result
 */
export async function uploadImage(file: File, folder: string = ''): Promise<ImageUploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Please upload a valid image file (JPEG, PNG, WebP, GIF, or HEIC)'
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

    // Process the image to 800x800px before uploading
    const processedFile = await processImage(file);

    // Generate unique filename (use .jpg since processed images are JPEG)
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload processed image to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
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
