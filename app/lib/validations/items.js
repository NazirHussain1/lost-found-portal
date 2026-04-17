import { z } from 'zod';

// Item categories
const itemCategories = [
  'electronics',
  'stationary',
  'documents',
  'jewelry',
  'clothing',
  'keys',
  'bags',
  'other'
];

// Item types
const itemTypes = ['lost', 'found', 'resolved'];

// Create item validation schema
export const createItemSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .trim(),
  category: z
    .enum(itemCategories, {
      errorMap: () => ({ message: 'Invalid category selected' })
    }),
  type: z
    .enum(itemTypes, {
      errorMap: () => ({ message: 'Type must be either lost, found, or resolved' })
    }),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must not exceed 200 characters')
    .trim(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format'
    })
    .transform((date) => new Date(date)),
  imageUrl: z
    .string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
});

// Update item validation schema (all fields optional except ID)
export const updateItemSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional(),
  category: z
    .enum(itemCategories, {
      errorMap: () => ({ message: 'Invalid category selected' })
    })
    .optional(),
  type: z
    .enum(itemTypes, {
      errorMap: () => ({ message: 'Type must be either lost, found, or resolved' })
    })
    .optional(),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must not exceed 200 characters')
    .trim()
    .optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format'
    })
    .transform((date) => new Date(date))
    .optional(),
  imageUrl: z
    .string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
});

// Item ID validation (MongoDB ObjectId format)
export const itemIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid item ID format');
