// Load the appropriate environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';

require('dotenv').config({ path: envFile });

console.log(`Loaded environment from: ${envFile}`);
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
});