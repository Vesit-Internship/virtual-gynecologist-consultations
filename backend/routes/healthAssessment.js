const express = require('express');
const router = express.Router();
const HealthAssessment = require('../models/HealthAssessment');
const WellnessTracker = require('../models/WellnessTracker');
const { authenticateToken, checkRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for AI assessments
const assessmentLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 assessments per hour
  message: { error: 'Too many assessments. Please try again later.' }
});

// AI-Powered Symptom Checker
router.post('/symptom-checker', authenticateToken, assessmentLimit, async (req, res) => {
  try {
    const { symptoms, menstrualInfo, urgency } = req.body;
    
    // Validate input
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ error: 'Symptoms are required' });
    }
    
    // AI Analysis (would integrate with actual AI service)
    const aiAnalysis = await performAIAnalysis({
      symptoms,
      menstrualInfo,
      urgency,
      userHistory: await getUserHealthHistory(req.user.id)
    });
    
    // Create assessment record
    const assessment = new HealthAssessment({
      user: req.user.id,
      assessmentType: 'symptom_checker',
      symptoms: symptoms.map(s => ({
        symptom: s.name,
        severity: s.severity,
        duration: s.duration,
        frequency: s.frequency,
        triggers: s.triggers || [],
        alleviatingFactors: s.alleviatingFactors || []
      })),
      menstrualHistory: menstrualInfo,
      aiAnalysis,
      consentGiven: {
        dataProcessing: true,
        aiAnalysis: true,
        doctorSharing: req.body.shareWithDoctor || false,
        researchUse: req.body.allowResearch || false
      }
    });
    
    await assessment.save();
    
    res.json({
      assessmentId: assessment._id,
      analysis: aiAnalysis,
      recommendations: assessment.getPersonalizedRecommendations(),
      urgentCare: assessment.needsImmediateAttention()
    });
    
  } catch (error) {
    console.error('Symptom checker error:', error);
    res.status(500).json({ error: 'Assessment failed. Please try again.' });
  }
});

// Risk Assessment for Gynecological Conditions
router.post('/risk-assessment', authenticateToken, async (req, res) => {
  try {
    const { 
      age, 
      familyHistory, 
      lifestyle, 
      reproductiveHistory,
      currentSymptoms 
    } = req.body;
    
    // Calculate risk scores for various conditions
    const riskAnalysis = await calculateRiskScores({
      age,
      familyHistory,
      lifestyle,
      reproductiveHistory,
      currentSymptoms,
      userProfile: req.user
    });
    
    const assessment = new HealthAssessment({
      user: req.user.id,
      assessmentType: 'risk_assessment',
      reproductiveHealth: reproductiveHistory,
      symptoms: currentSymptoms?.map(s => ({
        symptom: s.name,
        severity: s.severity || 1
      })) || [],
      aiAnalysis: {
        riskScore: riskAnalysis.overallRisk,
        urgencyLevel: riskAnalysis.urgencyLevel,
        possibleConditions: riskAnalysis.conditions,
        recommendations: riskAnalysis.recommendations,
        followUpRequired: riskAnalysis.followUp
      }
    });
    
    await assessment.save();
    
    res.json({
      riskAnalysis,
      preventiveRecommendations: riskAnalysis.preventive,
      screeningSchedule: riskAnalysis.screening,
      lifestyleModifications: riskAnalysis.lifestyle
    });
    
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({ error: 'Risk assessment failed' });
  }
});

