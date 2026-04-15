# ⚡ Quick Start Guide

## 🔧 What Was Fixed

✅ Fixed toast import errors in 3 components
✅ Moved middleware.js to correct location (root directory)
✅ Created Tailwind CSS configuration
✅ Created .env.local with all required variables

---

## 🚀 Run the Project (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Edit `.env.local` and update these values:

```env
# MongoDB - Use local or Atlas
MONGODB_URI=mongodb://localhost:27017/lost-and-found-portal

# JWT Secret - Change to any random string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Cloudinary - Get from https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start the Server
```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📝 Required Setup

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install from https://www.mongodb.com/try/download/community
# Start MongoDB
net start MongoDB
```

**Option 2: MongoDB Atlas (Cloud - Free)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in .env.local

### Cloudinary Setup (For Image Uploads)

1. Sign up at https://cloudinary.com (free tier)
2. Go to Dashboard
3. Copy: Cloud Name, API Key, API Secret
4. Update .env.local

---

## 🧪 Test the Application

1. **Sign Up**: Create a new account at http://localhost:3000/signup
2. **Login**: Login with your credentials
3. **Report Item**: Try reporting a lost or found item
4. **Browse**: View all items at /browse

### Access Admin Dashboard

1. Create a user account first
2. Connect to MongoDB and run:
```bash
mongosh
use lost-and-found-portal
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```
3. Access: http://localhost:3000/admin

---

## ⚠️ Common Issues

**"Cannot connect to MongoDB"**
- Ensure MongoDB is running
- Check MONGODB_URI in .env.local

**"Image upload fails"**
- Verify Cloudinary credentials
- Check you're not on free tier limits

**"Port 3000 in use"**
```bash
npx kill-port 3000
```

**"Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 What's Included

- ✅ User Authentication (JWT + Cookies)
- ✅ Lost & Found Item Management
- ✅ Image Upload (Cloudinary)
- ✅ Admin Dashboard
- ✅ User Profiles
- ✅ Activity History
- ✅ Search & Filter
- ✅ Responsive Design (Bootstrap + Tailwind)

---

## 🎯 Next Steps

1. **Customize**: Update branding, colors, and content
2. **Add Features**: Extend functionality as needed
3. **Deploy**: Use Vercel, Netlify, or your preferred platform

---

## 📚 Full Documentation

See `SETUP_INSTRUCTIONS.md` for detailed setup guide.

---

**Ready to go! 🚀**
