# 🚀 Complete Setup Guide - Lost & Found Portal

## 📊 Project Overview

**Type**: Full-Stack Web Application  
**Framework**: Next.js 16 (App Router)  
**Frontend**: React 19, Redux Toolkit, Bootstrap 5, Tailwind CSS  
**Backend**: Next.js API Routes (Serverless)  
**Database**: MongoDB with Mongoose  
**Authentication**: JWT with HTTP-only cookies  
**File Storage**: Cloudinary  

---

## 🛠️ Prerequisites

Before starting, ensure you have:

1. **Node.js** v18.17 or higher (You have v22.20.0 ✅)
2. **npm** or **yarn** package manager
3. **MongoDB** (Local or Cloud - MongoDB Atlas)
4. **Git** for version control
5. **Cloudinary Account** (Free tier available)

---

## 📥 Step 1: Install Dependencies

### If npm install failed, try these solutions:

**Solution 1: Clean install**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --fetch-timeout=60000 --fetch-retries=5
```

**Solution 2: Use Yarn (Recommended if npm fails)**
```bash
npm install -g yarn
yarn install
```

**Solution 3: Legacy peer deps**
```bash
npm install --legacy-peer-deps
```

---

## ⚙️ Step 2: Environment Configuration

### Create `.env.local` file in root directory:

```env
# MongoDB Connection
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/lost-and-found-portal

# Option 2: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lost-and-found-portal

