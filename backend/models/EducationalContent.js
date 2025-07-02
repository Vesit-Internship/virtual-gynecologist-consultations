const mongoose = require('mongoose');

const educationalContentSchema = new mongoose.Schema({
  // Basic Content Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  
  category: {
    type: String,
    required: true,
    enum: [
      'menstrual_health', 'fertility', 'pregnancy', 'reproductive_health',
      'sexual_health', 'contraception', 'hormones', 'pcos', 'endometriosis',
      'menopause', 'breast_health', 'mental_health', 'nutrition', 'exercise',
      'hygiene', 'std_prevention', 'cancer_screening', 'adolescent_health'
    ]
  },
  
  subcategory: {
    type: String,
    maxLength: 100
  },
  
  // Content Details
  contentType: {
    type: String,
    required: true,
    enum: ['article', 'video', 'infographic', 'quiz', 'checklist', 'guide', 'webinar', 'podcast']
  },
  
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  ageGroup: [{
    type: String,
    enum: ['teens', 'young_adults', 'adults', 'middle_aged', 'seniors']
  }],
  
  // Content Body
  summary: {
    type: String,
    required: true,
    maxLength: 500
  },
  
  content: {
    type: String,
    required: true
  },
  
  keyPoints: [String],
  
  // Media and Resources
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document']
    },
    url: String,
    thumbnail: String,
    caption: String,
    duration: Number, // For video/audio content in seconds
    size: Number      // File size in bytes
  }],
  
  // Educational Metadata
  learningObjectives: [String],
  
  prerequisites: [String],
  
  estimatedReadTime: {
    type: Number, // Minutes
    default: 5
  },
  
  tags: [String],
  
  // Medical Information
  medicalReviewer: {
    name: String,
    credentials: String,
    specialization: String,
    reviewDate: Date
  },
  
  accuracy: {
    level: {
      type: String,
      enum: ['evidence_based', 'expert_reviewed', 'general_information'],
      default: 'general_information'
    },
    sources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['research_paper', 'medical_journal', 'clinical_study', 'expert_opinion', 'government_source']
      },
      publishedDate: Date
    }],
    lastFactCheck: Date
  },
  
  // Interactive Elements
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    passingScore: {
      type: Number,
      default: 70
    }
  },
  
  interactiveElements: [{
    type: {
      type: String,
      enum: ['calculator', 'tracker', 'assessment', 'planner']
    },
    name: String,
    description: String,
    config: mongoose.Schema.Types.Mixed
  }],
  
  // Personalization
  personalizedFor: [{
    condition: String,
    ageRange: String,
    lifeStage: String
  }],
  
  // Engagement Metrics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    bookmarks: {
      type: Number,
      default: 0
    }
  },
  
  // User Interactions
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    helpful: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    moderated: {
      type: Boolean,
      default: false
    }
  }],
  
  // Related Content
  relatedContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationalContent'
  }],
  
  // SEO and Discoverability
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    openGraph: {
      title: String,
      description: String,
      image: String
    }
  },
  
  // Content Management
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  
  author: {
    name: String,
    credentials: String,
    bio: String,
    avatar: String
  },
  
  editor: {
    name: String,
    editDate: Date,
    changes: String
  },
  
  publishDate: Date,
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Accessibility
  accessibility: {
    alternativeFormats: [String], // 'audio', 'braille', 'sign_language'
    languageSupport: [String],    // Supported languages
    readingLevel: {
      type: String,
      enum: ['elementary', 'middle_school', 'high_school', 'college']
    }
  },
  
  // Content Series
  series: {
    name: String,
    part: Number,
    totalParts: Number
  },
  
  // Notifications and Updates
  subscribedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Compliance and Safety
  disclaimers: [String],
  
  warningsAndContraindications: [String],
  
  emergencyInformation: {
    includesEmergencyInfo: Boolean,
    emergencyContacts: [String],
    warningSignsToWatch: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
educationalContentSchema.index({ category: 1, status: 1 });
educationalContentSchema.index({ tags: 1 });
educationalContentSchema.index({ slug: 1 });
educationalContentSchema.index({ 'analytics.views': -1 });
educationalContentSchema.index({ 'analytics.averageRating': -1 });
educationalContentSchema.index({ publishDate: -1 });
educationalContentSchema.index({ title: 'text', content: 'text', summary: 'text' });

// Virtual for average user rating
educationalContentSchema.virtual('userRating').get(function() {
  if (this.analytics.totalRatings === 0) return 0;
  return this.analytics.averageRating;
});

// Virtual for reading difficulty
educationalContentSchema.virtual('readingDifficulty').get(function() {
  const words = this.content.split(' ').length;
  const sentences = this.content.split(/[.!?]+/).length;
  
  // Simple readability calculation
  const avgWordsPerSentence = words / sentences;
  
  if (avgWordsPerSentence < 10) return 'easy';
  if (avgWordsPerSentence < 15) return 'moderate';
  return 'difficult';
});

// Method to increment view count
educationalContentSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

// Method to add user rating
educationalContentSchema.methods.addRating = function(rating) {
  const currentTotal = this.analytics.averageRating * this.analytics.totalRatings;
  this.analytics.totalRatings += 1;
  this.analytics.averageRating = (currentTotal + rating) / this.analytics.totalRatings;
  return this.save();
};

// Method to check if content needs update
educationalContentSchema.methods.needsUpdate = function() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  return this.lastUpdated < sixMonthsAgo;
};

// Static method to get popular content
educationalContentSchema.statics.getPopularContent = function(category = null, limit = 10) {
  const query = { status: 'published' };
  if (category) query.category = category;
  
  return this.find(query)
    .sort({ 'analytics.views': -1, 'analytics.averageRating': -1 })
    .limit(limit)
    .select('title summary category analytics.views analytics.averageRating featuredImage estimatedReadTime');
};

// Static method to get recommended content for user
educationalContentSchema.statics.getRecommendedContent = function(userProfile, limit = 5) {
  const query = {
    status: 'published',
    $or: [
      { ageGroup: { $in: [userProfile.ageGroup] } },
      { category: { $in: userProfile.interests || [] } },
      { tags: { $in: userProfile.tags || [] } }
    ]
  };
  
  return this.find(query)
    .sort({ 'analytics.averageRating': -1, 'analytics.views': -1 })
    .limit(limit);
};

// Pre-save middleware
educationalContentSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Calculate estimated read time
  if (this.content) {
    const wordsPerMinute = 200;
    const words = this.content.split(' ').length;
    this.estimatedReadTime = Math.ceil(words / wordsPerMinute);
  }
  
  next();
});

module.exports = mongoose.model('EducationalContent', educationalContentSchema); 