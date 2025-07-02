# Virtual Gynecologist Backend API

A comprehensive Node.js/Express backend for the Virtual Gynecologist Consultation Platform, providing secure telemedicine services for women's health consultations in India.

## 🏥 Features

### Core Functionality
- **User Management**: Separate authentication for patients and doctors
- **Doctor Verification**: Multi-step verification process for medical professionals
- **Appointment Booking**: Flexible scheduling with time zone support
- **Video Consultations**: Real-time video calls with WebRTC
- **Real-time Messaging**: Secure chat between patients and doctors
- **Digital Prescriptions**: PDF generation with QR codes for verification
- **Payment Integration**: Support for Stripe, Razorpay, and UPI
- **File Uploads**: Medical documents and images with Cloudinary

### Security & Compliance
- **JWT Authentication**: Secure token-based authentication
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: Protection against abuse
- **Data Encryption**: Sensitive data encryption
- **Account Lockout**: Protection against brute force attacks
- **HIPAA Compliant**: Medical data privacy standards

### Technical Features
- **Real-time Communication**: Socket.IO for instant messaging and notifications
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Cloudinary for images and documents
- **Email Services**: Nodemailer for notifications
- **SMS Integration**: Twilio for appointment reminders
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed request and error logging
- **API Documentation**: RESTful API design

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud)
- Cloudinary account (for file uploads)

### Installation

1. **Clone and install dependencies**
```bash
cd backend
npm install
```

2. **Environment Setup**
```bash
cp config.env .env
# Edit .env with your configuration values
```

3. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud service
```

4. **Run the application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📋 Environment Variables

### Required Configuration
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/virtual_gynecologist
JWT_SECRET=your_super_secret_jwt_key_here
```

### Optional Services
```env
# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register/patient    - Register new patient
POST /api/auth/register/doctor     - Register new doctor
POST /api/auth/login               - User login
GET  /api/auth/me                  - Get current user
POST /api/auth/forgot-password     - Request password reset
PUT  /api/auth/reset-password/:token - Reset password
PUT  /api/auth/update-password     - Update password
POST /api/auth/logout              - Logout user
```

### Doctors
```
GET    /api/doctors                - Get all doctors (with filters)
GET    /api/doctors/:id            - Get single doctor
GET    /api/doctors/:id/availability - Get doctor availability
GET    /api/doctors/search/query   - Search doctors
GET    /api/doctors/meta/specializations - Get specializations
GET    /api/doctors/meta/cities    - Get available cities
POST   /api/doctors/:id/reviews    - Add doctor review
GET    /api/doctors/:id/reviews    - Get doctor reviews
GET    /api/doctors/:id/stats      - Get doctor statistics
```

### Appointments
```
GET    /api/appointments           - Get user appointments
POST   /api/appointments           - Book new appointment
GET    /api/appointments/:id       - Get appointment details
PUT    /api/appointments/:id       - Update appointment
DELETE /api/appointments/:id       - Cancel appointment
POST   /api/appointments/:id/reschedule - Reschedule appointment
```

### Prescriptions
```
GET    /api/prescriptions          - Get user prescriptions
GET    /api/prescriptions/:id      - Get prescription details
POST   /api/prescriptions          - Create prescription (doctors only)
PUT    /api/prescriptions/:id      - Update prescription
GET    /api/prescriptions/:id/pdf  - Download prescription PDF
```

### Messages
```
GET    /api/messages/conversations - Get user conversations
GET    /api/messages/:conversationId - Get conversation messages
POST   /api/messages               - Send message
PUT    /api/messages/:id/read      - Mark message as read
DELETE /api/messages/:id           - Delete message
```

### Video Calls
```
GET    /api/video-calls            - Get user video calls
POST   /api/video-calls            - Create video call
GET    /api/video-calls/:id        - Get call details
PUT    /api/video-calls/:id/join   - Join video call
PUT    /api/video-calls/:id/end    - End video call
POST   /api/video-calls/:id/feedback - Submit call feedback
```

### Users
```
GET    /api/users/profile          - Get user profile
PUT    /api/users/profile          - Update profile
POST   /api/users/avatar           - Upload avatar
GET    /api/users/medical-history  - Get medical history
PUT    /api/users/medical-history  - Update medical history
```

### Payments
```
POST   /api/payments/create-intent - Create payment intent
POST   /api/payments/confirm       - Confirm payment
GET    /api/payments/history       - Get payment history
POST   /api/payments/refund        - Process refund
```

## 🔗 Socket.IO Events

### Connection
```javascript
// Client connection with authentication
socket.emit('authenticate', { token: 'jwt_token' });
```

### Messaging
```javascript
// Join conversation
socket.emit('joinConversation', { patientId, doctorId });

// Send message
socket.emit('sendMessage', {
  patientId,
  doctorId,
  content: { text: 'Hello', type: 'text' }
});

// Typing indicator
socket.emit('typing', { patientId, doctorId, isTyping: true });
```

### Video Calls
```javascript
// Join video call
socket.emit('joinVideoCall', { callId });

// WebRTC signaling
socket.emit('webrtc-offer', { callId, offer, targetUserId });
socket.emit('webrtc-answer', { callId, answer, targetUserId });
socket.emit('webrtc-ice-candidate', { callId, candidate, targetUserId });
```

## 📊 Database Schema

### User Model (Patients)
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  gender: String,
  bloodGroup: String,
  address: Object,
  medicalHistory: [Object],
  gynecologicalHistory: Object,
  // ... more fields
}
```

### Doctor Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  registrationNumber: String,
  qualification: String,
  specialization: String,
  experience: Number,
  currentHospital: Object,
  consultationFee: Object,
  availability: Object,
  rating: Object,
  // ... more fields
}
```

### Appointment Model
```javascript
{
  patient: ObjectId,
  doctor: ObjectId,
  scheduledDateTime: Date,
  type: String,
  status: String,
  payment: Object,
  meetingLink: String,
  // ... more fields
}
```

## 🛡️ Security Features

### Authentication & Authorization
- JWT tokens with expiration
- Role-based access control (patient/doctor/admin)
- Account lockout after failed attempts
- Password strength requirements

### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption
- Rate limiting per endpoint
- Input validation and sanitization

### API Security
- CORS configuration
- Helmet for security headers
- Request size limits
- File upload restrictions

## 🚀 Deployment

### Production Setup
```bash
# Install dependencies
npm ci --only=production

# Set environment
export NODE_ENV=production

# Start with PM2
pm2 start server.js --name "gynecologist-api"
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Checklist
- [ ] MongoDB connection secured
- [ ] JWT secret configured
- [ ] CORS origins set
- [ ] File upload limits set
- [ ] Email service configured
- [ ] Payment gateway configured
- [ ] SSL certificates installed

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# API testing with Postman
# Import the Postman collection from /docs/api-collection.json
```

## 📝 API Documentation

Full API documentation is available at:
- Development: `http://localhost:5000/api-docs`
- Swagger/OpenAPI spec: `/docs/swagger.yaml`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@virtualgynecologist.com
- Documentation: [API Docs](http://localhost:5000/api-docs)
- Issues: [GitHub Issues](https://github.com/yourrepo/issues)

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added video calling and real-time messaging
- **v1.2.0** - Payment integration and prescription management

---

Built with ❤️ for women's healthcare in India 