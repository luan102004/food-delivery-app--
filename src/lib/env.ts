// src/lib/env.ts - NEW FILE FOR ENV VALIDATION
/**
 * Environment Variables Validation & Type Safety
 * Run this at app startup to ensure all required env vars are present
 */

interface EnvConfig {
  // Database
  MONGODB_URI: string;
  
  // Authentication
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  
  // OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  
  // Pusher (Realtime)
  PUSHER_APP_ID: string;
  PUSHER_APP_KEY: string;
  PUSHER_APP_SECRET: string;
  PUSHER_APP_CLUSTER: string;
  NEXT_PUBLIC_PUSHER_APP_KEY: string;
  NEXT_PUBLIC_PUSHER_APP_CLUSTER: string;
  
  // Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
  
  // Optional
  NODE_ENV: 'development' | 'production' | 'test';
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];
  
  // Required variables
  const required: (keyof EnvConfig)[] = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'PUSHER_APP_ID',
    'PUSHER_APP_KEY',
    'PUSHER_APP_SECRET',
    'PUSHER_APP_CLUSTER',
    'NEXT_PUBLIC_PUSHER_APP_KEY',
    'NEXT_PUBLIC_PUSHER_APP_CLUSTER',
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  ];
  
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment Configuration Errors:');
    console.error('═══════════════════════════════════════');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('═══════════════════════════════════════');
    console.error('\n📝 Please create/update your .env.local file with:');
    console.error(`
# Database
MONGODB_URI=mongodb://localhost:27017/food_delivery

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Pusher (Realtime) - Get from https://pusher.com
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster
NEXT_PUBLIC_PUSHER_APP_KEY=your_app_key
NEXT_PUBLIC_PUSHER_APP_CLUSTER=your_cluster

# Google Maps - Get from https://console.cloud.google.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
    `);
    
    throw new Error('Environment configuration incomplete. Check console for details.');
  }
  
  return {
    MONGODB_URI: process.env.MONGODB_URI!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    PUSHER_APP_ID: process.env.PUSHER_APP_ID!,
    PUSHER_APP_KEY: process.env.PUSHER_APP_KEY!,
    PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET!,
    PUSHER_APP_CLUSTER: process.env.PUSHER_APP_CLUSTER!,
    NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  };
}

// Export validated config
export const env = validateEnv();

// Helper to check if running in production
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Helper to check if OAuth is configured
export const hasGoogleOAuth = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

// Helper to get base URL
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  if (env.NEXTAUTH_URL) return env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

// Helper for safe client-side env access
export const getClientEnv = () => ({
  PUSHER_APP_KEY: env.NEXT_PUBLIC_PUSHER_APP_KEY,
  PUSHER_APP_CLUSTER: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
  GOOGLE_MAPS_API_KEY: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
});