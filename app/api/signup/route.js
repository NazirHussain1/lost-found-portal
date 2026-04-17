import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { signupSchema } from "@/app/lib/validations/auth";
import { validateData, createErrorResponse, createSuccessResponse } from "@/app/lib/validations/helper";

export async function POST(req) {
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

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
    });

    return createSuccessResponse(
      { userId: user._id, email: user.email },
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
