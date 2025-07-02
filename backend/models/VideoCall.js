const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
  // Basic Information
  callId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Participants
  appointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment is required']
  },
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
  
  // Call Configuration
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  meetingLink: {
    type: String,
    required: true
  },
  roomPassword: String,
  
  // Scheduling
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledDuration: {
    type: Number,
    default: 30, // in minutes
    min: 15,
    max: 90
  },
  
  // Call Status and Timing
  status: {
    type: String,
    enum: [
      'scheduled',
      'waiting',
      'connecting',
      'active',
      'on_hold',
      'ended',
      'cancelled',
      'failed',
      'no_show'
    ],
    default: 'scheduled'
  },
  
  // Actual call timing
  actualStartTime: Date,
  actualEndTime: Date,
  actualDuration: Number, // in minutes
  
  // Participants joined status
  participantStatus: {
    patient: {
      joined: {
        type: Boolean,
        default: false
      },
      joinedAt: Date,
      leftAt: Date,
      connectionQuality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor']
      }
    },
    doctor: {
      joined: {
        type: Boolean,
        default: false
      },
      joinedAt: Date,
      leftAt: Date,
      connectionQuality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor']
      }
    }
  },
  
  // Technical Details
  platform: {
    type: String,
    enum: ['webrtc', 'twilio', 'zoom', 'jitsi', 'custom'],
    default: 'webrtc'
  },
  
  // Call Quality Metrics
  quality: {
    overall: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    video: {
      resolution: String,
      frameRate: Number,
      bitrate: Number
    },
    audio: {
      quality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor']
      },
      bitrate: Number
    },
    network: {
      latency: Number, // in ms
      packetLoss: Number, // percentage
      jitter: Number // in ms
    }
  },
  
  // Recording
  recording: {
    enabled: {
      type: Boolean,
      default: false
    },
    consentGiven: {
      patient: {
        type: Boolean,
        default: false
      },
      doctor: {
        type: Boolean,
        default: false
      }
    },
    recordingUrl: String,
    recordingId: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    fileSize: Number, // in bytes
    isEncrypted: {
      type: Boolean,
      default: true
    }
  },
  
  // Features Used
  featuresUsed: {
    screenShare: {
      used: {
        type: Boolean,
        default: false
      },
      initiatedBy: {
        type: String,
        enum: ['patient', 'doctor']
      },
      duration: Number // in seconds
    },
    fileShare: {
      filesShared: [{
        filename: String,
        sharedBy: {
          type: String,
          enum: ['patient', 'doctor']
        },
        timestamp: Date,
        fileType: String
      }]
    },
    chat: {
      messagesCount: {
        type: Number,
        default: 0
      },
      lastMessageAt: Date
    },
    whiteboard: {
      used: {
        type: Boolean,
        default: false
      },
      duration: Number // in seconds
    }
  },
  
  // Issues and Problems
  technicalIssues: [{
    type: {
      type: String,
      enum: [
        'connection_failed',
        'audio_issues',
        'video_issues',
        'poor_connection',
        'platform_error',
        'browser_compatibility',
        'firewall_blocked'
      ]
    },
    description: String,
    reportedBy: {
      type: String,
      enum: ['patient', 'doctor', 'system']
    },
    timestamp: Date,
    resolved: {
      type: Boolean,
      default: false
    },
    resolution: String
  }],
  
  // Call Notes
  callNotes: {
    doctor: {
      preCallNotes: String,
      duringCallNotes: String,
      postCallNotes: String
    },
    patient: {
      feedback: String,
      technicalFeedback: String
    },
    system: {
      autoNotes: String,
      qualityReport: String
    }
  },
  
  // Feedback and Rating
  feedback: {
    patient: {
      overallRating: {
        type: Number,
        min: 1,
        max: 5
      },
      videoQuality: {
        type: Number,
        min: 1,
        max: 5
      },
      audioQuality: {
        type: Number,
        min: 1,
        max: 5
      },
      easeOfUse: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      submittedAt: Date
    },
    doctor: {
      patientEngagement: {
        type: Number,
        min: 1,
        max: 5
      },
      technicalSatisfaction: {
        type: Number,
        min: 1,
        max: 5
      },
      platformRating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      submittedAt: Date
    }
  },
  
  // Waiting Room
  waitingRoom: {
    patientEnteredAt: Date,
    doctorEnteredAt: Date,
    waitingTime: Number, // in minutes
    patientLeftWaiting: {
      type: Boolean,
      default: false
    }
  },
  
  // Security and Compliance
  security: {
    isEncrypted: {
      type: Boolean,
      default: true
    },
    encryptionProtocol: {
      type: String,
      default: 'AES-256'
    },
    accessLogs: [{
      userId: String,
      userType: {
        type: String,
        enum: ['patient', 'doctor']
      },
      action: {
        type: String,
        enum: ['joined', 'left', 'reconnected', 'muted', 'unmuted', 'video_on', 'video_off']
      },
      timestamp: Date,
      ipAddress: String,
      userAgent: String
    }]
  },
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpNotes: String,
  nextAppointmentSuggested: Date,
  
  // Billing and Payment
  billing: {
    amount: Number,
    duration: Number, // billable duration in minutes
    rate: Number, // per minute rate
    additionalCharges: [{
      type: String,
      amount: Number,
      description: String
    }]
  },
  
  // Cancellation
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'system']
  },
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate unique call ID
videoCallSchema.pre('save', async function(next) {
  if (!this.callId) {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.callId = `CALL-${timestamp}-${random}`;
  }
  next();
});

