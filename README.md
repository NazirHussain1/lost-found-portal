# Lost & Found Portal

A modern, full-stack web application for managing lost and found items on campus. Built with Next.js, MongoDB, and Cloudinary for seamless item tracking and recovery.

## Features

### Authentication & Security
- **User Registration** - Secure signup with email verification
- **Login System** - JWT-based authentication with HTTP-only cookies
- **Password Recovery** - Forgot password with email reset link
- **Email Verification** - Automated verification emails with 1-hour expiry
- **Role-Based Access** - User and admin roles with protected routes

### Item Management
- **Report Lost Items** - Create detailed reports with images and descriptions
- **Report Found Items** - Post found items to help reunite with owners
- **Image Upload** - Cloudinary integration for optimized image storage
- **Search & Filter** - Advanced search with category and location filters
- **Item Matching** - Smart algorithm to match lost and found items

### User Experience
- **Responsive Design** - Mobile-first Bootstrap 5 UI
- **Real-time Notifications** - Toast notifications for user actions
- **Profile Management** - Update profile, avatar, and contact info
- **Activity Tracking** - View your reported items and activity history
- **Admin Dashboard** - Manage users and items (admin only)

## Tech Stack

- **Frontend:** Next.js 16 (Turbopack), React 19, Bootstrap 5
- **Backend:** Next.js API Routes (serverless)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with HTTP-only cookies
- **Email:** Nodemailer with Gmail SMTP (TLS 1.2)
- **Storage:** Cloudinary for image hosting
- **State Management:** Redux Toolkit
- **Validation:** Zod schemas
- **Rate Limiting:** Custom middleware for API protection

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account (for email service)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/NazirHussain1/lost-found-portal.git
cd lost-found-portal
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lost-and-found

# Authentication (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_random_32_character_secret_key_here

# Cloudinary (get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (use Gmail App Password: https://support.google.com/accounts/answer/185833)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

### Registration
1. User signs up with name, email, phone, and password
2. System sends verification email with 1-hour token
3. User clicks verification link
4. Account activated → redirect to login

### Login
1. User enters email and password
2. System validates credentials
3. JWT token stored in HTTP-only cookie
4. Redirect to home page

### Password Recovery
1. User clicks "Forgot Password" on login page
2. Enters email address
3. Receives reset link (1-hour expiry)
4. Sets new password
5. Redirect to login

## Deployment

### Recommended: Vercel (Free Tier)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy automatically

**Vercel Configuration:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Alternative: Railway

1. Push code to GitHub
2. Create new project on [Railway](https://railway.app)
3. Connect GitHub repository
4. Add environment variables
5. Deploy with automatic builds

### Alternative: Render

1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect repository
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variables
7. Deploy

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Generate secure JWT_SECRET (32+ characters)
- [ ] Configure Gmail App Password
- [ ] Set production `NEXT_PUBLIC_APP_URL`
- [ ] Enable Cloudinary auto-optimization
- [ ] Test email delivery
- [ ] Verify authentication flow
- [ ] Test password reset
- [ ] Check responsive design on mobile

## Environment Variables

### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `32+ random characters` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |
| `EMAIL_SERVICE` | Email service provider | `gmail` |
| `EMAIL_USER` | Email address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail App Password | `16-character password` |
| `NEXT_PUBLIC_APP_URL` | Production URL | `https://yourdomain.com` |

## Admin Access

To create an admin user, update the role in MongoDB:

```bash
# Connect to MongoDB
mongosh "your_mongodb_uri"

# Switch to database
use lost-and-found-portal

# Update user role to admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## API Routes

### Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/verify-email?token=xxx` - Verify email
- `POST /api/resend-verification` - Resend verification email
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token

### Items
- `GET /api/items` - Get all items (with filters)
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item by ID
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/search` - Search items
- `GET /api/items/:id/matches` - Get matching items

### User
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/activity` - Get user activity

### Admin
- `GET /api/admin` - Get all users (admin only)
- `PUT /api/admin/:id` - Update user (admin only)
- `DELETE /api/admin/:id` - Delete user (admin only)

## Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint
npm test         # Run Jest tests
```

## Project Structure

```
lost-and-found-portal/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities (email, db, validation)
│   ├── models/           # MongoDB models
│   ├── store/            # Redux store
│   └── styles/           # CSS files
├── public/               # Static assets
├── __tests__/            # Test files
└── middleware.js         # Auth middleware
```

## Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - HTTP-only cookies (XSS protection)
- **Rate Limiting** - API endpoint protection
- **Input Validation** - Zod schemas on all inputs
- **Email Verification** - Required for account activation
- **Token Expiry** - 1-hour expiry for reset/verification tokens
- **TLS Encryption** - Secure email transmission (TLS 1.2+)

## License

MIT

## Author

**Nazir Hussain**
- GitHub: [@NazirHussain1](https://github.com/NazirHussain1)
- Email: nazirkhawaja251@gmail.com

---

**Note:** This project uses Gmail SMTP for email delivery. For production, consider using dedicated email services like SendGrid, AWS SES, or Mailgun for better deliverability and higher sending limits.
