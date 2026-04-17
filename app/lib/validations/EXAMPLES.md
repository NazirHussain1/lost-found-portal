# Zod Validation - Usage Examples

## Example API Request/Response Scenarios

### 1. Signup - Valid Request

**Request:**
```bash
POST /api/signup
Content-Type: application/json

{
  "name": "Nazir Hussain",
  "email": "nazir@example.com",
  "password": "SecurePass123!",
  "phone": "03321716508"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "nazir@example.com"
  }
}
```

### 2. Signup - Invalid Request (Multiple Errors)

**Request:**
```bash
POST /api/signup

{
  "name": "N",
  "email": "invalid-email",
  "password": "weak",
  "phone": "123"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 2 characters"
    },
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    },
    {
      "field": "phone",
      "message": "Phone must be in Pakistani format (03XXXXXXXXX)"
    }
  ]
}
```

### 3. Create Item - Valid Request

**Request:**
```bash
POST /api/items

{
  "title": "Lost iPhone 14 Pro",
  "description": "Black iPhone 14 Pro with a blue case. Lost near the library.",
  "category": "electronics",
  "type": "lost",
  "location": "Main Library, 2nd Floor",
  "date": "2026-04-17T10:30:00Z",
  "imageUrl": "https://cloudinary.com/image.jpg"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Lost iPhone 14 Pro",
    "description": "Black iPhone 14 Pro with a blue case. Lost near the library.",
    "category": "electronics",
    "type": "lost",
    "location": "Main Library, 2nd Floor",
    "date": "2026-04-17T10:30:00.000Z"
  }
}
```

### 4. Create Item - Invalid Request

**Request:**
```bash
POST /api/items

{
  "title": "Lo",
  "description": "Short",
  "category": "invalid",
  "type": "lost",
  "location": "AB",
  "date": "invalid-date"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "errors": [
    {
      "field": "title",
      "message": "Title must be at least 3 characters"
    },
    {
      "field": "description",
      "message": "Description must be at least 10 characters"
    },
    {
      "field": "category",
      "message": "Invalid category selected"
    },
    {
      "field": "location",
      "message": "Location must be at least 3 characters"
    },
    {
      "field": "date",
      "message": "Invalid date format"
    }
  ]
}
```

### 5. Update Item - Valid Request

**Request:**
```bash
PUT /api/items/507f1f77bcf86cd799439011

{
  "title": "Found iPhone 14 Pro",
  "type": "found"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Found iPhone 14 Pro",
    "type": "found"
  }
}
```

## Client-Side Integration Examples

### React/Next.js Form Validation

```javascript
'use client';

import { useState } from 'react';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!data.success) {
        // Display validation errors
        setErrors(data.errors);
      } else {
        // Success - redirect or show success message
        alert(data.message);
      }
    } catch (error) {
      setErrors([{ field: 'general', message: 'Network error' }]);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    const error = errors.find(err => err.field === fieldName);
    return error?.message;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Name"
        />
        {getFieldError('name') && (
          <span className="error">{getFieldError('name')}</span>
        )}
      </div>

      <div>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="Email"
        />
        {getFieldError('email') && (
          <span className="error">{getFieldError('email')}</span>
        )}
      </div>

      <div>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder="Password"
        />
        {getFieldError('password') && (
          <span className="error">{getFieldError('password')}</span>
        )}
      </div>

      <div>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="Phone (03XXXXXXXXX)"
        />
        {getFieldError('phone') && (
          <span className="error">{getFieldError('phone')}</span>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

## Testing with cURL

### Test Signup
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "phone": "03001234567"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Test Create Item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "title": "Lost Wallet",
    "description": "Brown leather wallet with ID cards inside",
    "category": "bags",
    "type": "lost",
    "location": "Cafeteria",
    "date": "2026-04-17T10:00:00Z"
  }'
```
