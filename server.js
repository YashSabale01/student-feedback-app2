require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:password123321@clustercampusarena.jlehwpg.mongodb.net/student_feedback';
let isMongoConnected = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
    isMongoConnected = true;
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    isMongoConnected = false;
  });

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
  isMongoConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
  isMongoConnected = true;
});

// Feedback schema with validation
const feedbackSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, trim: true },
  branch: { type: String, required: true },
  useful: { type: String, required: true, enum: ['yes', 'no'] },
  rating: { type: Number, required: true, min: 1, max: 5 },
  suggestions: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'feedbacks'
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS and debugging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Validation
const validateForm = (data) => {
  const errors = {};
  if (!data.fullName?.trim()) errors.fullName = 'Full Name is required';
  else if (!/^[a-zA-Z\s]+$/.test(data.fullName.trim())) errors.fullName = 'Full Name must contain only alphabets and spaces';
  if (!data.email?.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Please enter a valid email address';
  if (!data.phone?.trim()) errors.phone = 'Contact Number is required';
  else if (!/^\d{10}$/.test(data.phone.trim())) errors.phone = 'Contact Number must be exactly 10 digits';
  if (!data.rollNo?.trim()) errors.rollNo = 'Roll Number is required';
  if (!data.branch) errors.branch = 'Branch is required';
  if (!data.useful) errors.useful = 'Please select if the course was useful';
  if (!data.rating) errors.rating = 'Rating is required';
  else if (!/^[1-5]$/.test(data.rating)) errors.rating = 'Rating must be between 1 and 5';
  return errors;
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server running', 
    mongodb: isMongoConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

app.post('/submit', async (req, res) => {
  console.log('📝 Received form submission:', req.body);
  
  if (!isMongoConnected) {
    console.log('❌ MongoDB not connected');
    return res.status(500).json({ success: false, errors: { general: 'Database connection unavailable' } });
  }

  const errors = validateForm(req.body);
  
  if (Object.keys(errors).length > 0) {
    console.log('❌ Validation errors:', errors);
    return res.status(400).json({ success: false, errors, data: req.body });
  }

  try {
    const feedbackData = {
      fullName: req.body.fullName.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone.trim(),
      rollNo: req.body.rollNo.trim(),
      branch: req.body.branch,
      useful: req.body.useful,
      rating: parseInt(req.body.rating),
      suggestions: req.body.suggestions?.trim() || ''
    };

    console.log('💾 Saving to database:', feedbackData);
    const feedback = new Feedback(feedbackData);
    const savedFeedback = await feedback.save();
    
    console.log('✅ Feedback saved to MongoDB Atlas:', {
      id: savedFeedback._id,
      name: savedFeedback.fullName,
      email: savedFeedback.email,
      timestamp: savedFeedback.createdAt
    });
    
    res.status(200).json({ success: true, message: 'Feedback submitted successfully!' });
  } catch (error) {
    console.error('❌ Database save error:', error);
    res.status(500).json({ success: false, errors: { general: `Database error: ${error.message}` } });
  }
});

// Add endpoint to view all feedbacks (for testing)
app.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.json({ success: false, error: 'Failed to fetch feedbacks' });
  }
});

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    const testDoc = new Feedback({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      rollNo: 'TEST123',
      branch: 'CSE',
      useful: 'yes',
      rating: 5,
      suggestions: 'Test submission'
    });
    
    const saved = await testDoc.save();
    await Feedback.findByIdAndDelete(saved._id);
    
    res.json({ success: true, message: 'Database connection working!', mongoStatus: isMongoConnected });
  } catch (error) {
    res.json({ success: false, error: error.message, mongoStatus: isMongoConnected });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Form: http://localhost:${PORT}`);
});