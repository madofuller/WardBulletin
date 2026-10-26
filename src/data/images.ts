export { LDS_IMAGES, getImageByIdSync } from './imageCatalog';
export type { CustomImage, ImageData } from './imageCatalog';
import { LDS_IMAGES, type CustomImage, type ImageData } from './imageCatalog';

export const getCustomImages = async (userId?: string): Promise<CustomImage[]> => {
  try {
    // If no userId provided, try to get current user
    if (!userId) {
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      userId = user.id;
    }

    const { getUserImages } = await import('../lib/imageStorage');
    const storedImages = await getUserImages(userId);

    // Convert StoredImage to CustomImage format
    return storedImages.map(img => ({
      id: img.id,
      name: img.name,
      url: img.url,
      isCustom: true as const,
      uploadDate: img.createdAt
    }));
  } catch (error) {
    return [];
  }
};

// Compress image data to reduce storage size
const compressImage = (base64: string, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (max 800px width/height)
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.src = base64;
  });
};

// Save custom image to Supabase Storage with compression
export const saveCustomImage = async (image: CustomImage, userId?: string): Promise<CustomImage> => {
  try {
    // If no userId provided, try to get current user (but allow anonymous uploads)
    if (!userId) {
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id; // Will be undefined for anonymous users
    }

    // Compress the image first
    const compressedBase64 = await compressImage(image.url);

    // Upload to Supabase Storage and get public URL
    // If no userId, it will upload to 'anonymous' folder
    const { uploadImage } = await import('../lib/imageStorage');
    const publicUrl = await uploadImage(
      image.id,
      image.name,
      compressedBase64,
      userId
    );

    // Return the image with the new public URL
    return {
      ...image,
      url: publicUrl
    };
  } catch (error) {
    throw new Error('Failed to save custom image. Please try again.');
  }
};

// Delete custom image from Supabase Storage
export const deleteCustomImage = async (imageId: string, userId?: string): Promise<void> => {
  try {
    // If no userId provided, get current user
    if (!userId) {
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to delete images');
      userId = user.id;
    }

    const { deleteImage } = await import('../lib/imageStorage');
    await deleteImage(imageId, userId);
  } catch (error) {
    throw error;
  }
};

// Get all images (preset + custom)
export const getAllImages = async (userId?: string): Promise<ImageData[]> => {
  const customImages = await getCustomImages(userId);
  return [...LDS_IMAGES, ...customImages];
};

export const getImageById = async (id: string, userId?: string): Promise<ImageData> => {
  // Check preset images first
  const presetImage = LDS_IMAGES.find(img => img.id === id);
  if (presetImage) return presetImage;

  // Check custom images
  const customImages = await getCustomImages(userId);
  const customImage = customImages.find(img => img.id === id);

  return customImage || LDS_IMAGES[0];
};
