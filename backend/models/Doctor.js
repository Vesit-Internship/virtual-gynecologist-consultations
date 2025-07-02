const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  
  // Professional Information
  registrationNumber: {
    type: String,
    required: [true, 'Medical registration number is required'],
    unique: true,
    uppercase: true
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'Gynecologist & Obstetrician',
      'Women\'s Health Specialist', 
      'Maternal & Fetal Medicine',
      'Reproductive Endocrinology',
      'Gynecologic Oncology',
      'Adolescent Gynecology',
      'Urogynecology'
    ]
  },
  subSpecialties: [{
    type: String,
    enum: [
      'High-Risk Pregnancy',
      'Infertility Treatment',
      'Menopause Management',
      'PCOS Treatment',
      'Prenatal Care',
      'Family Planning',
      'Contraception Counseling',
      'Sexual Health',
      'Breast Health',
      'Cervical Screening'
    ]
  }],
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  
  // Hospital/Clinic Information
  currentHospital: {
    name: {
      type: String,
      required: [true, 'Hospital name is required']
    },
    address: {
      street: String,
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pincode: {
        type: String,
        required: true,
        match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
      }
    },
    department: String
  },
  
  // Additional Affiliations
  hospitalAffiliations: [{
    name: String,
    role: String,
    startDate: Date,
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    }
  }],
  
  // Education
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    grade: String
  }],
  
  // Certifications
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuedBy: {
      type: String,
      required: true
    },
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  
  // Languages
  languages: [{
    type: String,
    enum: ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Assamese', 'Odia']
  }],
  
  // Availability
  availability: {
    monday: [{
      startTime: String,
      endTime: String,
      consultationType: {
        type: String,
        enum: ['video', 'phone', 'both'],
        default: 'both'
      }
    }],
    tuesday: [{
      startTime: String,
      endTime: String,
      consultationType: {
        type: String,
        enum: ['video', 'phone', 'both'],
        default: 'both'
      }
    }],
    wednesday: [{
      startTime: String,
      endTime: String,
      consultationType: {
        type: String,
        enum: ['video', 'phone', 'both'],
        default: 'both'
      }
    }],
    thursday: [{
      startTime: String,
      endTime: String,
      consultationType: {
        type: String,
        enum: ['video', 'phone', 'both'],
        default: 'both'
      }
    }],
    friday: [{
      startTime: String,
      endTime: String,
      consultationType: {
        type: String,
        enum: ['video', 'phone', 'both'],
        default: 'both'
      }
    }],
    saturday: [{
      startTime: String,
      endTime: String,
      consultationType: {
        type: String,
        enum: ['video', 'phone', 'both'],
        default: 'both'
      }
    }],
    sunday: [{
      startTime: String,
      endTime: String,
      consultationType: {
        type: String,
        enum: ['video', 'phone', 'both'],
        default: 'both'
      }
    }]
  },
  
  // Consultation Details
  consultationFee: {
    video: {
      type: Number,
      required: [true, 'Video consultation fee is required'],
      min: [100, 'Fee cannot be less than ₹100']
    },
    phone: {
      type: Number,
      required: [true, 'Phone consultation fee is required'],
      min: [100, 'Fee cannot be less than ₹100']
    }
  },
  consultationDuration: {
    type: Number,
    default: 30, // in minutes
    min: [15, 'Consultation duration must be at least 15 minutes'],
    max: [90, 'Consultation duration cannot exceed 90 minutes']
  },
  
  // Profile
  avatar: {
    url: String,
    publicId: String
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  
  // Ratings and Reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statistics
  totalConsultations: {
    type: Number,
    default: 0
  },
  totalPatients: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: Number,
    default: 30 // in minutes
  },
  
  // Verification Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['degree', 'registration', 'experience', 'photo_id'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: Date,
  
  // Financial
  bankDetails: {
    accountNumber: {
      type: String,
      select: false // Sensitive information
    },
    ifscCode: {
      type: String,
      select: false
    },
    bankName: {
      type: String,
      select: false
    },
    accountHolderName: {
      type: String,
      select: false
    }
  },
  
  // System Fields
  role: {
    type: String,
    default: 'doctor'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  
  // Reset Password
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
  return `Dr. ${this.firstName} ${this.lastName}`;
});

// Virtual for next available slot (simplified)
doctorSchema.virtual('nextAvailable').get(function() {
  // This would need more complex logic in practice
  return 'Available Today';
});

// Hash password before saving
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
doctorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate average rating
doctorSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
};

// Update rating after review changes
doctorSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    this.calculateAverageRating();
  }
  next();
});

// Indexes for performance
doctorSchema.index({ specialization: 1, isActive: 1, isVerified: 1 });
doctorSchema.index({ 'currentHospital.address.city': 1 });
doctorSchema.index({ 'rating.average': -1 });
doctorSchema.index({ consultationFee: 1 });
doctorSchema.index({ experience: -1 });

module.exports = mongoose.model('Doctor', doctorSchema); 