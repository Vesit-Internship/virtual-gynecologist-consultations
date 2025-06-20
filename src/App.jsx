"use client"

import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react"
import { mockDoctors, mockAppointments, mockPrescriptions, mockUser } from "./lib/mock-data"
import "./App.css"

// ==================== CONTEXT ====================
const AppContext = createContext()

const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState("book-appointment")
  const [appointments, setAppointments] = useState(mockAppointments)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "doctor",
      content: "Hello! How can I help you today?",
      timestamp: new Date(Date.now() - 300000),
      avatar: mockDoctors[1].image,
    },
  ])

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type })
  }, [])

  const clearToast = useCallback(() => {
    setToast(null)
  }, [])

  const value = {
    currentView,
    appointments,
    isLoading,
    toast,
    isVideoCallActive,
    callDuration,
    messages,
    setCurrentView,
    setAppointments,
    setIsLoading,
    showToast,
    clearToast,
    setIsVideoCallActive,
    setCallDuration,
    setMessages,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

// ==================== CUSTOM HOOKS ====================
const useVideoCall = () => {
  const { isVideoCallActive, callDuration, setCallDuration, setIsVideoCallActive } = useApp()
  const callTimerRef = useRef(null)

  useEffect(() => {
    if (isVideoCallActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [isVideoCallActive, setCallDuration])

  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const endCall = () => {
    setIsVideoCallActive(false)
    setCallDuration(0)

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
    }
  }

  return {
    callDuration,
    formatCallTime,
    endCall,
  }
}

// ==================== UI COMPONENTS ====================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"

  return (
    <div className={`toast toast-${type} slide-in`}>
      <div className="toast-icon">{icon}</div>
      <div className="toast-content">
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="toast-close">
        ×
      </button>
    </div>
  )
}

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
)

const LoadingOverlay = () => (
  <div className="loading-overlay">
    <LoadingSpinner />
  </div>
)

const SkeletonCard = () => (
  <div className="doctor-card skeleton-card">
    <div className="skeleton skeleton-avatar"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text short"></div>
    <div className="skeleton skeleton-text medium"></div>
  </div>
)

const SecurityBadges = () => (
  <div className="security-badges">
    <div className="security-badge">🔒 Secure Platform</div>
    <div className="security-badge">🛡️ Encrypted</div>
    <div className="security-badge">⚡ 99.9% Uptime</div>
  </div>
)

const EmergencyContact = () => (
  <div className="emergency-contact">
    <button className="emergency-btn">🚨 Emergency: 102</button>
  </div>
)

