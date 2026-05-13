# Design Document: Graduation Messages Backend

## Overview

This document describes the technical design for a Node.js/Express REST API backend that replaces the localStorage-based message storage system with a persistent MongoDB database. The system enables visitors to submit graduation congratulation messages while enforcing a one-message-per-IP limit, and provides admin authentication for message management.

### Goals

- Replace client-side localStorage with server-side persistent storage
- Enable message sharing across browsers and devices
- Implement IP-based rate limiting (one message per visitor)
- Provide secure admin authentication using JWT
- Maintain backward compatibility with existing frontend
- Follow REST API best practices

### Non-Goals

- Real-time message updates (WebSocket/SSR)
- User registration system beyond admin authentication
- Message editing functionality
- Advanced analytics or reporting
- Multi-language admin interface

## Architecture

### System Architecture

```mermaid
graph TB
    Client[Frontend Client<br/>HTML/JavaScript]
    API[Express API Server<br/>Port 5000]
    Auth[JWT Auth Middleware]
    DB[(MongoDB Database)]
    
    Client -->|HTTP Requests| API
    API -->|Verify Token| Auth
    Auth -->|Authorized| API
    API -->|CRUD Operations| DB
    
    subgraph "Backend Services"
        API
        Auth
        DB
    end
```

### Technology Stack

- **Runtime**: Node.js (LTS version recommended)
- **Web Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs for password hashing
- **Security**: helmet, cors, express-rate-limit
- **Validation**: express-validator
- **Environment**: dotenv for configuration management

### Deployment Architecture

```mermaid
graph LR
    User[User Browser]
    CDN[Static File Hosting<br/>Frontend]
    API[API Server<br/>Heroku/Railway/Vercel]
    DB[(MongoDB Atlas)]
    
    User -->|HTTPS| CDN
    CDN -->|API Calls| API
    API -->|Mongoose| DB
```

## Components and Interfaces

### 1. Server Entry Point (`server.js`)

**Responsibility**: Application initialization and configuration

**Key Functions**:
- Load environment variables
- Initialize Express app
- Configure middleware stack
- Connect to MongoDB
- Start HTTP server
- Handle graceful shutdown

**Dependencies**:
- Express
- Mongoose
- dotenv
- All middleware modules

**Initialization Sequence**:
```javascript
1. Load environment variables (dotenv)
2. Validate required environment variables
3. Connect to MongoDB
4. Configure middleware (helmet, cors, body-parser, rate-limit)
5. Mount API routes
6. Mount error handling middleware
7. Start listening on configured port
```

### 2. Database Configuration (`config/database.js`)

**Responsibility**: MongoDB connection management

**Interface**:
```javascript
connectDB(): Promise<void>
```

**Behavior**:
- Reads `MONGODB_URI` from environment
- Establishes Mongoose connection with retry logic
- Logs connection success/failure
- Exits process on connection failure

**Mongoose Options**:
- `useNewUrlParser: true`
- `useUnifiedTopology: true`

### 3. Message Model (`models/Message.js`)

**Responsibility**: Define message schema and validation

**Schema Definition**:
```javascript
{
  name: {
    type: String,
    trim: true,
    maxlength: 50,
    required: false
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  }
}
```

**Indexes**:
- `ipAddress`: For efficient duplicate message checking
- `timestamp`: For sorting messages by date

**Methods**: Standard Mongoose CRUD operations

### 4. Authentication Middleware (`middleware/auth.js`)

**Responsibility**: Verify JWT tokens for admin endpoints

**Interface**:
```javascript
verifyAdmin(req, res, next): void
```

**Behavior**:
1. Extract token from `Authorization: Bearer <token>` header
2. If no token: return 401 Unauthorized
3. Verify token using `JWT_SECRET`
4. If invalid/expired: return 403 Forbidden
5. If valid: attach decoded payload to `req.admin` and call `next()`

**Token Payload Structure**:
```javascript
{
  role: "admin",
  iat: <issued_at_timestamp>,
  exp: <expiration_timestamp>
}
```

