import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomImage, saveCustomImage } from '../data/images';

interface ImageUploadProps {
  onImageUploaded: (imageId: string, imageUrl: string) => void;
  onError?: (error: string) => void;
  userId?: string; // Pass userId to check if user is authenticated
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, onError, userId }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.(t('form.invalidImageFile'));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onError?.(t('form.imageTooLarge'));
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const base64 = await convertToBase64(file);
      
      // Create custom image object
      const customImage: CustomImage = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        url: base64,
        description: `Custom uploaded image: ${file.name}`,
        isCustom: true,
        uploadDate: new Date().toISOString()
      };

      // Save to Supabase Storage and get back the image with public URL
      const savedImage = await saveCustomImage(customImage, userId);

      // Notify parent component with both ID and URL
      onImageUploaded(savedImage.id, savedImage.url);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      onError?.(t('form.failedToUploadImage'));
    } finally {
      setIsUploading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={triggerFileSelect}
        disabled={isUploading}
        className={`w-full px-4 py-3 border-2 border-dashed rounded-lg text-center transition-colors ${
          isUploading
            ? 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100 cursor-pointer'
        }`}
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>{t('form.uploading')}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-medium">{t('form.uploadCustomImage')}</span>
            <span className="text-sm text-gray-500">{t('form.imageFileTypes')}</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ImageUpload;