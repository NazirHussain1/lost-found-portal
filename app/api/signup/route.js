import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { signupSchema } from "@/app/lib/validations/auth";
import { validateData, createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";
import { withRateLimit, authRateLimit } from "@/app/lib/rateLimiter";
import { sendVerificationEmail } from "@/app/lib/email";

async function signupHandler(req) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate input data
    const validation = validateData(signupSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.errors);
    }

    const { name, email, phone, password } = validation.data;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return createErrorResponse([
        { field: 'email', message: 'User with this email already exists' }
      ]);
    }

    // Check if phone number already registered
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return createErrorResponse([
        { field: 'phone', message: 'Phone number already registered' }
      ]);
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Generate verification token (expires in 1 hour)
    const verificationToken = jwt.sign(
      { email, timestamp: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create user with verification fields
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    // Send verification email (non-blocking)
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      // Email service unavailable, continue with signup
    }

    return createSuccessResponse(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        isVerified: false,
        message: 'Account created successfully. Please check your email to verify your account.'
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

// Export POST handler with rate limiting
export const POST = withRateLimit(signupHandler, authRateLimit);
