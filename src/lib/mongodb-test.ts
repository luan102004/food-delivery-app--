import mongoose from 'mongoose';

export async function testMongoDBConnection() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    return false;
  }

  console.log('🔍 Testing MongoDB connection...');
  console.log('📍 URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🔌 Host:', mongoose.connection.host);
    console.log('📡 Ready state:', mongoose.connection.readyState);

    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);

    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n💡 Possible issues:');
      console.error('1. MongoDB is not running (if using local)');
      console.error('2. Wrong connection string');
      console.error('3. Network/firewall issues');
      console.error('4. MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)');
    }

    return false;
  }
}

// Run test if executed directly
if (require.main === module) {
  testMongoDBConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}