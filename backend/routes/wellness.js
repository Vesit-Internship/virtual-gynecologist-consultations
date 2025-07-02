const express = require('express');
const router = express.Router();
const WellnessTracker = require('../models/WellnessTracker');
const { authenticateToken } = require('../middleware/auth');

// Log daily wellness data
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const {
      menstrualTracking,
      fertilityTracking,
      moodTracking,
      physicalHealth,
      nutrition,
      lifestyle,
      medications,
      symptoms,
      dailyGoals
    } = req.body;
    
    // Check if entry already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let tracker = await WellnessTracker.findOne({
      user: req.user.id,
      trackingDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (tracker) {
      // Update existing entry
      Object.assign(tracker, {
        menstrualTracking: menstrualTracking || tracker.menstrualTracking,
        fertilityTracking: fertilityTracking || tracker.fertilityTracking,
        moodTracking: moodTracking || tracker.moodTracking,
        physicalHealth: physicalHealth || tracker.physicalHealth,
        nutrition: nutrition || tracker.nutrition,
        lifestyle: lifestyle || tracker.lifestyle,
        medications: medications || tracker.medications,
        symptoms: symptoms || tracker.symptoms,
        dailyGoals: dailyGoals || tracker.dailyGoals
      });
    } else {
      // Create new entry
      tracker = new WellnessTracker({
        user: req.user.id,
        trackingDate: today,
        menstrualTracking,
        fertilityTracking,
        moodTracking,
        physicalHealth,
        nutrition,
        lifestyle,
        medications,
        symptoms,
        dailyGoals
      });
    }
    
    // Generate AI insights
    tracker.aiInsights = await generateAIInsights(tracker, req.user.id);
    
    await tracker.save();
    
    res.json({
      success: true,
      tracker,
      insights: tracker.aiInsights,
      cycleInfo: tracker.cycleInfo,
      anomalies: tracker.detectAnomalies()
    });
    
  } catch (error) {
    console.error('Wellness tracking error:', error);
    res.status(500).json({ error: 'Failed to save wellness data' });
  }
});

// Get wellness dashboard
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const days = parseInt(timeframe);
    
    const summary = await WellnessTracker.getWellnessSummary(req.user.id, days);
    const trends = await calculateWellnessTrends(req.user.id, days);
    const predictions = await generatePredictions(req.user.id);
    
    res.json({
      summary: {
        totalEntries: summary.length,
        averageHealthScore: calculateAverageHealthScore(summary),
        trends,
        predictions
      },
      recentEntries: summary.slice(0, 7),
      cycleOverview: await getCycleOverview(req.user.id),
      achievements: await getAchievements(req.user.id),
      recommendations: await getPersonalizedRecommendations(req.user.id)
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Get menstrual cycle insights
router.get('/cycle-insights', authenticateToken, async (req, res) => {
  try {
    const cycleData = await getMenstrualCycleData(req.user.id);
    const patterns = await analyzeCyclePatterns(cycleData);
    const predictions = await predictNextCycle(cycleData);
    
    res.json({
      currentCycle: cycleData.current,
      averageCycle: cycleData.average,
      patterns,
      predictions,
      fertilityWindow: calculateFertilityWindow(cycleData),
      symptoms: await getCommonSymptoms(req.user.id),
      recommendations: await getCycleRecommendations(patterns)
    });
    
  } catch (error) {
    console.error('Cycle insights error:', error);
    res.status(500).json({ error: 'Failed to generate cycle insights' });
  }
});

// Get mood and mental health trends
router.get('/mood-analysis', authenticateToken, async (req, res) => {
  try {
    const { period = '3months' } = req.query;
    
    const moodData = await getMoodData(req.user.id, period);
    const correlations = await findMoodCorrelations(req.user.id, period);
    const triggers = await identifyMoodTriggers(req.user.id);
    
    res.json({
      moodTrends: moodData.trends,
      averageMood: moodData.average,
      correlations: {
        withCycle: correlations.menstrual,
        withSleep: correlations.sleep,
        withExercise: correlations.exercise,
        withStress: correlations.stress
      },
      triggers,
      recommendations: await getMoodRecommendations(moodData, correlations)
    });
    
  } catch (error) {
    console.error('Mood analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze mood data' });
  }
});

// Get fertility tracking insights
router.get('/fertility-insights', authenticateToken, async (req, res) => {
  try {
    const fertilityData = await getFertilityData(req.user.id);
    const ovulationPrediction = await predictOvulation(fertilityData);
    const fertilityWindow = calculateFertilityWindow(fertilityData);
    
    res.json({
      currentPhase: fertilityData.currentPhase,
      ovulationPrediction,
      fertilityWindow,
      basalTemperatureTrend: fertilityData.temperatureTrend,
      cervicalMucusPattern: fertilityData.mucusPattern,
      recommendations: await getFertilityRecommendations(fertilityData)
    });
    
  } catch (error) {
    console.error('Fertility insights error:', error);
    res.status(500).json({ error: 'Failed to generate fertility insights' });
  }
});

// Get health correlations and patterns
router.get('/correlations', authenticateToken, async (req, res) => {
  try {
    const correlations = await analyzeHealthCorrelations(req.user.id);
    
    res.json({
      strongCorrelations: correlations.strong,
      moderateCorrelations: correlations.moderate,
      insights: correlations.insights,
      actionableRecommendations: correlations.recommendations
    });
    
  } catch (error) {
    console.error('Correlations analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze health correlations' });
  }
});

