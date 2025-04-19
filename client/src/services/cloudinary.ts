// Cloudinary upload service for directly uploading media files

// Upload status handler type for providing upload progress
type ProgressHandler = (progress: number) => void;

/**
 * Uploads a file directly to Cloudinary
 * @param file The file to upload
 * @param onProgress Optional callback for tracking upload progress
 * @returns Promise resolving to the Cloudinary upload response
 */
export async function cloudinaryUpload(
  file: File,
  onProgress?: ProgressHandler
): Promise<any> {
  try {
    // First, get a signature from our server
    const response = await fetch('/api/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upload signature');
    }
    
    // Create a mock response for now since direct upload isn't fully implemented
    // In a real implementation, we would use the signature to upload directly to Cloudinary
    
    // Simulate upload progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(Math.min(progress, 99));
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }
    
    // Instead, we'll use our server as a proxy for the upload
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await uploadResponse.json();
    
    // Set progress to 100% when complete
    if (onProgress) {
      onProgress(100);
    }
    
    return result.cloudinaryData || {
      secure_url: result.media?.url,
      public_id: result.media?.name,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Generate a Cloudinary transformation URL
 * @param url Original Cloudinary URL
 * @param options Transformation options
 * @returns Transformed URL
 */
export function transformCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  } = {}
): string {
  if (!url || !url.includes('cloudinary')) {
    return url;
  }
  
  try {
    // Parse the existing URL to find upload path
    const urlParts = url.split('/upload/');
    
    if (urlParts.length !== 2) {
      return url;
    }
    
    // Build transformation string
    const transformations = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    
    const transformationString = transformations.length ? transformations.join(',') + '/' : '';
    
    // Return the transformed URL
    return `${urlParts[0]}/upload/${transformationString}${urlParts[1]}`;
  } catch (error) {
    console.error('Error transforming Cloudinary URL:', error);
    return url;
  }
}

/**
 * Get image dimensions from Cloudinary URL
 * @param url Cloudinary URL
 * @returns Object with width and height if available
 */
export function getImageDimensions(url: string): { width?: number; height?: number } {
  try {
    // Check if URL contains dimensions
    const match = url.match(/\/w_(\d+),h_(\d+)\//);
    if (match && match.length === 3) {
      return {
        width: parseInt(match[1], 10),
        height: parseInt(match[2], 10),
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return {};
  }
}

export default {
  upload: cloudinaryUpload,
  transform: transformCloudinaryUrl,
  getDimensions: getImageDimensions,
};