### 5. Error Handling Middleware (`middleware/errorHandler.js`)

**Responsibility**: Centralized error handling

**Interface**:
```javascript
errorHandler(err, req, res, next): void
```

**Behavior**:
- Log error details to console
- Determine appropriate status code (400/401/403/404/500)
- In development: return full error stack
- In production: return generic error message
- Format response as JSON

**Error Response Format**:
```javascript
{
  success: false,
  error: "Error message",
  stack: "..." // Only in development
}
```

### 6. Message Routes (`routes/messages.js`)

**Responsibility**: Handle message-related API endpoints

#### POST `/api/messages`

**Purpose**: Create a new message

**Authentication**: None (public endpoint)

**Request Body**:
```javascript
{
  name?: string,  // Optional, max 50 chars
  text: string    // Required, max 500 chars
}
```

**Process Flow**:
1. Extract client IP from `req.ip` or `x-forwarded-for` header
2. Validate request body (express-validator)
3. Check if IP already sent a message (query database)
4. If duplicate IP: return 403 with error message
5. Create new message document with IP address
6. Save to database
7. Return 201 with saved message

**Response (Success - 201)**:
```javascript
{
  success: true,
  data: {
    _id: "...",
    name: "...",
    text: "...",
    timestamp: "...",
    ipAddress: "..."
  }
}
```

**Response (Error - 403)**:
```javascript
{
  success: false,
  error: "لقد قمت بإرسال رسالة من قبل"
}
```

#### GET `/api/messages`

**Purpose**: Retrieve all messages (admin only)

**Authentication**: Required (JWT token)

**Query Parameters**: None

**Process Flow**:
1. Verify admin token (middleware)
2. Query all messages from database
3. Sort by timestamp descending (newest first)
4. Return 200 with message array

**Response (Success - 200)**:
```javascript
{
  success: true,
  count: 42,
  data: [
    {
      _id: "...",
      name: "...",
      text: "...",
      timestamp: "...",
      ipAddress: "..."
    },
    ...
  ]
}
```

#### DELETE `/api/messages/:id`

**Purpose**: Delete a specific message (admin only)

**Authentication**: Required (JWT token)

**URL Parameters**: `id` - MongoDB ObjectId

**Process Flow**:
1. Verify admin token (middleware)
2. Validate message ID format
3. Find and delete message by ID
4. If not found: return 404
5. Return 200 with success message

**Response (Success - 200)**:
```javascript
{
  success: true,
  message: "تم حذف الرسالة بنجاح"
}
```

### 7. Admin Routes (`routes/admin.js`)

**Responsibility**: Handle admin authentication

#### POST `/api/admin/login`

**Purpose**: Authenticate admin and issue JWT token

**Authentication**: None

**Request Body**:
```javascript
{
  password: string
}
```

**Process Flow**:
1. Validate request body
2. Retrieve hashed password from environment variable
3. Compare provided password with hash using bcrypt
4. If invalid: return 401
5. If valid: generate JWT token with 24-hour expiration
6. Return 200 with token

**Response (Success - 200)**:
```javascript
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresIn: "24h"
}
```

**Response (Error - 401)**:
```javascript
{
  success: false,
  error: "كلمة السر غير صحيحة"
}
```

### 8. Validation Middleware

**Responsibility**: Validate request data using express-validator

**Message Creation Validation**:
```javascript
[
  body('text')
    .trim()
    .notEmpty().withMessage('نص الرسالة مطلوب')
    .isLength({ max: 500 }).withMessage('نص الرسالة يجب ألا يتجاوز 500 حرف'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('الاسم يجب ألا يتجاوز 50 حرف')
]
```

**Admin Login Validation**:
```javascript
[
  body('password')
    .notEmpty().withMessage('كلمة السر مطلوبة')
]
```

### 9. Security Middleware

**Components**:

1. **Helmet**: Sets security-related HTTP headers
2. **CORS**: Configured based on environment
   - Development: Allow all origins
   - Production: Whitelist specific frontend domain
