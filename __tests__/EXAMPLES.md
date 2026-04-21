# Test Examples & Patterns

## Quick Start

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## Example 1: Testing API Routes

### Basic GET Request Test

```javascript
import { GET as handler } from '@/app/api/items/route'
import Item from '@/app/models/items'

jest.mock('@/app/models/items')

describe('GET /api/items', () => {
  it('should return items list', async () => {
    // Mock database response
    Item.countDocuments.mockResolvedValue(10)
    Item.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([
        { _id: '1', title: 'Item 1' },
        { _id: '2', title: 'Item 2' },
      ]),
    })

    // Create request
    const request = new Request('http://localhost:3000/api/items?page=1')

    // Execute
    const response = await handler(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.items).toHaveLength(2)
  })
})
```

### POST Request with Authentication

```javascript
import { POST as handler } from '@/app/api/items/route'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

jest.mock('next/headers')

describe('POST /api/items', () => {
  it('should create item with auth', async () => {
    // Mock authentication
    const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET)
    const mockCookies = {
      get: jest.fn().mockReturnValue({ value: token }),
    }
    cookies.mockResolvedValue(mockCookies)

    // Create request
    const request = new Request('http://localhost:3000/api/items', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Lost Phone',
        description: 'iPhone 13 Pro Max',
        category: 'electronics',
        type: 'lost',
        location: 'Karachi',
        date: '2024-01-15',
      }),
    })

    // Execute
    const response = await handler(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
  })
})
```

## Example 2: Testing Validation Schemas

### Valid Data Test

```javascript
import { signupSchema } from '@/app/lib/validations/auth'

describe('signupSchema', () => {
  it('should accept valid data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '03001234567',
      password: 'Secure@123',
    }

    const result = signupSchema.safeParse(validData)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(validData)
  })
})
```

### Invalid Data Test

```javascript
describe('signupSchema', () => {
  it('should reject weak password', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '03001234567',
      password: 'weak',
    }

    const result = signupSchema.safeParse(invalidData)

    expect(result.success).toBe(false)
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues[0].path).toContain('password')
  })
})
```

## Example 3: Testing Authentication Flow

### Successful Login

```javascript
import { POST as loginHandler } from '@/app/api/login/route'
import User from '@/app/models/user'
import bcrypt from 'bcrypt'

jest.mock('@/app/models/user')

describe('Login Flow', () => {
  it('should login verified user', async () => {
    const hashedPassword = await bcrypt.hash('Test@1234', 10)
    
    User.findOne.mockResolvedValue({
      _id: 'user123',
      email: 'test@example.com',
      password: hashedPassword,
      isVerified: true,
      role: 'user',
    })

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
})
```

### Rejected Unverified User

```javascript
describe('Login Flow', () => {
  it('should reject unverified user', async () => {
    const hashedPassword = await bcrypt.hash('Test@1234', 10)
    
    User.findOne.mockResolvedValue({
      _id: 'user123',
      email: 'test@example.com',
      password: hashedPassword,
      isVerified: false, // Not verified
    })

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
    expect(data.errors[0].message).toContain('verify')
  })
})
```

## Example 4: Testing Error Handling

### Database Error

```javascript
describe('Error Handling', () => {
  it('should handle database errors', async () => {
    Item.find.mockRejectedValue(new Error('Database connection failed'))

    const request = new Request('http://localhost:3000/api/items')

    const response = await handler(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})
```

### Validation Error

```javascript
describe('Error Handling', () => {
  it('should return validation errors', async () => {
    const request = new Request('http://localhost:3000/api/items', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Ph', // Too short
        description: 'Short', // Too short
      }),
    })

    const response = await handler(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.errors).toBeDefined()
  })
})
```

## Example 5: Testing Pagination

```javascript
describe('Pagination', () => {
  it('should return correct pagination metadata', async () => {
    Item.countDocuments.mockResolvedValue(45)
    Item.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    })

    const request = new Request('http://localhost:3000/api/items?page=2&limit=20')

    const response = await handler(request)
    const data = await response.json()

    expect(data.pagination).toEqual({
      currentPage: 2,
      totalPages: 3,
      totalItems: 45,
      itemsPerPage: 20,
      hasNextPage: true,
      hasPrevPage: true,
      nextPage: 3,
      prevPage: 1,
    })
  })
})
```

## Common Patterns

### Setup and Teardown

```javascript
describe('Test Suite', () => {
  beforeEach(() => {
    // Runs before each test
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Runs after each test
    jest.restoreAllMocks()
  })

  beforeAll(() => {
    // Runs once before all tests
  })

  afterAll(() => {
    // Runs once after all tests
  })
})
```

### Mocking Modules

```javascript
// Mock entire module
jest.mock('@/app/lib/mongodb')

// Mock specific function
jest.mock('@/app/lib/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
}))

// Mock with implementation
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn().mockReturnValue({ value: 'token' }),
  })),
}))
```

### Async Testing

```javascript
// Using async/await
it('should handle async operation', async () => {
  const result = await asyncFunction()
  expect(result).toBe('success')
})

// Using promises
it('should handle promise', () => {
  return asyncFunction().then(result => {
    expect(result).toBe('success')
  })
})

// Using resolves/rejects
it('should resolve', async () => {
  await expect(asyncFunction()).resolves.toBe('success')
})

it('should reject', async () => {
  await expect(asyncFunction()).rejects.toThrow('Error')
})
```

## Tips & Best Practices

1. **Use descriptive test names**: "should create item with valid data" is better than "test 1"
2. **One assertion per test**: Focus each test on a single behavior
3. **Mock external dependencies**: Don't make real database or API calls
4. **Test edge cases**: Empty strings, null values, boundary conditions
5. **Keep tests independent**: Each test should work in isolation
6. **Use beforeEach**: Clear mocks and reset state between tests
7. **Test error paths**: Don't just test the happy path
8. **Use meaningful test data**: Use realistic values that make tests readable

## Running Specific Tests

```bash
# Run tests in a specific file
npm test auth.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should create"

# Run tests in a directory
npm test __tests__/api/

# Run only changed tests
npm test -- --onlyChanged

# Run with verbose output
npm test -- --verbose
```

## Debugging Tests

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run single test file
npm test -- --testPathPattern=auth.test.js

# Show console.log output
npm test -- --verbose

# Update snapshots
npm test -- --updateSnapshot
```