// ==================== NAVIGATION COMPONENT ====================
const Navigation = ({ currentView, onViewChange }) => {
  const navigationItems = [
    { view: "book-appointment", label: "Book Appointment", icon: "➕" },
    { view: "appointments", label: "My Appointments", icon: "📅" },
    { view: "messaging", label: "Messages", icon: "💬" },
    { view: "prescriptions", label: "Prescriptions", icon: "💊" },
  ]

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <div className="logo">🏥</div>
        <h1>Women's Health Center</h1>
      </div>

      <div className="nav-menu">
        {navigationItems.map(({ view, label, icon }) => (
          <button
            key={view}
            className={`nav-btn ${currentView === view ? "active" : ""}`}
            onClick={() => onViewChange(view)}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="nav-profile">
        <div className="profile-info">
          <img src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} className="profile-avatar" />
          <div className="profile-details">
            <span className="profile-name">{mockUser.name}</span>
            <small className="profile-id">ID: {mockUser.patientId}</small>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ==================== DOCTOR CARD COMPONENT ====================
const DoctorCard = ({ doctor, index, onBookAppointment, isLoading }) => (
  <div className={`doctor-card slide-in-delay-${index}`}>
    <div className="doctor-badge">{doctor.nextAvailable}</div>
    <div className="doctor-header">
      <img src={doctor.image || "/placeholder.svg"} alt={doctor.name} className="doctor-image" />
      <div className="doctor-basic-info">
        <h3>{doctor.name}</h3>
        <p className="specialization">🩺 {doctor.specialization}</p>
        <div className="doctor-stats">
          <span className="rating">⭐ {doctor.rating}</span>
          <span className="reviews">({doctor.reviews} reviews)</span>
          <span className="experience">📚 {doctor.experience}</span>
        </div>
      </div>
    </div>

    <div className="doctor-details">
      <div className="languages">
        <strong>Languages:</strong> {doctor.languages.join(", ")}
      </div>
      <div className="qualification">
        <strong>Qualification:</strong> {doctor.qualification}
      </div>
      <div className="hospital">
        <strong>Hospital:</strong> {doctor.hospital}
      </div>
      <div className="consultation-fee">
        <span className="price">₹{doctor.consultationFee}</span>
        <small>per consultation</small>
      </div>
    </div>

    <div className="availability-section">
      <h4>🕒 Available Today</h4>
      <div className="time-slots">
        {doctor.availability.map((time) => (
          <button
            key={time}
            className="time-slot"
            onClick={() => onBookAppointment(doctor, "2024-08-20", time)}
            disabled={isLoading}
          >
            {time}
          </button>
        ))}
      </div>
    </div>

    <div className="doctor-actions">
      <button className="btn-secondary">👁️ View Profile</button>
      <button
        className="btn-primary"
        onClick={() => onBookAppointment(doctor, "2024-08-20", doctor.availability[0])}
        disabled={isLoading}
      >
        📅 Book Now
      </button>
    </div>
  </div>
)

// ==================== APPOINTMENT CARD COMPONENT ====================
const AppointmentCard = ({ appointment, index, onStartVideoCall }) => {
  const doctor = mockDoctors.find((d) => d.id === appointment.doctorId)

  return (
    <div className={`appointment-card ${appointment.status} slide-in-delay-${index}`}>
      <div className="appointment-main">
        <div className="appointment-doctor">
          <img src={doctor?.image || "/placeholder.svg"} alt={appointment.doctorName} />
          <div className="appointment-info">
            <h3>{appointment.doctorName}</h3>
            <p className="appointment-type">{appointment.type}</p>
            <div className="appointment-datetime">
              <span className="date">📅 {appointment.date}</span>
              <span className="time">🕒 {appointment.time}</span>
            </div>
          </div>
        </div>
        <div className="appointment-status">
          <span className={`status-badge ${appointment.status}`}>
            {appointment.status === "upcoming" ? "🔜 Upcoming" : "✅ Completed"}
          </span>
        </div>
      </div>

      {appointment.status === "upcoming" && (
        <div className="appointment-actions">
          <button className="btn-secondary">📝 Reschedule</button>
          <button className="btn-primary" onClick={onStartVideoCall}>
            🎥 Join Call
          </button>
        </div>
      )}

      {appointment.status === "completed" && appointment.duration && (
        <div className="appointment-summary">
          <p>📋 Duration: {appointment.duration}</p>
          <button className="btn-link">View Summary →</button>
        </div>
      )}
    </div>
  )
}

// ==================== MESSAGE COMPONENTS ====================
const MessageBubble = ({ message }) => (
  <div className={`message ${message.sender}`}>
    <img src={message.avatar || "/placeholder.svg"} alt={message.sender} className="message-avatar" />
    <div className="message-content">
      <div className="message-bubble">
        <p>{message.content}</p>
      </div>
      <small className="message-time">
        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </small>
    </div>
  </div>
)

const MessageComposer = ({ onSendMessage }) => {
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="message-input-container">
      <div className="message-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSendMessage} className="send-btn">
          ✈️
        </button>
      </div>
    </div>
  )
}

const ChatInterface = ({ messages, onSendMessage }) => {
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="messaging-container">
      <div className="chat-window">
        <div className="messages-list">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={chatEndRef} />
        </div>
        <MessageComposer onSendMessage={onSendMessage} />
      </div>
    </div>
  )
}

const MessagingFeatures = () => {
  const features = [
    { icon: "🔒", title: "End-to-End Encryption", description: "Your messages are completely secure and private" },
    { icon: "📱", title: "Mobile Notifications", description: "Get instant alerts for new messages" },
    { icon: "📎", title: "File Sharing", description: "Share documents, images, and test results" },
    { icon: "🕒", title: "24/7 Support", description: "Round-the-clock healthcare assistance" },
  ]

  return (
    <div className="messaging-features">
      {features.map((feature, index) => (
        <div key={index} className="feature-card">
          <span className="feature-icon">{feature.icon}</span>
          <h4>{feature.title}</h4>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  )
}

// ==================== PRESCRIPTION COMPONENTS ====================
const PrescriptionCard = ({ prescription, index }) => (
  <div className={`prescription-card slide-in-delay-${index}`}>
    <div className="prescription-header">
      <div className="prescription-info">
        <h3>📋 Prescription from {prescription.doctorName}</h3>
        <p className="prescription-meta">
          📅 {prescription.date} • 🆔 {prescription.prescriptionNumber}
        </p>
        <p className="refills-info">🔄 {prescription.refillsRemaining} refills remaining</p>
      </div>
      <div className="prescription-actions">
        <button className="btn-secondary">📄 Download PDF</button>
        <button className="btn-primary">📧 Send to Pharmacy</button>
      </div>
    </div>

    <div className="medications-section">
      <h4>💊 Medications</h4>
      {prescription.medications.map((med, index) => (
        <div key={index} className="medication-item">
          <div className="medication-icon">💊</div>
          <div className="medication-details">
            <h5>{med.name}</h5>
            <p className="dosage">📏 {med.dosage}</p>
            <p className="duration">⏰ Duration: {med.duration}</p>
            <p className="instructions">📝 {med.instructions}</p>
          </div>
          <div className="medication-actions">
            <button className="btn-small">🛒 Order Refill</button>
            <button className="btn-small">⏰ Set Reminder</button>
          </div>
        </div>
      ))}
    </div>

    <div className="prescription-notes">
      <h4>📝 Doctor's Notes</h4>
      <div className="notes-content">
        <p>{prescription.notes}</p>
      </div>
    </div>
  </div>
)

const PrescriptionFeatures = () => {
  const features = [
    { icon: "🏥", title: "Pharmacy Network", description: "Connected to 5000+ pharmacies across India" },
    { icon: "🚚", title: "Home Delivery", description: "Get medicines delivered to your doorstep" },
    { icon: "⏰", title: "Medication Reminders", description: "Never miss a dose with smart alerts" },
    { icon: "💰", title: "Insurance Claims", description: "Direct billing with major insurance providers" },
  ]

  return (
    <div className="prescription-features">
      <h3>Prescription Management Features</h3>
      <div className="feature-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <span className="feature-icon">{feature.icon}</span>
            <h4>{feature.title}</h4>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== VIDEO CALL COMPONENTS ====================
const VideoControls = ({ onEndCall }) => (
  <div className="video-controls">
    <button className="control-btn active">📹</button>
    <button className="control-btn active">🎤</button>
    <button className="control-btn">🖥️</button>
    <button className="control-btn end-call" onClick={onEndCall}>
      📞
    </button>
  </div>
)

// ==================== VIEW COMPONENTS ====================
const BookAppointmentView = () => {
  const { isLoading, appointments, setAppointments, showToast, setCurrentView, setIsLoading } = useApp()
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  const handleBookAppointment = async (doctor, date, time) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newAppointment = {
      id: appointments.length + 1,
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: date,
      time: time,
      status: "upcoming",
      type: "General Consultation",
      meetingLink: `https://meet.gyneconsult.com/${Math.random().toString(36).substr(2, 9)}`,
    }

    setAppointments([...appointments, newAppointment])
    setSelectedDoctor(doctor)
    setIsLoading(false)
    showToast(`Appointment booked successfully with ${doctor.name} for ${date} at ${time}!`, "success")
    setCurrentView("appointments")
  }

  return (
    <div className="view-container fade-in">
      <div className="page-header">
        <h2>Find Your Perfect Doctor</h2>
        <p>Connect with certified gynecologists and women's health specialists</p>
      </div>

      <div className="doctors-grid">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : mockDoctors.map((doctor, i) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                index={i}
                onBookAppointment={handleBookAppointment}
                isLoading={isLoading}
              />
            ))}
      </div>
    </div>
  )
}

const AppointmentsView = () => {
  const { appointments, setCurrentView, setIsVideoCallActive } = useApp()

  const startVideoCall = () => {
    setIsVideoCallActive(true)
    setCurrentView("video-call")
  }

  return (
    <div className="view-container fade-in">
      <div className="page-header">
        <h2>Your Appointments</h2>
        <p>Manage your healthcare schedule</p>
      </div>

      <div className="appointments-list">
        {appointments.map((appointment, i) => (
          <AppointmentCard key={appointment.id} appointment={appointment} index={i} onStartVideoCall={startVideoCall} />
        ))}
      </div>
    </div>
  )
}

const VideoCallView = () => {
  const { setCurrentView, setIsVideoCallActive, showToast } = useApp()
  const { callDuration, formatCallTime, endCall } = useVideoCall()
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.error("Video access denied:", err)
          showToast("Camera access denied. Please check permissions.", "error")
          setIsVideoCallActive(false)
          setCurrentView("appointments")
        })
    }
  }, [showToast, setIsVideoCallActive, setCurrentView])

  const handleEndCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
    }

    endCall()
    setCurrentView("appointments")
  }

  return (
    <div className="video-call-container">
      <div className="video-header">
        <h2>Video Consultation</h2>
        <div className="call-info">
          <span className="call-status">🟢 Connected</span>
          <span className="call-timer">⏱️ {formatCallTime(callDuration)}</span>
        </div>
      </div>

      <div className="video-layout">
        <div className="main-video">
          <video ref={videoRef} autoPlay muted className="doctor-video" />
          <div className="video-overlay">
            <span>Dr. Priya Sharma</span>
          </div>
        </div>

        <div className="self-video">
          <video autoPlay muted className="user-video" />
          <div className="video-overlay">
            <span>You</span>
          </div>
        </div>
      </div>

      <VideoControls onEndCall={handleEndCall} />
    </div>
  )
}

