# 📚 Course Platform Backend API

A **Node.js + Express REST API** built with a clean and scalable backend architecture.
The project demonstrates **modular Express structure, authentication, middleware pipelines, and centralized error handling**, following patterns commonly used in real production backends.

---

# 🚀 Tech Stack

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB
* Mongoose

**Authentication**

* JSON Web Tokens (JWT)
* bcrypt password hashing

---

# 🏗 Project Structure

The project follows a **layered and modular Express architecture**.

```
project-root
│
├── controllers
│   └── user.controller.js
│
├── middlewares
│   ├── authenticate.js
│   ├── catchAsync.js
│   ├── errorHandler.js
│   └── logger.js
│
├── models
│   └── User.js
│
├── routes
│   └── user.routes.js
│
├── utils
│   └── AppError.js
│
├── validators
│
├── app.js
├── server.js
└── README.md
```

### Architecture Overview

* **Routes** → define API endpoints
* **Controllers** → handle business logic
* **Models** → define MongoDB schemas
* **Middlewares** → process requests before controllers
* **Utils** → reusable utilities (custom errors, helpers)

This structure helps maintain **separation of concerns and scalability**.

---

# ✨ Core Features

### 👤 User Profile Management

Authenticated users can:

* Retrieve profile
* Update profile information
* Change password
* Change email

### Endpoints

```
GET    /users/me
PATCH  /users/me
PATCH  /users/me/password
PATCH  /users/me/email
```

All routes are protected by **JWT authentication middleware**.

---

# 🔐 Authentication

Authentication is implemented using **JWT tokens**.

### Flow

1. User logs in
2. Server generates JWT
3. Client sends token in request headers
4. Auth middleware verifies token
5. Request proceeds with `req.user`

Example header:

```
Authorization: Bearer <token>
```

---

# ⚙️ Middleware Pipeline

Each request flows through a middleware pipeline:

```
Request
   ↓
Logger Middleware
   ↓
Authentication Middleware
   ↓
Route Controller (Async Wrapped)
   ↓
Global Error Handler
```

Benefits:

* cleaner controller logic
* centralized error handling
* easier debugging

---

# 🧠 Async Controller Wrapper

Express does not automatically catch async errors.
A custom **async wrapper middleware** ensures all controller errors are properly forwarded to the global error handler.

Example:

```javascript
exports.myProfile = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password")
  res.status(200).json({ status: "success", data: user })
})
```

---

# 🛑 Centralized Error Handling

A custom error utility is used for operational errors.

Example:

```javascript
throw new AppError("User not found", 404)
```

The **global error handler** ensures consistent API responses.

Example response:

```json
{
  "status": "error",
  "message": "User not found"
}
```

---

# 🔎 Logging Middleware

A lightweight logger middleware records:

* HTTP method
* endpoint
* request time

Useful during development and debugging.

---

# 🔒 Security Practices

The API includes basic backend security practices:

* Password hashing using **bcrypt**
* Sensitive fields excluded from responses
* Email uniqueness validation
* Password verification before updates

Example:

```javascript
User.findById(id).select("-password")
```

---

# 🧪 Example API Request

### Get Current User

Request:

```
GET /users/me
Authorization: Bearer <token>
```

Example response:

```json
{
  "status": "success",
  "data": {
    "id": "65a8f3...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

# 📦 Current Status

The backend currently includes:

✅ Modular Express architecture
✅ JWT authentication
✅ User profile management
✅ Password & email update endpoints
✅ Async controller wrapper
✅ Centralized error handling
✅ Middleware request pipeline

The **core backend API is fully functional** and ready for additional features.

---

# 🔮 Planned Improvements

Future improvements planned:

* Pagination for large datasets
* Filtering and sorting
* Course management system
* Enrollment system
* Role-based access control (RBAC)
* Rate limiting

---

# ⚡ Installation

Clone the repository:

```
git clone <repository-url>
```

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory.

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

---

# 🧑‍💻 Development Focus

This project was built to practice:

* scalable Express architecture
* middleware design patterns
* authentication systems
* backend error handling
* modular API development

---

# 📄 License

This project is intended for **learning and backend development practice**.