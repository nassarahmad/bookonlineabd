const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * POST /api/admin/login
 * Admin login endpoint
 * 
 * Request body:
 * - password: string (required)
 * 
 * Response:
 * - 200: { success: true, token: string, expiresIn: string }
 * - 401: { success: false, error: string }
 * - 400: { success: false, errors: array }
 */
router.post(
  '/login',
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { password } = req.body;

      // Get hashed password from environment
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
      
      if (!adminPasswordHash) {
        return res.status(500).json({
          success: false,
          error: 'Server configuration error'
        });
      }

      // Compare password with hash
      const isMatch = await bcrypt.compare(password, adminPasswordHash);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password'
        });
      }

      // Generate JWT token with 24-hour expiration
      const token = jwt.sign(
        { role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        token,
        expiresIn: '24h'
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
