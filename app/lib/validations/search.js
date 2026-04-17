import { z } from 'zod';

// Valid categories
const categories = [
  'all',
  'electronics',
  'stationary',
  'documents',
  'jewelry',
  'clothing',
  'keys',
  'bags',
  'other'
];

// Valid types
const types = ['all', 'lost', 'found', 'resolved'];

// Valid sort fields
const sortFields = ['relevance', 'date', 'createdAt'];

// Valid sort orders
const sortOrders = ['asc', 'desc'];

/**
 * Search query validation schema
 */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .max(200, 'Search query must not exceed 200 characters')
    .optional()
    .transform(val => val?.trim() || ''),
  
  category: z
    .enum(categories, {
      errorMap: () => ({ message: 'Invalid category' })
    })
    .optional(),
  
  type: z
    .enum(types, {
      errorMap: () => ({ message: 'Invalid type' })
    })
    .optional(),
  
  dateFrom: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid dateFrom format'
    })
    .optional(),
  
  dateTo: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid dateTo format'
    })
    .optional(),
  
  page: z
    .string()
    .optional()
    .transform(val => parseInt(val || '1'))
    .refine(val => val > 0, {
      message: 'Page must be greater than 0'
    }),
  
  limit: z
    .string()
    .optional()
    .transform(val => Math.min(parseInt(val || '20'), 100))
    .refine(val => val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100'
    }),
  
  sortBy: z
    .enum(sortFields, {
      errorMap: () => ({ message: 'Invalid sortBy field' })
    })
    .optional()
    .default('relevance'),
  
  sortOrder: z
    .enum(sortOrders, {
      errorMap: () => ({ message: 'Invalid sortOrder' })
    })
    .optional()
    .default('desc'),
});

/**
 * Advanced search filters
 */
export const advancedSearchSchema = searchQuerySchema.extend({
  minDate: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid minDate format'
    })
    .optional(),
  
  maxDate: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid maxDate format'
    })
    .optional(),
  
  userId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    .optional(),
  
  hasImage: z
    .string()
    .optional()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
});

/**
 * Autocomplete search schema
 */
export const autocompleteSchema = z.object({
  q: z
    .string()
    .min(2, 'Query must be at least 2 characters')
    .max(100, 'Query must not exceed 100 characters')
    .trim(),
  
  limit: z
    .string()
    .optional()
    .transform(val => Math.min(parseInt(val || '10'), 20))
    .refine(val => val > 0 && val <= 20, {
      message: 'Limit must be between 1 and 20'
    }),
});
