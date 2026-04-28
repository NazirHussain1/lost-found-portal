import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "@/app/lib/email";
import { withRateLimit, strictRateLimit } from "@/app/lib/rateLimiter";
import { createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";
import { z } from 'zod';
import { validateData } from "@/app/lib/validations/helper";

const resendSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
});

async function resendVerificationHandler(req) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate input
    const validation = validateData(resendSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.errors);
    }

    const { email } = validation.data;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return createSuccessResponse(
        {},
        'If an account exists with this email, a verification link has been sent.'
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return createErrorResponse([
        { field: 'email', message: 'Email is already verified' }
      ], 400);
    }

    // Generate new verification token (expires in 1 hour)
    const verificationToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return createSuccessResponse(
      { email: user.email },
      'Verification email sent successfully. Please check your inbox.'
    );
  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Failed to send verification email' }
    ], 500);
  }
}

// Export POST handler with strict rate limiting (3 requests per hour)
export const POST = withRateLimit(resendVerificationHandler, strictRateLimit);
