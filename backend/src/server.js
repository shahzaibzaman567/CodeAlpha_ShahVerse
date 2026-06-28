require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// ── DB Middleware ─────────────────────────────────────────────────────────────
// For Vercel serverless: connectDB is called per-request so connection is
// re-used across warm invocations (cached in global.mongoose).
const dbMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB Connection failed:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please try again.',
    });
  }
};

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── DB connection on every /api/* request ─────────────────────────────────────
app.use('/api', dbMiddleware);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({
  success: true,
  message: '✨ ShahVerse API',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await connectDB();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }
  res.json({
    success: true,
    message: 'ShahVerse API is healthy ✅',
    env: process.env.NODE_ENV || 'development',
    mongo: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/products',   require('./routes/productRoutes'));
app.use('/api/orders',     require('./routes/orderRoutes'));
app.use('/api/users',      require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/coupons',    require('./routes/couponRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start (local only) ────────────────────────────────────────────────────────
// On Vercel, module.exports = app is enough (serverless)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
}

module.exports = app;
