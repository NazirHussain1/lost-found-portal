import { setupIndexes, getIndexStats } from "@/app/lib/setupIndexes";
import { withRateLimit, adminRateLimit } from "@/app/lib/rateLimiter";
import { createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

/**
 * Admin endpoint to setup MongoDB indexes
 * Only accessible by admin users
 */
async function setupIndexesHandler(req) {
  try {
    // Verify admin access
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return createErrorResponse([
        { field: 'auth', message: 'Unauthorized - Admin access required' }
      ], 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return createErrorResponse([
        { field: 'auth', message: 'Invalid or expired token' }
      ], 401);
    }

    if (decoded.role !== 'admin') {
      return createErrorResponse([
        { field: 'auth', message: 'Forbidden - Admin access required' }
      ], 403);
    }

    // Setup indexes
    const success = await setupIndexes();

    if (!success) {
      return createErrorResponse([
        { field: 'server', message: 'Failed to setup indexes' }
      ], 500);
    }

    // Get index statistics
    const stats = await getIndexStats();

    return createSuccessResponse(
      { stats },
      'Indexes setup successfully'
    );
  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

// Export POST handler with admin rate limiting
export const POST = withRateLimit(setupIndexesHandler, adminRateLimit);
