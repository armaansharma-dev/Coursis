# 🎓 Coursis

A full-stack course marketplace: teachers publish courses, students browse and enroll, and admins manage the platform.

Built with **React + TypeScript + Tailwind** on the frontend and **Node.js + Express 5 + MongoDB** on the backend, with JWT authentication and three roles.

**Status:** functional MVP — see the [Roadmap](#-roadmap--known-gaps) for what is not built yet.

---

## 📋 What works today

- Signup / login with hashed passwords and a 7-hour JWT
- Automatic session refresh on page load (role changes apply without re-login)
- Browse published courses and view course details
- Enroll in a course (free — no payment gateway yet)
- "My Courses" with progress bars and the ability to leave a course
- Enrolled students keep access even if a teacher unpublishes or archives the course
- Teacher dashboard: create → publish → archive / restore / delete courses, see enrollment counts
- Admin dashboard: platform stats, user management (role change / delete), course management
- Validation on every write (Zod), centralized error responses, ownership checks

---

## 🧱 Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript 5.9, Tailwind CSS 4, Vite 8, React Router 7 |
| Backend | Node.js 20.19+, Express 5 |
| Database | MongoDB Atlas, Mongoose 9 |
| Auth | JSON Web Tokens (`jsonwebtoken` 9), bcrypt 6 |
| Validation | Zod 4 |

---

## 📁 Project structure

```
Coursis/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Express app, CORS, route mounting
│   │   ├── server.js                 # Entry point: env → DNS → DB → listen
│   │   ├── config/db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # signup, login, token refresh
│   │   │   ├── user.controller.js    # profile, password, email
│   │   │   ├── public.controller.js  # public course browsing
│   │   │   ├── teacher.controller.js # course CRUD + publish
│   │   │   ├── enrollment.controller.js
│   │   │   └── admin.controller.js
│   │   ├── middlewares/
│   │   │   ├── authenticate.js       # Bearer token → req.user
│   │   │   ├── restrictTo.js         # role check
│   │   │   ├── validator.js          # Zod runner
│   │   │   ├── ownership.js          # teacher owns this course?
│   │   │   ├── globalerrorhandler.js
│   │   │   ├── catchAsync.js
│   │   │   ├── logger.js
│   │   │   └── notfound.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Course.js
│   │   │   └── Enrollment.js
│   │   ├── routes/
│   │   │   ├── Auth.route.js
│   │   │   ├── User.route.js
│   │   │   ├── Course.route.js
│   │   │   ├── Enrollment.route.js
│   │   │   └── Admin.route.js
│   │   ├── validators/               # Zod schemas per resource
│   │   └── utils/                    # AppError, Hasher, token
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   # Routes + session refresh
│   │   ├── config/api.ts             # Every API URL in one file
│   │   ├── assets/                   # logo, illustrations
│   │   ├── components/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   └── layout/               # Layout, Navbar, AuthLayout
│   │   └── pages/
│   │       ├── HomePage.tsx
│   │       ├── ExplorePage.tsx
│   │       ├── CourseDetails.tsx
│   │       ├── MyCourses.tsx
│   │       ├── Login.tsx / Signup.tsx
│   │       ├── EditProfile.tsx
│   │       ├── TeacherDashboard.tsx
│   │       └── AdminDashboard.tsx
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── LICENSE                           # MIT
├── logo.svg
└── README.md
```

---

## 🔐 Roles

| Role | Can do |
|------|--------|
| `user` (student) | Browse, enroll, view own enrollments, leave a course, edit own profile |
| `teacher` | Everything a student can do, plus create/edit/delete **own** courses, publish/archive, view **own** course enrollments |
| `admin` | Everything, plus manage all users and courses, change roles, view stats |

Signup always creates a `user`. An admin changes the role from the Admin Dashboard.

`GET /auth/refresh` re-issues the token from the **current database role**, and the frontend calls it on load — so a promotion applies on the next page refresh instead of requiring a logout.

---

## ⚙️ How a request flows

```
logger → auth → restrictTo(roles) → validator(Zod) → ownership → controller
                                                       ↓
                                              globalerrorhandler
```

- `auth` sets `req.user = { id, role }` from the JWT.
- `validator` stores parsed input; Zod 4 errors are returned as `{ success, message, errors }`.
- `ownership` loads the course into `req.course` and rejects teachers who don't own it.
- Controllers never send raw errors: `AppError` + `asyncWrapper` + the global handler produce consistent JSON.

---

## 🔌 API reference

Base URL: `http://localhost:5400/api/v1`

### Auth — public

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create account (role `user`) |
| POST | `/auth/login` | Returns `{ token, safeuser }` |
| GET | `/auth/refresh` | 🔒 New token from the current DB role |

### Users — authenticated

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/me` | Current profile |
| PATCH | `/user/me` | Update name |
| PATCH | `/user/me/password` | `{ currentPassword, newPassword, confirmNewPassword }` |
| PATCH | `/user/me/email` | `{ newMail, password }` |

### Courses

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/course` | Public | Published, non-archived courses |
| GET | `/course/random` | Public | Up to 6 random published courses |
| GET | `/course/:id` | Public | Published, non-archived course |
| POST | `/course` | Teacher / Admin | Create a draft course |
| GET | `/course/my/courses` | Teacher / Admin | Own courses incl. drafts + `enrollmentCount` |
| PATCH | `/course/:id` | Owner / Admin | Update title, description, price, image, archive |
| DELETE | `/course/:id` | Owner / Admin | Delete course **and its enrollments** |
| PUT | `/course/:id/publish` | Owner / Admin | Toggle published |
| GET | `/course/:id/enrollments` | Owner / Admin | Enrolled users |

### Enrollments — authenticated

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/enrollment/me` | My enrollments (populated course) |
| POST | `/enrollment/:courseId` | Enroll in a published, non-archived course (`user` only) |
| GET | `/enrollment/course/:courseId` | Course content for enrolled students — **works after unpublish/archive** |
| DELETE | `/enrollment/:id` | Leave a course (own enrollment only) |
| PATCH | `/enrollment/:id/progress` | `{ progress: 0-100 }` |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Users, courses, sales totals |
| GET | `/admin/users?page=&limit=` | Paginated users |
| GET | `/admin/users/:userId` | Single user |
| PATCH | `/admin/users/:userId/role` | `{ role: "user" \| "teacher" \| "admin" }` |
| DELETE | `/admin/users/:userId` | Delete user + their enrollments |
| GET | `/admin/users/:userId/enrollments` | A user's enrollments |
| GET | `/admin/courses?page=&limit=&includeArchived=` | Courses + `enrollmentCount` |
| GET | `/admin/courses/:courseId` | Single course |
| PATCH | `/admin/courses/:courseId` | Update course |
| PATCH | `/admin/courses/:courseId/archive` | Soft delete |
| PATCH | `/admin/courses/:courseId/restore` | Un-archive |
| DELETE | `/admin/courses/:courseId` | Permanent delete |

All protected routes expect:

```
Authorization: Bearer <jwt>
```

---

## 🚀 Getting started

**Prerequisites:** Node.js 20.19+ (required by Vite 8), a MongoDB database (Atlas or local).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # then edit MONGO_URL and JWT_SECRET
npm run dev
```

You should see:

```
Database connection succeeded
Server is running on port 5400
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173**.

The frontend talks to the backend at `VITE_API_URL` (default `http://localhost:5400/api/v1`).

---

## 🔧 Environment variables

### `backend/.env`

```env
PORT=5400
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/coursis
JWT_SECRET=change_this_to_a_long_random_string
CORS_ORIGIN=http://localhost:5173

# Optional: only needed if your network cannot resolve MongoDB SRV records
# DNS_SERVERS=8.8.8.8,1.1.1.1
```

- `CORS_ORIGIN` accepts a comma-separated list.
- `DNS_SERVERS` exists because some local networks refuse DNS SRV lookups used by `mongodb+srv://`. Leave it unset on healthy networks.

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5400/api/v1
```

> Vite bakes `VITE_*` variables in **at build time**. Restart the dev server after changing them.

---

## 📜 Scripts

**Backend**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start once with plain `node` — use this in production |

**Frontend**

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

---

## 🧠 Data model notes

- **User** — `name`, `email` (unique), `password` (`select: false`, bcrypt hash), `role`.
- **Course** — `title`, `description`, `price`, `image`, `published`, `isArchived`, `creator`, `lastModifyBy/At`. `creator` is immutable.
- **Enrollment** — `user` + `course` (unique pair), `priceBought` snapshot, `progress`, `status`.

Because MongoDB has no foreign keys:

- Deleting a course deletes its enrollments first.
- Deleting a user deletes their enrollments first.
- UIs that `populate()` a course must tolerate `null` if data was deleted outside the app.

---

## ✅ Manual test checklist

Run both servers, then:

1. Sign up with a 6-character password → the real validation message appears (minimum is 8).
2. Sign up normally → change password → log out → log in with the new password.
3. As an admin, promote a user to teacher → that user refreshes the page → Teacher Dashboard appears.
4. As a teacher, create a course → publish → archive it → it disappears from Explore and its detail URL returns 404.
5. Enroll in a course as a student → teacher unpublishes it → the student can still open it from **My Courses**.
6. In **My Courses**, click **Leave** → the course disappears and the enrollment count on the teacher dashboard drops.
7. Delete a course that has students → their **My Courses** stays usable (no crash).
8. `cd frontend && npm run build` → passes.

---

## 🗺️ Roadmap & known gaps

None of the items below are built yet; this list is both the planned work and the current limitations.

- **Teacher signup / onboarding flow.** Signup always creates a `user`; an admin must promote someone to `teacher`.
- **Lessons, video content and progress UI.** A course is currently title, description, price and image; `PATCH /enrollment/:id/progress` exists but students cannot set progress from the app.
- **Payments (Stripe / PayPal) and refunds.** Enrolling creates an `Enrollment` document; no money moves and `priceBought` is recorded for future use.
- **Search, filters and pagination.**
- **Ratings and reviews.**
- **Email verification and password reset.**
- **Automated tests (API + UI).**

---

## 📄 License

MIT — see [`LICENSE`](./LICENSE). You may use, copy, modify and distribute this code, provided the copyright notice is kept. No warranty is provided.

Copyright © 2026 Armaan Sharma.
