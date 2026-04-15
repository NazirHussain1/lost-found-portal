# 📝 Command Reference

## 🚀 Essential Commands

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Access at: http://localhost:3000

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm start
```

### Run Linter
```bash
npm run lint
```

---

## 🗄️ MongoDB Commands

### Start Local MongoDB (Windows)
```bash
net start MongoDB
```

### Stop Local MongoDB (Windows)
```bash
net stop MongoDB
```

### Connect to MongoDB Shell
```bash
mongosh
```

### Create Admin User
```bash
mongosh
use lost-and-found-portal
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### View All Users
```bash
mongosh
use lost-and-found-portal
db.users.find().pretty()
```

### View All Items
```bash
mongosh
use lost-and-found-portal
db.items.find().pretty()
```

### Clear All Data (Reset Database)
```bash
mongosh
use lost-and-found-portal
db.users.deleteMany({})
db.items.deleteMany({})
```

---

## 🐛 Troubleshooting Commands

### Clear Node Modules and Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Kill Process on Port 3000
```bash
npx kill-port 3000
```

### Run on Different Port
```bash
npm run dev -- -p 3001
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Check Node Version
```bash
node --version
```

### Check npm Version
```bash
npm --version
```

---

## 🔍 Debugging Commands

### View Environment Variables (Windows)
```bash
Get-Content .env.local
```

### Check if MongoDB is Running
```bash
mongosh --eval "db.adminCommand('ping')"
```

### Test MongoDB Connection
```bash
mongosh "mongodb://localhost:27017/lost-and-found-portal"
```

---

## 📦 Package Management

### Install New Package
```bash
npm install package-name
```

### Install Dev Dependency
```bash
npm install --save-dev package-name
```

### Update All Packages
```bash
npm update
```

### Check for Outdated Packages
```bash
npm outdated
```

---

## 🚀 Deployment Commands

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Build and Test Locally
```bash
npm run build
npm start
```

---

## 🧪 Testing Commands

### Test API Endpoints (using curl)

**Test Signup**:
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"1234567890","password":"password123"}'
```

**Test Login**:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📊 Useful Git Commands

### Initialize Git Repository
```bash
git init
```

### Add All Files
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Initial commit"
```

### Add Remote Repository
```bash
git remote add origin https://github.com/yourusername/lost-and-found-portal.git
```

### Push to GitHub
```bash
git branch -M main
git push -u origin main
```

---

## 🔐 Security Commands

### Generate Random JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 Quick Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `mongosh` | Connect to MongoDB |
| `npx kill-port 3000` | Kill port 3000 |
| `npm cache clean --force` | Clear npm cache |

---

**Keep this file handy for quick command reference!** 📚
