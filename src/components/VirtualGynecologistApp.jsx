import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDoctors, mockAppointments, mockMessages } from '../lib/mock-data';

// Beautiful inline styles
const styles = {
  // Base animations and keyframes
  '@keyframes float': {
    '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
    '33%': { transform: 'translate(30px, -30px) rotate(120deg)' },
    '66%': { transform: 'translate(-20px, 20px) rotate(240deg)' }
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' }
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 }
  },
  
  // Global body style (applied via useEffect)
  body: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    color: '#1a1a1a',
    overflowX: 'hidden'
  },
  
  // Main container
  appContainer: {
    minHeight: '100vh',
    position: 'relative'
  },
  
  // Animated background
  animatedBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
    `,
    zIndex: -1,
    animation: 'float 20s ease-in-out infinite'
  },
  
  // Navigation
  navigation: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: '20px 40px'
  },
  
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  navLogo: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  },
  
  navTitle: {
    fontSize: '24px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  
  navSubtitle: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 500
  },
  
  navButtons: {
    display: 'flex',
    gap: '8px'
  },
  
  navBtn: {
    padding: '12px 20px',
    borderRadius: '16px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  
  navBtnHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    transform: 'translateY(-2px)'
  },
  
  navBtnActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  },
  
  navProfile: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    objectFit: 'cover'
  },
  
  // Main content
  mainContent: {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  
  // Hero section
  heroSection: {
    textAlign: 'center',
    marginBottom: '60px',
    padding: '60px 20px'
  },
  
  heroTitle: {
    fontSize: '48px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '20px',
    lineHeight: 1.2
  },
  
  heroSubtitle: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 400,
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6
  },
  
  // Trust indicators
  trustIndicators: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '60px'
  },
  
  trustCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    borderRadius: '24px',
    padding: '32px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  
  trustCardBefore: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s ease-in-out infinite'
  },
  
  trustCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
  },
  
  trustIcon: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '28px',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
    color: 'white'
  },
  
  trustTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'white',
    marginBottom: '12px'
  },
  
  trustDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    lineHeight: 1.5
  },
  
  // Section headers
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  
  sectionTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: 'white',
    marginBottom: '12px'
  },
  
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '16px'
  },
  
  // Doctor cards
  doctorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '32px',
    marginBottom: '60px'
  },
  
  // Emergency section
  emergencySection: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    borderRadius: '20px',
    padding: '24px',
    margin: '40px 0',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
  },
  
  emergencyIcon: {
    width: '60px',
    height: '60px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    animation: 'pulse 2s infinite'
  },
  
  emergencyContent: {
    flex: 1
  },
  
  emergencyTitle: {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '8px'
  },
  
  emergencyDescription: {
    opacity: 0.9,
    fontSize: '14px'
  },
  
  emergencyBtn: {
    background: 'white',
    color: '#ef4444',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginLeft: 'auto'
  },
  
  emergencyBtnHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)'
  },
  
  // Loading styles
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  },
  
  loadingSpinner: {
    textAlign: 'center'
  },
  
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(102, 126, 234, 0.1)',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  },
  
  // Toast styles
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: '#1a1a1a',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '400px',
    zIndex: 10001,
    animation: 'slideInRight 0.3s ease-out'
  },
  
  toastSuccess: {
    borderLeft: '4px solid #10b981'
  },
  
  toastError: {
    borderLeft: '4px solid #ef4444'
  },
  
  toastInfo: {
    borderLeft: '4px solid #3b82f6'
  },
  
  toastIcon: {
    fontSize: '18px',
    minWidth: '20px'
  },
  
  toastContent: {
    flex: 1
  },
  
  toastClose: {
    background: 'none',
    border: 'none',
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.3s ease'
  },
  
  toastCloseHover: {
    background: 'rgba(0, 0, 0, 0.1)',
    color: '#1a1a1a'
  }
};

// Context for state management
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('book-appointment');
  const [appointments, setAppointments] = useState(mockAppointments);
  const [messages, setMessages] = useState(mockMessages);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView,
      appointments, setAppointments,
      messages, setMessages,
      selectedDoctor, setSelectedDoctor,
      isVideoCallActive, setIsVideoCallActive,
      loading, setLoading,
      toast, setToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Custom hook for video call
const useVideoCall = () => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  useEffect(() => {
    let interval;
    if (callDuration > 0) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callDuration]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return { 
    callDuration, 
    setCallDuration, 
    isMuted, 
    setIsMuted, 
    isCameraOn, 
    setIsCameraOn, 
    formatDuration 
  };
};

// Toast Component with beautiful inline styles
const Toast = ({ message, type, onClose }) => {
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastStyle = () => ({
    ...styles.toast,
    ...(type === 'success' ? styles.toastSuccess : {}),
    ...(type === 'error' ? styles.toastError : {}),
    ...(type === 'info' ? styles.toastInfo : {})
  });

  const getCloseButtonStyle = () => ({
    ...styles.toastClose,
    ...(isCloseHovered ? styles.toastCloseHover : {})
  });

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  };

  return (
    <div style={getToastStyle()}>
      <div style={styles.toastIcon}>
        {getIcon()}
      </div>
      <div style={styles.toastContent}>
        <span>{message}</span>
      </div>
      <button 
        style={getCloseButtonStyle()}
        onClick={onClose}
        onMouseEnter={() => setIsCloseHovered(true)}
        onMouseLeave={() => setIsCloseHovered(false)}
      >
        ×
      </button>
    </div>
  );
};

// Loading Component with beautiful inline styles
const Loading = () => (
  <div style={styles.loadingOverlay}>
    <div style={styles.loadingSpinner}>
      <div style={styles.spinner}></div>
      <p style={{ color: '#667eea', fontWeight: 600, margin: 0 }}>Loading...</p>
    </div>
  </div>
);

// Navigation Component with beautiful inline styles
const Navigation = () => {
  const { currentView, setCurrentView } = useApp();
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const navItems = [
    { id: 'book-appointment', icon: '📅', label: 'Book' },
    { id: 'appointments', icon: '🗓️', label: 'Appointments' },
    { id: 'messaging', icon: '💬', label: 'Messages' },
    { id: 'prescriptions', icon: '💊', label: 'Prescriptions' }
  ];

  const getButtonStyle = (itemId) => ({
    ...styles.navBtn,
    ...(currentView === itemId ? styles.navBtnActive : {}),
    ...(hoveredBtn === itemId ? styles.navBtnHover : {})
  });

  return (
    <>
      {/* Animated Background */}
      <div style={styles.animatedBackground}></div>
      
      {/* Desktop Navigation */}
      <nav style={styles.navigation}>
        <div style={styles.navContainer}>
          <div style={styles.navBrand}>
            <div style={styles.navLogo}>✚</div>
            <div>
              <div style={styles.navTitle}>WellWoman</div>
              <div style={styles.navSubtitle}>Healthcare Platform</div>
            </div>
          </div>
          
          <div style={styles.navButtons}>
            {navItems.map(item => (
              <button
                key={item.id}
                style={getButtonStyle(item.id)}
                onClick={() => setCurrentView(item.id)}
                onMouseEnter={() => setHoveredBtn(item.id)}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <img 
            src="https://images.unsplash.com/photo-1494790108755-2616c6de2ce2?w=150&h=150&fit=crop&crop=face"
            alt="Profile"
            style={styles.navProfile}
          />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div style={{
        display: 'none',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '12px 0',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        '@media (max-width: 768px)': {
          display: 'block'
        }
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}>
          {navItems.map(item => (
            <button
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                color: currentView === item.id ? '#667eea' : 'rgba(255, 255, 255, 0.7)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                ...(currentView === item.id ? { backgroundColor: 'rgba(102, 126, 234, 0.1)' } : {})
              }}
              onClick={() => setCurrentView(item.id)}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// Hero Section with beautiful inline styles
const HeroSection = () => (
  <div style={styles.heroSection}>
    <h1 style={styles.heroTitle}>Premium Women's Healthcare</h1>
    <p style={styles.heroSubtitle}>
      Connect with certified gynecologists instantly. Secure, private, and professional consultations from the comfort of your home.
    </p>
  </div>
);

// Trust Indicators with beautiful inline styles
const TrustIndicators = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const trustData = [
    {
      icon: '🔒',
      title: 'Bank-Level Security',
      description: 'End-to-end encryption protects all your medical data and conversations'
    },
    {
      icon: '⚡',
      title: 'Instant Consultations',
      description: 'Connect with specialists within minutes, 24/7 availability'
    },
    {
      icon: '🏆',
      title: 'Certified Experts',
      description: 'Board-certified gynecologists with 10+ years of experience'
    }
  ];

  const getCardStyle = (index) => ({
    ...styles.trustCard,
    ...(hoveredCard === index ? styles.trustCardHover : {})
  });

  return (
    <div style={styles.trustIndicators}>
      {trustData.map((item, index) => (
        <div 
          key={index}
          style={getCardStyle(index)}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={styles.trustCardBefore}></div>
          <div style={styles.trustIcon}>{item.icon}</div>
          <h3 style={styles.trustTitle}>{item.title}</h3>
          <p style={styles.trustDescription}>{item.description}</p>
        </div>
      ))}
    </div>
  );
};

// Emergency Section with beautiful inline styles
const EmergencySection = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div style={styles.emergencySection}>
      <div style={styles.emergencyIcon}>🚨</div>
      <div style={styles.emergencyContent}>
        <h4 style={styles.emergencyTitle}>Emergency Services Available</h4>
        <p style={styles.emergencyDescription}>24/7 emergency consultations for urgent gynecological concerns</p>
      </div>
      <button 
        style={{
          ...styles.emergencyBtn,
          ...(isHovered ? styles.emergencyBtnHover : {})
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Call Emergency
      </button>
    </div>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor }) => {
  const { setSelectedDoctor, setCurrentView, setToast } = useApp();

  const handleBookAppointment = () => {
    setSelectedDoctor(doctor);
    setToast({ message: `Booking appointment with Dr. ${doctor.name}`, type: 'success' });
  };

  const getRandomTime = () => {
    const times = ['2:00 PM', '3:30 PM', '4:15 PM', '5:00 PM'];
    return times[Math.floor(Math.random() * times.length)];
  };

  const achievements = ['🏆 Top Rated', '📋 Board Certified', '⚡ Quick Response'];
  const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];

  return (
    <div className="doctor-card" style={{ position: 'relative', background: 'rgba(255, 255, 255, 0.98)' }}>
      {/* Premium Badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Premium
      </div>

      <div className="doctor-header">
        <div style={{ position: 'relative' }}>
          <img 
            src={doctor.image}
            alt={doctor.name}
            className="doctor-image"
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '24px',
              border: '4px solid rgba(102, 126, 234, 0.2)',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
            }}
          />
          <div className="doctor-status" style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: '24px',
            height: '24px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '50%',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
          }}></div>
        </div>
        <div className="doctor-info" style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '22px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1a1a1a, #374151)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px'
          }}>{doctor.name}</h3>
          <div className="doctor-specialty" style={{
            color: '#667eea',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '8px'
          }}>{doctor.specialization}</div>
          <div className="doctor-rating" style={{ marginBottom: '8px' }}>
            <div className="rating-stars" style={{ fontSize: '16px', marginRight: '8px' }}>⭐⭐⭐⭐⭐</div>
            <span className="rating-number" style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
              4.9 (127 reviews)
            </span>
          </div>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #e0f2fe, #b3e5fc)',
            color: '#0369a1',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            {randomAchievement}
          </div>
        </div>
      </div>

      {/* Specializations Tags */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        flexWrap: 'wrap', 
        margin: '16px 0',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        {['Pregnancy Care', 'PCOS Treatment', 'Fertility'].map((spec, index) => (
          <span key={index} style={{
            background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
            color: '#374151',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 500
          }}>
            {spec}
          </span>
        ))}
      </div>

      <div className="doctor-fee-section" style={{
        background: 'linear-gradient(135deg, #fafbfc, #f1f5f9)',
        borderRadius: '20px',
        padding: '24px',
        margin: '20px 0',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)'
        }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="fee-info">
            <h4 style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Consultation Fee</h4>
            <div className="fee-amount" style={{
              fontSize: '28px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>₹{doctor.consultationFee}</div>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
              💳 Insurance Accepted
            </div>
          </div>
          <div className="availability-info" style={{ textAlign: 'right' }}>
            <div className="availability-status" style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>🟢 Available Now</div>
            <div className="next-slot" style={{ color: '#6b7280', fontSize: '12px' }}>
              Next: {getRandomTime()}
            </div>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Languages:</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['English', 'Hindi', 'Spanish'].map((lang, index) => (
            <span key={index} style={{
              background: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 500
            }}>
              {lang}
            </span>
          ))}
        </div>
      </div>

      <button className="book-btn" onClick={handleBookAppointment} style={{
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
      }}>
        <span style={{ position: 'relative', zIndex: 2 }}>💫 Book Consultation</span>
      </button>
    </div>
  );
};

// Book Appointment View with beautiful inline styles
const BookAppointmentView = () => {
  const statsData = [
    { number: '10,000+', label: 'Happy Patients', icon: '😊' },
    { number: '50+', label: 'Expert Doctors', icon: '👩‍⚕️' },
    { number: '24/7', label: 'Support Available', icon: '🕐' },
    { number: '99%', label: 'Success Rate', icon: '⚡' }
  ];

  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    margin: '40px 0 60px',
    padding: '40px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(15px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const statItemStyle = {
    textAlign: 'center',
    padding: '20px'
  };

  const statIconStyle = {
    fontSize: '32px',
    marginBottom: '12px'
  };

  const statNumberStyle = {
    fontSize: '28px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px'
  };

  const statLabelStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px',
    fontWeight: 600
  };

  return (
    <div style={styles.mainContent}>
      <HeroSection />
      <TrustIndicators />
      
      {/* Stats Section */}
      <div style={statsContainerStyle}>
        {statsData.map((stat, index) => (
          <div key={index} style={statItemStyle}>
            <div style={statIconStyle}>{stat.icon}</div>
            <div style={statNumberStyle}>{stat.number}</div>
            <div style={statLabelStyle}>{stat.label}</div>
          </div>
        ))}
      </div>
      
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Choose Your Specialist</h2>
        <p style={styles.sectionSubtitle}>Select from our team of experienced gynecologists</p>
      </div>

      <div style={styles.doctorsGrid}>
        {mockDoctors.map(doctor => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>

    {/* Services Section */}
    <div style={{ margin: '80px 0 60px' }}>
      <div className="section-header">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">Comprehensive women's healthcare solutions</p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {[
          {
            icon: '🤰',
            title: 'Pregnancy Care',
            description: 'Complete prenatal and postnatal care with regular monitoring',
            features: ['Regular checkups', 'Ultrasound scans', 'Nutrition guidance']
          },
          {
            icon: '💊',
            title: 'PCOS Treatment',
            description: 'Specialized treatment for PCOS and hormonal disorders',
            features: ['Hormone therapy', 'Lifestyle coaching', 'Regular monitoring']
          },
          {
            icon: '🌸',
            title: 'Fertility Consulting',
            description: 'Expert guidance for family planning and fertility treatments',
            features: ['Fertility assessment', 'Treatment options', 'Emotional support']
          }
        ].map((service, index) => (
          <div key={index} style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(15px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }} 
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)'
            }}></div>
            
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>{service.icon}</div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: '12px',
              textAlign: 'center'
            }}>{service.title}</h3>
            
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '20px',
              textAlign: 'center'
            }}>{service.description}</p>
            
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {service.features.map((feature, idx) => (
                <li key={idx} style={{
                  padding: '8px 0',
                  fontSize: '14px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#10b981' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <EmergencySection />

    {/* Feature Sidebar */}
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', marginTop: '60px' }}>
      <div>
        <h3 className="section-title" style={{ fontSize: '24px', marginBottom: '20px' }}>Why Choose WellWoman?</h3>
        <div style={{ display: 'grid', gap: '16px' }}>
          {[
            { icon: '🎯', title: 'Personalized Care', desc: 'Tailored treatment plans for your unique needs' },
            { icon: '📱', title: 'Modern Technology', desc: 'State-of-the-art telemedicine platform' },
            { icon: '🔍', title: 'Comprehensive Care', desc: 'From routine checkups to complex treatments' },
            { icon: '🌟', title: 'Patient Satisfaction', desc: '98% patient satisfaction rate' }
          ].map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon-wrapper">
                <span style={{ color: 'white' }}>{feature.icon}</span>
              </div>
              <div className="feature-text">
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="feature-sidebar">
        <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Security Features</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            '🔐 HIPAA Compliant',
            '🛡️ SSL Encrypted',
            '👤 Anonymous Options',
            '🔒 Secure Payments',
            '📋 Digital Records'
          ].map((feature, index) => (
            <div key={index} style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '14px',
              padding: '8px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};

// Appointment Card Component
const AppointmentCard = ({ appointment }) => {
  const { setCurrentView, setIsVideoCallActive, setToast } = useApp();
  
  // Get doctor details from mockDoctors array
  const doctor = mockDoctors.find(doc => doc.id === appointment.doctorId);
  
  const handleJoinCall = () => {
    setIsVideoCallActive(true);
    setCurrentView('video-call');
    setToast({ message: 'Joining video call...', type: 'info' });
  };

  const handleReschedule = () => {
    setToast({ message: 'Appointment rescheduled successfully', type: 'success' });
  };

  const handleCancel = () => {
    setToast({ message: 'Appointment cancelled', type: 'error' });
  };

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <div className="appointment-doctor">
          <img 
            src={doctor?.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face"}
            alt={appointment.doctorName}
            className="doctor-avatar"
          />
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
              {appointment.doctorName}
            </h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>{appointment.type}</p>
          </div>
        </div>
        <div className={`appointment-status status-${appointment.status}`}>
          {appointment.status}
        </div>
      </div>

      <div className="appointment-details">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
          <div>
            <strong>📅 Date:</strong> {appointment.date}
          </div>
          <div>
            <strong>🕒 Time:</strong> {appointment.time}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <strong>📋 Type:</strong> {appointment.type}
          </div>
        </div>
      </div>

      <div className="appointment-actions">
        {appointment.status === 'upcoming' && (
          <>
            <button className="btn-secondary" onClick={handleReschedule}>
              Reschedule
            </button>
            <button className="btn-primary" onClick={handleJoinCall}>
              Join Call
            </button>
          </>
        )}
        {appointment.status === 'completed' && (
          <>
            <button className="btn-secondary">View Report</button>
            <button className="btn-primary">Book Follow-up</button>
          </>
        )}
        {appointment.status === 'cancelled' && (
          <button className="btn-primary" style={{ width: '100%' }}>
            Rebook Appointment
          </button>
        )}
      </div>
    </div>
  );
};

// Appointments View
const AppointmentsView = () => {
  const { appointments } = useApp();

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <div className="main-content">
      <div className="section-header">
        <h2 className="section-title">Your Appointments</h2>
        <p className="section-subtitle">Manage your healthcare appointments</p>
      </div>

      {upcomingAppointments.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
            Upcoming Appointments
          </h3>
          {upcomingAppointments.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}

      {pastAppointments.length > 0 && (
        <div>
          <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
            Past Appointments
          </h3>
          {pastAppointments.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}

      {appointments.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3 className="empty-title">No Appointments Yet</h3>
          <p className="empty-description">Book your first consultation to get started</p>
          <button className="btn-primary" style={{ marginTop: '20px' }}>
            Book Appointment
          </button>
        </div>
      )}
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, isUser }) => (
  <div className={`message-bubble ${isUser ? 'user-message' : 'doctor-message'}`}>
    <img 
      src={isUser 
        ? "https://images.unsplash.com/photo-1494790108755-2616c6de2ce2?w=150&h=150&fit=crop&crop=face"
        : "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face"
      }
      alt="Avatar"
      className="message-avatar"
    />
    <div className="message-content">
      <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>{message.text}</p>
      <div className="message-time">{message.time}</div>
    </div>
  </div>
);

// Messaging View
const MessagingView = () => {
  const { messages, setMessages, setToast } = useApp();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
      setToast({ message: 'Message sent', type: 'success' });

      // Simulate doctor response
      setTimeout(() => {
        const doctorResponse = {
          id: Date.now() + 1,
          text: "Thank you for your message. I'll review this and get back to you shortly.",
          sender: 'doctor',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, doctorResponse]);
      }, 2000);
    }
  };

  return (
    <div className="main-content">
      <div className="section-header">
        <h2 className="section-title">Secure Messaging</h2>
        <p className="section-subtitle">Communicate privately with your healthcare provider</p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <h3>Dr. Sarah Johnson</h3>
          <div className="chat-status">🟢 Online</div>
        </div>

        <div className="chat-messages">
          {messages.map(message => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isUser={message.sender === 'user'} 
            />
          ))}
        </div>

        <div className="message-composer">
          <div className="composer-input">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <button 
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Prescription Card Component
const PrescriptionCard = ({ prescription }) => (
  <div className="prescription-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
          Dr. {prescription.doctorName}
        </h3>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          📅 Prescribed on {prescription.date}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
          ✓ VERIFIED
        </div>
      </div>
    </div>

    <div>
      <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
        💊 Medications
      </h4>
      {prescription.medications.map((med, index) => (
        <div key={index} className="medication-item">
          <div className="medication-name">{med.name}</div>
          <div className="medication-details">
            <div><strong>Dosage:</strong> {med.dosage}</div>
            <div><strong>Duration:</strong> {med.duration}</div>
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>Instructions:</strong> {med.instructions}
            </div>
          </div>
        </div>
      ))}
    </div>

    {prescription.notes && (
      <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
        <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          📝 Doctor's Notes
        </h5>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
          {prescription.notes}
        </p>
      </div>
    )}

    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
      <button className="btn-secondary">Download PDF</button>
      <button className="btn-primary">Refill Request</button>
    </div>
  </div>
);

// Prescriptions View
const PrescriptionsView = () => {
  const mockPrescriptions = [
    {
      id: 1,
      doctorName: "Sarah Johnson",
      date: "Dec 15, 2024",
      medications: [
        {
          name: "Ibuprofen 200mg",
          dosage: "1 tablet",
          duration: "7 days",
          instructions: "Take with food, twice daily"
        },
        {
          name: "Folic Acid 5mg",
          dosage: "1 tablet",
          duration: "30 days",
          instructions: "Take once daily in the morning"
        }
      ],
      notes: "Continue regular prenatal vitamins. Follow up in 2 weeks for routine checkup."
    },
    {
      id: 2,
      doctorName: "Emily Chen",
      date: "Dec 10, 2024",
      medications: [
        {
          name: "Metformin 500mg",
          dosage: "1 tablet",
          duration: "60 days",
          instructions: "Take with dinner"
        }
      ],
      notes: "Monitor blood sugar levels daily. Schedule follow-up in 4 weeks."
    }
  ];

  return (
    <div className="main-content">
      <div className="section-header">
        <h2 className="section-title">Your Prescriptions</h2>
        <p className="section-subtitle">Manage your medications and refills</p>
      </div>

      {mockPrescriptions.map(prescription => (
        <PrescriptionCard key={prescription.id} prescription={prescription} />
      ))}

      {mockPrescriptions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💊</div>
          <h3 className="empty-title">No Prescriptions Yet</h3>
          <p className="empty-description">Your prescriptions will appear here after consultations</p>
        </div>
      )}
    </div>
  );
};

// Video Call View
const VideoCallView = () => {
  const { setIsVideoCallActive, setCurrentView, setToast } = useApp();
  const { callDuration, setCallDuration, isMuted, setIsMuted, isCameraOn, setIsCameraOn, formatDuration } = useVideoCall();

  useEffect(() => {
    setCallDuration(1);
    return () => setCallDuration(0);
  }, [setCallDuration]);

  const handleEndCall = () => {
    setIsVideoCallActive(false);
    setCurrentView('appointments');
    setToast({ message: 'Call ended successfully', type: 'info' });
  };

  return (
    <div className="video-call-container" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
        `,
        animation: 'float 15s ease-in-out infinite'
      }}></div>

      <div className="video-call-header" style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        padding: '24px 40px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="call-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img 
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face"
                alt="Doctor"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  border: '2px solid rgba(16, 185, 129, 0.5)'
                }}
              />
              <div>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 600, 
                  marginBottom: '4px',
                  color: 'white'
                }}>Dr. Sarah Johnson</h3>
                <div className="call-status" style={{
                  color: '#10b981',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  Connected • HD Quality
                </div>
              </div>
            </div>
          </div>
          <div className="call-duration" style={{
            fontSize: '32px',
            fontWeight: 700,
            fontFamily: 'Monaco, monospace',
            color: 'white',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
          }}>{formatDuration(callDuration)}</div>
          <button 
            className="btn-secondary"
            onClick={handleEndCall}
            style={{ 
              background: 'rgba(239, 68, 68, 0.8)', 
              border: 'none', 
              color: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 1)'}
            onMouseLeave={e => e.target.style.background = 'rgba(239, 68, 68, 0.8)'}
          >
            End Call
          </button>
        </div>
      </div>

      <div className="video-grid" style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '0',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Main Doctor Video */}
        <div className="video-frame" style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          borderRadius: '0',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '70vh'
        }}>
          <img 
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop&crop=face"
            alt="Doctor"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <div className="video-label" style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            backdropFilter: 'blur(10px)'
          }}>Dr. Sarah Johnson</div>
          
          {/* Recording Indicator */}
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: 'white',
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite'
            }}></div>
            Recording
          </div>
        </div>
        
        {/* Self Video - Picture in Picture */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          width: '300px',
          height: '200px',
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          zIndex: 10
        }}>
          <img 
            src="https://images.unsplash.com/photo-1494790108755-2616c6de2ce2?w=400&h=300&fit=crop&crop=face"
            alt="You"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isCameraOn ? 'none' : 'blur(10px) grayscale(100%)'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500
          }}>You</div>
          
          {!isCameraOn && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: '24px'
            }}>📵</div>
          )}
        </div>
      </div>

      <div className="video-controls" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '30px',
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <button 
          className={`control-btn mute-btn`}
          onClick={() => setIsMuted(!isMuted)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: isMuted ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>
        
        <button 
          className={`control-btn camera-btn`}
          onClick={() => setIsCameraOn(!isCameraOn)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: !isCameraOn ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          {isCameraOn ? '📹' : '📵'}
        </button>
        
        <button 
          className="control-btn chat-btn"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          💬
        </button>
        
        <button 
          className="control-btn end-call-btn" 
          onClick={handleEndCall}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
          }}
        >
          📞
        </button>
      </div>
    </div>
  );
};

// Main App Component with beautiful inline styles
const VirtualGynecologistApp = () => {
  const { currentView, loading, toast, setToast, isVideoCallActive } = useApp();

  // Apply global styles to body
  useEffect(() => {
    document.body.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.style.minHeight = '100vh';
    document.body.style.color = '#1a1a1a';
    document.body.style.overflowX = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    return () => {
      // Cleanup styles if needed
      document.body.style.fontFamily = '';
      document.body.style.background = '';
      document.body.style.minHeight = '';
      document.body.style.color = '';
      document.body.style.overflowX = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  if (isVideoCallActive) {
    return <VideoCallView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'book-appointment':
        return <BookAppointmentView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'messaging':
        return <MessagingView />;
      case 'prescriptions':
        return <PrescriptionsView />;
      default:
        return <BookAppointmentView />;
    }
  };

  return (
    <div style={styles.appContainer}>
      <Navigation />
      {renderView()}
      
      {loading && <Loading />}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

const WrappedApp = () => (
  <AppProvider>
    <VirtualGynecologistApp />
  </AppProvider>
);

export default WrappedApp; 