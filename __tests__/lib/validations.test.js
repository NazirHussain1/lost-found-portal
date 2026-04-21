/**
 * Validation Tests
 * Tests for Zod validation schemas
 */

import { signupSchema, loginSchema } from '@/app/lib/validations/auth'
import { createItemSchema, updateItemSchema } from '@/app/lib/validations/items'
import { searchSchema } from '@/app/lib/validations/search'

describe('Validation Schemas', () => {
  describe('Auth Validations', () => {
    describe('signupSchema', () => {
      it('should validate correct signup data', () => {
        const validData = {
          name: 'Test User',
          email: 'test@example.com',
          phone: '03001234567',
          password: 'Test@1234',
        }

        const result = signupSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid email', () => {
        const invalidData = {
          name: 'Test User',
          email: 'invalid-email',
          phone: '03001234567',
          password: 'Test@1234',
        }

        const result = signupSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject weak password', () => {
        const invalidData = {
          name: 'Test User',
          email: 'test@example.com',
          phone: '03001234567',
          password: 'weak',
        }

        const result = signupSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject invalid Pakistani phone format', () => {
        const invalidData = {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          password: 'Test@1234',
        }

        const result = signupSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    describe('loginSchema', () => {
      it('should validate correct login data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Test@1234',
        }

        const result = loginSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject missing email', () => {
        const invalidData = {
          password: 'Test@1234',
        }

        const result = loginSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Item Validations', () => {
    describe('createItemSchema', () => {
      it('should validate correct item data', () => {
        const validData = {
          title: 'Lost Phone',
          description: 'iPhone 13 Pro Max, black color',
          category: 'electronics',
          type: 'lost',
          location: 'Karachi, Saddar',
          date: '2024-01-15',
        }

        const result = createItemSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject short title', () => {
        const invalidData = {
          title: 'Ph',
          description: 'iPhone 13 Pro',
          category: 'electronics',
          type: 'lost',
          location: 'Karachi',
          date: '2024-01-15',
        }

        const result = createItemSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject short description', () => {
        const invalidData = {
          title: 'Lost Phone',
          description: 'Short',
          category: 'electronics',
          type: 'lost',
          location: 'Karachi',
          date: '2024-01-15',
        }

        const result = createItemSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject invalid category', () => {
        const invalidData = {
          title: 'Lost Phone',
          description: 'iPhone 13 Pro Max',
          category: 'invalid-category',
          type: 'lost',
          location: 'Karachi',
          date: '2024-01-15',
        }

        const result = createItemSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject invalid type', () => {
        const invalidData = {
          title: 'Lost Phone',
          description: 'iPhone 13 Pro Max',
          category: 'electronics',
          type: 'invalid-type',
          location: 'Karachi',
          date: '2024-01-15',
        }

        const result = createItemSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    describe('updateItemSchema', () => {
      it('should validate partial update data', () => {
        const validData = {
          title: 'Updated Title',
        }

        const result = updateItemSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should allow empty update', () => {
        const validData = {}

        const result = updateItemSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Search Validations', () => {
    describe('searchSchema', () => {
      it('should validate search with query', () => {
        const validData = {
          q: 'phone',
          page: 1,
          limit: 20,
        }

        const result = searchSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should validate search with filters', () => {
        const validData = {
          q: 'wallet',
          category: 'accessories',
          type: 'found',
          page: 1,
          limit: 20,
        }

        const result = searchSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid page number', () => {
        const invalidData = {
          q: 'phone',
          page: 0,
        }

        const result = searchSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject limit exceeding maximum', () => {
        const invalidData = {
          q: 'phone',
          limit: 200,
        }

        const result = searchSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })
  })
})
