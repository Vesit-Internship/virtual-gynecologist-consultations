const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get all doctors with filtering, sorting, and pagination
// @route   GET /api/doctors
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('specialization').optional().isString(),
  query('city').optional().isString(),
  query('minRating').optional().isFloat({ min: 0, max: 5 }),
  query('maxFee').optional().isInt({ min: 0 }),
  query('experience').optional().isInt({ min: 0 }),
  query('language').optional().isString(),
  query('sortBy').optional().isIn(['rating', 'experience', 'fee', 'name']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], optionalAuth, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build filter object
  const filter = {
    isActive: true,
    isVerified: true
  };

  if (req.query.specialization) {
    filter.specialization = { $regex: req.query.specialization, $options: 'i' };
  }

  if (req.query.city) {
    filter['currentHospital.address.city'] = { $regex: req.query.city, $options: 'i' };
  }

  if (req.query.minRating) {
    filter['rating.average'] = { $gte: parseFloat(req.query.minRating) };
  }

  if (req.query.maxFee) {
    filter['consultationFee.video'] = { $lte: parseInt(req.query.maxFee, 10) };
  }

  if (req.query.experience) {
    filter.experience = { $gte: parseInt(req.query.experience, 10) };
  }

  if (req.query.language) {
    filter.languages = { $in: [req.query.language] };
  }

  // Build sort object
  let sort = {};
  const sortBy = req.query.sortBy || 'rating';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  switch (sortBy) {
    case 'rating':
      sort = { 'rating.average': sortOrder };
      break;
    case 'experience':
      sort = { experience: sortOrder };
      break;
    case 'fee':
      sort = { 'consultationFee.video': sortOrder };
      break;
    case 'name':
      sort = { firstName: sortOrder };
      break;
    default:
      sort = { 'rating.average': -1 };
  }

  // Execute query
  const doctors = await Doctor.find(filter)
    .select('-password -bankDetails -verificationDocuments')
    .sort(sort)
    .limit(limit)
    .skip(startIndex)
    .populate('reviews.user', 'firstName lastName');

  // Get total count for pagination
  const total = await Doctor.countDocuments(filter);

  // Pagination info
  const pagination = {
    current: page,
    total: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };

  res.json({
    success: true,
    count: doctors.length,
    total,
    pagination,
    data: doctors
  });
}));

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .select('-password -bankDetails')
    .populate('reviews.user', 'firstName lastName avatar');

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }

  if (!doctor.isActive || !doctor.isVerified) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not available'
    });
  }

  res.json({
    success: true,
    data: doctor
  });
}));

// @desc    Get doctor availability
// @route   GET /api/doctors/:id/availability
// @access  Public
router.get('/:id/availability', asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .select('availability consultationDuration firstName lastName');

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }

  // Get date range (next 7 days by default)
  const startDate = new Date(req.query.startDate || Date.now());
  const endDate = new Date(req.query.endDate || Date.now() + 7 * 24 * 60 * 60 * 1000);

  // TODO: Implement availability calculation considering existing appointments
  // For now, return the basic availability schedule

  res.json({
    success: true,
    data: {
      doctorId: doctor._id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      availability: doctor.availability,
      consultationDuration: doctor.consultationDuration,
      dateRange: {
        start: startDate,
        end: endDate
      }
    }
  });
}));

// @desc    Search doctors
// @route   GET /api/doctors/search
// @access  Public
router.get('/search/query', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], optionalAuth, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { q } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Create search regex
  const searchRegex = { $regex: q, $options: 'i' };

  // Build search query
  const searchQuery = {
    $and: [
      { isActive: true, isVerified: true },
      {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { specialization: searchRegex },
          { 'currentHospital.name': searchRegex },
          { 'currentHospital.address.city': searchRegex },
          { qualification: searchRegex },
          { subSpecialties: { $in: [searchRegex] } }
        ]
      }
    ]
  };

  const doctors = await Doctor.find(searchQuery)
    .select('-password -bankDetails -verificationDocuments')
    .sort({ 'rating.average': -1 })
    .limit(limit)
    .skip(startIndex);

  const total = await Doctor.countDocuments(searchQuery);

  res.json({
    success: true,
    count: doctors.length,
    total,
    data: doctors,
    query: q
  });
}));

// @desc    Get specializations
// @route   GET /api/doctors/specializations
// @access  Public
router.get('/meta/specializations', asyncHandler(async (req, res) => {
  const specializations = await Doctor.distinct('specialization', {
    isActive: true,
    isVerified: true
  });

  res.json({
    success: true,
    data: specializations
  });
}));

// @desc    Get cities where doctors are available
// @route   GET /api/doctors/cities
// @access  Public
router.get('/meta/cities', asyncHandler(async (req, res) => {
  const cities = await Doctor.distinct('currentHospital.address.city', {
    isActive: true,
    isVerified: true
  });

  res.json({
    success: true,
    data: cities.filter(city => city) // Remove null values
  });
}));

// @desc    Add review for doctor
// @route   POST /api/doctors/:id/reviews
// @access  Private (Patient only)
router.post('/:id/reviews', protect, authorize('patient'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }

  // Check if user has already reviewed this doctor
  const existingReview = doctor.reviews.find(
    review => review.user.toString() === req.user._id.toString()
  );

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this doctor'
    });
  }

  // TODO: Check if user has had an appointment with this doctor

  // Add review
  const review = {
    user: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment
  };

  doctor.reviews.push(review);
  
  // Recalculate average rating
  doctor.calculateAverageRating();
  
  await doctor.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: review
  });
}));

// @desc    Get doctor reviews
// @route   GET /api/doctors/:id/reviews
// @access  Public
router.get('/:id/reviews', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const doctor = await Doctor.findById(req.params.id)
    .select('reviews firstName lastName')
    .populate({
      path: 'reviews.user',
      select: 'firstName lastName avatar'
    });

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }

  // Sort reviews by date (newest first) and paginate
  const sortedReviews = doctor.reviews
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(startIndex, startIndex + limit);

  const total = doctor.reviews.length;

  res.json({
    success: true,
    count: sortedReviews.length,
    total,
    data: {
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      reviews: sortedReviews
    }
  });
}));

// @desc    Get doctor statistics
// @route   GET /api/doctors/:id/stats
// @access  Public
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .select('rating totalConsultations totalPatients responseTime experience joinDate');

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }

  // Calculate additional stats
  const yearsOfService = Math.floor((Date.now() - doctor.joinDate) / (365.25 * 24 * 60 * 60 * 1000));
  
  res.json({
    success: true,
    data: {
      rating: doctor.rating,
      totalConsultations: doctor.totalConsultations,
      totalPatients: doctor.totalPatients,
      responseTime: doctor.responseTime,
      experience: doctor.experience,
      yearsOfService,
      joinDate: doctor.joinDate
    }
  });
}));

module.exports = router; 