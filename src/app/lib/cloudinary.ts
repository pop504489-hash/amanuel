'use client';

/**
 * Utility for uploading images to Cloudinary using an unsigned upload preset.
 * This avoids the need for a backend signature and stays within the free tier.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  // Hardcoded credentials as requested
  const CLOUD_NAME = 'dhdfkeajk';
  const UPLOAD_PRESET = 'dada_28';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
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
    return data.secure_url;
  } catch (error) {
    // In a production app, we would use a more sophisticated error reporting tool.
    // For now, we throw the error so it can be handled by the calling component's UI.
    throw error;
  }
}
