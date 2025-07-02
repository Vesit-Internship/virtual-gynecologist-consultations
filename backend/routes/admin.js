const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Admin dashboard',
    data: {
      totalUsers: 0,
      totalDoctors: 0,
      totalAppointments: 0
    }
  });
}));

module.exports = router; 