// Pre-consultation Assessment
router.post('/pre-consultation', authenticateToken, async (req, res) => {
  try {
    const { appointmentId, chiefComplaint, symptoms, duration } = req.body;
    
    // Prepare comprehensive patient summary for doctor
    const patientSummary = await generatePatientSummary(req.user.id, {
      chiefComplaint,
      symptoms,
      duration
    });
    
    const assessment = new HealthAssessment({
      user: req.user.id,
      assessmentType: 'pre_consultation',
      symptoms: symptoms.map(s => ({
        symptom: s.name,
        severity: s.severity,
        duration: duration,
        frequency: s.frequency
      })),
      aiAnalysis: {
        possibleConditions: patientSummary.likelyConditions,
        recommendations: patientSummary.questionsForDoctor,
        urgencyLevel: patientSummary.urgency
      }
    });
    
    await assessment.save();
    
    res.json({
      patientSummary,
      suggestedQuestions: patientSummary.questionsToAsk,
      preparationTips: patientSummary.preparationTips,
      relevantHistory: patientSummary.relevantHistory
    });
    
  } catch (error) {
    console.error('Pre-consultation assessment error:', error);
    res.status(500).json({ error: 'Pre-consultation assessment failed' });
  }
});

// Get Assessment History
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { user: req.user.id };
    if (type) query.assessmentType = type;
    
    const assessments = await HealthAssessment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('assessmentType aiAnalysis.riskScore aiAnalysis.urgencyLevel createdAt');
    
    const total = await HealthAssessment.countDocuments(query);
    
    res.json({
      assessments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Assessment history error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment history' });
  }
});

// Get Specific Assessment Details
router.get('/:assessmentId', authenticateToken, async (req, res) => {
  try {
    const assessment = await HealthAssessment.findOne({
      _id: req.params.assessmentId,
      user: req.user.id
    }).populate('doctorRecommendations.doctor', 'name specialization rating');
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    res.json(assessment);
    
  } catch (error) {
    console.error('Assessment fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Health Insights Dashboard
router.get('/insights/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get recent assessments
    const recentAssessments = await HealthAssessment.getUserAssessmentHistory(userId, 5);
    
    // Get wellness trends
    const wellnessData = await WellnessTracker.getWellnessSummary(userId, 30);
    
    // Calculate health trends
    const healthTrends = calculateHealthTrends(recentAssessments, wellnessData);
    
    // Generate personalized insights
    const personalizedInsights = await generatePersonalizedInsights(userId);
    
    res.json({
      overview: {
        totalAssessments: recentAssessments.length,
        averageRiskScore: calculateAverageRiskScore(recentAssessments),
        trendsImproving: healthTrends.improving,
        urgentItems: healthTrends.urgent
      },
      recentAssessments: recentAssessments.slice(0, 3),
      healthScore: personalizedInsights.healthScore,
      recommendations: personalizedInsights.topRecommendations,
      upcomingReminders: personalizedInsights.reminders,
      patterns: personalizedInsights.patterns
    });
    
  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({ error: 'Failed to generate health insights' });
  }
});

// AI-Powered Health Patterns Analysis
router.get('/insights/patterns', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '3months' } = req.query;
    const userId = req.user.id;
    
    const patterns = await analyzeHealthPatterns(userId, timeframe);
    
    res.json({
      menstrualPatterns: patterns.menstrual,
      moodPatterns: patterns.mood,
      symptomCorrelations: patterns.correlations,
      riskTrends: patterns.risks,
      lifestyleImpact: patterns.lifestyle,
      recommendations: patterns.recommendations
    });
    
  } catch (error) {
    console.error('Pattern analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze health patterns' });
  }
});

// Emergency Assessment
router.post('/emergency', authenticateToken, async (req, res) => {
  try {
    const { symptoms, severity, duration } = req.body;
    
    // Quick emergency assessment
    const emergencyAnalysis = await assessEmergencyLevel(symptoms, severity);
    
    if (emergencyAnalysis.callEmergency) {
      // Log emergency assessment
      const assessment = new HealthAssessment({
        user: req.user.id,
        assessmentType: 'emergency',
        symptoms: symptoms.map(s => ({ symptom: s, severity: severity })),
        aiAnalysis: {
          urgencyLevel: 'emergency',
          riskScore: 100,
          redFlags: emergencyAnalysis.redFlags,
          recommendations: [{
            type: 'immediate_care',
            priority: 'urgent',
            description: 'Seek immediate medical attention',
            actionItems: ['Call emergency services', 'Go to nearest emergency room']
          }]
        }
      });
      
      await assessment.save();
    }
    
    res.json({
      emergency: emergencyAnalysis.callEmergency,
      urgencyLevel: emergencyAnalysis.level,
      recommendations: emergencyAnalysis.recommendations,
      nearestFacilities: emergencyAnalysis.nearestEmergency,
      warning: emergencyAnalysis.warning
    });
    
  } catch (error) {
    console.error('Emergency assessment error:', error);
    res.status(500).json({ error: 'Emergency assessment failed' });
  }
});

