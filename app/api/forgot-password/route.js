import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "@/app/lib/email";
import { withRateLimit, strictRateLimit } from "@/app/lib/rateLimiter";
import { createErrorResponse, createSuccessResponse, validateData } from "@/app/lib/validations/helper";
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
});

async function forgotPasswordHandler(req) {
  try {
    await connectDB();

    const body = await req.json();

    const validation = validateData(forgotPasswordSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.errors);
    }

    const { email } = validation.data;

    const user = await User.findOne({ email });

    if (!user) {
      return createSuccessResponse(
        {},
        'If an account exists with this email, a password reset link has been sent.'
      );
    }

    const resetToken = jwt.sign(
      { userId: user._id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      return createErrorResponse([
        { field: 'email', message: 'Failed to send reset email. Please try again later.' }
      ], 500);
    }

    return createSuccessResponse(
      { email: user.email },
      'Password reset link sent successfully. Please check your email.'
    );
  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

export const POST = withRateLimit(forgotPasswordHandler, strictRateLimit);
