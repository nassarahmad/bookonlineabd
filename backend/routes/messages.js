const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const { verifyAdmin } = require('../middleware/auth');
const extractClientIP = require('../utils/extractIP');

const router = express.Router();

/**
 * POST /api/messages
 * Create a new message
 * 
 * Request body:
 * - text: string (required, max 500 chars)
 * - name: string (optional, max 50 chars)
 * 
 * Response:
 * - 201: { success: true, message: object }
 * - 400: { success: false, errors: array } (validation error)
 */
router.post(
  '/',
  [
    body('text')
      .notEmpty()
      .withMessage('Text is required')
      .isLength({ max: 500 })
      .withMessage('Text must not exceed 500 characters'),
    body('name')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Name must not exceed 50 characters')
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

      // Extract client IP
      const ipAddress = extractClientIP(req);

      // لا نتحقق من IP - السماح بإرسال رسائل متعددة
      // تم إلغاء: Check if IP already sent a message

      // Create new message
      const message = new Message({
        text: req.body.text,
        name: req.body.name || undefined,
        ipAddress
      });

      await message.save();

      res.status(201).json({
        success: true,
        message: {
          id: message._id,
          text: message.text,
          name: message.name,
          timestamp: message.timestamp
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/messages
 * Get all messages (admin only)
 * 
 * Response:
 * - 200: { success: true, count: number, messages: array }
 * - 401: { success: false, error: string } (no token)
 * - 403: { success: false, error: string } (invalid token)
 */
router.get('/', verifyAdmin, async (req, res, next) => {
  try {
    // Query all messages, sorted by timestamp descending
    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .select('-ipAddress -__v');

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/messages/:id
 * Delete a message by ID (admin only)
 * 
 * Response:
 * - 200: { success: true, message: string }
 * - 404: { success: false, error: string } (message not found)
 * - 401: { success: false, error: string } (no token)
 * - 403: { success: false, error: string } (invalid token)
 */
router.delete('/:id', verifyAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid message ID format'
      });
    }

    // Find and delete message
    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
