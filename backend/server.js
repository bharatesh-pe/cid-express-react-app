const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const ssoRoutes = require('./routes/sso');
const userRoutes = require('./routes/userRoutes');
const powerBIroutes = require('./routes/powerbi');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  const allowedOrigins = ['localhost', '127.0.0.1','139.59.35.227','cop-main.patterneffects.in','mob-beta.patterneffects.in','rs.patterneffects.in','muddemal.patterneffects.in','mob.patterneffects.in'];
  // Development: Local checking purpose Allow all localhost origins
  // const allowedOrigins = [
  //   'http://localhost:3000',
  //   'http://localhost:3001', 
  //   'http://localhost:5173',
  //   'http://127.0.0.1:3000',
  //   'http://127.0.0.1:3001',
  //   'http://127.0.0.1:5173',
  //   'http://139.59.35.227',
  //   'http://cop-main.patterneffects.in',
  //   'http://mob-beta.patterneffects.in',
  //   'http://rs.patterneffects.in',
  //   'http://muddemal.patterneffects.in',
  //   'http://mob.patterneffects.in'
  // ];
  
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow any localhost origin in development (including preview server)
      const isAllowed = allowedOrigins.some(allowedOrigin => origin.includes(allowedOrigin));
      // Check if origin is in allowed list or is a localhost variant -  For local testing purposes
      // const isAllowed = allowedOrigins.includes(origin) || 
      //                  origin.startsWith('http://localhost:') || 
      //                  origin.startsWith('http://127.0.0.1:');
      
      if (isAllowed) {
        console.log('✅ CORS allowing origin:', origin);
        return callback(null, true);
      }
      
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Accept']
  }));
} else {
  // Production: Specific allowed origins
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.VUE_APP_URL
  ].filter(Boolean);

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Accept']
  }));
}

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Accept'); - Local testing purpose
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/sso', ssoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/powerbi', powerBIroutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
