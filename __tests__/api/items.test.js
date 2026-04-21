/**
 * Items API Tests
 * Tests for item creation, retrieval, update, and deletion
 */

import { GET as getItemsHandler, POST as createItemHandler } from '@/app/api/items/route'
import { PUT as updateItemHandler, DELETE as deleteItemHandler } from '@/app/api/items/[id]/route'
import { connectDB } from '@/app/lib/mongodb'
import Item from '@/app/models/items'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// Mock dependencies
jest.mock('@/app/lib/mongodb')
jest.mock('@/app/models/items')
jest.mock('next/headers')

describe('Items API', () => {
  const mockToken = jwt.sign({ id: 'user123', role: 'user' }, process.env.JWT_SECRET)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/items', () => {
    it('should return paginated items', async () => {
      const mockItems = [
        {
          _id: 'item1',
          title: 'Lost Phone',
          description: 'iPhone 13 Pro',
          category: 'electronics',
          type: 'lost',
          location: 'Karachi',
          user: { name: 'User 1', email: 'user1@example.com' },
        },
        {
          _id: 'item2',
          title: 'Found Wallet',
          description: 'Black leather wallet',
          category: 'accessories',
          type: 'found',
          location: 'Lahore',
          user: { name: 'User 2', email: 'user2@example.com' },
        },
      ]

      Item.countDocuments.mockResolvedValue(25)
      Item.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockItems),
      })

      const request = new Request('http://localhost:3000/api/items?page=1&limit=20')

      const response = await getItemsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(2)
      expect(data.pagination.totalItems).toBe(25)
      expect(data.pagination.totalPages).toBe(2)
      expect(data.pagination.currentPage).toBe(1)
    })

    it('should filter items by type', async () => {
      Item.countDocuments.mockResolvedValue(10)
      Item.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      })

      const request = new Request('http://localhost:3000/api/items?type=lost')

      await getItemsHandler(request)

      expect(Item.find).toHaveBeenCalledWith({ type: 'lost' })
    })

    it('should filter items by category', async () => {
      Item.countDocuments.mockResolvedValue(5)
      Item.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      })

      const request = new Request('http://localhost:3000/api/items?category=electronics')

      await getItemsHandler(request)

      expect(Item.find).toHaveBeenCalledWith({ category: 'electronics' })
    })

    it('should reject invalid page number', async () => {
      const request = new Request('http://localhost:3000/api/items?page=0')

      const response = await getItemsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject limit exceeding maximum', async () => {
      const request = new Request('http://localhost:3000/api/items?limit=200')

      const response = await getItemsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/items', () => {
    it('should create item with valid data', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: mockToken }),
      }
      cookies.mockResolvedValue(mockCookies)

      const mockItem = {
        _id: 'item123',
        title: 'Lost Phone',
        description: 'iPhone 13 Pro Max, black color',
        category: 'electronics',
        type: 'lost',
        location: 'Karachi, Saddar',
        date: new Date('2024-01-15'),
        imageUrl: 'https://example.com/image.jpg',
        user: 'user123',
        populate: jest.fn().mockResolvedValue({
          _id: 'item123',
          title: 'Lost Phone',
          user: { name: 'Test User', email: 'test@example.com' },
        }),
      }

      Item.create.mockResolvedValue(mockItem)

      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Lost Phone',
          description: 'iPhone 13 Pro Max, black color',
          category: 'electronics',
          type: 'lost',
          location: 'Karachi, Saddar',
          date: '2024-01-15',
          imageUrl: 'https://example.com/image.jpg',
        }),
      })

      const response = await createItemHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe('Lost Phone')
    })

    it('should reject item creation without authentication', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue(undefined),
      }
      cookies.mockResolvedValue(mockCookies)

      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Lost Phone',
          description: 'iPhone 13 Pro',
          category: 'electronics',
          type: 'lost',
          location: 'Karachi',
          date: '2024-01-15',
        }),
      })

      const response = await createItemHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('should reject item with short title', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: mockToken }),
      }
      cookies.mockResolvedValue(mockCookies)

      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Ph',
          description: 'iPhone 13 Pro',
          category: 'electronics',
          type: 'lost',
          location: 'Karachi',
          date: '2024-01-15',
        }),
      })

      const response = await createItemHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject item with short description', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: mockToken }),
      }
      cookies.mockResolvedValue(mockCookies)

      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Lost Phone',
          description: 'Short',
          category: 'electronics',
          type: 'lost',
          location: 'Karachi',
          date: '2024-01-15',
        }),
      })

      const response = await createItemHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject item with invalid category', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: mockToken }),
      }
      cookies.mockResolvedValue(mockCookies)

      const request = new Request('http://localhost:3000/api/items', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Lost Phone',
          description: 'iPhone 13 Pro Max',
          category: 'invalid-category',
          type: 'lost',
          location: 'Karachi',
          date: '2024-01-15',
        }),
      })

      const response = await createItemHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('PUT /api/items/[id]', () => {
    it('should update item with valid data', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: mockToken }),
      }
      cookies.mockResolvedValue(mockCookies)

      const mockItem = {
        _id: 'item123',
        user: 'user123',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: 'item123',
          title: 'Updated Title',
        }),
      }

      Item.findById.mockResolvedValue(mockItem)

      const request = new Request('http://localhost:3000/api/items/item123', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Title',
          description: 'Updated description here',
        }),
      })

      const response = await updateItemHandler(request, { params: { id: 'item123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockItem.save).toHaveBeenCalled()
    })

    it('should reject update from non-owner', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: mockToken }),
      }
      cookies.mockResolvedValue(mockCookies)

      const mockItem = {
        _id: 'item123',
        user: 'different-user',
      }

      Item.findById.mockResolvedValue(mockItem)

      const request = new Request('http://localhost:3000/api/items/item123', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Title',
        }),
      })

      const response = await updateItemHandler(request, { params: { id: 'item123' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })
  })

  describe('DELETE /api/items/[id]', () => {
    it('should delete item by owner', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: mockToken }),
      }
      cookies.mockResolvedValue(mockCookies)

      const mockItem = {
        _id: 'item123',
        user: 'user123',
      }

      Item.findById.mockResolvedValue(mockItem)
      Item.findByIdAndDelete.mockResolvedValue(mockItem)

      const request = new Request('http://localhost:3000/api/items/item123', {
        method: 'DELETE',
      })

      const response = await deleteItemHandler(request, { params: { id: 'item123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Item.findByIdAndDelete).toHaveBeenCalledWith('item123')
    })

    it('should reject deletion by non-owner', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: mockToken }),
      }
      cookies.mockResolvedValue(mockCookies)

      const mockItem = {
        _id: 'item123',
        user: 'different-user',
      }

      Item.findById.mockResolvedValue(mockItem)

      const request = new Request('http://localhost:3000/api/items/item123', {
        method: 'DELETE',
      })

      const response = await deleteItemHandler(request, { params: { id: 'item123' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })
  })
})
