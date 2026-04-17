import { ZodError } from 'zod';

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
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation failed' }],
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
