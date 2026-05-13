const mongoose = require('mongoose');

// Define Message schema
const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'الاسم يجب ألا يتجاوز 50 حرف'],
    required: false
  },
  text: {
    type: String,
    required: [true, 'نص الرسالة مطلوب'],
    trim: true,
    maxlength: [500, 'نص الرسالة يجب ألا يتجاوز 500 حرف']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  ipAddress: {
    type: String,
    required: [true, 'عنوان IP مطلوب']
  }
});

// Create indexes for efficient querying
messageSchema.index({ ipAddress: 1 });
messageSchema.index({ timestamp: -1 }); // For sorting messages by date (descending)

// Export Mongoose model
module.exports = mongoose.model('Message', messageSchema);
