# Email Verification Implementation Guide

## Overview

Complete email verification system implemented using Nodemailer and JWT tokens. Users must verify their email before they can login to the platform.

## ✅ Implementation Status

**Status:** COMPLETE
**Dependencies:** nodemailer (installed)
**Security:** JWT tokens with 1-hour expiration
**Production Ready:** Yes (requires email configuration)

## 📁 Files Created/Modified

### New Files

1. **`app/lib/email.js`** - Email utility functions
   - `sendVerificationEmail()` - Send verification email
   - `sendWelcomeEmail()` - Send welcome email after verification
   - `sendPasswordResetEmail()` - Send password reset email
   - `testEmailConfig()` - Test email configuration

2. **`app/api/verify-email/route.js`** - Email verification endpoint
   - Verifies JWT token
   - Updates user verification status
   - Sends welcome email

3. **`app/api/resend-verification/route.js`** - Resend verification email
   - Generates new token
   - Sends new verification email
   - Rate limited (3 requests/hour)

4. **`app/verify-email/page.js`** - Verification page UI
   - Shows verification status
   - Handles token verification
   - Allows resending verification email

### Modified Files

1. **`app/models/user.js`** - Added verification fields
   - `isVerified` (Boolean, default: false)
   - `verificationToken` (String)
   - `verificationTokenExpiry` (Date)

2. **`app/api/signup/route.js`** - Updated signup flow
   - Generates verification token
   - Sends verification email
   - Sets isVerified to false

3. **`app/api/login/route.js`** - Added verification check
   - Blocks unverified users from logging in
   - Returns appropriate error message

4. **`.env.local`** - Added email configuration
5. **`.env.example`** - Added email configuration template

## 🔄 Verification Flow

### 1. User Signup

```
User submits signup form
    ↓
Validate input data
    ↓
Check if email/phone exists
    ↓
Hash password
    ↓
Generate JWT verification token (expires in 1 hour)
    ↓
Create user with isVerified = false
    ↓
Send verification email
    ↓
Return success message
```

### 2. Email Verification

```
User clicks verification link in email
    ↓
Redirect to /verify-email?token=...
    ↓
Verify JWT token
    ↓
Check token expiry
    ↓
Update user: isVerified = true
    ↓
Clear verification token
    ↓
Send welcome email
    ↓
Redirect to login page
```

### 3. Login Attempt

```
User submits login credentials
    ↓
Validate email and password
    ↓
Check if isVerified = true
    ↓
If not verified: Return error
    ↓
If verified: Generate session token and login
```

## 🔐 Security Features

### Token Security
- **JWT Tokens:** Cryptographically signed
- **Expiration:** 1 hour from generation
- **One-time Use:** Token cleared after verification
- **Validation:** Checks signature, expiry, and user match

### Rate Limiting
- **Signup:** 5 requests / 15 minutes
- **Verification:** 5 requests / 15 minutes
- **Resend:** 3 requests / 1 hour (strict)

### Email Security
- **No User Enumeration:** Generic messages for resend
- **Token in URL:** Secure, one-time use
- **HTTPS Required:** In production

## 📧 Email Configuration

### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification

2. **Generate App Password**
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Update .env.local**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Other SMTP Services

#### SendGrid
```env
EMAIL_SERVICE=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```env
EMAIL_SERVICE=mailgun
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
```

#### AWS SES
```env
EMAIL_SERVICE=ses
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
```

## 💻 API Endpoints

### 1. Signup (POST /api/signup)

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "03001234567"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email to login.",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "isVerified": false,
    "message": "Please check your email to verify your account"
  }
}
```

### 2. Verify Email (GET /api/verify-email?token=...)

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login.",
  "data": {
    "email": "john@example.com",
    "name": "John Doe",
    "verified": true
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "errors": [
    {
      "field": "token",
      "message": "Verification link has expired. Please request a new one."
    }
  ]
}
```

### 3. Resend Verification (POST /api/resend-verification)

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent successfully. Please check your inbox.",
  "data": {
    "email": "john@example.com"
  }
}
```

### 4. Login (POST /api/login)

