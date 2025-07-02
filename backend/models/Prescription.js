const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  // Basic Information
  prescriptionNumber: {
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
  appointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment is required']
  },
  
  // Prescription Details
  dateIssued: {
    type: Date,
    default: Date.now,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  
  // Patient Information at time of prescription
  patientInfo: {
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      required: true
    },
    phone: String,
    address: String
  },
  
  // Doctor Information
  doctorInfo: {
    name: {
      type: String,
      required: true
    },
    registrationNumber: {
      type: String,
      required: true
    },
    qualification: String,
    hospital: String,
    signature: String // Base64 encoded signature
  },
  
  // Medical Information
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
  },
  symptoms: {
    type: String,
    maxlength: [1000, 'Symptoms cannot exceed 1000 characters']
  },
  
  // Medications
  medications: [{
    name: {
      type: String,
      required: [true, 'Medication name is required']
    },
    genericName: String,
    strength: {
      type: String,
      required: [true, 'Medication strength is required']
    },
    dosageForm: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'spray', 'gel', 'powder'],
      required: [true, 'Dosage form is required']
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: [
        'Once daily',
        'Twice daily', 
        'Three times daily',
        'Four times daily',
        'Every 4 hours',
        'Every 6 hours',
        'Every 8 hours',
        'Every 12 hours',
        'As needed',
        'Before meals',
        'After meals',
        'At bedtime'
      ]
    },
    duration: {
      value: {
        type: Number,
        required: true,
        min: 1
      },
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        required: true
      }
    },
    instructions: {
      type: String,
      maxlength: [500, 'Instructions cannot exceed 500 characters']
    },
    timing: {
      type: String,
      enum: ['before_meals', 'after_meals', 'with_meals', 'empty_stomach', 'bedtime', 'morning', 'evening', 'as_needed']
    },
    precautions: {
      type: String,
      maxlength: [300, 'Precautions cannot exceed 300 characters']
    },
    refillsAllowed: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    refillsUsed: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  
  // Tests/Lab Work
  recommendedTests: [{
    testName: {
      type: String,
      required: true
    },
    reason: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine'
    },
    instructions: String
  }],
  
  // Lifestyle Recommendations
  lifestyleRecommendations: {
    diet: String,
    exercise: String,
    restrictions: String,
    generalAdvice: String
  },
  
  // Follow-up
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    timeframe: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months']
      }
    },
    reason: String,
    instructions: String
  },
  
  // Emergency Instructions
  emergencyInstructions: {
    type: String,
    maxlength: [500, 'Emergency instructions cannot exceed 500 characters']
  },
  
  // Digital Prescription
  digitalSignature: String,
  qrCode: String, // For verification
  isDigitallyVerified: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  
  // Notes
  doctorNotes: {
    type: String,
    maxlength: [1000, 'Doctor notes cannot exceed 1000 characters']
  },
  pharmacyNotes: {
    type: String,
    maxlength: [500, 'Pharmacy notes cannot exceed 500 characters']
  },
  
  // Pharmacy Information (if filled)
  pharmacy: {
    name: String,
    address: String,
    phone: String,
    pharmacistName: String,
    dispenseDate: Date,
    dispensedBy: String
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  isLatestVersion: {
    type: Boolean,
    default: true
  },
  previousVersions: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Prescription'
  }],
  
  // Compliance Tracking
  complianceTracking: [{
    medicationName: String,
    date: Date,
    taken: Boolean,
    notes: String
  }],
  
  // Allergies and Contraindications
  allergiesChecked: [{
    allergen: String,
    severity: String,
    reaction: String
  }],
  drugInteractionsChecked: [{
    medication1: String,
    medication2: String,
    interactionLevel: {
      type: String,
      enum: ['minor', 'moderate', 'major']
    },
    description: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate unique prescription number
prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count existing prescriptions for today
    const count = await mongoose.model('Prescription').countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), date.getDate()),
        $lt: new Date(year, date.getMonth(), date.getDate() + 1)
      }
    });
    
    this.prescriptionNumber = `RX-IND-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Set validity period (default 30 days)
prescriptionSchema.pre('save', function(next) {
  if (!this.validUntil) {
    this.validUntil = new Date(this.dateIssued.getTime() + (30 * 24 * 60 * 60 * 1000));
  }
  next();
});

// Virtual for formatted date
prescriptionSchema.virtual('formattedDate').get(function() {
  return this.dateIssued.toLocaleDateString('en-IN');
});

// Virtual for validity status
prescriptionSchema.virtual('isValid').get(function() {
  return new Date() <= this.validUntil && this.status === 'active';
});

// Virtual for total medications
prescriptionSchema.virtual('totalMedications').get(function() {
  return this.medications.length;
});

// Method to check if prescription is expired
prescriptionSchema.methods.isExpired = function() {
  return new Date() > this.validUntil;
};

// Method to get remaining refills for a medication
prescriptionSchema.methods.getRemainingRefills = function(medicationIndex) {
  const medication = this.medications[medicationIndex];
  if (!medication) return 0;
  return medication.refillsAllowed - medication.refillsUsed;
};

// Index for performance
prescriptionSchema.index({ patient: 1, dateIssued: -1 });
prescriptionSchema.index({ doctor: 1, dateIssued: -1 });
prescriptionSchema.index({ prescriptionNumber: 1 });
prescriptionSchema.index({ status: 1, validUntil: 1 });
prescriptionSchema.index({ appointment: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema); 