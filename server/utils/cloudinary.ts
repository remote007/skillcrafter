import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

/**
 * Upload a file to Cloudinary
 * @param filePath Path to the file to upload
 * @param folder Optional folder in Cloudinary to store the file
 * @returns Cloudinary upload result
 */
export async function uploadToCloudinary(filePath: string, folder: string = 'projectshelf') {
  try {
    // Set folder and allowed resource types
    const options = {
      folder: folder,
      resource_type: "auto", // Allow both images and videos
      use_filename: true, // Use the original filename
      unique_filename: true // Ensure unique names
    };
    
    // Perform the upload
    const result = await cloudinary.uploader.upload(filePath, options);
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId The public ID of the file to delete
 * @param resourceType The type of resource ('image' or 'video')
 * @returns Cloudinary deletion result
 */
export async function deleteFromCloudinary(publicId: string, resourceType: string = 'image') {
  try {
    // Delete the file
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as any
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

/**
 * Generate a transformation URL for an image or video
 * @param url Original Cloudinary URL
 * @param options Transformation options
 * @returns Transformed URL
 */
export function transformUrl(url: string, options: any = {}) {
  // Example options: { width: 300, height: 200, crop: 'fill' }
  // Extract the public ID from the URL
  const parts = url.split('/');
  let publicIdWithExt = parts[parts.length - 1];
  let publicId = publicIdWithExt.split('.')[0];
  
  // Determine resource type
  const resourceType = url.includes('/image/') ? 'image' : 'video';
  
  // Build the transformation
  let transformations = '';
  if (options.width) transformations += `w_${options.width},`;
  if (options.height) transformations += `h_${options.height},`;
  if (options.crop) transformations += `c_${options.crop},`;
  
  // Remove trailing comma if needed
  if (transformations.endsWith(',')) {
    transformations = transformations.slice(0, -1);
  }
  
  // Format the URL with transformations
  return `https://res.cloudinary.com/${cloudinary.config().cloud_name}/${resourceType}/upload/${transformations}/${publicId}`;
}
