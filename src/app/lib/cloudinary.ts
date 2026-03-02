'use client';

/**
 * Utility for uploading images to Cloudinary using an unsigned upload preset.
 * This avoids the need for a backend signature and stays within the free tier.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  // Replace these with your Cloudinary credentials from your dashboard
  const CLOUD_NAME = 'demo'; // Replace with your cloud name
  const UPLOAD_PRESET = 'unsigned_preset'; // Replace with your unsigned upload preset

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  // Cloudinary optimization flags can be added via the upload preset settings in their dashboard.
  // Common settings: "Auto Format", "Auto Quality", "Resize/Crop".

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
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
}