// Get wellness goals progress
router.get('/goals', authenticateToken, async (req, res) => {
  try {
    const goals = await getWellnessGoals(req.user.id);
    const progress = await calculateGoalsProgress(req.user.id);
    
    res.json({
      activeGoals: goals.active,
      completedGoals: goals.completed,
      progress,
      streaks: await calculateStreaks(req.user.id),
      suggestions: await suggestNewGoals(req.user.id)
    });
    
  } catch (error) {
    console.error('Goals tracking error:', error);
    res.status(500).json({ error: 'Failed to fetch goals data' });
  }
});

// Export wellness data
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const query = { user: req.user.id };
    if (startDate || endDate) {
      query.trackingDate = {};
      if (startDate) query.trackingDate.$gte = new Date(startDate);
      if (endDate) query.trackingDate.$lte = new Date(endDate);
    }
    
    const data = await WellnessTracker.find(query).sort({ trackingDate: 1 });
    
    if (format === 'csv') {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=wellness-data.csv');
      res.send(csv);
    } else {
      res.json({
        exportDate: new Date(),
        totalRecords: data.length,
        data: data
      });
    }
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Helper Functions
async function generateAIInsights(tracker, userId) {
  // Get user's historical data for pattern analysis
  const historicalData = await WellnessTracker.find({ user: userId })
    .sort({ trackingDate: -1 })
    .limit(30);
  
  const insights = {
    patterns: [],
    predictions: [],
    recommendations: [],
    healthScore: {
      overall: 75, // Would be calculated based on various factors
      categories: {
        menstrual: 80,
        fertility: 70,
        mental: 75,
        physical: 80,
        nutrition: 70,
        lifestyle: 75
      }
    }
  };
  
  // Analyze patterns
  if (tracker.moodTracking?.overallMood) {
    if (tracker.moodTracking.overallMood < 5) {
      insights.patterns.push({
        type: 'mood_decline',
        insight: 'Mood appears to be lower than usual',
        confidence: 75,
        actionable: true
      });
      
      insights.recommendations.push({
        category: 'mental_health',
        recommendation: 'Consider mood-boosting activities like exercise or meditation',
        priority: 'medium'
      });
    }
  }
  
  // Cycle-based insights
  if (tracker.menstrualTracking?.cycleDay) {
    const phase = tracker.cycleInfo?.phase;
    insights.predictions.push({
      event: 'next_period',
      date: new Date(Date.now() + (28 - tracker.menstrualTracking.cycleDay) * 24 * 60 * 60 * 1000),
      confidence: 80
    });
  }
  
  return insights;
}

async function calculateWellnessTrends(userId, days) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const data = await WellnessTracker.find({
    user: userId,
    trackingDate: { $gte: startDate, $lte: endDate }
  }).sort({ trackingDate: 1 });
  
  return {
    moodTrend: calculateTrend(data.map(d => d.moodTracking?.overallMood).filter(Boolean)),
    energyTrend: calculateTrend(data.map(d => d.moodTracking?.energyLevel).filter(Boolean)),
    sleepTrend: calculateTrend(data.map(d => d.moodTracking?.sleepQuality?.quality).filter(Boolean)),
    exerciseTrend: calculateTrend(data.map(d => d.physicalHealth?.exerciseMinutes).filter(Boolean))
  };
}

function calculateTrend(values) {
  if (values.length < 2) return 'insufficient_data';
  
  const first = values.slice(0, Math.floor(values.length / 2));
  const second = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
  const secondAvg = second.reduce((a, b) => a + b, 0) / second.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 5) return 'improving';
  if (change < -5) return 'declining';
  return 'stable';
}

async function generatePredictions(userId) {
  // Mock predictions - would use ML models in real implementation
  return {
    nextPeriod: {
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      confidence: 85
    },
    ovulation: {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      confidence: 70
    },
    fertileWindow: {
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      confidence: 75
    }
  };
}

function calculateAverageHealthScore(entries) {
  if (!entries.length) return 0;
  
  const scores = entries
    .map(entry => entry.aiInsights?.healthScore?.overall)
    .filter(Boolean);
  
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
}

function convertToCSV(data) {
  // Basic CSV conversion - would be more comprehensive in real implementation
  const headers = ['Date', 'Mood', 'Energy', 'Sleep Quality', 'Exercise Minutes'];
  const rows = data.map(entry => [
    entry.trackingDate.toISOString().split('T')[0],
    entry.moodTracking?.overallMood || '',
    entry.moodTracking?.energyLevel || '',
    entry.moodTracking?.sleepQuality?.quality || '',
    entry.physicalHealth?.exerciseMinutes || ''
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

module.exports = router; 