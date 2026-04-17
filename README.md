# 🔍 Lost & Found Portal

A full-stack web application for managing lost and found items, built with Next.js, MongoDB, and Cloudinary.

## ✨ Features

- 🔐 User Authentication (JWT + HTTP-only cookies)
- 📝 Report Lost Items
- 🎯 Report Found Items
- 🔍 Browse & Search Items
- 👤 User Profiles & Activity History
- 👨‍💼 Admin Dashboard
- 📸 Image Upload (Cloudinary)
- 📱 Responsive Design (Bootstrap + Tailwind CSS)
- 🔒 Protected Routes with Middleware

## 🛠️ Tech Stack

- **Frontend**: React 19, Redux Toolkit, Bootstrap 5, Tailwind CSS
- **Backend**: Next.js 16 (App Router) with API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Image Storage**: Cloudinary
- **Styling**: Bootstrap + Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17 or higher
- MongoDB (local or Atlas)
- Cloudinary account (free tier available)

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
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your credentials
```

Required environment variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Random secret key for JWT
- `CLOUDINARY_CLOUD_NAME` - From Cloudinary dashboard
- `CLOUDINARY_API_KEY` - From Cloudinary dashboard
- `CLOUDINARY_API_SECRET` - From Cloudinary dashboard

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **Quick Start**: See [QUICK_START.md](QUICK_START.md)
- **Detailed Setup**: See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- **Commands Reference**: See [COMMANDS.md](COMMANDS.md)
- **Fixes Applied**: See [FIXES_APPLIED.md](FIXES_APPLIED.md)

## 🗄️ Database Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB Community Edition
# Start MongoDB service
net start MongoDB
```

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

## 📸 Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Copy credentials (Cloud Name, API Key, API Secret)
4. Update `.env.local` with your credentials

## 👨‍💼 Admin Access

To create an admin user:

```bash
mongosh
use lost-and-found-portal
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Then access admin dashboard at: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📁 Project Structure

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
├── .env.local            # Environment variables (not in git)
└── package.json          # Dependencies
```

## 🧪 Testing

1. Create a user account at `/signup`
2. Login with your credentials
3. Report a lost or found item
4. Browse items at `/browse`
5. View your profile at `/userProfile`
6. Access admin dashboard (after setting admin role)

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Don't forget to add environment variables in your deployment platform!

## 🐛 Troubleshooting

**Cannot connect to MongoDB**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env.local`

**Image upload fails**
- Verify Cloudinary credentials
- Check API limits on free tier

**Port 3000 already in use**
```bash
npx kill-port 3000
```

**Module not found errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Nazir Hussain**
- GitHub: [@NazirHussain1](https://github.com/NazirHussain1)
- LinkedIn: [Nazir Hussain](https://www.linkedin.com/in/nazir-hussain-27b061360)
- Email: nazirkhawaja251@gmail.com
- WhatsApp: [+92 3321716508](https://wa.me/923321716508)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Bootstrap](https://getbootstrap.com/) and [Tailwind CSS](https://tailwindcss.com/)
- Database by [MongoDB](https://www.mongodb.com/)
- Image hosting by [Cloudinary](https://cloudinary.com/)

---

**Made with ❤️ for the community**
