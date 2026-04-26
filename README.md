# Lost & Found Portal

A modern web application for managing lost and found items on campus. Built with Next.js, MongoDB, and Cloudinary.

## Features

- User authentication with email verification
- Report lost and found items
- Image upload and management
- Search and filter functionality
- Real-time notifications
- Admin dashboard
- Responsive design

## Tech Stack

- **Frontend:** Next.js 16, React 19, Bootstrap 5
- **Backend:** Next.js API Routes
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with HTTP-only cookies
- **Storage:** Cloudinary
- **State Management:** Redux Toolkit
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. Clone the repository
```bash
git clone https://github.com/NazirHussain1/lost-found-portal.git
cd lost-found-portal
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Build for production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## Admin Access

To create an admin user, update the user role in MongoDB:

```bash
mongosh
use lost-and-found-portal
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Access admin dashboard at `/admin`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## License

MIT

## Author

**Nazir Hussain**
- GitHub: [@NazirHussain1](https://github.com/NazirHussain1)
- Email: nazirkhawaja251@gmail.com
