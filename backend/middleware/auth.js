const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Determine user type and get user
    let user;
    if (decoded.userType === 'patient') {
      user = await User.findById(decoded.id).select('-password');
    } else if (decoded.userType === 'doctor') {
      user = await Doctor.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if account is locked (for patients)
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.'
      });
    }

    // Add user info to request
    req.user = user;
    req.userType = decoded.userType;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userType || !roles.includes(req.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

// Check if user is verified doctor
const verifiedDoctor = async (req, res, next) => {
  try {
    if (req.userType !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor access required.'
      });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor verification required.'
      });
    }

    next();
  } catch (error) {
    console.error('Verified doctor middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification check'
    });
  }
};

// Check if user owns the resource
const checkOwnership = (resourceModel, resourceField = '_id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params[resourceField];
      let resource;

      // Get the resource
      if (resourceModel === 'User') {
        resource = await User.findById(resourceId);
      } else if (resourceModel === 'Doctor') {
        resource = await Doctor.findById(resourceId);
      } else {
        // For other models, dynamically require them
        const Model = require(`../models/${resourceModel}`);
        resource = await Model.findById(resourceId);
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check ownership based on user type
      let hasAccess = false;

      if (req.userType === 'patient') {
        // For patients, check if they own the resource or are referenced in it
        if (resource.patient && resource.patient.toString() === req.user._id.toString()) {
          hasAccess = true;
        } else if (resourceModel === 'User' && resource._id.toString() === req.user._id.toString()) {
          hasAccess = true;
        }
      } else if (req.userType === 'doctor') {
        // For doctors, check if they own the resource or are referenced in it
        if (resource.doctor && resource.doctor.toString() === req.user._id.toString()) {
          hasAccess = true;
        } else if (resourceModel === 'Doctor' && resource._id.toString() === req.user._id.toString()) {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.'
        });
      }

      // Add resource to request for further use
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during ownership check'
      });
    }
  };
};

// Optional authentication (for public routes that benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        let user;
        if (decoded.userType === 'patient') {
          user = await User.findById(decoded.id).select('-password');
        } else if (decoded.userType === 'doctor') {
          user = await Doctor.findById(decoded.id).select('-password');
        }

        if (user && user.isActive) {
          req.user = user;
          req.userType = decoded.userType;
        }
      } catch (error) {
        // Silently fail for optional auth
        console.log('Optional auth failed:', error.message);
      }
    }

    next();
  } catch (error) {
    // Silently fail and continue
    next();
  }
};

// Check if user has completed profile
const requireCompleteProfile = (req, res, next) => {
  if (req.userType === 'patient') {
    if (!req.user.dateOfBirth || !req.user.phone || !req.user.gender) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile before accessing this feature.'
      });
    }
  } else if (req.userType === 'doctor') {
    if (!req.user.registrationNumber || !req.user.qualification || !req.user.currentHospital) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your professional profile before accessing this feature.'
      });
    }
  }
  next();
};

// Rate limiting per user
const userRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.user) return next();
    
    const key = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    // Remove old requests
    while (userRequests.length > 0 && userRequests[0] < windowStart) {
      userRequests.shift();
    }
    
    if (userRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }
    
    userRequests.push(now);
    next();
  };
};

module.exports = {
  protect,
  authorize,
  verifiedDoctor,
  checkOwnership,
  optionalAuth,
  requireCompleteProfile,
  userRateLimit
}; 