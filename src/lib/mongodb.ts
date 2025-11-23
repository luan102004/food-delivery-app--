// src/lib/mongodb.ts - FIXED VERSION
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error(
    '⚠️ MONGODB_URI is not defined in .env.local\n' +
    'Please create .env.local and add:\n' +
    'MONGODB_URI=mongodb://localhost:27017/food_delivery\n' +
    'or use MongoDB Atlas connection string'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // Return existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Check if URI is configured
  if (!MONGODB_URI) {
    throw new Error(
      'Please define MONGODB_URI in .env.local file'
    );
  }

  // Create new connection promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip IPv6
      retryWrites: true,
      w: 'majority' as const,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected Successfully');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        console.log('🔌 Host:', mongoose.connection.host);
        return mongoose;
      })
      .catch((error) => {
        cached.promise = null; // Reset on error
        console.error('❌ MongoDB Connection Error:', error.message);
        
        // Provide helpful error messages
        if (error.message.includes('authentication failed')) {
          console.error('💡 Check your username and password in MONGODB_URI');
        } else if (error.message.includes('ENOTFOUND')) {
          console.error('💡 Check your network connection and MongoDB host');
        } else if (error.message.includes('timeout')) {
          console.error('💡 MongoDB server is not responding. Check if:');
          console.error('   - MongoDB is running (local)');
          console.error('   - IP is whitelisted (Atlas)');
        }
        
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// Export connection status checker
export async function checkDBConnection(): Promise<boolean> {
  try {
    await connectDB();
    return mongoose.connection.readyState === 1;
  } catch (error) {
    return false;
  }
}

// Export connection state
export const getConnectionState = (): number => {
  return mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
};