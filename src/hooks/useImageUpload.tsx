import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Match the exact image_metadata type from the original schema
type ImageMetadata = {
    url: string;
    width: number;
    height: number;
    size: number;
    format: string;
  };
  
  /**
 * uploads an image to supabase and returns the metadata.
 * @param bucketName - the name of the supabase bucket.
 */
  export const useImageUpload = (bucketName: string) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
  
    const extractImageMetadata = (file: File): Promise<ImageMetadata> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            url: URL.createObjectURL(file),
            width: img.width,
            height: img.height,
            size: file.size,
            format: file.type.split('/')[1] || 'unknown'
          });
        };
        img.onerror = () => reject(new Error('Image loading failed'));
        img.src = URL.createObjectURL(file);
      });
    };
  
    const uploadImage = async (file: File): Promise<ImageMetadata> => {
      setIsUploading(true);
      setError(null);
  
      try {
        // Extract image metadata
        const metadata = await extractImageMetadata(file);
  
        // Upload file to Supabase storage
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}.${fileExtension}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);
  
        if (storageError) throw storageError;
  
        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
  
        // Update the URL with the actual public URL
        metadata.url = urlData.publicUrl;
  
        // Return just the metadata
        return metadata;
  
      } catch (err) {
        console.log({err})
        const error = err instanceof Error 
          ? err 
          : new Error('Unknown upload error');
        setError(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    };
  
    return { 
      uploadImage, 
      isUploading, 
      error 
    };
  };