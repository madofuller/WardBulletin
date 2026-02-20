import { supabase } from './supabase';

const BUCKET_NAME = 'bulletin-images';

export interface StoredImage {
  id: string;
  name: string;
  url: string;
  userId: string;
  createdAt: string;
}

// Helper to convert base64 to Blob
const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(',');
  const contentType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const raw = atob(parts[1]);
  const array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return new Blob([array], { type: contentType });
};

// Upload image to Supabase Storage
export const uploadImage = async (
  imageId: string,
  imageName: string,
  base64Data: string,
  userId?: string
): Promise<string> => {
  try {
    // Refresh session so the storage request uses the user's JWT, not the anon key
    await supabase.auth.refreshSession();

    // Convert base64 to blob
    const blob = base64ToBlob(base64Data);

    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }
    if (!userId) {
      throw new Error('User must be authenticated to upload images');
    }

    const filePath = `${userId}/${imageId}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true, // Allow overwriting if exists
        cacheControl: '3600'
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    throw new Error('Failed to upload image to storage');
  }
};

// Delete image from Supabase Storage
export const deleteImage = async (imageId: string, userId?: string): Promise<void> => {
  try {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }
    if (!userId) {
      throw new Error('User must be authenticated to delete images');
    }
    const filePath = `${userId}/${imageId}.jpg`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error('Failed to delete image from storage');
  }
};

// Get all images for a user
export const getUserImages = async (userId: string): Promise<StoredImage[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(userId);

    if (error) {
      return [];
    }

    // Convert to StoredImage format
    const images: StoredImage[] = data.map(file => {
      const filePath = `${userId}/${file.name}`;
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        id: file.name.replace('.jpg', ''),
        name: file.name.replace('.jpg', ''),
        url: urlData.publicUrl,
        userId,
        createdAt: file.created_at || new Date().toISOString()
      };
    });

    return images;
  } catch (error) {
    return [];
  }
};

// Check if storage bucket exists and is accessible
export const checkStorageAccess = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
    return !error && !!data;
  } catch (error) {
    return false;
  }
};