// Helper Functions
async function performAIAnalysis(data) {
  // This would integrate with actual AI/ML service
  // For now, returning mock analysis
  const riskScore = calculateRiskScore(data.symptoms);
  const urgencyLevel = determineUrgency(data.symptoms, riskScore);
  
  return {
    riskScore,
    urgencyLevel,
    possibleConditions: await identifyPossibleConditions(data.symptoms),
    recommendations: generateRecommendations(data.symptoms, urgencyLevel),
    redFlags: identifyRedFlags(data.symptoms),
    followUpRequired: {
      required: riskScore > 60,
      timeframe: riskScore > 80 ? 'within 24 hours' : 'within 1 week',
      reason: 'Symptoms require medical evaluation'
    }
  };
}

async function getUserHealthHistory(userId) {
  const assessments = await HealthAssessment.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('symptoms aiAnalysis.possibleConditions createdAt');
  
  return assessments;
}

function calculateRiskScore(symptoms) {
  // Basic risk calculation based on symptoms
  let score = 0;
  symptoms.forEach(symptom => {
    score += symptom.severity * 10;
    if (symptom.duration.includes('week')) score += 15;
    if (symptom.duration.includes('month')) score += 25;
  });
  return Math.min(score, 100);
}

function determineUrgency(symptoms, riskScore) {
  const emergencySymptoms = [
    'severe abdominal pain', 'heavy bleeding', 'severe headache',
    'chest pain', 'difficulty breathing', 'fainting'
  ];
  
  const hasEmergencySymptom = symptoms.some(s => 
    emergencySymptoms.some(es => s.symptom.toLowerCase().includes(es))
  );
  
  if (hasEmergencySymptom || riskScore > 90) return 'emergency';
  if (riskScore > 70) return 'high';
  if (riskScore > 40) return 'moderate';
  return 'low';
}

async function identifyPossibleConditions(symptoms) {
  // Mock condition identification logic
  const conditions = [
    { condition: 'Menstrual irregularities', probability: 75, description: 'Common gynecological condition' },
    { condition: 'PCOS', probability: 45, description: 'Polycystic Ovary Syndrome symptoms' },
    { condition: 'UTI', probability: 30, description: 'Urinary tract infection symptoms' }
  ];
  
  return conditions;
}

function generateRecommendations(symptoms, urgencyLevel) {
  const recommendations = [];
  
  if (urgencyLevel === 'emergency') {
    recommendations.push({
      type: 'immediate_care',
      priority: 'urgent',
      description: 'Seek immediate medical attention',
      actionItems: ['Call emergency services', 'Go to nearest emergency room']
    });
  } else if (urgencyLevel === 'high') {
    recommendations.push({
      type: 'book_appointment',
      priority: 'high',
      description: 'Schedule appointment within 24-48 hours',
      actionItems: ['Book urgent appointment', 'Monitor symptoms closely']
    });
  } else {
    recommendations.push({
      type: 'monitoring',
      priority: 'medium',
      description: 'Monitor symptoms and consider appointment if worsening',
      actionItems: ['Track symptoms daily', 'Consider lifestyle modifications']
    });
  }
  
  return recommendations;
}

function identifyRedFlags(symptoms) {
  const redFlags = [];
  const dangerSymptoms = ['severe pain', 'heavy bleeding', 'fainting', 'chest pain'];
  
  symptoms.forEach(symptom => {
    if (dangerSymptoms.some(ds => symptom.symptom.toLowerCase().includes(ds))) {
      redFlags.push(`Severe symptom detected: ${symptom.symptom}`);
    }
  });
  
  return redFlags;
}

module.exports = router; 