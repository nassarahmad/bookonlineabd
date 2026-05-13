# Graduation Messages Backend API

REST API backend for graduation messages website with MongoDB storage, IP-based rate limiting, and JWT-based admin authentication.

## 🚀 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcryptjs, express-rate-limit
- **Validation**: express-validator

## 📋 Features

- ✅ Persistent message storage in MongoDB
- ✅ IP-based duplicate message prevention
- ✅ JWT-based admin authentication
- ✅ Rate limiting (100 requests per 15 minutes per IP)
- ✅ Input validation and sanitization
- ✅ Secure password hashing with bcrypt
- ✅ CORS support for frontend integration
- ✅ Centralized error handling
- ✅ Environment-based configuration

## 🔧 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/graduation-messages

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
ADMIN_PASSWORD_HASH=$2a$10$example.hash.here

# Frontend (for CORS in production)
FRONTEND_URL=http://localhost:3000
```

### Generating Admin Password Hash

To generate a bcrypt hash for your admin password:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(hash => console.log(hash));"
```

Copy the output and set it as `ADMIN_PASSWORD_HASH` in your `.env` file.

## 📦 Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with required environment variables (see above)

4. Start MongoDB (if running locally):
```bash
mongod
```

## 🏃 Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 5000).

## 📡 API Endpoints

### Health Check

#### GET `/health`
Check if the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Admin Authentication

#### POST `/api/admin/login`
Admin login to obtain JWT token.

**Request Body:**
```json
{
  "password": "your-admin-password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid password"
}
```

---

### Messages

#### POST `/api/messages`
Create a new graduation message (public endpoint).

**Request Body:**
```json
{
  "text": "Congratulations on your graduation!",
  "name": "Ahmad" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": {
    "id": "507f1f77bcf86cd799439011",
    "text": "Congratulations on your graduation!",
    "name": "Ahmad",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response - Duplicate IP (403):**
```json
{
  "success": false,
  "error": "You have already sent a message"
}
```

**Error Response - Validation (400):**
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Text is required",
      "param": "text",
      "location": "body"
    }
  ]
}
```

---

#### GET `/api/messages`
Get all messages (admin only - requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "text": "Congratulations!",
      "name": "Ahmad",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "text": "Well done!",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Response - No Token (401):**
```json
{
  "success": false,
  "error": "No token provided"
}
```

**Error Response - Invalid Token (403):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

---

#### DELETE `/api/messages/:id`
Delete a message by ID (admin only - requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "error": "Message not found"
}
```

---

## 🔐 Authentication Flow

1. Admin logs in via `POST /api/admin/login` with password
2. Server validates password and returns JWT token
3. Frontend stores token (e.g., in sessionStorage)
4. For protected endpoints, frontend sends token in Authorization header:
   ```
   Authorization: Bearer <token>
   ```
5. Server validates token and grants access if valid

## 🛡️ Security Considerations

- **Password Hashing**: Admin password is hashed using bcrypt with 10 salt rounds
- **JWT Secret**: Use a strong, random secret (minimum 32 characters)
- **HTTPS**: Always use HTTPS in production to protect tokens in transit
- **Rate Limiting**: Prevents abuse with 100 requests per 15 minutes per IP
- **Input Validation**: All inputs are validated and sanitized
- **CORS**: Configured to allow only specified frontend domain in production
- **Helmet**: Adds security headers to protect against common vulnerabilities

## 🌐 Deployment

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user with read/write permissions
4. Whitelist IP addresses (0.0.0.0/0 for all IPs or specific IPs)
5. Get connection string and update `MONGODB_URI` in environment variables

### Deployment Platforms

#### Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set ADMIN_PASSWORD_HASH=your-password-hash
heroku config:set FRONTEND_URL=https://your-frontend-domain.com

# Deploy
git push heroku main
```

#### Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

#### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in backend directory
3. Add environment variables in Vercel dashboard

### Production Environment Variables

Ensure these are set in your production environment:

- `NODE_ENV=production`
- `MONGODB_URI` (MongoDB Atlas connection string)
- `JWT_SECRET` (strong random string, 32+ characters)
- `ADMIN_PASSWORD_HASH` (bcrypt hash of admin password)
- `FRONTEND_URL` (your production frontend domain)
- `PORT` (usually provided by hosting platform)

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── middleware/
│   ├── auth.js              # JWT verification middleware
│   ├── errorHandler.js      # Centralized error handling
│   └── validation.js        # Input validation rules
├── models/
│   └── Message.js           # Message schema and model
├── routes/
│   ├── admin.js             # Admin authentication routes
│   └── messages.js          # Message CRUD routes
├── utils/
│   └── extractIP.js         # IP extraction utility
├── .env                     # Environment variables (not in git)
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── package.json             # Dependencies and scripts
├── server.js                # Main application entry point
└── README.md                # This file
```

## 🧪 Testing the API

### Using cURL

**Create a message:**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"text":"Congratulations!","name":"Ahmad"}'
```

**Admin login:**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}'
```

**Get all messages (with token):**
```bash
curl -X GET http://localhost:5000/api/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Delete a message (with token):**
```bash
curl -X DELETE http://localhost:5000/api/messages/MESSAGE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for base URL and token
3. Test each endpoint with various inputs
4. Verify error handling and validation

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Verify `MONGODB_URI` is correct
- Check MongoDB service is running (if local)
- Verify network access in MongoDB Atlas (if cloud)
- Check firewall settings

### Authentication Issues

- Verify `JWT_SECRET` is set
- Verify `ADMIN_PASSWORD_HASH` is correct bcrypt hash
- Check token is sent in correct format: `Bearer <token>`
- Verify token hasn't expired (24-hour expiration)

### CORS Issues

- Verify `FRONTEND_URL` matches your frontend domain
- In development, CORS allows all origins
- In production, only specified `FRONTEND_URL` is allowed

## 📝 License

ISC

## 👤 Author

Your Name

---

**Note**: This is a backend API only. It requires a frontend application to provide a user interface. The API is designed to replace localStorage-based storage with persistent database storage for a graduation messages website.
