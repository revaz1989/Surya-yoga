const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(process.cwd(), 'surya-yoga.db');

console.log('Adding google_id column to database...');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check if column already exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasGoogleIdColumn = tableInfo.some(column => column.name === 'google_id');
  
  if (hasGoogleIdColumn) {
    console.log('✅ google_id column already exists');
  } else {
    // Add the column (without UNIQUE constraint for existing tables)
    db.exec('ALTER TABLE users ADD COLUMN google_id TEXT');
    console.log('✅ Added google_id column to users table');
  }
  
  // Verify the column was added
  const updatedTableInfo = db.prepare("PRAGMA table_info(users)").all();
  console.log('Current users table structure:');
  updatedTableInfo.forEach(column => {
    console.log(`  - ${column.name} (${column.type})`);
  });
  
  db.close();
  console.log('✅ Database migration completed successfully');
  
} catch (error) {
  console.error('❌ Database migration failed:', error);
  process.exit(1);
}