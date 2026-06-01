# 🎓 Coursis - Course Selling Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-v18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-v19+-61dafb?logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/mongodb-v9+-green?logo=mongodb)](https://mongodb.com)
[![Express](https://img.shields.io/badge/express-v5+-yellow?logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/typescript-v5.9+-blue?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/vite-v8+-purple?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-v4.2-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

A **modern, full-stack course selling platform** enabling educators to create and sell courses while students discover, purchase, and learn from expert-led content. Built with professional architecture, responsive UI, and multi-role authentication.

---

## 🎯 What is Coursis?

Coursis is a **complete learning platform** where:
- **Teachers** create courses, set prices, and manage enrollments
- **Students** browse, enroll, and track their learning
- **Admins** oversee platform operations and users

Course data includes title, description, pricing, instructor info, and timestamps—everything needed to run a professional course marketplace.

---

# 🚀 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React, TypeScript, Tailwind CSS, Vite | 19.2, 5.9, 4.2, 8.0 |
| **Backend** | Node.js, Express.js | 18+, 5.2 |
| **Database** | MongoDB, Mongoose | 9.1 |
| **Auth** | JWT (jsonwebtoken) | 9.0 |
| **Security** | bcrypt | 6.0 |
| **Validation** | Zod | 4.3 |
| **UI Library** | React Router, React Icons | 7.13, 5.6 |

---

# 🏗 Project Structure

```
Coursis/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app configuration
│   │   ├── server.js              # Server entry point
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/           # Business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── course.controller.js
│   │   │   ├── enrollment.controller.js
│   │   │   ├── teacher.controller.js
│   │   │   └── admin.controller.js
│   │   ├── models/                # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Course.js
│   │   │   └── Enrollment.js
│   │   ├── routes/                # API endpoints
│   │   ├── middlewares/           # Custom middlewares
│   │   ├── validators/            # Zod schemas
│   │   └── utils/                 # Helpers & utilities
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx               # React entry point
│   │   ├── App.tsx                # Main component
│   │   ├── pages/                 # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── ExplorePage.tsx
│   │   │   ├── CourseDetails.tsx
│   │   │   ├── MyCourses.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── EditProfile.tsx
│   │   ├── components/            # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   └── layout/
│   │   ├── config/
│   │   │   └── api.ts             # API client
│   │   ├── index.css              # Global styles
│   │   └── App.css
│   ├── vite.config.ts             # Vite config
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

# ✨ Core Features

### 🎓 For Students
- Browse & discover courses by category
- Enroll and access course materials
- Track enrolled courses
- View instructor profiles

### 👨‍🏫 For Teachers
- Create and publish courses
- Set course price and details
- View student enrollments
- Manage course lifecycle

### 🛡️ For Admins
- Monitor all users and courses
- System-wide statistics
- User and course management

### 🔐 Authentication
- JWT-based secure login
- Role-based access (Student, Teacher, Admin)
- Password hashing with bcrypt

---

# 🔐 Authentication & Authorization

Uses **JWT tokens** for secure authentication. Different roles have different access:

- **Student**: Browse courses, enroll, view profile
- **Teacher**: Create/edit own courses, view enrollments
- **Admin**: Full platform access

All sensitive endpoints require a valid JWT token in the request header.

---

# ⚙️ Backend Architecture

Each request goes through:
1. **Logger** - Track request info
2. **Validator** - Check input data (Zod)
3. **Auth Middleware** - Verify JWT token
4. **Role Check** - Ensure user has permission
5. **Controller** - Handle business logic
6. **Error Handler** - Catch & format errors

This keeps code clean and secure.

---

# 🎯 Main API Endpoints

```
POST   /auth/register           - Sign up
POST   /auth/login              - Log in (returns JWT)

GET    /courses                 - Browse all courses
GET    /courses/:id             - Get course details

GET    /users/me                - Get your profile
PATCH  /users/me                - Update profile

POST   /teacher/courses         - Create a course
PATCH  /teacher/courses/:id     - Edit your course

POST   /enrollments             - Enroll in a course
GET    /enrollments             - View your enrollments

GET    /admin/dashboard         - Admin overview
```

---

# ❌ Error Handling & 🔒 Security

**Consistent Error Responses:**
- 400 Bad Request - Invalid input
- 401 Unauthorized - Missing/invalid token
- 403 Forbidden - No permission
- 404 Not Found - Resource doesn't exist
- 500 Server Error - Something went wrong

**Security Features:**
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ Role-based access control
- ✅ Input validation (Zod)
- ✅ Ownership verification

---

# ✅ Project Status

**Complete & Production Ready:**
- ✅ Full-stack course marketplace
- ✅ User authentication (JWT)
- ✅ Role-based system (Student, Teacher, Admin)
- ✅ Course CRUD operations
- ✅ Enrollment system
- ✅ Professional UI (React + Tailwind)
- ✅ Error handling & validation

---

# 🚀 Future Improvements

- Payment gateway (Stripe/PayPal)
- Video streaming for courses
- Course ratings & reviews
- Email notifications
- Search & filtering
- Student certificates
- Live sessions

---

# ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or cloud)
- npm or yarn

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/armaansharma-dev/Coursis.git
cd Coursis
```

**2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

**3. Setup Frontend (new terminal)**
```bash
cd frontend
npm install
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5400`

---

# 🔧 Environment Variables

### Backend (.env)
```
PORT=5400
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/coursis
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5400/api/v1
VITE_ENV=development
```

See `.env.example` files in backend/ and frontend/ for complete templates.

---

# 👨‍💻 What I Learned

- Full-stack development (React + Node.js)
- JWT authentication & role-based access
- Express.js middleware patterns
- MongoDB schema design
- RESTful API design
- Error handling & validation
- TypeScript for type safety

---

# 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

**Built with ❤️ by Armaan Sharma**