export const mockDoctors = [
    {
      id: 1,
      name: "Dr. Priya Sharma",
      specialization: "Gynecologist & Obstetrician",
      experience: "15 years",
      rating: 4.9,
      reviews: 1247,
      availability: ["9:00 AM", "2:00 PM", "6:00 PM"],
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
      languages: ["Hindi", "English", "Marathi"],
      consultationFee: 800,
      nextAvailable: "Available Today",
      qualification: "MBBS, MD (OBG)",
      hospital: "Apollo Hospital, Mumbai",
      registrationNo: "MH-12345",
    },
    {
      id: 2,
      name: "Dr. Kavitha Reddy",
      specialization: "Women's Health Specialist",
      experience: "12 years",
      rating: 4.8,
      reviews: 892,
      availability: ["10:00 AM", "1:00 PM", "5:00 PM"],
      image: "https://images.unsplash.com/photo-1594824475108-d5fb6e11cddb?w=300&h=300&fit=crop&crop=face",
      languages: ["Telugu", "Hindi", "English"],
      consultationFee: 600,
      nextAvailable: "Available Today",
      qualification: "MBBS, DGO, DNB",
      hospital: "Fortis Hospital, Hyderabad",
      registrationNo: "TS-67890",
    },
    {
      id: 3,
      name: "Dr. Anita Kumari",
      specialization: "Maternal & Fetal Medicine",
      experience: "18 years",
      rating: 4.9,
      reviews: 1523,
      availability: ["8:00 AM", "11:00 AM", "7:00 PM"],
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
      languages: ["Hindi", "English", "Bengali", "Punjabi"],
      consultationFee: 1000,
      nextAvailable: "Available Today",
      qualification: "MBBS, MD, FRCOG",
      hospital: "AIIMS, New Delhi",
      registrationNo: "DL-11111",
    },
  ]
  
  export const mockAppointments = [
    {
      id: 1,
      doctorId: 1,
      doctorName: "Dr. Priya Sharma",
      date: "2024-08-15",
      time: "2:00 PM",
      status: "upcoming",
      type: "Pregnancy Checkup",
      meetingLink: "https://meet.gyneconsult.com/abc123",
    },
    {
      id: 2,
      doctorId: 2,
      doctorName: "Dr. Kavitha Reddy",
      date: "2024-07-20",
      time: "10:00 AM",
      status: "completed",
      type: "Women's Health Consultation",
      duration: "45 minutes",
    },
  ]
  
  export const mockPrescriptions = [
    {
      id: 1,
      doctorName: "Dr. Kavitha Reddy",
      date: "2024-07-20",
      prescriptionNumber: "RX-IND-2024-001",
      medications: [
        { name: "Folic Acid", dosage: "400mcg daily", duration: "30 days", instructions: "Take with breakfast" },
        {
          name: "Iron Supplement",
          dosage: "65mg twice daily",
          duration: "60 days",
          instructions: "Take with meals to avoid stomach upset",
        },
      ],
      notes: "Patient advised to maintain a healthy diet and regular exercise. Follow-up in 4 weeks.",
      refillsRemaining: 2,
    },
  ]
  
  export const mockMessages = [
  {
    id: 1,
    text: "Hello Doctor, I have some questions about my recent test results.",
    sender: "user",
    time: "10:30 AM"
  },
  {
    id: 2,
    text: "Hi! I'd be happy to help you understand your results. What specific questions do you have?",
    sender: "doctor",
    time: "10:32 AM"
  },
  {
    id: 3,
    text: "I noticed some values were highlighted. Should I be concerned?",
    sender: "user",
    time: "10:35 AM"
  }
];

export const mockUser = {
  name: "Priya Gupta",
  lastVisit: "July 20, 2024",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b002?w=150&h=150&fit=crop&crop=face",
  patientId: "PAT-IND-12345",
  location: "New Delhi, India",
}
  