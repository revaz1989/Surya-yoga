#!/usr/bin/env node

// Set production environment
process.env.NODE_ENV = 'production';

// Load production environment variables
require('dotenv').config({ path: '.env.production' });

// Set Node.js HTTP server limits for large file uploads
process.env.NODE_OPTIONS = '--max-http-header-size=80000';
process.env.UV_THREADPOOL_SIZE = '128';

console.log('Starting production server with environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log();

// Run Next.js start
const { spawn } = require('child_process');

const nextStart = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

nextStart.on('close', (code) => {
  console.log(`Start process exited with code ${code}`);
  process.exit(code);
});