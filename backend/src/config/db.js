const mongoose = require('mongoose');

// Cache connection for Vercel serverless warm reuse
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return cached connection if available and still connected
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  if (!cached.promise) {
    const opts = {
      // Vercel functions have a 10s default timeout — keep DB handshake under that
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      maxPoolSize: 10,
      minPoolSize: 1,
      bufferCommands: false, // Fail fast when disconnected (don't queue ops)
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        // Reset so the next request can retry
        cached.promise = null;
        cached.conn = null;
        console.error(`❌ MongoDB Error: ${err.message}`);
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
