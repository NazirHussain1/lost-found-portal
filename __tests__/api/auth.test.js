/**
 * Authentication API Tests
 * Tests for signup, login, and email verification flows
 */

import { POST as signupHandler } from '@/app/api/signup/route'
import { POST as loginHandler } from '@/app/api/login/route'
import { GET as verifyEmailHandler } from '@/app/api/verify-email/route'
import { connectDB } from '@/app/lib/mongodb'
import User from '@/app/models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Mock dependencies
jest.mock('@/app/lib/mongodb')
jest.mock('@/app/models/user')
jest.mock('@/app/lib/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
}))

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/signup', () => {
    it('should create a new user with valid data', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '03001234567',
        isVerified: false,
      }

      User.findOne.mockResolvedValue(null)
      User.create.mockResolvedValue(mockUser)
      User.findByIdAndDelete.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '03001234567',
          password: 'Test@1234',
        }),
      })

      const response = await signupHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.email).toBe('test@example.com')
      expect(data.data.isVerified).toBe(false)
    })

    it('should reject signup with existing email', async () => {
      User.findOne.mockResolvedValue({ email: 'test@example.com' })

      const request = new Request('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '03001234567',
          password: 'Test@1234',
        }),
      })

      const response = await signupHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors[0].message).toContain('already exists')
    })

    it('should reject invalid email format', async () => {
      const request = new Request('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email',
          phone: '03001234567',
          password: 'Test@1234',
        }),
      })

      const response = await signupHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject weak password', async () => {
      const request = new Request('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '03001234567',
          password: 'weak',
        }),
      })

      const response = await signupHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject invalid Pakistani phone format', async () => {
      const request = new Request('http://localhost:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          password: 'Test@1234',
        }),
      })

      const response = await signupHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/login', () => {
    it('should login user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 10)
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
      }

      User.findOne.mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test@1234',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.email).toBe('test@example.com')
    })

    it('should reject login for unverified user', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 10)
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: hashedPassword,
        isVerified: false,
      }

      User.findOne.mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test@1234',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.errors[0].message).toContain('verify your email')
    })

    it('should reject login with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 10)
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: hashedPassword,
        isVerified: true,
      }

      User.findOne.mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('should reject login with non-existent email', async () => {
      User.findOne.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'Test@1234',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/verify-email', () => {
    it('should verify email with valid token', async () => {
      const token = jwt.sign(
        { email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isVerified: false,
        verificationToken: token,
        verificationTokenExpiry: new Date(Date.now() + 3600000),
        save: jest.fn().mockResolvedValue(true),
      }

      User.findOne.mockResolvedValue(mockUser)

      const request = new Request(
        `http://localhost:3000/api/verify-email?token=${token}`,
        { method: 'GET' }
      )

      const response = await verifyEmailHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockUser.save).toHaveBeenCalled()
    })

    it('should reject expired token', async () => {
      const token = jwt.sign(
        { email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      const mockUser = {
        email: 'test@example.com',
        isVerified: false,
        verificationToken: token,
        verificationTokenExpiry: new Date(Date.now() - 3600000), // Expired
      }

      User.findOne.mockResolvedValue(mockUser)

      const request = new Request(
        `http://localhost:3000/api/verify-email?token=${token}`,
        { method: 'GET' }
      )

      const response = await verifyEmailHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject invalid token', async () => {
      User.findOne.mockResolvedValue(null)

      const request = new Request(
        'http://localhost:3000/api/verify-email?token=invalid-token',
        { method: 'GET' }
      )

      const response = await verifyEmailHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})
