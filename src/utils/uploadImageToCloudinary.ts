// utils/cloudinary.js
export const uploadImageToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  if (!uploadPreset) {
    throw new Error(
      'Cloudinary upload preset is not defined in environment variables.'
    );
  }
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
      };
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
