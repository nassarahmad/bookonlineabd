# Implementation Plan: Graduation Messages Backend

## Overview

This implementation plan converts the design for a Node.js/Express REST API backend with MongoDB into discrete coding tasks. The backend replaces localStorage-based message storage with persistent database storage, implements IP-based rate limiting, and provides JWT-based admin authentication. Each task builds incrementally, with testing integrated throughout to validate functionality early.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create `backend` directory with subdirectories: `config`, `models`, `routes`, `middleware`, `utils`
  - Initialize npm project with `package.json`
  - Install dependencies: express, mongoose, cors, dotenv, jsonwebtoken, bcryptjs, helmet, express-rate-limit, express-validator
  - Install dev dependencies: nodemon
  - Create `.env.example` file with all required environment variables
  - Create `.gitignore` to exclude `node_modules` and `.env`
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [x] 2. Implement database configuration
  - [x] 2.1 Create MongoDB connection module (`config/database.js`)
    - Implement `connectDB()` function with Mongoose connection logic
    - Add retry logic for connection failures (max 5 retries with 5-second delays)
    - Read `MONGODB_URI` from environment variables
    - Log connection success/failure messages
    - Exit process on connection failure after max retries
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Define Message model and schema
  - [x] 3.1 Create Message schema (`models/Message.js`)
    - Define schema with fields: name (String, optional, max 50 chars), text (String, required, max 500 chars), timestamp (Date, default now), ipAddress (String, required)
    - Add validation rules for field lengths
    - Create indexes on `ipAddress` and `timestamp` fields
    - Export Mongoose model
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4. Implement authentication middleware
  - [-] 4.1 Create JWT verification middleware (`middleware/auth.js`)
    - Implement `verifyAdmin()` function to extract and verify JWT tokens
    - Extract token from `Authorization: Bearer <token>` header
    - Return 401 if token is missing
    - Return 403 if token is invalid or expired
    - Attach decoded payload to `req.admin` if valid
    - Use `JWT_SECRET` from environment variables
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 5. Implement error handling middleware
  - [-] 5.1 Create centralized error handler (`middleware/errorHandler.js`)
    - Implement `errorHandler(err, req, res, next)` function
    - Log error details to console
    - Determine appropriate status code based on error type
    - Return full stack trace in development mode
    - Return generic error message in production mode
    - Format response as JSON with `success: false` and `error` message
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 6. Implement validation middleware
  - [-] 6.1 Create validation rules (`middleware/validation.js`)
    - Define validation rules for message creation (text required, max 500 chars; name optional, max 50 chars)
    - Define validation rules for admin login (password required)
    - Use express-validator for validation logic
    - Return 400 with validation error array when validation fails
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [ ] 7. Implement IP extraction utility
  - [ ] 7.1 Create IP extraction function (`utils/extractIP.js`)
    - Implement function to extract client IP from request
    - Check `x-forwarded-for` header first (for proxies/load balancers)
    - Check `x-real-ip` header second (for nginx)
    - Fallback to `req.ip` for direct connections
    - Return first IP from comma-separated list in `x-forwarded-for`
    - _Requirements: 10.5_

- [ ] 8. Implement admin authentication routes
  - [~] 8.1 Create admin routes (`routes/admin.js`)
    - Implement POST `/api/admin/login` endpoint
    - Validate request body using validation middleware
    - Read hashed admin password from environment variable
    - Compare provided password with hash using bcrypt
    - Return 401 if password is incorrect
    - Generate JWT token with 24-hour expiration if password is correct
    - Return 200 with token and expiration info
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 8.2 Write unit tests for admin login
    - Test successful login with correct password
    - Test failed login with incorrect password
    - Test validation error with missing password
    - Test JWT token structure and expiration

- [ ] 9. Implement message routes
  - [~] 9.1 Create message routes (`routes/messages.js`)
    - Implement POST `/api/messages` endpoint for creating messages
    - Extract client IP using IP extraction utility
    - Validate request body using validation middleware
    - Check database for existing message from same IP
    - Return 403 if IP already sent a message
    - Save new message to database with IP address
    - Return 201 with saved message data
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 10.1, 10.2, 10.3, 10.4_

  - [~] 9.2 Implement GET `/api/messages` endpoint (admin only)
    - Apply `verifyAdmin` middleware to protect endpoint
    - Query all messages from database
    - Sort messages by timestamp descending (newest first)
    - Return 200 with message array and count
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [~] 9.3 Implement DELETE `/api/messages/:id` endpoint (admin only)
    - Apply `verifyAdmin` middleware to protect endpoint
    - Validate message ID format
    - Find and delete message by ID
    - Return 404 if message not found
    - Return 200 with success message if deleted
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 9.4 Write integration tests for message endpoints
    - Test POST with valid data returns 201
    - Test POST with empty text returns 400
    - Test POST with text > 500 chars returns 400
    - Test POST from same IP twice returns 403 on second attempt
    - Test GET without token returns 401
    - Test GET with valid token returns 200 and all messages
    - Test DELETE without token returns 401
    - Test DELETE with valid token and valid ID returns 200
    - Test DELETE with invalid ID returns 404

