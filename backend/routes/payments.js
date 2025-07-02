const express = require('express');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/history', protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.post('/create-intent', protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Payment intent created',
    data: { clientSecret: 'pi_test_123' }
  });
}));

module.exports = router; 