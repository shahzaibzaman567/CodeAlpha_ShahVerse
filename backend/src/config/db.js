const mongoose = require('mongoose');
const dns = require('dns');

// ── Bypassing ISP DNS Timeouts locally ─────────────────────────────────────────
// Some ISP DNS servers fail or timeout when resolving Atlas replica sets.
// We override it with Google DNS for local development only.
if (process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('🌐 Local DNS Override: Using Google DNS (8.8.8.8) to connect to Atlas.');
  } catch (err) {
    console.warn('⚠️ DNS override failed:', err.message);
  }
}

// ── CRITICAL: Disable Mongoose buffering GLOBALLY before any models are loaded ──
// Without this, pre-compiled models still buffer queries for 10s then time out.
// With this, a failed/missing DB connection throws immediately with a clear error.
mongoose.set('bufferCommands', false);


// Cache the connection across Vercel serverless warm invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Reuse existing connected instance
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error(
      'MONGO_URI is not set. Add it to Vercel Environment Variables.'
    );
  }

  // Validate URI format — Vercel requires mongodb+srv://, not mongodb://
  if (process.env.MONGO_URI.startsWith('mongodb://') && process.env.MONGO_URI.includes(':27017')) {
    console.warn(
      '⚠️  MONGO_URI uses old shard format (mongodb://...27017). ' +
      'Vercel blocks port 27017. Use mongodb+srv:// from Atlas → Connect → Drivers.'
    );
  }

  if (!cached.promise) {
    const opts = {
      // Keep all timeouts well under Vercel's 30s maxDuration
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    console.log('🔌 Connecting to MongoDB...');

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        // Reset cache so next request retries
        cached.promise = null;
        cached.conn = null;
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        console.error(`   URI starts with: ${process.env.MONGO_URI?.substring(0, 30)}...`);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;

