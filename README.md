# Blogster - MERN Blog Platform

**Blogster** is a full-stack blog application built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides a clean, modern platform for reading and managing blog posts with authentication, categorization, and commenting features.

🔗 **Live Demo:** [https://blogster-frontend-three.vercel.app/](https://blogster-frontend-three.vercel.app/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

### Public Features
- **Blog Post Listing** - Browse all published articles with pagination
- **Category Filtering** - Filter posts by category
- **Popular & Latest Posts** - View trending and recent articles
- **Post Details** - Read full articles with author information
- **Search** - Find posts by title or content
- **User Authentication** - Login and registration system
- **Responsive Design** - Optimized for desktop and mobile devices

### Authenticated User Features
- **Create Posts** - Write and publish your own blog articles
- **Edit Posts** - Update your published content
- **Delete Posts** - Remove your own articles
- **Commenting** - Engage with posts through comments
- **Profile Management** - Update your user profile

### Admin Features
- **Admin Dashboard** - Overview of site statistics
- **User Management** - View and manage registered users
- **Post Moderation** - Review and manage all posts
- **Category Management** - Create, edit, and delete categories
- **Comment Moderation** - Approve or delete comments

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image upload and storage
- **Multer** - File upload handling

---

## 📦 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/blogster.git
cd blogster
```

2. **Install frontend dependencies**

```bash
cd frontend
npm install
```

3. **Install backend dependencies**

```bash
cd ../backend
npm install
```

4. **Set up environment variables** (see below)

5. **Start the development servers**

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev
```

6. **Open the application**

Visit `http://localhost:5173` for the frontend and `http://localhost:5000` for the backend API.

---

## 🔐 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_SECRET=your_admin_secret_key
```

### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Start backend
cd backend
npm run dev

# Start frontend (in a new terminal)
cd frontend
npm run dev
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build

# Start production server
cd backend
npm start
```

---

## 📁 Project Structure

```
blogster/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   ├── services/         # API services
│   │   └── styles/           # Global styles
│   ├── public/               # Static assets
│   └── package.json
│
└── backend/                  # Express backend
    ├── src/
    │   ├── controllers/      # Route controllers
    │   ├── models/           # Mongoose models
    │   ├── routes/           # API routes
    │   ├── middleware/       # Express middleware
    │   ├── config/           # Configuration files
    │   └── utils/            # Utility functions
    ├── uploads/              # Uploaded files (local)
    └── package.json
```

---

## 🌐 Deployment

### Frontend (Vercel)

The frontend is deployed on Vercel. To deploy your own:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add the required environment variables
4. Deploy

### Backend (Render / Railway / Heroku)

The backend can be deployed on Render, Railway, or Heroku:

1. Push your code to a GitHub repository
2. Connect your repository to your chosen platform
3. Add the required environment variables
4. Deploy

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
Created by Bublai Sarkar

---

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for frontend hosting
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [Cloudinary](https://cloudinary.com) for image hosting

---

**Built with ❤️ using the MERN stack**