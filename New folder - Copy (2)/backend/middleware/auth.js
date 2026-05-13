const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token for admin authentication
 * Extracts token from Authorization header and validates it
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyAdmin = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'لا يوجد رمز مصادقة'
      });
    }
    
    // Check if header follows "Bearer <token>" format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'صيغة رمز المصادقة غير صحيحة'
      });
    }
    
    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);
    
    // Check if token is empty
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'رمز المصادقة مطلوب'
      });
    }
    
    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded payload to request object
    req.admin = decoded;
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle JWT verification errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'رمز المصادقة غير صالح'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'انتهت صلاحية رمز المصادقة'
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      success: false,
      error: 'خطأ في التحقق من المصادقة'
    });
  }
};

module.exports = { verifyAdmin };
