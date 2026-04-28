import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { loginSchema } from "@/app/lib/validations/auth";
import { validateData, createErrorResponse } from "@/app/lib/validations/helper";
import { withRateLimit, authRateLimit } from "@/app/lib/rateLimiter";

async function loginHandler(req) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate input data
    const validation = validateData(loginSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.errors);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return createErrorResponse([
        { field: 'email', message: 'Invalid email or password' }
      ], 401);
    }

    // Check if email is verified (warning only, allow login)
    const isVerified = user.isVerified;

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return createErrorResponse([
        { field: 'password', message: 'Invalid email or password' }
      ], 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      success: true,
      message: isVerified ? "Logged in successfully" : "Logged in successfully. Please verify your email.",
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: isVerified
      }
    });

    // Set HTTP-only cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res;
  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

// Export POST handler with rate limiting
export const POST = withRateLimit(loginHandler, authRateLimit);
