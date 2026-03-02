'use client';

/**
 * Utility for uploading images to Cloudinary using an unsigned upload preset.
 * This avoids the need for a backend signature and stays within the free tier.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  // IMPORTANT: Replace these with your actual Cloudinary credentials
  const CLOUD_NAME = 'demo'; // Replace with your actual Cloud Name
  const UPLOAD_PRESET = 'unsigned_preset'; // Replace with your actual Unsigned Upload Preset

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  // Apply basic optimization via unsigned transformation if desired
  // Cloudinary handles format/quality optimization automatically if set in the preset

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    // Return the secure URL for HTTPS support
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
}
