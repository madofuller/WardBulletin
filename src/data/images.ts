import { uploadImage, deleteImage, getUserImages } from '../lib/imageStorage';
import { supabase } from '../lib/supabase';

// Preloaded LDS-themed images for bulletin headers
export const LDS_IMAGES = [
  {
    id: 'none',
    name: 'No Image',
    url: '',
    description: 'Plain text header without image'
  },
  {
    id: 'resurrected-christ',
    name: 'Resurrected Christ',
    url: '/resurrected_christ.jpeg',
    description: 'The Resurrected Christ'
  },
  {
    id: 'jesus-raising-lazarus',
    name: 'Jesus Raising Lazarus',
    url: '/jesus_raising_lazarus.jpeg',
    description: 'Jesus raising Lazarus from the dead'
  },
  {
    id: 'crucifixion-christ',
    name: 'Crucifixion of Christ',
    url: '/crucifixion_christ_anderson.jpeg',
    description: 'The crucifixion of Jesus Christ'
  },
  {
    id: 'living-water',
    name: 'Living Water',
    url: '/living_water_jesus_christ.jpeg',
    description: 'Jesus Christ, the Living Water'
  },
  {
    id: 'triumphant-entry',
    name: 'Triumphant Entry',
    url: '/triumphant_entry.jpeg',
    description: 'Jesus Christ\'s triumphant entry'
  },
  {
    id: 'second-coming',
    name: 'The Second Coming',
    url: '/the_second_coming.jpeg',
    description: 'The Second Coming of Jesus Christ'
  },
  {
    id: 'lost-lamb',
    name: 'Lost Lamb',
    url: '/lost_lamb_art_lds.jpeg',
    description: 'The Good Shepherd and the lost lamb'
  },
  {
    id: 'john-baptizes-christ',
    name: 'John Baptizes Christ',
    url: '/john_baptizes_christ.jpeg',
    description: 'John the Baptist baptizing Jesus Christ'
  },
  {
    id: 'jesus-at-door',
    name: 'Jesus at the Door',
    url: '/jesus_at_the_door.jpeg',
    description: 'Jesus Christ knocking at the door'
  },
  {
    id: 'jesus-praying-gethsemane',
    name: 'Jesus Praying in Gethsemane',
    url: '/jesus_praying_in_gethsemane.jpeg',
    description: 'Jesus Christ praying in the Garden of Gethsemane'
  },
  {
    id: 'jesus-raising-jairus-daughter',
    name: 'Jesus Raising Jairus\' Daughter',
    url: '/jesus_raising_jairus_daughter_olsen.jpeg',
    description: 'Jesus raising Jairus\' daughter from the dead'
  },
  {
    id: 'jesus-blessing-children',
    name: 'Jesus Blessing the Children',
    url: '/jesus_blessing_the_children.jpeg',
    description: 'Jesus Christ blessing the children'
  },
  {
    id: 'go-ye-therefore',
    name: 'Go Ye Therefore',
    url: '/go_ye_therefore_and_teach_all_nations.jpeg',
    description: 'Go ye therefore and teach all nations'
  },
  {
    id: 'christ-rich-young-ruler',
    name: 'Christ and the Rich Young Ruler',
    url: '/christ_rich_young_ruler_hofmann.jpeg',
    description: 'Jesus Christ and the rich young ruler'
  },
  {
    id: 'christ-ordaining-apostles',
    name: 'Christ Ordaining the Apostles',
    url: '/christ_ordaining_the_apostles.jpeg',
    description: 'Jesus Christ ordaining the apostles'
  },
  {
    id: 'jesus-burial-tomb',
    name: 'Jesus Burial Tomb',
    url: '/jesus_burial_tomb.jpeg',
    description: 'The burial tomb of Jesus Christ'
  },
  {
    id: 'pool-of-bethesda',
    name: 'Pool of Bethesda',
    url: '/pool_of_bethesda_carl_bloch.jpeg',
    description: 'The Pool of Bethesda'
  },
  {
    id: 'calling-the-fishermen',
    name: 'Calling the Fishermen',
    url: '/calling_the_fishermen.jpeg',
    description: 'Jesus calling the fishermen to be fishers of men'
  },
  {
    id: 'angel-appears-shepherds',
    name: 'Angel Appears to Shepherds',
    url: '/angel_appears_shepherds.jpeg',
    description: 'The angel announcing Christ\'s birth to the shepherds'
  },
  {
    id: 'jesus-birth-nativity',
    name: 'Jesus Birth Nativity',
    url: '/jesus_birth_nativity.jpeg',
    description: 'The birth of Jesus Christ'
  },
  {
    id: 'mary-joseph-inn-bethlehem',
    name: 'Mary and Joseph at the Inn',
    url: '/mary_joseph_inn_bethlehem.jpeg',
    description: 'Mary and Joseph seeking room at the inn in Bethlehem'
  },
  {
    id: 'nativity',
    name: 'The Nativity',
    url: '/nativity.jpeg',
    description: 'The nativity scene'
  },
  {
    id: 'mary-joseph-bethlehem-inn-barrett',
    name: 'Mary and Joseph at Bethlehem Inn',
    url: '/robert_barrett_mary_joseph_bethlehem_inn.jpeg',
    description: 'Mary and Joseph at the Bethlehem inn by Robert Barrett'
  },
  {
    id: 'star-jesus-birth',
    name: 'Star of Jesus Birth',
    url: '/star_jesus_birth.jpeg',
    description: 'The star announcing the birth of Jesus'
  },
  {
    id: 'walter-rane-nativity',
    name: 'Nativity by Walter Rane',
    url: '/walter_rane_nativity.jpeg',
    description: 'The nativity scene by Walter Rane'
  }
];

// Custom image interface
export interface CustomImage {
  id: string;
  name: string;
  url: string;
  description?: string;
  isCustom: true;
  uploadDate: string;
}

// Combined image type
export type ImageData = typeof LDS_IMAGES[0] | CustomImage;

// Get custom images from Supabase Storage
export const getCustomImages = async (userId?: string): Promise<CustomImage[]> => {
  try {
    // If no userId provided, try to get current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      userId = user.id;
    }

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
    // If no userId provided, get current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to upload images');
      userId = user.id;
    }

    // Compress the image first
    const compressedBase64 = await compressImage(image.url);

    // Upload to Supabase Storage and get public URL
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to delete images');
      userId = user.id;
    }

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

// Synchronous version for rendering - checks LDS images only
// For custom images, the URL should already be in the Supabase public URL format
export const getImageByIdSync = (id: string): ImageData => {
  // Check preset images first
  const presetImage = LDS_IMAGES.find(img => img.id === id);
  if (presetImage) return presetImage;

  // If it's a Supabase Storage URL (custom image), return a placeholder that will render the URL
  // This works because announcement.images already have the URL stored
  if (id.startsWith('custom-')) {
    return {
      id,
      name: 'Custom Image',
      url: '', // URL will be taken from announcement.images object
      description: 'Custom uploaded image'
    };
  }

  return LDS_IMAGES[0];
};