3. **Rate Limiting**: Prevent spam/DoS attacks
   - Window: 15 minutes
   - Max requests: 100 per IP
   - Message: "تم تجاوز عدد الطلبات المسموح به"

## Data Models

### Message Document

**Collection Name**: `messages`

**Schema**:
```javascript
{
  _id: ObjectId,           // Auto-generated by MongoDB
  name: String,            // Optional, max 50 chars, trimmed
  text: String,            // Required, max 500 chars, trimmed
  timestamp: Date,         // Auto-set to current time
  ipAddress: String,       // Required, extracted from request
  __v: Number             // Mongoose version key
}
```

**Indexes**:
```javascript
{ ipAddress: 1 }  // For duplicate checking
{ timestamp: -1 } // For sorting
```

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "أحمد",
  "text": "مبروك التخرج! أتمنى لك مستقبلاً مشرقاً",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "ipAddress": "192.168.1.100",
  "__v": 0
}
```

### Environment Variables

**Required Variables**:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `PORT` | Number | Server port | `5000` |
| `MONGODB_URI` | String | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/graduation` |
| `ADMIN_PASSWORD_HASH` | String | Bcrypt hash of admin password | `$2a$10$...` |
| `JWT_SECRET` | String | Secret key for JWT signing | `your-secret-key-min-32-chars` |
| `NODE_ENV` | String | Environment mode | `development` or `production` |
| `FRONTEND_URL` | String | Frontend URL for CORS (production) | `https://graduation.example.com` |

**`.env.example` Template**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/graduation
ADMIN_PASSWORD_HASH=$2a$10$example_hash_here
JWT_SECRET=your-secret-key-at-least-32-characters-long
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Error Handling

### Error Categories

1. **Validation Errors (400)**
   - Missing required fields
   - Field length violations
   - Invalid data format

2. **Authentication Errors (401)**
   - Missing token
   - Invalid credentials

3. **Authorization Errors (403)**
   - Invalid/expired token
   - Duplicate message from same IP

4. **Not Found Errors (404)**
   - Message ID not found

5. **Server Errors (500)**
   - Database connection failures
   - Unexpected exceptions

### Error Response Format

**Standard Error Response**:
```javascript
{
  success: false,
  error: "Human-readable error message in Arabic",
  details: [...] // Optional: validation error details
}
```

**Validation Error Response**:
```javascript
{
  success: false,
  error: "خطأ في البيانات المدخلة",
  details: [
    {
      field: "text",
      message: "نص الرسالة مطلوب"
    }
  ]
}
```

### Error Handling Strategy

1. **Route-Level**: Try-catch blocks in async route handlers
2. **Middleware-Level**: Express error handling middleware
3. **Database-Level**: Mongoose error handling
4. **Validation-Level**: express-validator error formatting

**Example Route Error Handling**:
```javascript
router.post('/messages', async (req, res, next) => {
  try {
    // Route logic
  } catch (error) {
    next(error); // Pass to error middleware
  }
});
```

## Testing Strategy

### Testing Approach

This backend API is primarily focused on HTTP request/response handling, database operations, and authentication logic. The testing strategy will emphasize:

1. **Manual API Testing**: Using Postman or curl to verify endpoint behavior
2. **Integration Testing**: Testing the full request-response cycle with a test database
3. **Unit Testing**: Testing individual utility functions and middleware

Property-based testing is **not applicable** for this feature because:
- The system primarily handles HTTP I/O and database operations (external dependencies)
- Most logic is deterministic request validation and CRUD operations
- Behavior doesn't vary meaningfully across input ranges in ways that benefit from randomized testing
- The cost of setting up/tearing down database state for 100+ iterations is prohibitive

### Manual Testing Checklist

