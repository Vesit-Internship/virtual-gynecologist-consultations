const express = require('express');
const VideoCall = require('../models/VideoCall');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/', protect, asyncHandler(async (req, res) => {
  const filter = {};
  if (req.userType === 'patient') {
    filter.patient = req.user._id;
  } else if (req.userType === 'doctor') {
    filter.doctor = req.user._id;
  }

  const calls = await VideoCall.find(filter)
    .populate('patient', 'firstName lastName')
    .populate('doctor', 'firstName lastName')
    .sort({ scheduledStartTime: -1 });

  res.json({
    success: true,
    data: calls
  });
}));

module.exports = router; 