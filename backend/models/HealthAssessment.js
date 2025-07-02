const mongoose = require('mongoose');

const healthAssessmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Assessment Details
  assessmentType: {
    type: String,
    enum: ['symptom_checker', 'risk_assessment', 'periodic_checkup', 'pre_consultation'],
    required: true
  },
  
  // Symptoms and Concerns
  symptoms: [{
    symptom: String,
    severity: {
      type: Number,
      min: 1,
      max: 10
    },
    duration: String, // "2 days", "1 week", etc.
    frequency: {
      type: String,
      enum: ['constant', 'frequent', 'occasional', 'rare']
    },
    triggers: [String],
    alleviatingFactors: [String]
  }],
  
  // Menstrual Health Assessment
  menstrualHistory: {
    lastPeriodDate: Date,
    cycleLength: Number,
    cycleDuration: Number,
    flowIntensity: {
      type: String,
      enum: ['light', 'moderate', 'heavy', 'irregular']
    },
    painLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    irregularities: [String]
  },
  
  // Reproductive Health
  reproductiveHealth: {
    sexuallyActive: Boolean,
    contraceptionMethod: String,
    pregnancyHistory: {
      pregnancies: Number,
      livebirths: Number,
      miscarriages: Number,
      abortions: Number
    },
    fertilityPlanning: {
      type: String,
      enum: ['trying_to_conceive', 'preventing_pregnancy', 'not_applicable']
    }
  },
  
  // AI Analysis Results
  aiAnalysis: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    },
    urgencyLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'emergency'],
      default: 'low'
    },
    possibleConditions: [{
      condition: String,
      probability: Number, // 0-100
      description: String
    }],
    recommendations: [{
      type: {
        type: String,
        enum: ['immediate_care', 'book_appointment', 'lifestyle_change', 'monitoring', 'education']
      },
      priority: {
        type: String,
        enum: ['urgent', 'high', 'medium', 'low']
      },
      description: String,
      actionItems: [String]
    }],
    redFlags: [String], // Warning signs that need immediate attention
    followUpRequired: {
      required: Boolean,
      timeframe: String,
      reason: String
    }
  },
  
  // Educational Content Recommendations
  educationalRecommendations: [{
    topic: String,
    priority: Number,
    resourceType: {
      type: String,
      enum: ['article', 'video', 'infographic', 'quiz', 'webinar']
    },
    contentId: String
  }],
  
  // Doctor Recommendations
  doctorRecommendations: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    specialization: String,
    matchScore: Number, // 0-100
    reasonForRecommendation: String
  }],
  
  // Assessment Metadata
  completionTime: Number, // seconds
  version: String, // AI model version used
  dataQuality: {
    completeness: Number, // 0-100
    reliability: Number, // 0-100
    notes: String
  },
  
  // Follow-up Tracking
  followUpAssessments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthAssessment'
  }],
  parentAssessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthAssessment'
  },
  
  // Privacy and Consent
  consentGiven: {
    dataProcessing: Boolean,
    aiAnalysis: Boolean,
    doctorSharing: Boolean,
    researchUse: Boolean
  },
  
  // Analytics Data
  analytics: {
    sourceView: String, // where assessment was initiated
    deviceType: String,
    location: {
      country: String,
      state: String,
      city: String
    },
    referralSource: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
healthAssessmentSchema.index({ user: 1, createdAt: -1 });
healthAssessmentSchema.index({ 'aiAnalysis.urgencyLevel': 1 });
healthAssessmentSchema.index({ 'aiAnalysis.riskScore': -1 });
healthAssessmentSchema.index({ assessmentType: 1 });

// Virtual for assessment summary
healthAssessmentSchema.virtual('assessmentSummary').get(function() {
  return {
    symptomsCount: this.symptoms.length,
    highestSeverity: Math.max(...this.symptoms.map(s => s.severity || 0)),
    riskLevel: this.aiAnalysis?.urgencyLevel || 'low',
    needsFollowUp: this.aiAnalysis?.followUpRequired?.required || false
  };
});

// Method to check if assessment needs immediate attention
healthAssessmentSchema.methods.needsImmediateAttention = function() {
  return this.aiAnalysis?.urgencyLevel === 'emergency' || 
         this.aiAnalysis?.riskScore > 80 ||
         this.aiAnalysis?.redFlags?.length > 0;
};

// Method to get personalized recommendations
healthAssessmentSchema.methods.getPersonalizedRecommendations = function() {
  return this.aiAnalysis?.recommendations?.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// Static method to get user's assessment history
healthAssessmentSchema.statics.getUserAssessmentHistory = function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('assessmentType aiAnalysis.riskScore aiAnalysis.urgencyLevel createdAt');
};

module.exports = mongoose.model('HealthAssessment', healthAssessmentSchema); 