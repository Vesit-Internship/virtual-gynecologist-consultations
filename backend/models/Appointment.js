const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Basic Information
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Participants
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },
  
  // Scheduling
  scheduledDateTime: {
    type: Date,
    required: [true, 'Scheduled date and time is required']
  },
  duration: {
    type: Number,
    default: 30, // in minutes
    min: [15, 'Duration must be at least 15 minutes'],
    max: [90, 'Duration cannot exceed 90 minutes']
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  
  // Appointment Details
  type: {
    type: String,
    enum: [
      'General Consultation',
      'Pregnancy Checkup',
      'Women\'s Health Consultation',
      'Follow-up',
      'Routine Checkup',
      'PCOS Consultation',
      'Fertility Consultation',
      'Menopause Consultation',
      'Emergency Consultation'
    ],
    required: [true, 'Appointment type is required']
  },
  consultationMode: {
    type: String,
    enum: ['video', 'phone'],
    required: [true, 'Consultation mode is required']
  },
  
  // Status
  status: {
    type: String,
    enum: [
      'scheduled',
      'confirmed',
      'in-progress',
      'completed',
      'cancelled',
      'no-show',
      'rescheduled'
    ],
    default: 'scheduled'
  },
  
  // Patient Information
  symptoms: {
    type: String,
    maxlength: [1000, 'Symptoms description cannot exceed 1000 characters']
  },
  medicalHistory: {
    type: String,
    maxlength: [1000, 'Medical history cannot exceed 1000 characters']
  },
  currentMedications: {
    type: String,
    maxlength: [500, 'Current medications cannot exceed 500 characters']
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  
  // Payment Information
  payment: {
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'net_banking', 'wallet']
    },
    paidAt: Date
  },
  
  // Meeting Information
  meetingLink: String,
  meetingId: String,
  meetingPassword: String,
  
  // Call Details
  callStartTime: Date,
  callEndTime: Date,
  actualDuration: Number, // in minutes
  callQuality: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor']
  },
  
  // Consultation Notes
  doctorNotes: {
    type: String,
    maxlength: [2000, 'Doctor notes cannot exceed 2000 characters']
  },
  diagnosis: {
    type: String,
    maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
  },
  treatmentPlan: {
    type: String,
    maxlength: [1000, 'Treatment plan cannot exceed 1000 characters']
  },
  nextFollowUp: Date,
  
  // Files and Documents
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'test_report', 'prescription'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: String,
    uploadedBy: {
      type: String,
      enum: ['patient', 'doctor'],
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Prescription
  prescription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Prescription'
  },
  
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['appointment', 'follow_up', 'medication']
    },
    message: String,
    scheduledAt: Date,
    sent: {
      type: Boolean,
      default: false
    }
  }],
  
  // Feedback and Rating
  patientFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters']
    },
    submittedAt: Date
  },
  
  // Rescheduling History
  rescheduleHistory: [{
    previousDateTime: Date,
    newDateTime: Date,
    reason: String,
    rescheduledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin']
    },
    rescheduledAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Cancellation
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin']
  },
  cancelledAt: Date,
  refundAmount: Number,
  refundStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'not_applicable'],
    default: 'not_applicable'
  },
  
  // System Fields
  createdBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  lastModifiedBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate unique appointment ID
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count existing appointments for today
    const count = await mongoose.model('Appointment').countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), date.getDate()),
        $lt: new Date(year, date.getMonth(), date.getDate() + 1)
      }
    });
    
    this.appointmentId = `APT-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.scheduledDateTime.toLocaleDateString('en-IN');
});

// Virtual for formatted time
appointmentSchema.virtual('formattedTime').get(function() {
  return this.scheduledDateTime.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
});

// Virtual for status display
appointmentSchema.virtual('statusDisplay').get(function() {
  return this.status.charAt(0).toUpperCase() + this.status.slice(1).replace('-', ' ');
});

// Index for performance
appointmentSchema.index({ patient: 1, scheduledDateTime: -1 });
appointmentSchema.index({ doctor: 1, scheduledDateTime: -1 });
appointmentSchema.index({ status: 1, scheduledDateTime: 1 });
appointmentSchema.index({ appointmentId: 1 });
appointmentSchema.index({ scheduledDateTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema); 