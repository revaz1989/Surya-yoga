const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(process.cwd(), 'surya-yoga.db');

const emailToMakeAdmin = 'suryayogageorgia@gmail.com';

console.log('Making user admin...');
console.log('Database path:', dbPath);
console.log('Email:', emailToMakeAdmin);

try {
  const db = new Database(dbPath);
  
  // Check if user exists
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailToMakeAdmin);
  
  if (!user) {
    console.log(`❌ User with email ${emailToMakeAdmin} not found`);
    console.log('User needs to register first with Google Sign-In or regular registration');
  } else if (user.is_admin === 1) {
    console.log(`✅ User ${emailToMakeAdmin} is already an admin`);
  } else {
    // Make user admin
    const stmt = db.prepare('UPDATE users SET is_admin = 1 WHERE email = ?');
    stmt.run(emailToMakeAdmin);
    console.log(`✅ Successfully made ${emailToMakeAdmin} an admin`);
  }
  
  // Show all admin users
  const admins = db.prepare('SELECT email, username FROM users WHERE is_admin = 1').all();
  console.log('\nCurrent admin users:');
  admins.forEach(admin => {
    console.log(`  - ${admin.email} (${admin.username})`);
  });
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}