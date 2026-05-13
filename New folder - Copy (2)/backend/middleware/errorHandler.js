/**
 * Centralized Error Handling Middleware
 * 
 * This middleware catches all errors thrown in the application and formats
 * them into consistent JSON responses. It handles different error types and
 * adjusts the response based on the environment (development vs production).
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

/**
 * Error handler middleware function
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Requirement 13.3: Log error details to console
  console.error('Error occurred:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Timestamp:', new Date().toISOString());

  // Requirement 13.6: Determine appropriate status code based on error type
  let statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
  } else if (err.name === 'CastError') {
    // Invalid MongoDB ObjectId
    statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    // Invalid JWT token
    statusCode = 403;
  } else if (err.name === 'TokenExpiredError') {
    // Expired JWT token
    statusCode = 403;
  } else if (err.name === 'UnauthorizedError') {
    // Unauthorized access
    statusCode = 401;
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    error: err.message || 'حدث خطأ في الخادم'
  };

  // Requirement 13.4: Return full stack trace in development mode
  // Requirement 13.5: Return generic error message in production mode
  if (process.env.NODE_ENV === 'development') {
    // In development, include full error details and stack trace
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || null;
  } else {
    // In production, sanitize error messages for security
    // Don't expose internal error details to clients
    if (statusCode === 500) {
      errorResponse.error = 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً';
    }
  }

  // Requirement 13.6: Format response as JSON with success: false and error message
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
