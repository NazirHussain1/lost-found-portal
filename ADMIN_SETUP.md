# 👨‍💼 Admin Setup Guide - GAMICA Lost & Found Portal

## 🔑 Creating Admin User

Since this is a fresh installation, you need to create an admin user to access the admin dashboard.

---

## 📋 STEP-BY-STEP GUIDE

### Step 1: Register a Regular User Account

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - Navigate to: `http://localhost:3000`

3. **Go to Sign Up page:**
   - Click "Register" button in navbar
   - Or navigate to: `http://localhost:3000/signup`

4. **Fill in registration form:**
   ```
   Name: Admin User
   Email: admin@gamica.edu (or your email)
   Phone: 03001234567 (Pakistani format)
   Password: Admin@123 (or your secure password)
   ```

5. **Submit the form**
   - You'll receive a verification email
   - Click the verification link in the email
   - Your account is now verified

6. **Login with your credentials:**
   - Navigate to: `http://localhost:3000/loginPage`
   - Enter your email and password
   - Click "Login"

---

### Step 2: Promote User to Admin via MongoDB

Now you need to promote your user account to admin role using MongoDB.

#### Option A: Using MongoDB Compass (GUI)

1. **Open MongoDB Compass**

2. **Connect to your database:**
   - Use your `MONGODB_URI` from `.env.local`

3. **Navigate to your database:**
   - Database name: `lost-and-found-portal`
   - Collection: `users`

4. **Find your user:**
   - Look for the user with your email address

5. **Edit the document:**
   - Click the pencil icon to edit
   - Find the `role` field
   - Change value from `"user"` to `"admin"`
   - Click "Update"

#### Option B: Using MongoDB Shell (mongosh)

1. **Open terminal/command prompt**

2. **Connect to MongoDB:**
   ```bash
   mongosh
   ```

3. **Switch to your database:**
   ```bash
   use lost-and-found-portal
   ```

4. **Update user role to admin:**
   ```bash
   db.users.updateOne(
     { email: "admin@gamica.edu" },
     { $set: { role: "admin" } }
   )
   ```
   
   **Replace `admin@gamica.edu` with your actual email address**

5. **Verify the update:**
   ```bash
   db.users.findOne({ email: "admin@gamica.edu" })
   ```
   
   You should see `role: "admin"` in the output

6. **Exit mongosh:**
   ```bash
   exit
   ```

#### Option C: Using MongoDB Atlas (Cloud)

1. **Login to MongoDB Atlas:**
   - Go to: https://cloud.mongodb.com

2. **Navigate to your cluster:**
   - Click "Browse Collections"

3. **Find your database:**
   - Database: `lost-and-found-portal`
   - Collection: `users`

4. **Find your user document:**
   - Use the filter: `{ "email": "admin@gamica.edu" }`

5. **Edit the document:**
   - Click the pencil icon
   - Change `role` from `"user"` to `"admin"`
   - Click "Update"

---

### Step 3: Access Admin Dashboard

1. **Logout and login again:**
   - This ensures your new admin role is loaded

2. **Access admin dashboard:**
   - Navigate to: `http://localhost:3000/admin`
   - Or click your profile dropdown → "Admin Dashboard" (if visible)

3. **You should now see:**
   - Total users count
   - Total items count
   - Lost items count
   - Found items count
   - List of all users
   - List of all items
   - Delete buttons for items
   - Database management options

---

## 🎯 ADMIN FEATURES

Once you have admin access, you can:

### User Management:
- ✅ View all registered users
- ✅ See user details (name, email, phone)
- ✅ Monitor user activity

### Item Management:
- ✅ View all lost items
- ✅ View all found items
- ✅ Delete inappropriate items
- ✅ Monitor item reports

### System Management:
- ✅ View system statistics
- ✅ Setup database indexes
- ✅ Monitor application health

---

## 🔒 SECURITY NOTES

### Admin Account Security:

1. **Use a strong password:**
   - Minimum 8 characters
   - Include uppercase letters
   - Include numbers
   - Include special characters
   - Example: `Admin@2026!Secure`

2. **Use a secure email:**
   - Use your official university email
   - Enable 2-factor authentication on email
   - Don't share admin credentials

3. **Limit admin accounts:**
   - Only create admin accounts for trusted staff
   - Regularly review admin users
   - Remove admin access when no longer needed

4. **Monitor admin activity:**
   - Check admin actions regularly
   - Review deleted items
   - Monitor user management

---

## 📝 EXAMPLE ADMIN CREDENTIALS

### For Development/Testing:
```
Email: admin@gamica.edu
Password: Admin@123
Phone: 03001234567
Role: admin
```

### For Production:
```
Email: your-official-email@gamica.edu
Password: [Use a strong, unique password]
Phone: [Your actual phone number]
Role: admin
```

**⚠️ IMPORTANT:** Change these credentials in production!

---

## 🚨 TROUBLESHOOTING

### Issue: Can't access admin dashboard

**Solution:**
1. Verify you're logged in
2. Check your user role in database:
   ```bash
   db.users.findOne({ email: "your-email@gamica.edu" })
   ```
3. Ensure `role` field is set to `"admin"`
4. Logout and login again

### Issue: Admin dashboard shows "Unauthorized"

**Solution:**
1. Clear browser cookies
2. Logout completely
3. Login again with admin account
4. Try accessing `/admin` again

### Issue: Can't update user role in MongoDB

**Solution:**
1. Ensure MongoDB is running
2. Check your connection string
3. Verify database name is correct
4. Check collection name is `users` (lowercase)

### Issue: Email verification not working

**Solution:**
1. Check email configuration in `.env.local`
2. Verify Gmail app password is correct
3. Check spam folder for verification email
4. Manually verify user in database:
   ```bash
   db.users.updateOne(
     { email: "your-email@gamica.edu" },
     { $set: { isVerified: true } }
   )
   ```

---

## 🎯 QUICK REFERENCE

### MongoDB Commands:

**Connect:**
```bash
mongosh
```

**Switch database:**
```bash
use lost-and-found-portal
```

**Make user admin:**
```bash
db.users.updateOne(
  { email: "admin@gamica.edu" },
  { $set: { role: "admin" } }
)
```

**Verify admin:**
```bash
db.users.findOne({ email: "admin@gamica.edu" }, { role: 1, email: 1 })
```

**List all admins:**
```bash
db.users.find({ role: "admin" }, { name: 1, email: 1 })
```

**Remove admin role:**
```bash
db.users.updateOne(
  { email: "admin@gamica.edu" },
  { $set: { role: "user" } }
)
```

---

## 📞 SUPPORT

If you need help setting up admin access:

1. Check this guide carefully
2. Verify MongoDB connection
3. Check application logs
4. Review `.env.local` configuration

---

## ✅ CHECKLIST

- [ ] Created user account via signup
- [ ] Verified email address
- [ ] Logged in successfully
- [ ] Connected to MongoDB
- [ ] Updated user role to "admin"
- [ ] Logged out and logged in again
- [ ] Accessed `/admin` successfully
- [ ] Can see admin dashboard
- [ ] Can view all users
- [ ] Can view all items
- [ ] Can delete items

---

**🎊 Congratulations! You now have admin access!**

**Admin Dashboard:** http://localhost:3000/admin

---

*Made with ❤️ for GAMICA Campus Community*
