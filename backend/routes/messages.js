const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/conversations', protect, asyncHandler(async (req, res) => {
  const filter = {};
  if (req.userType === 'patient') {
    filter['conversation.patient'] = req.user._id;
  } else if (req.userType === 'doctor') {
    filter['conversation.doctor'] = req.user._id;
  }

  const messages = await Message.find(filter)
    .sort({ sentAt: -1 })
    .limit(50);

  res.json({
    success: true,
    data: messages
  });
}));

module.exports = router; 