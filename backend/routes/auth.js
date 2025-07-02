const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Generate JWT Token
const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new patient
// @route   POST /api/auth/register/patient
// @access  Public
router.post('/register/patient', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth'),
  body('gender').isIn(['Female', 'Other']).withMessage('Gender must be Female or Other')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    dateOfBirth,
    gender,
    bloodGroup,
    address
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === email 
        ? 'User with this email already exists' 
        : 'User with this phone number already exists'
    });
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    dateOfBirth,
    gender,
    bloodGroup,
    address
  });

  // Generate token
  const token = generateToken(user._id, 'patient');

  res.status(201).json({
    success: true,
    message: 'Patient registered successfully',
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userType: 'patient'
    }
  });
}));

// @desc    Register a new doctor
// @route   POST /api/auth/register/doctor
// @access  Public
router.post('/register/doctor', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
  body('registrationNumber').notEmpty().withMessage('Medical registration number is required'),
  body('qualification').notEmpty().withMessage('Qualification is required'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a valid number'),
  body('currentHospital.name').notEmpty().withMessage('Hospital name is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    registrationNumber,
    qualification,
    specialization,
    experience,
    currentHospital,
    consultationFee,
    languages
  } = req.body;

  // Check if doctor already exists
  const existingDoctor = await Doctor.findOne({
    $or: [{ email }, { phone }, { registrationNumber }]
  });

  if (existingDoctor) {
    let message = 'Doctor already exists with this ';
    if (existingDoctor.email === email) message += 'email';
    else if (existingDoctor.phone === phone) message += 'phone number';
    else message += 'registration number';
    
    return res.status(400).json({
      success: false,
      message
    });
  }

  // Create doctor
  const doctor = await Doctor.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    registrationNumber,
    qualification,
    specialization,
    experience,
    currentHospital,
    consultationFee: consultationFee || { video: 500, phone: 300 },
    languages: languages || ['English', 'Hindi']
  });

  // Generate token
  const token = generateToken(doctor._id, 'doctor');

  res.status(201).json({
    success: true,
    message: 'Doctor registered successfully. Account is pending verification.',
    token,
    user: {
      id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone,
      userType: 'doctor',
      isVerified: doctor.isVerified,
      verificationStatus: doctor.verificationStatus
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('userType').isIn(['patient', 'doctor']).withMessage('User type must be patient or doctor')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password, userType } = req.body;

  // Find user based on type
  let user;
  if (userType === 'patient') {
    user = await User.findOne({ email }).select('+password');
  } else {
    user = await Doctor.findOne({ email }).select('+password');
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if account is locked
  if (user.isLocked) {
    return res.status(423).json({
      success: false,
      message: 'Account is temporarily locked due to multiple failed login attempts'
    });
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id, userType);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userType,
      ...(userType === 'doctor' && {
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus
      })
    }
  });
}));

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = req.user;
  
  res.json({
    success: true,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userType: req.userType,
      avatar: user.avatar,
      ...(req.userType === 'patient' && {
        dateOfBirth: user.dateOfBirth,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        address: user.address
      }),
      ...(req.userType === 'doctor' && {
        registrationNumber: user.registrationNumber,
        qualification: user.qualification,
        specialization: user.specialization,
        experience: user.experience,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        rating: user.rating,
        currentHospital: user.currentHospital
      })
    }
  });
}));

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('userType').isIn(['patient', 'doctor']).withMessage('User type must be patient or doctor')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, userType } = req.body;

  // Find user
  let user;
  if (userType === 'patient') {
    user = await User.findOne({ email });
  } else {
    user = await Doctor.findOne({ email });
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user found with this email address'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  // TODO: Send email with reset URL
  // For now, just return success (in production, you'd send an email)
  
  res.json({
    success: true,
    message: 'Password reset email sent',
    resetToken // Remove this in production
  });
}));

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
router.put('/reset-password/:resettoken', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['patient', 'doctor']).withMessage('User type must be patient or doctor')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const { password, userType } = req.body;

  // Find user by token
  let user;
  if (userType === 'patient') {
    user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
  } else {
    user = await Doctor.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
  }

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // Generate token
  const token = generateToken(user._id, userType);

  res.json({
    success: true,
    message: 'Password reset successful',
    token
  });
}));

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
router.put('/update-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  let user;
  if (req.userType === 'patient') {
    user = await User.findById(req.user._id).select('+password');
  } else {
    user = await Doctor.findById(req.user._id).select('+password');
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id, req.userType);

  res.json({
    success: true,
    message: 'Password updated successfully',
    token
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just return a success message
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

module.exports = router; 