# JWT Secret - CHANGE THIS!
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Environment
NODE_ENV=development
```

### 🔐 How to get these values:

#### MongoDB URI:
**Option A: Local MongoDB**
1. Install MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use: `mongodb://localhost:27017/lost-and-found-portal`

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (Free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `lost-and-found-portal`

#### JWT Secret:
Generate a secure random string:
```bash
# On Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use any random 32+ character string
```

#### Cloudinary Credentials:
1. Sign up at https://cloudinary.com (Free tier: 25GB storage)
2. Go to Dashboard
3. Copy:
   - Cloud Name
   - API Key
   - API Secret

---

## 🚀 Step 3: Run the Project

### Start Development Server:

```bash
npm run dev
```

The application will start on: **http://localhost:3000**

### Available Scripts:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server (after build)
- `npm run lint` - Run ESLint

---

## 🗄️ Step 4: Database Setup

### If using Local MongoDB:

1. **Install MongoDB**:
   - Download: https://www.mongodb.com/try/download/community
   - Install and start the service

2. **Verify MongoDB is running**:
   ```bash
   # Check if MongoDB is running
   mongosh
   ```

3. **The database and collections will be created automatically** when you:
   - Register your first user
   - Create your first item

### If using MongoDB Atlas:

1. **Whitelist your IP**:
   - Go to Network Access
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (for development)

2. **Create Database User**:
   - Go to Database Access
   - Add New Database User
   - Set username and password
   - Grant "Read and write to any database" permission

---

## 👤 Step 5: Create Admin User

The first user you create will be a regular user. To create an admin:

### Option 1: Manually in MongoDB

```javascript
// Connect to MongoDB
use lost-and-found-portal

// Update a user to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Option 2: Using MongoDB Compass (GUI)
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect using your MONGODB_URI
3. Navigate to `lost-and-found-portal` → `users` collection
4. Find your user and change `role` from "user" to "admin"

---

## 🧪 Step 6: Test the Application

### Test these features:

1. **Homepage**: http://localhost:3000
2. **Sign Up**: Create a new account
3. **Login**: Login with your credentials
4. **Browse Items**: View lost/found items
5. **Post Item**: Create a lost or found item
6. **Profile**: View and edit your profile
7. **Admin Panel**: http://localhost:3000/admin (if you're admin)

---

## ⚠️ Common Issues & Fixes

### Issue 1: "Cannot connect to MongoDB"
```
Error: Please define the MONGODB_URI environment variable
```
**Fix**: 
- Ensure `.env.local` exists in root directory
- Check MONGODB_URI is correct
- Restart the dev server after creating .env.local

### Issue 2: "JWT_SECRET is not defined"
**Fix**: 
- Add JWT_SECRET to `.env.local`
- Must be at least 32 characters long
- Restart dev server

### Issue 3: Image upload fails
```
Error: Cloudinary credentials not found
```
**Fix**: 
- Add Cloudinary credentials to `.env.local`
- Verify credentials are correct on Cloudinary dashboard

### Issue 4: Port 3000 already in use
```
Error: Port 3000 is already in use
```
**Fix**: 
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Issue 5: Module not found errors
**Fix**: 
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

---

## 🔒 Step 7: Security Checklist

### Before Deployment:

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Enable MongoDB IP whitelist
- [ ] Set NODE_ENV=production
- [ ] Never commit .env.local to Git
- [ ] Review .gitignore includes .env*
- [ ] Use HTTPS in production
- [ ] Set secure cookie flags in production

---

## 📤 Step 8: Push to Your GitHub

### Initialize Git (if not already):

```bash
# Check if git is initialized
git status

# If not initialized:
git init
```

### Create .gitignore (already exists, but verify):

Ensure these are in `.gitignore`:
```
node_modules/
.next/
.env*
.DS_Store
*.log
```

### Push to GitHub:

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Lost and Found Portal"

# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 Step 9: Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Import your repository
4. Add environment variables:
   - MONGODB_URI
   - JWT_SECRET
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - NODE_ENV=production
5. Deploy!

### Option 2: Netlify

1. Go to https://netlify.com
2. Connect GitHub repository
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables
6. Deploy

### Option 3: Railway / Render

Similar process - connect repo, add env vars, deploy.

---

## 📝 Step 10: Post-Deployment Checklist

- [ ] Test all features on production URL
- [ ] Verify MongoDB connection works
- [ ] Test image uploads to Cloudinary
- [ ] Test user registration and login
- [ ] Test admin panel access
- [ ] Check mobile responsiveness
- [ ] Test all API endpoints
- [ ] Monitor error logs

---

## 🐛 Debugging Tips

### View Logs:
```bash
# Development
npm run dev

# Production (after build)
npm run build
npm start
```

### Check MongoDB Connection:
```bash
# Using mongosh
mongosh "your-mongodb-uri"

# List databases
show dbs

# Use your database
use lost-and-found-portal

# List collections
show collections

# View users
db.users.find()
```

### Clear Next.js Cache:
```bash
rm -rf .next
npm run dev
```

---

## 📚 Project Structure

```
lost-and-found-portal/
├── app/
│   ├── api/                 # Backend API routes
│   │   ├── login/          # Authentication
│   │   ├── signup/         # User registration
│   │   ├── items/          # CRUD for items
│   │   ├── admin/          # Admin operations
│   │   ├── profile/        # User profile
│   │   └── upload/         # Image upload
│   ├── components/         # React components
│   ├── models/             # MongoDB schemas
│   ├── lib/                # Database connection
│   ├── store/              # Redux store
│   └── [pages]/            # Next.js pages
├── public/                 # Static assets
├── .env.local             # Environment variables (DO NOT COMMIT)
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
└── next.config.mjs        # Next.js configuration
```

---

## 🎯 Features

- ✅ User Authentication (JWT)
- ✅ Role-based Access Control (User/Admin)
- ✅ Post Lost Items
- ✅ Post Found Items
- ✅ Browse All Items
- ✅ Image Upload (Cloudinary)
- ✅ User Profiles
- ✅ Admin Dashboard
- ✅ Activity Tracking
- ✅ Responsive Design

---

## 🆘 Need Help?

If you encounter issues:

1. Check this guide first
2. Review error messages carefully
3. Check browser console (F12)
4. Check terminal logs
5. Verify all environment variables are set
6. Try clearing cache and reinstalling

---

## 📞 Support Resources

- Next.js Docs: https://nextjs.org/docs
- MongoDB Docs: https://docs.mongodb.com
- Cloudinary Docs: https://cloudinary.com/documentation
- React Docs: https://react.dev

---

**Good luck with your project! 🚀**
