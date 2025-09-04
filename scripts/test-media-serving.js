#!/usr/bin/env node

// Test script to verify media file serving works correctly

const fs = require('fs');
const path = require('path');

async function testMediaServing() {
  console.log('🧪 Testing media file serving configuration...\n');
  
  // Test environment variables
  console.log('Environment Configuration:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('UPLOAD_DIR:', process.env.UPLOAD_DIR);
  console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
  console.log();
  
  // Check upload directory
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
  const newsDir = path.join(uploadDir, 'news');
  
  console.log('Directory Check:');
  console.log('Upload directory:', uploadDir);
  console.log('Upload dir exists:', fs.existsSync(uploadDir));
  console.log('News directory:', newsDir);
  console.log('News dir exists:', fs.existsSync(newsDir));
  
  if (fs.existsSync(newsDir)) {
    const files = fs.readdirSync(newsDir);
    console.log('Files in news directory:', files.length);
    if (files.length > 0) {
      console.log('Sample files:', files.slice(0, 3));
    }
  }
  console.log();
  
  // Test URL generation
  const sampleFilename = '1757011701105_studio4_upscayl_4x_upscayl-standard-4x.png';
  const apiUrl = `/api/media/news/${sampleFilename}`;
  const directUrl = `/uploads/news/${sampleFilename}`;
  
  console.log('URL Generation Test:');
  console.log('API URL:', apiUrl);
  console.log('Direct URL (nginx):', directUrl);
  console.log();
  
  // Production recommendations
  console.log('🚀 Production Recommendations:');
  console.log('1. Use nginx to serve /uploads/* directly for better performance');
  console.log('2. Use /api/media/* as fallback for dynamic serving');
  console.log('3. Ensure UPLOAD_DIR is set to /var/lib/suryayoga/uploads');
  console.log('4. Run migration script: npm run migrate-uploads');
  console.log('5. Test both URLs work in production');
  console.log();
  
  // File permissions check (Unix-like systems)
  if (process.platform !== 'win32' && fs.existsSync(uploadDir)) {
    try {
      const stats = fs.statSync(uploadDir);
      console.log('Directory Permissions:');
      console.log('Upload dir permissions:', (stats.mode & parseInt('777', 8)).toString(8));
    } catch (error) {
      console.log('Could not check permissions:', error.message);
    }
  }
  
  console.log('✅ Media serving test completed!');
}

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
require('dotenv').config({ path: envFile });

testMediaServing().catch(console.error);