// Generate room ID
videoCallSchema.pre('save', function(next) {
  if (!this.roomId) {
    const random = Math.random().toString(36).substring(2, 15);
    this.roomId = `room-${Date.now()}-${random}`;
  }
  next();
});

// Virtual for call duration display
videoCallSchema.virtual('durationDisplay').get(function() {
  if (!this.actualDuration) return 'N/A';
  const hours = Math.floor(this.actualDuration / 60);
  const minutes = this.actualDuration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Virtual for status display
videoCallSchema.virtual('statusDisplay').get(function() {
  return this.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
});

// Method to start call
videoCallSchema.methods.startCall = function() {
  this.status = 'active';
  this.actualStartTime = new Date();
  return this.save();
};

// Method to end call
videoCallSchema.methods.endCall = function() {
  this.status = 'ended';
  this.actualEndTime = new Date();
  
  if (this.actualStartTime) {
    this.actualDuration = Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  
  return this.save();
};

// Method to join participant
videoCallSchema.methods.joinParticipant = function(participantType) {
  this.participantStatus[participantType].joined = true;
  this.participantStatus[participantType].joinedAt = new Date();
  
  // If both participants joined, start the call
  if (this.participantStatus.patient.joined && this.participantStatus.doctor.joined && this.status === 'waiting') {
    this.status = 'active';
    if (!this.actualStartTime) {
      this.actualStartTime = new Date();
    }
  }
  
  return this.save();
};

// Method to leave participant
videoCallSchema.methods.leaveParticipant = function(participantType) {
  this.participantStatus[participantType].leftAt = new Date();
  
  // If doctor leaves, end the call
  if (participantType === 'doctor' && this.status === 'active') {
    this.endCall();
  }
  
  return this.save();
};

// Static method to get active calls for user
videoCallSchema.statics.getActiveCalls = function(userId, userType) {
  const filter = {
    status: { $in: ['waiting', 'connecting', 'active'] }
  };
  
  if (userType === 'patient') {
    filter.patient = userId;
  } else if (userType === 'doctor') {
    filter.doctor = userId;
  }
  
  return this.find(filter)
    .populate('patient', 'firstName lastName avatar')
    .populate('doctor', 'firstName lastName avatar')
    .populate('appointment', 'type scheduledDateTime')
    .sort({ scheduledStartTime: 1 });
};

// Index for performance
videoCallSchema.index({ callId: 1 });
videoCallSchema.index({ roomId: 1 });
videoCallSchema.index({ patient: 1, scheduledStartTime: -1 });
videoCallSchema.index({ doctor: 1, scheduledStartTime: -1 });
videoCallSchema.index({ status: 1, scheduledStartTime: 1 });
videoCallSchema.index({ appointment: 1 });

module.exports = mongoose.model('VideoCall', videoCallSchema); 