# Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [x] Build passes: `npm run build`
- [x] No console errors
- [x] All routes working
- [x] Tests passing (if applicable)

### 2. Environment Setup
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account created
- [ ] Email service configured (Gmail App Password)
- [ ] All environment variables ready

### 3. Security
- [x] JWT secret is strong (32+ characters)
- [x] No secrets in code
- [x] HTTP-only cookies enabled
- [x] Input validation implemented
- [x] Protected routes secured

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Why Vercel:**
- Built for Next.js
- Zero configuration
- Automatic HTTPS
- Global CDN
- Free tier available

**Steps:**

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy on Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel auto-detects Next.js

3. **Add Environment Variables**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-32-char-secret
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

4. **Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Your app is live! 🎉

**Custom Domain (Optional):**
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records

---

### Option 2: Railway

**Why Railway:**
- Easy MongoDB integration
- Simple deployment
- Good for full-stack apps

**Steps:**

1. **Push to GitHub**
```bash
git push origin main
```

2. **Deploy on Railway**
- Go to [railway.app](https://railway.app)
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository

3. **Add Environment Variables**
- Go to Variables tab
- Add all environment variables

4. **Deploy**
- Railway automatically deploys
- Get your deployment URL

---

### Option 3: Render

**Why Render:**
- Free tier available
- Good performance
- Easy setup

**Steps:**

1. **Push to GitHub**

2. **Deploy on Render**
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect GitHub repository

3. **Configure**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Add environment variables

4. **Deploy**

---

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create Account**
- Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for free

2. **Create Cluster**
- Choose FREE tier (M0)
- Select region closest to your users
- Click "Create Cluster"

3. **Create Database User**
- Go to Database Access
- Add New Database User
- Username: `admin`
- Password: Generate secure password
- Save credentials

4. **Whitelist IP**
- Go to Network Access
- Add IP Address
- Allow access from anywhere: `0.0.0.0/0`
- (For production, restrict to your deployment platform IPs)

5. **Get Connection String**
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy connection string
- Replace `<password>` with your password
- Replace `<dbname>` with `lost-and-found-portal`

Example:
```
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/lost-and-found-portal?retryWrites=true&w=majority
```

---

## 📸 Cloudinary Setup

1. **Create Account**
- Go to [cloudinary.com](https://cloudinary.com)
- Sign up for free

2. **Get Credentials**
- Go to Dashboard
- Copy:
  - Cloud Name
  - API Key
  - API Secret

3. **Configure Upload Preset (Optional)**
- Go to Settings → Upload
- Enable unsigned uploading (if needed)

---

## 📧 Email Setup (Gmail)

1. **Enable 2-Factor Authentication**
- Go to Google Account settings
- Security → 2-Step Verification
- Enable it

2. **Generate App Password**
- Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Select "Mail" and "Other"
- Name it "Lost & Found Portal"
- Copy the 16-character password

3. **Use in Environment Variables**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## 🔐 Generate JWT Secret

Run this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use as `JWT_SECRET`

---

## 🧪 Post-Deployment Testing

1. **Test User Registration**
- Sign up with a new account
- Check email verification

2. **Test Login**
- Login with credentials
- Verify JWT cookie is set

3. **Test Item Creation**
- Report a lost item
- Upload an image
- Verify it appears in browse

4. **Test Search**
- Search for items
- Filter by category
- Check pagination

5. **Test Admin**
- Create admin user in MongoDB
- Access `/admin`
- Test delete functionality

---

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (18.17+)
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`

### Database Connection Error
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure password doesn't have special characters (URL encode if needed)

### Image Upload Fails
- Verify Cloudinary credentials
- Check API key is correct
- Ensure cloud name matches

### Email Not Sending
- Verify Gmail App Password
- Check 2FA is enabled
- Try different email service

### 404 on Routes
- Ensure `npm run build` completed
- Check middleware configuration
- Verify all routes are exported correctly

---

## 📊 Monitoring (Optional)

### Vercel Analytics
- Enable in Project Settings
- Track page views and performance

### Error Tracking
- Add Sentry for error monitoring
- Track API failures

### Database Monitoring
- Use MongoDB Atlas monitoring
- Set up alerts for high usage

---

## 🎉 You're Ready!

Your Lost & Found Portal is production-ready and can be deployed to any of the platforms above.

**Recommended Flow:**
1. Set up MongoDB Atlas (10 min)
2. Set up Cloudinary (5 min)
3. Set up Gmail App Password (5 min)
4. Deploy to Vercel (5 min)
5. Test everything (10 min)

**Total Time: ~35 minutes**

---

## 📞 Support

If you encounter issues:
1. Check this guide
2. Review error logs in deployment platform
3. Check MongoDB Atlas logs
4. Verify all environment variables

**Good luck with your deployment! 🚀**
