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

    // Parse request body with error handling
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return createErrorResponse([
        { field: 'body', message: 'Invalid JSON in request body' }
      ], 400);
    }

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

    // Create user first (without token)
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      isVerified: false,
    });

    // Generate verification token with userId (expires in 1 hour)
    const verificationToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Update user with verification token
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Send verification email (non-blocking)
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
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
    console.error('Signup error:', error);
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}

// Export POST handler with rate limiting
export const POST = withRateLimit(signupHandler, authRateLimit);
