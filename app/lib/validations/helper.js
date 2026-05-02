import { z } from 'zod';

/**
 * Validates data against a Zod schema
 * @param {Object} schema - Zod schema to validate against
 * @param {Object} data - Data to validate
 * @returns {Object} - { success: boolean, data?: any, errors?: array }
 */
export function validateData(schema, data) {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error('Validation error:', error);
    
    // Check if it's a Zod error (works for both v3 and v4)
    if (error && error.name === 'ZodError' && error.issues) {
      // Zod v4 uses 'issues' instead of 'errors'
      const errors = Array.isArray(error.issues) 
        ? error.issues.map((err) => ({
            field: Array.isArray(err.path) ? err.path.join('.') : 'unknown',
            message: err.message || 'Validation error',
          }))
        : [{ field: 'unknown', message: 'Validation failed' }];
      
      return {
        success: false,
        errors,
      };
    }
    
    // Fallback for Zod v3 (uses 'errors' property)
    if (error && error.errors && Array.isArray(error.errors)) {
      const errors = error.errors.map((err) => ({
        field: Array.isArray(err.path) ? err.path.join('.') : 'unknown',
        message: err.message || 'Validation error',
      }));
      
      return {
        success: false,
        errors,
      };
    }
    
    // Handle non-Zod errors
    return {
      success: false,
      errors: [{ 
        field: 'unknown', 
        message: error.message || 'Validation failed' 
      }],
    };
  }
}

/**
 * Creates a standardized error response
 * @param {Array} errors - Array of error objects
 * @param {Number} status - HTTP status code (default: 400)
 * @returns {Response} - Next.js Response object
 */
export function createErrorResponse(errors, status = 400) {
  return Response.json(
    {
      success: false,
      errors,
    },
    { status }
  );
}

/**
 * Creates a standardized success response
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} status - HTTP status code (default: 200)
 * @returns {Response} - Next.js Response object
 */
export function createSuccessResponse(data, message = 'Success', status = 200) {
  return Response.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}