const MessagingView = () => {
  const { messages, setMessages } = useApp()

  const handleSendMessage = (content) => {
    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      content,
      timestamp: new Date(),
      avatar: mockUser.avatar,
    }

    setMessages((prev) => [...prev, newMessage])

    // Simulate doctor response
    setTimeout(() => {
      const doctorResponse = {
        id: messages.length + 2,
        sender: "doctor",
        content: "Thank you for your message. I will review and get back to you shortly.",
        timestamp: new Date(),
        avatar: mockDoctors[0].image,
      }
      setMessages((prev) => [...prev, doctorResponse])
    }, 2000)
  }

  return (
    <div className="view-container fade-in">
      <div className="page-header">
        <h2>💬 Secure Messaging</h2>
        <p>HIPAA-compliant communication with your healthcare providers</p>
      </div>

      <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
      <MessagingFeatures />
    </div>
  )
}

const PrescriptionsView = () => (
  <div className="view-container fade-in">
    <div className="page-header">
      <h2>💊 Digital Prescriptions</h2>
      <p>Manage your medications and prescriptions</p>
    </div>

    <div className="prescriptions-list">
      {mockPrescriptions.map((prescription, i) => (
        <PrescriptionCard key={prescription.id} prescription={prescription} index={i} />
      ))}
    </div>

    <PrescriptionFeatures />
  </div>
)

// ==================== MAIN APP COMPONENT ====================
const AppContent = () => {
  const { currentView, toast, isLoading, setCurrentView, clearToast } = useApp()

  const renderCurrentView = () => {
    switch (currentView) {
      case "book-appointment":
        return <BookAppointmentView />
      case "appointments":
        return <AppointmentsView />
      case "video-call":
        return <VideoCallView />
      case "messaging":
        return <MessagingView />
      case "prescriptions":
        return <PrescriptionsView />
      default:
        return <BookAppointmentView />
    }
  }

  return (
    <div className="app">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="main-content">{renderCurrentView()}</main>

      <SecurityBadges />
      <EmergencyContact />

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      {isLoading && <LoadingOverlay />}
    </div>
  )
}

const VirtualGynecologistApp = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default VirtualGynecologistApp
