import { uploadOptimizedImage, getUploadPreset } from "@/app/lib/cloudinary";
import { withRateLimit, uploadRateLimit } from "@/app/lib/rateLimiter";
import { createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";

async function uploadHandler(req) {
  try {
    const data = await req.json();
    const { image } = data;

    if (!image) {
      return createErrorResponse([
        { field: 'image', message: 'No image data provided' }
      ], 400);
    }

    // Upload optimized image
    const result = await uploadOptimizedImage(image);

    return createSuccessResponse({
      url: result.urls.medium, // Default to medium size
      urls: result.urls,
      metadata: result.metadata
    }, 'Image uploaded successfully');

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific error messages
    if (error.message.includes('exceeds maximum')) {
      return createErrorResponse([
        { field: 'image', message: error.message }
      ], 413); // Payload Too Large
    }

    if (error.message.includes('Invalid image format')) {
      return createErrorResponse([
        { field: 'image', message: error.message }
      ], 400);
    }

    return createErrorResponse([
      { field: 'server', message: 'Failed to upload image. Please try again.' }
    ], 500);
  }
}

async function getConfigHandler(req) {
  try {
    const config = getUploadPreset();
    
    return createSuccessResponse({
      maxFileSize: config.maxFileSize,
      maxFileSizeMB: config.maxFileSizeMB,
      allowedFormats: config.allowedFormats,
      imageSizes: config.imageSizes
    }, 'Upload configuration retrieved');

  } catch (error) {
    console.error('Get config error:', error);
    return createErrorResponse([
      { field: 'server', message: 'Failed to get upload configuration' }
    ], 500);
  }
}

// Export handlers with upload rate limiting (10 requests per 15 minutes)
export const POST = withRateLimit(uploadHandler, uploadRateLimit);
export const GET = withRateLimit(getConfigHandler, uploadRateLimit);
