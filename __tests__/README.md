# Testing Documentation

## Overview
This project uses **Jest** and **React Testing Library** for comprehensive testing of API routes, authentication flows, and item management features.

## Test Structure

```
__tests__/
├── api/
│   ├── auth.test.js       # Authentication tests (signup, login, verification)
│   ├── items.test.js      # Item CRUD operations tests
├── lib/
│   └── validations.test.js # Zod schema validation tests
└── README.md              # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run specific test file
```bash
npm test auth.test.js
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should create"
```

## Test Coverage

### Authentication Tests (`auth.test.js`)
- ✅ User signup with valid data
- ✅ Email verification flow
- ✅ Login with verified account
- ✅ Reject unverified user login
- ✅ Password validation (min 8 chars, uppercase, number, special char)
- ✅ Email format validation
- ✅ Pakistani phone format validation (03XXXXXXXXX)
- ✅ Duplicate email/phone rejection
- ✅ Token expiration handling

### Item Management Tests (`items.test.js`)
- ✅ Create item with authentication
- ✅ Get paginated items
- ✅ Filter by type (lost/found)
- ✅ Filter by category
- ✅ Update item by owner
- ✅ Delete item by owner
- ✅ Reject unauthorized operations
- ✅ Validate title (min 3 chars)
- ✅ Validate description (min 10 chars)
- ✅ Pagination limits (1-100 items per page)

### Validation Tests (`validations.test.js`)
- ✅ Signup schema validation
- ✅ Login schema validation
- ✅ Create item schema validation
- ✅ Update item schema validation
- ✅ Search schema validation
- ✅ Field-level error messages

## Test Configuration

### jest.config.js
- Uses Next.js Jest configuration
- JSdom test environment for React components
- Module path mapping (@/ alias)
- Coverage thresholds: 50% for all metrics
- Ignores .next/ and node_modules/

### jest.setup.js
- Imports @testing-library/jest-dom matchers
- Mocks Next.js router and navigation
- Mocks Next.js headers and cookies
- Sets test environment variables
- Suppresses console errors in tests

## Writing New Tests

### Example: Testing an API Route

```javascript
import { POST as handler } from '@/app/api/your-route/route'
import { connectDB } from '@/app/lib/mongodb'
import YourModel from '@/app/models/yourModel'

jest.mock('@/app/lib/mongodb')
jest.mock('@/app/models/yourModel')

describe('Your API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle request correctly', async () => {
    // Mock database response
    YourModel.find.mockResolvedValue([{ id: 1, name: 'Test' }])

    // Create request
    const request = new Request('http://localhost:3000/api/your-route', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    })

    // Call handler
    const response = await handler(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

### Example: Testing Validation Schema

```javascript
import { yourSchema } from '@/app/lib/validations/yourValidation'

describe('Your Validation Schema', () => {
  it('should validate correct data', () => {
    const validData = { field: 'value' }
    const result = yourSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid data', () => {
    const invalidData = { field: '' }
    const result = yourSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
```

## Best Practices

1. **Mock External Dependencies**: Always mock database connections, external APIs, and file system operations
2. **Clear Mocks**: Use `jest.clearAllMocks()` in `beforeEach` to ensure test isolation
3. **Test Edge Cases**: Include tests for error conditions, validation failures, and boundary values
4. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
5. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
6. **Avoid Test Interdependence**: Each test should be independent and not rely on other tests

## Continuous Integration

Tests should be run automatically in CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test -- --ci --coverage --maxWorkers=2
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
**Solution**: Check module path aliases in jest.config.js

**Issue**: Async tests timeout
**Solution**: Increase timeout with `jest.setTimeout(10000)` or use `--testTimeout` flag

**Issue**: Mocks not working
**Solution**: Ensure mocks are defined before imports and cleared between tests

**Issue**: Coverage not generated
**Solution**: Run with `--coverage` flag and check `collectCoverageFrom` patterns

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Zod Documentation](https://zod.dev/)