**Message Endpoints**:
- [ ] POST `/api/messages` with valid data returns 201
- [ ] POST `/api/messages` with empty text returns 400
- [ ] POST `/api/messages` with text > 500 chars returns 400
- [ ] POST `/api/messages` from same IP twice returns 403 on second attempt
- [ ] GET `/api/messages` without token returns 401
- [ ] GET `/api/messages` with valid token returns 200 and all messages
- [ ] DELETE `/api/messages/:id` without token returns 401
- [ ] DELETE `/api/messages/:id` with valid token and valid ID returns 200
- [ ] DELETE `/api/messages/:id` with invalid ID returns 404

**Admin Endpoints**:
- [ ] POST `/api/admin/login` with correct password returns 200 and token
- [ ] POST `/api/admin/login` with incorrect password returns 401
- [ ] Token expires after 24 hours

**Security & CORS**:
- [ ] CORS headers allow frontend origin
- [ ] Rate limiting blocks excessive requests
- [ ] Helmet sets security headers

**Database**:
- [ ] Messages persist across server restarts
- [ ] IP addresses are stored correctly
- [ ] Timestamps are set automatically

### Integration Test Structure

If implementing automated tests (optional), use:
- **Framework**: Jest or Mocha
- **HTTP Testing**: supertest
- **Database**: MongoDB Memory Server for isolated testing

**Example Test Structure**:
```javascript
describe('POST /api/messages', () => {
  it('should create a message with valid data', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send({ text: 'Test message', name: 'Test' })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.text).toBe('Test message');
  });

  it('should reject duplicate IP', async () => {
    // First message
    await request(app)
      .post('/api/messages')
      .send({ text: 'First message' })
      .expect(201);
    
    // Second message from same IP
    await request(app)
      .post('/api/messages')
      .send({ text: 'Second message' })
      .expect(403);
  });
});
```

### Unit Test Targets

**Testable Units**:
1. IP extraction utility function
2. Password hashing/comparison
3. JWT token generation/verification
4. Validation rules

**Example Unit Test**:
```javascript
describe('extractClientIP', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const req = {
      headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      ip: '127.0.0.1'
    };
    expect(extractClientIP(req)).toBe('192.168.1.1');
  });

  it('should fallback to req.ip', () => {
    const req = { ip: '127.0.0.1' };
    expect(extractClientIP(req)).toBe('127.0.0.1');
  });
});
```

## Implementation Notes

### Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Error handling
│   └── validation.js        # Request validation
├── models/
│   └── Message.js           # Mongoose schema
├── routes/
│   ├── admin.js             # Admin endpoints
│   └── messages.js          # Message endpoints
├── utils/
│   └── extractIP.js         # IP extraction utility
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
├── README.md                # Documentation
└── server.js                # Entry point
```

### Security Considerations

1. **Password Storage**: Admin password must be hashed with bcrypt before storing in environment variable
   ```bash
   # Generate hash
   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
   ```

2. **JWT Secret**: Use a strong random string (minimum 32 characters)
   ```bash
   # Generate secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **HTTPS**: Always use HTTPS in production to protect tokens in transit

4. **Environment Variables**: Never commit `.env` file to version control

5. **Input Sanitization**: express-validator automatically trims and escapes input

### IP Address Extraction

**Strategy**: Check multiple sources in order of priority

```javascript
function extractClientIP(req) {
  // 1. Check x-forwarded-for (proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // 2. Check x-real-ip (nginx)
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }
  
  // 3. Fallback to req.ip (direct connection)
  return req.ip;
}
```

**Note**: In development (localhost), all requests may appear from `::1` or `127.0.0.1`. Test IP limiting in production or use a proxy.

### CORS Configuration

**Development**:
```javascript
app.use(cors({
  origin: '*',
  credentials: true
}));
```

**Production**:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Database Connection Resilience

**Retry Logic**:
```javascript
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      retries++;
      console.error(`MongoDB connection attempt ${retries} failed:`, error.message);
      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};
```

### Graceful Shutdown

**Handle Process Signals**:
```javascript
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server gracefully...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

## Frontend Integration

### API Base URL Configuration

**Frontend should use environment-based URL**:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.graduation.example.com'
  : 'http://localhost:5000';
```

### Example Frontend Code Changes

