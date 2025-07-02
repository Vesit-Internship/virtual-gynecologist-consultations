const mongoose = require('mongoose');

const wellnessTrackerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Date of tracking entry
  trackingDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Menstrual Cycle Tracking
  menstrualTracking: {
    cycleDay: Number, // Day of current cycle (1-35+)
    flow: {
      type: String,
      enum: ['none', 'spotting', 'light', 'moderate', 'heavy']
    },
    symptoms: [{
      type: String,
      enum: [
        'cramps', 'bloating', 'headache', 'mood_swings', 'fatigue',
        'breast_tenderness', 'backache', 'nausea', 'acne', 'constipation',
        'diarrhea', 'insomnia', 'anxiety', 'depression', 'irritability'
      ]
    }],
    painLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    notes: String
  },
  
  // Fertility Tracking
  fertilityTracking: {
    basalBodyTemperature: Number, // Celsius
    cervicalMucus: {
      type: String,
      enum: ['dry', 'sticky', 'creamy', 'watery', 'egg_white']
    },
    cervicalPosition: {
      type: String,
      enum: ['low_firm_closed', 'medium', 'high_soft_open']
    },
    ovulationTest: {
      type: String,
      enum: ['negative', 'positive', 'peak']
    },
    sexualActivity: {
      occurred: Boolean,
      protection: {
        type: String,
        enum: ['none', 'condom', 'hormonal', 'iud', 'other']
      }
    }
  },
  
  // Mood and Mental Health
  moodTracking: {
    overallMood: {
      type: Number,
      min: 1,
      max: 10
    },
    emotions: [{
      type: String,
      enum: [
        'happy', 'sad', 'anxious', 'stressed', 'calm', 'energetic',
        'tired', 'angry', 'excited', 'overwhelmed', 'content', 'lonely'
      ]
    }],
    stressLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    sleepQuality: {
      hours: Number,
      quality: {
        type: Number,
        min: 1,
        max: 10
      },
      disturbances: [String]
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  
  // Physical Health Metrics
  physicalHealth: {
    weight: Number, // kg
    bodyTemperature: Number, // Celsius
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number, // bpm
    exerciseMinutes: Number,
    exerciseType: [String],
    waterIntake: Number, // liters
    steps: Number,
    caloriesBurned: Number
  },
  
  // Nutrition Tracking
  nutrition: {
    meals: [{
      type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack']
      },
      foods: [String],
      calories: Number,
      macros: {
        protein: Number, // grams
        carbs: Number,   // grams
        fat: Number      // grams
      },
      micronutrients: {
        calcium: Number,  // mg
        iron: Number,     // mg
        vitaminD: Number, // IU
        folicAcid: Number // mg
      }
    }],
    supplements: [{
      name: String,
      dosage: String,
      timeTaken: Date
    }],
    waterIntake: Number, // liters
    alcoholIntake: Number, // units
    caffeineIntake: Number // mg
  },
  
  // Lifestyle Factors
  lifestyle: {
    smokingStatus: {
      type: String,
      enum: ['never', 'former', 'current']
    },
    cigarettesPerDay: Number,
    alcoholFrequency: {
      type: String,
      enum: ['never', 'rarely', 'weekly', 'daily']
    },
    screenTime: Number, // hours
    outdoorTime: Number, // minutes
    socialInteractions: {
      type: Number,
      min: 1,
      max: 10
    },
    workStress: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  
  // Medication and Supplements
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    timeTaken: [Date],
    sideEffects: [String],
    effectiveness: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  
  // Symptom Tracking
  symptoms: [{
    symptom: String,
    severity: {
      type: Number,
      min: 1,
      max: 10
    },
    duration: String,
    triggers: [String],
    remedies: [String],
    notes: String
  }],
  
  // Goals and Challenges
  dailyGoals: [{
    category: {
      type: String,
      enum: ['exercise', 'nutrition', 'meditation', 'sleep', 'water', 'medication']
    },
    target: Number,
    achieved: Number,
    completed: Boolean
  }],
  
  // AI Insights
  aiInsights: {
    patterns: [{
      type: String, // e.g., "cycle_regularity", "mood_exercise_correlation"
      insight: String,
      confidence: Number, // 0-100
      actionable: Boolean
    }],
    predictions: [{
      event: String, // e.g., "next_period", "ovulation"
      date: Date,
      confidence: Number
    }],
    recommendations: [{
      category: String,
      recommendation: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent']
      }
    }],
    healthScore: {
      overall: Number, // 0-100
      categories: {
        menstrual: Number,
        fertility: Number,
        mental: Number,
        physical: Number,
        nutrition: Number,
        lifestyle: Number
      }
    }
  },
  
  // Data Sources
  dataSources: [{
    source: {
      type: String,
      enum: ['manual', 'fitness_tracker', 'smart_scale', 'app_import', 'device_sync']
    },
    deviceId: String,
    lastSync: Date,
    reliability: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  
  // Privacy and Sharing
  privacy: {
    shareWithDoctor: Boolean,
    shareWithPartner: Boolean,
    allowResearch: Boolean,
    dataRetention: {
      type: String,
      enum: ['indefinite', '1_year', '2_years', '5_years']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
wellnessTrackerSchema.index({ user: 1, trackingDate: -1 });
wellnessTrackerSchema.index({ 'menstrualTracking.cycleDay': 1 });
wellnessTrackerSchema.index({ trackingDate: 1 });
wellnessTrackerSchema.index({ user: 1, 'aiInsights.healthScore.overall': -1 });

// Virtual for cycle information
wellnessTrackerSchema.virtual('cycleInfo').get(function() {
  if (this.menstrualTracking.cycleDay) {
    const phases = {
      1: 'menstrual',
      7: 'follicular',
      14: 'ovulation',
      21: 'luteal'
    };
    
    let phase = 'menstrual';
    if (this.menstrualTracking.cycleDay > 21) phase = 'luteal';
    else if (this.menstrualTracking.cycleDay > 14) phase = 'ovulation';
    else if (this.menstrualTracking.cycleDay > 7) phase = 'follicular';
    
    return {
      day: this.menstrualTracking.cycleDay,
      phase: phase,
      dayOfPhase: this.menstrualTracking.cycleDay - 
        (phase === 'luteal' ? 21 : phase === 'ovulation' ? 14 : phase === 'follicular' ? 7 : 0)
    };
  }
  return null;
});

// Method to calculate streak for a goal
wellnessTrackerSchema.methods.calculateGoalStreak = function(goalCategory) {
  // This would be implemented to find consecutive days of goal completion
  return 0; // Placeholder
};

// Method to get health trends
wellnessTrackerSchema.methods.getHealthTrends = function() {
  return {
    moodTrend: 'stable', // Would calculate from recent entries
    weightTrend: 'stable',
    energyTrend: 'improving',
    sleepTrend: 'stable'
  };
};

// Static method to get wellness summary for user
wellnessTrackerSchema.statics.getWellnessSummary = function(userId, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    user: userId,
    trackingDate: { $gte: startDate, $lte: endDate }
  })
  .sort({ trackingDate: -1 })
  .select('trackingDate aiInsights.healthScore moodTracking.overallMood menstrualTracking');
};

// Method to detect anomalies
wellnessTrackerSchema.methods.detectAnomalies = function() {
  const anomalies = [];
  
  // Check for unusual patterns
  if (this.moodTracking.overallMood <= 3) {
    anomalies.push({
      type: 'mood',
      severity: 'medium',
      message: 'Low mood detected'
    });
  }
  
  if (this.moodTracking.sleepQuality.hours < 5) {
    anomalies.push({
      type: 'sleep',
      severity: 'high',
      message: 'Insufficient sleep detected'
    });
  }
  
  return anomalies;
};

module.exports = mongoose.model('WellnessTracker', wellnessTrackerSchema); 