**Unverified User Response (403):**
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Please verify your email before logging in. Check your inbox for the verification link."
    }
  ]
}
```

## 🎨 Email Templates

### Verification Email

- **Subject:** 🔐 Verify Your Email - GAMICA Lost & Found Portal
- **Content:**
  - Welcome message
  - Verification button
  - Expiry warning (1 hour)
  - Plain text link fallback
  - Security notice

### Welcome Email

- **Subject:** ✅ Welcome to GAMICA Lost & Found Portal!
- **Content:**
  - Congratulations message
  - Platform features overview
  - Call-to-action button
  - Support information

## 🧪 Testing

### Test Email Configuration

```javascript
import { testEmailConfig } from '@/app/lib/email';

// Test if email is configured correctly
const isValid = await testEmailConfig();
console.log('Email config valid:', isValid);
```

### Test Signup Flow

```bash
# 1. Signup
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "phone": "03001234567"
  }'

# 2. Check email for verification link

# 3. Click link or visit:
# http://localhost:3000/verify-email?token=YOUR_TOKEN

# 4. Try to login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Test Resend Verification

```bash
curl -X POST http://localhost:3000/api/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## 🚀 Production Deployment

### 1. Environment Variables

Update production environment with:
```env
EMAIL_SERVICE=gmail  # or your service
EMAIL_USER=your-production-email@domain.com
EMAIL_PASSWORD=your-secure-password
NEXT_PUBLIC_APP_URL=https://yourdomain.com
JWT_SECRET=your-production-jwt-secret
```

### 2. Email Service Recommendations

**For Production:**
- **SendGrid** - 100 emails/day free
- **Mailgun** - 5,000 emails/month free
- **AWS SES** - 62,000 emails/month free (with EC2)
- **Postmark** - Reliable, transactional focus

**Avoid Gmail for Production:**
- Daily sending limits (500 emails/day)
- Risk of account suspension
- Not designed for bulk sending

### 3. Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT_SECRET
- [ ] Use environment-specific email credentials
- [ ] Enable email logging/monitoring
- [ ] Set up SPF, DKIM, DMARC records
- [ ] Monitor bounce rates
- [ ] Implement email queue for reliability

### 4. Monitoring

```javascript
// Add to email.js
import * as Sentry from '@sentry/nextjs';

try {
  await transporter.sendMail(mailOptions);
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

## 🔧 Troubleshooting

### Email Not Sending

1. **Check Configuration**
   ```javascript
   import { testEmailConfig } from '@/app/lib/email';
   await testEmailConfig();
   ```

2. **Check Gmail App Password**
   - Must be 16 characters
   - No spaces
   - 2FA must be enabled

3. **Check Firewall/Port**
   - Port 587 must be open
   - Try port 465 with secure: true

4. **Check Logs**
   ```bash
   # Check server logs for errors
   npm run dev
   ```

### Token Expired

- Tokens expire after 1 hour
- User can request new verification email
- Use `/api/resend-verification` endpoint

### User Already Verified

- System prevents duplicate verification
- Returns success message
- No error thrown

## 📊 Database Schema

```javascript
{
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  isVerified: Boolean (default: false),
  verificationToken: String (nullable),
  verificationTokenExpiry: Date (nullable),
  avatar: String,
  bio: String,
  location: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Future Enhancements

1. **Email Queue**
   - Use Bull or BullMQ
   - Retry failed emails
   - Better reliability

2. **Email Templates**
   - Use template engine (Handlebars, EJS)
   - Centralized template management
   - Multi-language support

3. **Email Analytics**
   - Track open rates
   - Track click rates
   - Monitor bounces

4. **SMS Verification**
   - Alternative to email
   - Use Twilio or similar
   - Faster verification

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Setup](https://sendgrid.com/docs/)
- [JWT Best Practices](https://jwt.io/introduction)

## ✅ Verification Checklist

- [x] Nodemailer installed
- [x] Email utility created
- [x] User model updated
- [x] Verification API route created
- [x] Resend verification route created
- [x] Signup flow updated
- [x] Login check added
- [x] Verification page created
- [x] Email templates designed
- [x] Environment variables configured
- [x] Rate limiting applied
- [x] Documentation created
- [x] Security implemented
- [x] Error handling added

## 🎉 Summary

Email verification system is fully implemented and ready for use. Users must verify their email before logging in. The system includes:

- Beautiful HTML email templates
- Secure JWT tokens (1-hour expiry)
- Rate limiting protection
- Resend verification capability
- User-friendly verification page
- Comprehensive error handling
- Production-ready configuration

**Next Steps:**
1. Configure email credentials in `.env.local`
2. Test signup and verification flow
3. Deploy to production with proper email service
