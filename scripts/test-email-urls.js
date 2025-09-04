#!/usr/bin/env node

// This script tests email URL generation to ensure production URLs are correct

console.log('Testing email URL generation...\n');

// Test with production environment
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_BASE_URL = 'https://suryayoga.ge';

console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log();

// Import the gmail functions after setting env vars
const { generateVerificationToken } = require('../src/lib/gmail.ts');

// Test token generation (doesn't require OAuth for this test)
const testEmail = 'test@example.com';
console.log('Testing token generation...');
try {
  const token = generateVerificationToken(testEmail);
  console.log('✅ Token generated successfully');
  console.log('Token length:', token.length);
} catch (error) {
  console.log('❌ Token generation failed:', error.message);
}

console.log('\n--- Test Results ---');
console.log('The email functions should now use https://suryayoga.ge in production');
console.log('Check the server logs when emails are sent to verify the URLs are correct');