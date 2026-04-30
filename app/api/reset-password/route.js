import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { withRateLimit, authRateLimit } from "@/app/lib/rateLimiter";
import { createErrorResponse, createSuccessResponse, validateData } from "@/app/lib/validations/helper";
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password must not exceed 128 characters'),
});

async function resetPasswordHandler(req) {
  try {
    await connectDB();

    const body = await req.json();

    const validation = validateData(resetPasswordSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.errors);
    }

    const { token, password } = validation.data;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type !== 'password-reset') {
        return createErrorResponse([
          { field: 'token', message: 'Invalid reset token' }
        ], 400);
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return createErrorResponse([
          { field: 'token', message: 'Reset link has expired. Please request a new one.' }
        ], 400);
      }
      return createErrorResponse([
        { field: 'token', message: 'Invalid reset token' }
      ], 400);
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return createErrorResponse([
        { field: 'user', message: 'User not found' }
      ], 404);
    }

    if (user.resetPasswordToken !== token) {
      return createErrorResponse([
        { field: 'token', message: 'Invalid or expired reset token' }
      ], 400);
    }

    if (user.resetPasswordExpiry && new Date() > user.resetPasswordExpiry) {
      return createErrorResponse([
        { field: 'token', message: 'Reset link has expired. Please request a new one.' }
      ], 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    return createSuccessResponse(
      { email: user.email },
      'Password reset successfully! You can now login with your new password.'
    );
  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

export const POST = withRateLimit(resetPasswordHandler, authRateLimit);
