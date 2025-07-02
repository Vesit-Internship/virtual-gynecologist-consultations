const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(`Error: ${err.message}`);
  
  // Log full error in development
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    
    // Extract field name from error
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    if (field === 'email') {
      message = `Email ${value} is already registered`;
    } else if (field === 'phone') {
      message = `Phone number ${value} is already registered`;
    } else if (field === 'registrationNumber') {
      message = `Registration number ${value} is already registered`;
    } else {
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
    
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Maximum size allowed is 10MB';
    error = {
      message,
      statusCode: 413
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files uploaded';
    error = {
      message,
      statusCode: 413
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = {
      message,
      statusCode: 400
    };
  }

  // Stripe payment errors
  if (err.type && err.type.startsWith('Stripe')) {
    let message = 'Payment processing error';
    
    switch (err.type) {
      case 'StripeCardError':
        message = err.message || 'Your card was declined';
        break;
      case 'StripeRateLimitError':
        message = 'Too many requests to payment processor';
        break;
      case 'StripeInvalidRequestError':
        message = 'Invalid payment request';
        break;
      case 'StripeAPIError':
        message = 'Payment service temporarily unavailable';
        break;
      case 'StripeConnectionError':
        message = 'Network error during payment processing';
        break;
      case 'StripeAuthenticationError':
        message = 'Payment authentication failed';
        break;
      default:
        message = 'Payment processing error';
    }
    
    error = {
      message,
      statusCode: 400
    };
  }

  // Rate limiting errors
  if (err.message && err.message.includes('rate limit')) {
    error = {
      message: 'Too many requests. Please try again later.',
      statusCode: 429
    };
  }

  // Database connection errors
  if (err.message && err.message.includes('ECONNREFUSED')) {
    error = {
      message: 'Database connection failed',
      statusCode: 503
    };
  }

  // Timeout errors
  if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
    error = {
      message: 'Request timeout. Please try again.',
      statusCode: 408
    };
  }

  // Permission errors
  if (err.code === 'EACCES' || err.code === 'EPERM') {
    error = {
      message: 'Permission denied',
      statusCode: 403
    };
  }

  // Disk space errors
  if (err.code === 'ENOSPC') {
    error = {
      message: 'Insufficient storage space',
      statusCode: 507
    };
  }

  // Custom application errors
  if (err.name === 'AppError') {
    error = {
      message: err.message,
      statusCode: err.statusCode || 500
    };
  }

  // Send response
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  });
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Validation error formatter
const formatValidationError = (errors) => {
  const formattedErrors = {};
  
  Object.keys(errors).forEach(key => {
    if (errors[key].message) {
      formattedErrors[key] = errors[key].message;
    }
  });
  
  return formattedErrors;
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

module.exports = {
  errorHandler,
  AppError,
  asyncHandler,
  notFound,
  formatValidationError
}; 