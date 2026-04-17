import { z } from 'zod';

// Password validation: min 8 chars, 1 uppercase, 1 number, 1 special char
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Pakistani phone format: 03XXXXXXXXX (11 digits starting with 03)
const phoneSchema = z
  .string()
  .regex(/^03[0-9]{9}$/, 'Phone must be in Pakistani format (03XXXXXXXXX)')
  .length(11, 'Phone number must be exactly 11 digits');

// Signup validation schema
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: passwordSchema,
  phone: phoneSchema,
});

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// Profile update schema (optional fields)
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .trim()
    .optional(),
  phone: phoneSchema.optional(),
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .optional(),
});
