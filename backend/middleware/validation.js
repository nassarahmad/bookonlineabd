const { body, validationResult } = require('express-validator');

/**
 * Validation rules for message creation
 * Validates:
 * - text: required, non-empty after trimming, max 500 characters
 * - name: optional, max 50 characters
 */
const validateMessageCreation = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('نص الرسالة مطلوب')
    .isLength({ max: 500 })
    .withMessage('نص الرسالة يجب ألا يتجاوز 500 حرف'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('الاسم يجب ألا يتجاوز 50 حرف')
];

/**
 * Validation rules for admin login
 * Validates:
 * - password: required, non-empty
 */
const validateAdminLogin = [
  body('password')
    .notEmpty()
    .withMessage('كلمة السر مطلوبة')
];

/**
 * Middleware to handle validation errors
 * Returns 400 with array of validation errors if validation fails
 * Otherwise, passes control to next middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'خطأ في البيانات المدخلة',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

module.exports = {
  validateMessageCreation,
  validateAdminLogin,
  handleValidationErrors
};
