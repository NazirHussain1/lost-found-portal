# 🚀 Lost & Found Portal - Setup Instructions

## ✅ FIXES APPLIED

The following critical issues have been fixed:

1. **Toast Import Errors** - Fixed incorrect imports in:
   - `app/components/adminPage/admin.js`
   - `app/components/ProfilePage/profilePage.js`
   - `app/components/My Items/myItems.js`

2. **Middleware Location** - Moved `middleware.js` from `app/` to root directory (Next.js requirement)

3. **Tailwind CSS Configuration** - Created missing `tailwind.config.js`

4. **Environment Variables** - Created `.env.local` with all required variables

---

## 📋 PREREQUISITES

Before running the project, ensure you have:

1. **Node.js** - Version 18.17 or higher (You have v22.20.0 ✅)
2. **MongoDB** - Running locally or MongoDB Atlas account
3. **Cloudinary Account** - For image uploads (free tier available)

---

## 🔧 STEP 1: Install Dependencies

If you haven't already, install the project dependencies:

```bash
npm install
```

If you encounter network errors, try:

```bash
# Clear cache and retry
npm cache clean --force
npm install --fetch-timeout=60000 --fetch-retries=5

# OR use Yarn
npm install -g yarn
yarn install
```

---

## 🗄️ STEP 2: Setup MongoDB

### Option A: Local MongoDB

1. Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Or run manually
   mongod --dbpath="C:\data\db"
   ```
3. Your connection string is already set in `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/lost-and-found-portal
   ```

### Option B: MongoDB Atlas (Cloud)

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get your connection string
3. Update `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lost-and-found-portal
   ```

---

## 📸 STEP 3: Setup Cloudinary

1. Create free account at https://cloudinary.com
2. Go to Dashboard and copy your credentials
3. Update `.env.local`:
   ```
   CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   CLOUDINARY_API_KEY=your_actual_api_key
   CLOUDINARY_API_SECRET=your_actual_api_secret
   ```

---

## 🔐 STEP 4: Configure JWT Secret

Update the JWT secret in `.env.local` to a random string:

```
JWT_SECRET=my-super-secret-random-string-12345-change-this
```

**IMPORTANT:** Use a strong, random string in production!

---

## ▶️ STEP 5: Run the Project

Start the development server:

```bash
npm run dev
```

The application will start on **http://localhost:3000**

---

## 🧪 STEP 6: Test the Application

1. **Open Browser**: Navigate to http://localhost:3000
2. **Create Account**: Click "Sign Up" and create a user account
3. **Login**: Login with your credentials
4. **Test Features**:
   - Report a lost item
   - Report a found item
   - Browse items
   - View your profile

### Create Admin User

To access the admin dashboard, you need to manually set a user as admin in MongoDB:

```bash
# Connect to MongoDB
mongosh

# Use your database
use lost-and-found-portal

# Update a user to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Then access admin dashboard at: http://localhost:3000/admin

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Ensure MongoDB is running
- Check your connection string in `.env.local`
- For local MongoDB, verify it's running on port 27017

### Issue: "Image upload fails"
**Solution**:
- Verify Cloudinary credentials in `.env.local`
- Check your Cloudinary dashboard for API limits

### Issue: "Module not found" errors
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"
**Solution**:
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or run on different port
npm run dev -- -p 3001
```

### Issue: "JWT must be provided"
**Solution**:
- Clear browser cookies
- Ensure JWT_SECRET is set in `.env.local`
- Try logging out and logging in again

---

## 📁 PROJECT STRUCTURE

```
lost-and-found-portal/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── login/        # Authentication
│   │   ├── signup/       # User registration
│   │   ├── items/        # CRUD for items
│   │   ├── admin/        # Admin operations
│   │   ├── profile/      # User profile
│   │   └── upload/       # Image upload
│   ├── components/       # React components
│   ├── models/           # MongoDB schemas
│   ├── store/            # Redux store
│   └── lib/              # Database connection
├── middleware.js         # Route protection
├── .env.local            # Environment variables
└── package.json          # Dependencies
```

---

## 🚀 DEPLOYMENT PREPARATION

Before deploying to production:

1. **Update Environment Variables**:
   - Use production MongoDB URI
   - Generate strong JWT_SECRET
   - Verify Cloudinary credentials

2. **Build the Project**:
   ```bash
   npm run build
   ```

3. **Test Production Build**:
   ```bash
   npm start
   ```

4. **Deploy to Vercel** (Recommended):
   ```bash
   npm install -g vercel
   vercel
   ```

---

## ✅ VALIDATION CHECKLIST

- [ ] Dependencies installed successfully
- [ ] MongoDB connected
- [ ] Cloudinary configured
- [ ] Application runs on http://localhost:3000
- [ ] Can create user account
- [ ] Can login successfully
- [ ] Can report lost/found items
- [ ] Images upload successfully
- [ ] Admin dashboard accessible (after setting admin role)

---

## 📞 SUPPORT

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB and all services are running

---

## 🎉 SUCCESS!

If all steps completed successfully, your Lost & Found Portal is now running!

Access it at: **http://localhost:3000**
