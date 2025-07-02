const express = require('express');
const Prescription = require('../models/Prescription');
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

  const prescriptions = await Prescription.find(filter)
    .populate('patient', 'firstName lastName')
    .populate('doctor', 'firstName lastName')
    .sort({ dateIssued: -1 });

  res.json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
}));

module.exports = router; 