- [ ] 10. Implement server entry point
  - [~] 10.1 Create main server file (`server.js`)
    - Load environment variables using dotenv
    - Validate required environment variables (PORT, MONGODB_URI, ADMIN_PASSWORD_HASH, JWT_SECRET, NODE_ENV)
    - Exit with error message if required variables are missing
    - Initialize Express app
    - Configure security middleware (helmet)
    - Configure CORS middleware (allow all origins in development, whitelist specific domain in production)
    - Configure rate limiting (100 requests per 15 minutes per IP)
    - Configure body parser middleware (express.json())
    - Connect to MongoDB using database config
    - Mount admin routes at `/api/admin`
    - Mount message routes at `/api/messages`
    - Add health check endpoint at `/health`
    - Mount error handling middleware last
    - Start HTTP server on configured port
    - Log server start message with port number
    - Handle graceful shutdown on SIGTERM signal
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.2, 9.3, 9.4, 9.5, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

- [~] 11. Checkpoint - Test API endpoints manually
  - Test all endpoints using Postman or curl
  - Verify POST `/api/messages` with valid data
  - Verify POST `/api/messages` rejects duplicate IP
  - Verify POST `/api/admin/login` with correct and incorrect passwords
  - Verify GET `/api/messages` requires authentication
  - Verify DELETE `/api/messages/:id` requires authentication
  - Verify CORS headers are present
  - Verify rate limiting works
  - Ensure all tests pass, ask the user if questions arise
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

- [ ] 12. Create API documentation
  - [~] 12.1 Write comprehensive README.md
    - Add project overview and technology stack
    - Document all API endpoints with HTTP methods, authentication requirements, request/response formats
    - Provide example requests and responses for each endpoint
    - Explain environment variable setup with `.env.example` reference
    - Add instructions for running in development mode (npm run dev)
    - Add instructions for running in production mode (npm start)
    - Document authentication flow and how to obtain admin token
    - Include security considerations and best practices
    - Add deployment instructions for Heroku/Railway/Vercel
    - Document MongoDB Atlas setup steps
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 20.6_

- [ ] 13. Prepare for deployment
  - [~] 13.1 Set up MongoDB Atlas cluster
    - Create MongoDB Atlas account and cluster
    - Create database user with read/write permissions
    - Whitelist IP addresses (0.0.0.0/0 for all IPs)
    - Get connection string and update environment variables
    - _Requirements: 20.2_

  - [~] 13.2 Configure deployment platform
    - Choose deployment platform (Heroku/Railway/Vercel)
    - Create new project and connect repository
    - Configure environment variables on platform
    - Set NODE_ENV to production
    - Generate and set strong JWT_SECRET (32+ characters)
    - Generate and set ADMIN_PASSWORD_HASH using bcrypt
    - Set FRONTEND_URL to production frontend domain
    - _Requirements: 20.1, 20.3_

  - [~] 13.3 Deploy and verify
    - Deploy backend to chosen platform
    - Note the generated API URL
    - Test all endpoints in production environment
    - Verify database connection works
    - Verify CORS allows frontend domain
    - _Requirements: 20.4, 20.5_

- [ ] 14. Update frontend integration
  - [~] 14.1 Modify frontend to use API instead of localStorage
    - Replace `localStorage.setItem` with fetch POST to `/api/messages`
    - Replace `localStorage.getItem` with fetch GET to `/api/messages`
    - Store admin token in sessionStorage after login
    - Send admin token in Authorization header for protected endpoints
    - Handle success responses (display success message)
    - Handle error responses (display appropriate error messages in Arabic)
    - Handle network errors gracefully
    - Update API base URL to point to production API
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 20.4_

  - [ ]* 14.2 Test frontend-backend integration
    - Test message submission from frontend
    - Test duplicate message prevention
    - Test admin login flow
    - Test message display for admin
    - Test message deletion for admin
    - Test error handling for network failures

- [~] 15. Final checkpoint - End-to-end verification
  - Verify complete flow: visitor submits message → message saved to database → admin logs in → admin views messages → admin deletes message
  - Verify IP-based rate limiting prevents duplicate messages
  - Verify authentication protects admin endpoints
  - Verify all error cases display appropriate messages
  - Verify deployment is stable and accessible
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation uses JavaScript/Node.js as specified in the design document
- Checkpoints ensure incremental validation of functionality
- Testing tasks are integrated as sub-tasks to catch errors early
- The project follows REST API best practices and security standards
- Environment variables must be configured before running the server
- MongoDB Atlas is recommended for production database hosting
- HTTPS should be used in production to protect JWT tokens in transit

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["4.1", "5.1", "6.1", "7.1"] },
    { "id": 3, "tasks": ["8.1", "8.2"] },
    { "id": 4, "tasks": ["9.1"] },
    { "id": 5, "tasks": ["9.2", "9.3"] },
    { "id": 6, "tasks": ["9.4", "10.1"] },
    { "id": 7, "tasks": ["12.1", "13.1"] },
    { "id": 8, "tasks": ["13.2"] },
    { "id": 9, "tasks": ["13.3", "14.1"] },
    { "id": 10, "tasks": ["14.2"] }
  ]
}
```
