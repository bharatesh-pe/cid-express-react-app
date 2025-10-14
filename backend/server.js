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
//const powerbiRoutes=require('routes/powerbi');

const powerbiRoutes = require('./routes/powerbi');
const app = express();
app.use('/api/powerbi', powerbiRoutes);
// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// Combined allowed origins for both development and production
const allowedOrigins = [
  'localhost',
  '127.0.0.1',
  '139.59.35.227',
  'cop-main.patterneffects.in',
  'mob-beta.patterneffects.in',
  'rs.patterneffects.in',
  'muddemal.patterneffects.in',
  'mob.patterneffects.in',
  process.env.FRONTEND_URL,
  process.env.VUE_APP_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ CORS allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Support both HTTP and HTTPS
      const httpOrigin = `http://${allowedOrigin}`;
      const httpsOrigin = `https://${allowedOrigin}`;
      return origin === httpOrigin || origin === httpsOrigin || origin.includes(allowedOrigin);
    });
    
    if (isAllowed) {
      console.log('✅ CORS allowing origin:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Accept'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Handle preflight OPTIONS requests specifically for PowerBI routes
app.options('/api/powerbi/*', (req, res) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    if (!origin) return false;
    const httpOrigin = `http://${allowedOrigin}`;
    const httpsOrigin = `https://${allowedOrigin}`;
    return origin === httpOrigin || origin === httpsOrigin || origin.includes(allowedOrigin);
  });
  
  if (isAllowed || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    console.log('✅ Preflight OPTIONS allowed for PowerBI route from origin:', origin);
    res.sendStatus(200);
  } else {
    console.log('❌ Preflight OPTIONS blocked for PowerBI route from origin:', origin);
    res.status(403).json({ error: 'CORS preflight request blocked' });
  }
});

// General OPTIONS handler for other routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Accept');
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
