#!/usr/bin/env node

// Migration script to move uploads from public/uploads to production upload directory

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function copyDirectory(src, dest) {
  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      await mkdir(dest, { recursive: true });
    }

    const entries = await readdir(src);
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      
      const stats = await stat(srcPath);
      
      if (stats.isDirectory()) {
        // Recursively copy subdirectories
        await copyDirectory(srcPath, destPath);
      } else {
        // Copy file
        console.log(`Copying ${srcPath} -> ${destPath}`);
        await copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error('Error copying directory:', error);
  }
}

async function main() {
  console.log('Starting uploads migration...');
  
  const sourceDir = path.join(process.cwd(), 'public', 'uploads');
  const destDir = process.env.UPLOAD_DIR || '/var/lib/suryayoga/uploads';
  
  console.log('Source directory:', sourceDir);
  console.log('Destination directory:', destDir);
  
  if (!fs.existsSync(sourceDir)) {
    console.log('Source directory does not exist. Nothing to migrate.');
    return;
  }
  
  if (fs.existsSync(destDir)) {
    console.log('Destination directory already exists. Merging files...');
  }
  
  await copyDirectory(sourceDir, destDir);
  
  console.log('Migration completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update your .env.production file to include:');
  console.log(`   UPLOAD_DIR=${destDir}`);
  console.log('2. Restart your application');
  console.log('3. Test that uploaded files are accessible');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { copyDirectory };