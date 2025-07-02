const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const filter = {};
  
  if (req.userType === 'patient') {
    filter.patient = req.user._id;
  } else if (req.userType === 'doctor') {
    filter.doctor = req.user._id;
  }

  const appointments = await Appointment.find(filter)
    .populate('patient', 'firstName lastName phone')
    .populate('doctor', 'firstName lastName specialization')
    .sort({ scheduledDateTime: -1 });

  res.json({
    success: true,
    count: appointments.length,
    data: appointments
  });
}));

// @desc    Book new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
router.post('/', protect, authorize('patient'), [
  body('doctor').notEmpty().withMessage('Doctor is required'),
  body('scheduledDateTime').notEmpty().withMessage('Scheduled date and time is required'),
  body('type').notEmpty().withMessage('Appointment type is required'),
  body('consultationMode').isIn(['video', 'phone']).withMessage('Consultation mode must be video or phone')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const appointmentData = {
    patient: req.user._id,
    ...req.body
  };

  const appointment = await Appointment.create(appointmentData);
  await appointment.populate('doctor', 'firstName lastName specialization consultationFee');

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: appointment
  });
}));

module.exports = router; 