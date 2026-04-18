/**
 * Client-side image upload utilities
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {Object} - Validation result
 */
export function validateImageFile(file) {
  if (!file) {
    return {
      valid: false,
      error: 'No file selected',
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMB}MB) exceeds maximum allowed size of 5MB.`,
    };
  }

  return {
    valid: true,
    file,
    size: file.size,
    type: file.type,
  };
}

/**
 * Convert file to base64
 * @param {File} file - Image file
 * @returns {Promise<string>} - Base64 encoded string
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = (error) => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image before upload
 * @param {File} file - Image file
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Compressed base64 string
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.9,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to server
 * @param {File} file - Image file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export async function uploadImage(file, options = {}) {
  const {
    compress = true,
    onProgress = null,
  } = options;

  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Convert to base64 (with optional compression)
    let base64;
    if (compress && file.size > 1024 * 1024) { // Compress if > 1MB
      if (onProgress) onProgress(10);
      base64 = await compressImage(file);
      if (onProgress) onProgress(30);
    } else {
      if (onProgress) onProgress(10);
      base64 = await fileToBase64(file);
      if (onProgress) onProgress(30);
    }

    // Upload to server
    if (onProgress) onProgress(40);
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64 }),
    });

    if (onProgress) onProgress(80);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Upload failed');
    }

    if (onProgress) onProgress(100);

    return {
      success: true,
      url: data.data.url,
      urls: data.data.urls,
      metadata: data.data.metadata,
    };

  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Get upload configuration from server
 * @returns {Promise<Object>} - Upload configuration
 */
export async function getUploadConfig() {
  try {
    const response = await fetch('/api/upload');
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to get upload configuration');
    }

    return data.data;
  } catch (error) {
    console.error('Get config error:', error);
    throw error;
  }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Create image preview URL
 * @param {File} file - Image file
 * @returns {string} - Preview URL
 */
export function createPreviewUrl(file) {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL
 * @param {string} url - Preview URL to revoke
 */
export function revokePreviewUrl(url) {
  URL.revokeObjectURL(url);
}