**Before (localStorage)**:
```javascript
// Save message
localStorage.setItem('messages', JSON.stringify(messages));

// Load messages
const messages = JSON.parse(localStorage.getItem('messages') || '[]');
```

**After (API)**:
```javascript
// Save message
async function submitMessage(messageData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error submitting message:', error);
    throw error;
  }
}

// Load messages (admin only)
async function loadMessages() {
  try {
    const token = sessionStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load messages');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error loading messages:', error);
    throw error;
  }
}

// Admin login
async function adminLogin(password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const result = await response.json();
    sessionStorage.setItem('adminToken', result.token);
    return result.token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Delete message (admin only)
async function deleteMessage(messageId) {
  try {
    const token = sessionStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}
```

### Error Handling in Frontend

```javascript
// Display user-friendly error messages
function handleAPIError(error) {
  if (error.message.includes('لقد قمت بإرسال رسالة من قبل')) {
    alert('لقد قمت بإرسال رسالة من قبل. يمكنك إرسال رسالة واحدة فقط.');
  } else if (error.message.includes('401') || error.message.includes('403')) {
    alert('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
    sessionStorage.removeItem('adminToken');
  } else {
    alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
  }
}
```

## Deployment Guide

### Prerequisites

1. MongoDB Atlas account (or self-hosted MongoDB)
2. Hosting platform account (Heroku/Railway/Vercel)
3. Domain name (optional, for custom URL)

### MongoDB Atlas Setup

1. Create a new cluster
2. Create database user with read/write permissions
3. Whitelist IP addresses (or allow from anywhere: `0.0.0.0/0`)
4. Get connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>`

### Deployment Steps (Railway Example)

1. **Prepare Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create Railway Project**:
   - Connect GitHub repository
   - Select backend directory as root

3. **Configure Environment Variables**:
   - Add all variables from `.env.example`
   - Set `NODE_ENV=production`
   - Set `FRONTEND_URL` to your frontend domain

4. **Deploy**:
   - Railway auto-deploys on push
   - Note the generated API URL

5. **Update Frontend**:
   - Update `API_BASE_URL` to Railway URL
   - Redeploy frontend

### Health Check Endpoint

**Add to `server.js`**:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Monitoring

**Recommended Tools**:
- Railway/Heroku built-in logs
- MongoDB Atlas monitoring
- UptimeRobot for uptime monitoring
- Sentry for error tracking (optional)

## API Documentation Summary

### Base URL
- Development: `http://localhost:5000`
- Production: `https://your-api-domain.com`

### Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/messages` | No | Create a new message |
| GET | `/api/messages` | Yes | Get all messages (admin) |
| DELETE | `/api/messages/:id` | Yes | Delete a message (admin) |
| POST | `/api/admin/login` | No | Admin login |
| GET | `/health` | No | Health check |

### Authentication

**Admin endpoints require JWT token in header**:
```
Authorization: Bearer <token>
```

**Token obtained from**:
```
POST /api/admin/login
Body: { "password": "admin-password" }
```

### Rate Limiting

- 100 requests per 15 minutes per IP
- Applies to all endpoints

### Response Format

**Success**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Future Enhancements

**Potential Improvements** (out of scope for initial implementation):

1. **Message Moderation**: Flag/approve messages before display
2. **Rich Text**: Support for formatted text, emojis, or images
3. **Message Reactions**: Allow visitors to like/react to messages
4. **Analytics Dashboard**: View message statistics and trends
5. **Email Notifications**: Notify admin of new messages
6. **Message Search**: Search messages by text or name
7. **Pagination**: Limit messages per page for performance
8. **WebSocket Support**: Real-time message updates
9. **Multi-Admin Support**: Multiple admin accounts with roles
10. **Message Export**: Export messages to CSV/PDF

## Conclusion

This design provides a robust, secure, and scalable backend for the graduation messages website. The architecture follows REST API best practices, implements proper authentication and authorization, and includes comprehensive error handling. The system is designed to be easily deployable to modern cloud platforms while maintaining security and performance standards.
