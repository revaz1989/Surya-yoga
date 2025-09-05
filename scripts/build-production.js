#!/usr/bin/env node

// Set production environment
process.env.NODE_ENV = 'production';

// Load ONLY production environment variables
// Clear any existing env vars from .env.local
delete process.env.NEXT_PUBLIC_BASE_URL;
require('dotenv').config({ path: '.env.production' });

console.log('Building for production with environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log();

// Run Next.js build
const { spawn } = require('child_process');

const nextBuild = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

nextBuild.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
  process.exit(code);
});