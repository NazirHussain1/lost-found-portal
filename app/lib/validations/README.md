# Zod Validation Implementation

This directory contains Zod validation schemas for all API routes in the Lost & Found Portal.

## Installation

```bash
npm install zod
```

## Structure

```
/lib/validations/
├── auth.js          # Authentication schemas (signup, login, profile)
├── items.js         # Item schemas (create, update)
├── helper.js        # Validation helper functions
└── README.md        # This file
```

## Validation Schemas

### 1. Authentication Schemas (`auth.js`)

#### Signup Schema
```javascript
import { signupSchema } from '@/app/lib/validations/auth';

// Validates:
// - name: min 2 chars, max 50 chars
// - email: valid email format
// - password: min 8 chars, 1 uppercase, 1 number, 1 special char
// - phone: Pakistani format (03XXXXXXXXX)
```

#### Login Schema
```javascript
import { loginSchema } from '@/app/lib/validations/auth';

// Validates:
// - email: valid email format
// - password: required
```

#### Update Profile Schema
```javascript
import { updateProfileSchema } from '@/app/lib/validations/auth';

// Validates (all optional):
// - name: min 2 chars, max 50 chars
// - email: valid email format
// - phone: Pakistani format (03XXXXXXXXX)
```

### 2. Item Schemas (`items.js`)

#### Create Item Schema
```javascript
import { createItemSchema } from '@/app/lib/validations/items';

// Validates:
// - title: min 3 chars, max 100 chars
// - description: min 10 chars, max 1000 chars
// - category: enum (electronics, stationary, documents, jewelry, clothing, keys, bags, other)
// - type: enum (lost, found, resolved)
// - location: min 3 chars, max 200 chars
// - date: valid date format
// - imageUrl: valid URL (optional)
```

#### Update Item Schema
```javascript
import { updateItemSchema } from '@/app/lib/validations/items';

// All fields optional, same validation rules as create
```

#### Item ID Schema
```javascript
import { itemIdSchema } from '@/app/lib/validations/items';

// Validates MongoDB ObjectId format (24 hex characters)
```

## Helper Functions (`helper.js`)

### validateData()
Validates data against a Zod schema and returns structured result.

```javascript
import { validateData } from '@/app/lib/validations/helper';
import { signupSchema } from '@/app/lib/validations/auth';

const result = validateData(signupSchema, requestBody);

if (!result.success) {
  // result.errors = [{ field: 'email', message: 'Invalid email format' }]
  return createErrorResponse(result.errors);
}

// result.data contains validated and transformed data
const { name, email, password, phone } = result.data;
```

### createErrorResponse()
Creates standardized error response.

```javascript
import { createErrorResponse } from '@/app/lib/validations/helper';

return createErrorResponse([
  { field: 'email', message: 'Email already exists' }
], 400);

// Response:
// {
//   success: false,
//   errors: [
//     { field: 'email', message: 'Email already exists' }
//   ]
// }
```

### createSuccessResponse()
Creates standardized success response.

```javascript
import { createSuccessResponse } from '@/app/lib/validations/helper';

return createSuccessResponse(
  { userId: user._id, email: user.email },
  'User created successfully',
  201
);

// Response:
// {
//   success: true,
//   message: 'User created successfully',
//   data: { userId: '...', email: '...' }
// }
```

## Usage Examples

### Example 1: Signup API Route

```javascript
import { signupSchema } from '@/app/lib/validations/auth';
import { validateData, createErrorResponse, createSuccessResponse } from '@/app/lib/validations/helper';

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate input
    const validation = validateData(signupSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.errors);
    }

    const { name, email, phone, password } = validation.data;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return createErrorResponse([
        { field: 'email', message: 'User with this email already exists' }
      ]);
    }

    // Create user
    const user = await User.create({ name, email, phone, password: hashedPassword });

    return createSuccessResponse(
      { userId: user._id },
      'User registered successfully',
      201
    );
  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}
```

### Example 2: Create Item API Route

```javascript
import { createItemSchema } from '@/app/lib/validations/items';
import { validateData, createErrorResponse, createSuccessResponse } from '@/app/lib/validations/helper';

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate input
    const validation = validateData(createItemSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.errors);
    }

    const { title, description, category, type, location, date, imageUrl } = validation.data;

    // Create item
    const item = await Item.create({
      title,
      description,
      category: category.toLowerCase(),
      type: type.toLowerCase(),
      location,
      date,
      imageUrl,
      user: userId
    });

    return createSuccessResponse(item, 'Item created successfully', 201);
  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}
```

### Example 3: Update Item API Route

```javascript
import { updateItemSchema, itemIdSchema } from '@/app/lib/validations/items';
import { validateData, createErrorResponse, createSuccessResponse } from '@/app/lib/validations/helper';

export async function PUT(req, context) {
  try {
    const { id } = await context.params;

    // Validate item ID
    const idValidation = validateData(itemIdSchema, id);
    if (!idValidation.success) {
      return createErrorResponse([
        { field: 'id', message: 'Invalid item ID format' }
      ]);
    }

    const body = await req.json();

    // Validate update data
    const validation = validateData(updateItemSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.errors);
    }

    // Update item
    const updated = await Item.findByIdAndUpdate(id, validation.data, { new: true });

    return createSuccessResponse(updated, 'Item updated successfully');
  } catch (error) {
    return createErrorResponse([
      { field: 'server', message: 'Internal server error' }
    ], 500);
  }
}
```

## Error Response Format

All validation errors follow this structure:

```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

## Success Response Format

All success responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

## Validation Rules Summary

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*(),.?":{}|<>)

### Phone Requirements
- Pakistani format: 03XXXXXXXXX
- Exactly 11 digits
- Must start with "03"

### Email Requirements
- Valid email format (RFC 5322)
- Automatically converted to lowercase

### Title Requirements
- Minimum 3 characters
- Maximum 100 characters

### Description Requirements
- Minimum 10 characters
- Maximum 1000 characters

### Location Requirements
- Minimum 3 characters
- Maximum 200 characters

### Category Options
- electronics
- stationary
- documents
- jewelry
- clothing
- keys
- bags
- other

### Type Options
- lost
- found
- resolved

## Testing Validation

You can test validation schemas directly:

```javascript
import { signupSchema } from '@/app/lib/validations/auth';

// Valid data
const validData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  phone: '03001234567'
};

try {
  const result = signupSchema.parse(validData);
  console.log('Valid:', result);
} catch (error) {
  console.log('Errors:', error.errors);
}

// Invalid data
const invalidData = {
  name: 'J',
  email: 'invalid-email',
  password: 'weak',
  phone: '123'
};

try {
  signupSchema.parse(invalidData);
} catch (error) {
  console.log('Validation errors:', error.errors);
  // Will show all validation errors
}
```

## Benefits

1. **Type Safety**: Zod provides runtime type checking
2. **Consistent Validation**: Same rules across all API routes
3. **Better Error Messages**: Clear, user-friendly error messages
4. **Data Transformation**: Automatic trimming, lowercase conversion, etc.
5. **Security**: Prevents invalid data from reaching the database
6. **Maintainability**: Centralized validation logic

## Notes

- All validation happens before database operations
- Validation errors return HTTP 400 (Bad Request)
- Authentication errors return HTTP 401 (Unauthorized)
- Authorization errors return HTTP 403 (Forbidden)
- Server errors return HTTP 500 (Internal Server Error)
- All string fields are automatically trimmed
- Email addresses are automatically converted to lowercase
- Categories and types are automatically converted to lowercase
