#!/usr/bin/env tsx

import { testMongoDBConnection } from '../src/lib/mongodb-test';

console.log('╔════════════════════════════════════════╗');
console.log('║  MongoDB Connection Test              ║');
console.log('╚════════════════════════════════════════╝\n');

testMongoDBConnection().then(success => {
  if (success) {
    console.log('\n✅ MongoDB connection test PASSED');
    console.log('You can now run: npm run seed');
  } else {
    console.log('\n❌ MongoDB connection test FAILED');
    console.log('\n📝 Troubleshooting steps:');
    console.log('1. Check .env.local file exists');
    console.log('2. Verify MONGODB_URI is correct');
    console.log('3. For MongoDB Atlas:');
    console.log('   - Check username/password');
    console.log('   - Whitelist IP: 0.0.0.0/0 (for testing)');
    console.log('   - Database user has read/write permissions');
    console.log('4. For local MongoDB:');
    console.log('   - Ensure mongod is running');
    console.log('   - Try: mongodb://127.0.0.1:27017/food_delivery');
  }
  
  process.exit(success ? 0 : 1);
});