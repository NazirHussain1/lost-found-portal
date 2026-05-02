# Email Setup Guide for GAMICA Lost & Found Portal

## Problem Fixed ✅

The 500 error on signup was caused by invalid email credentials in `.env.local`. The application has been updated to handle this gracefully.

## Current Status

The signup will now work **without email verification** if credentials are not configured. Users can still sign up, but won't receive verification emails.

## To Enable Email Functionality

### Option 1: Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update `.env.local`**:
   ```env
   EMAIL_USER=your-actual-gmail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### Option 2: Other SMTP Service

Update these variables in `.env.local`:
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

## Testing Email Configuration

After updating credentials, restart your dev server:
```bash
npm run dev
```

Then try signing up with a test account. Check the console for:
- ✅ Success: Email sent successfully
- ⚠️ Warning: Email credentials not configured (signup still works)
- ❌ Error: Specific error message for debugging

## Development Mode

For development without email:
- Signup works normally
- Users are created in the database
- Verification emails are skipped
- Check console logs for any warnings

## Important Notes

- Never commit real credentials to git
- Use environment variables for sensitive data
- The `.env.local` file is already in `.gitignore`
- Email sending failures won't block user signup
