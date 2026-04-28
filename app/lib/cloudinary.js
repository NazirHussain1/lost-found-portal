import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const FOLDER = 'lost_found_portal';

// Image size configurations
const IMAGE_SIZES = {
  thumbnail: {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'auto',
  },
  medium: {
    width: 800,
    height: 600,
    crop: 'limit',
  },
  full: {
    width: 1920,
    height: 1080,
    crop: 'limit',
  },
};

/**
 * Validate image data
 * @param {string} imageData - Base64 image data
 * @returns {Object} - Validation result
 */
function validateImage(imageData) {
  if (!imageData) {
    return {
      valid: false,
      error: 'No image data provided',
    };
  }

  // Check if it's a valid base64 string
  if (!imageData.startsWith('data:image/')) {
    return {
      valid: false,
      error: 'Invalid image format. Must be a base64 encoded image.',
    };
  }

  // Extract format
  const formatMatch = imageData.match(/data:image\/(\w+);base64,/);
  if (!formatMatch) {
    return {
      valid: false,
      error: 'Could not determine image format',
    };
  }

  const format = formatMatch[1].toLowerCase();
  if (!ALLOWED_FORMATS.includes(format)) {
    return {
      valid: false,
      error: `Invalid image format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`,
    };
  }

  // Estimate file size from base64 string
  const base64Data = imageData.split(',')[1];
  const sizeInBytes = (base64Data.length * 3) / 4;

  // Check for padding
  const padding = (base64Data.match(/=/g) || []).length;
  const actualSize = sizeInBytes - padding;

  if (actualSize > MAX_FILE_SIZE) {
    const sizeMB = (actualSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Image size (${sizeMB}MB) exceeds maximum allowed size of 5MB`,
    };
  }

  return {
    valid: true,
    format,
    size: actualSize,
  };
}

/**
 * Upload image to Cloudinary with optimizations
 * @param {string} imageData - Base64 image data
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with multiple sizes
 */
export async function uploadOptimizedImage(imageData, options = {}) {
  try {
    // Validate image
    const validation = validateImage(imageData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Upload options
    const uploadOptions = {
      folder: options.folder || FOLDER,
      resource_type: 'image',
      format: 'webp', // Auto-convert to WebP
      quality: 'auto:good', // Automatic quality optimization
      fetch_format: 'auto', // Automatic format selection
      flags: 'progressive', // Progressive loading
      ...options,
    };

    // Upload original image
    const uploadResult = await cloudinary.uploader.upload(imageData, uploadOptions);

    // Generate URLs for different sizes
    const urls = {
      original: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      thumbnail: cloudinary.url(uploadResult.public_id, {
        ...IMAGE_SIZES.thumbnail,
        format: 'webp',
        quality: 'auto:good',
        fetch_format: 'auto',
      }),
      medium: cloudinary.url(uploadResult.public_id, {
        ...IMAGE_SIZES.medium,
        format: 'webp',
        quality: 'auto:good',
        fetch_format: 'auto',
      }),
      full: cloudinary.url(uploadResult.public_id, {
        ...IMAGE_SIZES.full,
        format: 'webp',
        quality: 'auto:good',
        fetch_format: 'auto',
      }),
    };

    return {
      success: true,
      urls,
      metadata: {
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        createdAt: uploadResult.created_at,
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get image transformation URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {string} - Transformed image URL
 */
export function getTransformedUrl(publicId, transformations = {}) {
  return cloudinary.url(publicId, {
    format: 'webp',
    quality: 'auto:good',
    fetch_format: 'auto',
    ...transformations,
  });
}

/**
 * Generate responsive image URLs
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} - Responsive image URLs
 */
export function getResponsiveUrls(publicId) {
  const breakpoints = [320, 640, 768, 1024, 1280, 1536];
  
  return breakpoints.reduce((acc, width) => {
    acc[`w${width}`] = cloudinary.url(publicId, {
      width,
      crop: 'limit',
      format: 'webp',
      quality: 'auto:good',
      fetch_format: 'auto',
    });
    return acc;
  }, {});
}

/**
 * Validate Cloudinary configuration
 * @returns {boolean} - True if configured correctly
 */
export function validateCloudinaryConfig() {
  const config = cloudinary.config();
  return !!(config.cloud_name && config.api_key && config.api_secret);
}

/**
 * Get upload preset configuration
 * @returns {Object} - Upload preset
 */
export function getUploadPreset() {
  return {
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
    allowedFormats: ALLOWED_FORMATS,
    imageSizes: IMAGE_SIZES,
  };
}

export default cloudinary;
