import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "@/app/lib/email";
import { withRateLimit, authRateLimit } from "@/app/lib/rateLimiter";
import { createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";

async function verifyEmailHandler(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return createErrorResponse([
        { field: 'token', message: 'Verification token is required' }
      ], 400);
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return createErrorResponse([
          { field: 'token', message: 'Verification link has expired. Please request a new one.' }
        ], 400);
      }
      return createErrorResponse([
        { field: 'token', message: 'Invalid verification token' }
      ], 400);
    }

    // Find user by ID from token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return createErrorResponse([
        { field: 'user', message: 'User not found' }
      ], 404);
    }

    // Check if already verified
    if (user.isVerified) {
      return createSuccessResponse(
        { email: user.email, alreadyVerified: true },
        'Email is already verified'
      );
    }

    // Check if token matches
    if (user.verificationToken !== token) {
      return createErrorResponse([
        { field: 'token', message: 'Invalid or expired verification token' }
      ], 400);
    }

    // Check token expiry
    if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
      return createErrorResponse([
        { field: 'token', message: 'Verification link has expired. Please request a new one.' }
      ], 400);
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(() => {
      // Email service unavailable
    });

    return createSuccessResponse(
      {
        email: user.email,
        name: user.name,
        verified: true
      },
      'Email verified successfully! You can now login.'
    );
  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

// Export GET handler with rate limiting
export const GET = withRateLimit(verifyEmailHandler, authRateLimit);
