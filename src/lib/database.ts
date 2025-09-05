import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

// Database file path - use environment variable or default to project root
// In production, try multiple possible locations
function getDatabasePath(): string {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  
  // Try different possible paths in production
  const possiblePaths = [
    path.join(process.cwd(), 'surya-yoga.db'),
    path.join(process.cwd(), 'data', 'surya-yoga.db'),
    path.join('/tmp', 'surya-yoga.db'),
    './surya-yoga.db'
  ];
  
  // Return the first path that works or default to current directory
  return possiblePaths[0];
}

const dbPath = getDatabasePath();

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    try {
      console.log('Opening database at:', dbPath);
      
      // Create the directory if it doesn't exist
      const dir = path.dirname(dbPath);
      if (!require('fs').existsSync(dir)) {
        console.log('Creating directory:', dir);
        require('fs').mkdirSync(dir, { recursive: true });
      }
      
      db = new Database(dbPath);
      db.pragma('journal_mode = WAL'); // Better for concurrent access
      initializeDatabase();
      console.log('Database opened successfully at:', dbPath);
    } catch (error) {
      console.error('Failed to open database:', error);
      // Try in-memory database as last resort
      console.log('Using in-memory database as fallback');
      db = new Database(':memory:');
      db.pragma('journal_mode = WAL');
      initializeDatabase();
      
      // Create a default admin user for testing
      try {
        createUser('admin', 'admin@suryayoga.ge', 'admin123').then(userId => {
          const updateStmt = db!.prepare('UPDATE users SET is_verified = 1, is_admin = 1 WHERE id = ?');
          updateStmt.run(userId);
          console.log('Created default admin user - username: admin, password: admin123');
        });
      } catch (e) {
        console.log('Could not create default admin');
      }
    }
  }
  return db;
}

function initializeDatabase() {
  if (!db) return;

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_verified INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add is_admin column if it doesn't exist (for existing databases)
  try {
    db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0');
  } catch (error) {
    // Column already exists, ignore error
  }

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Sessions table for managing user sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // News posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS news_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_en TEXT NOT NULL,
      title_ge TEXT NOT NULL,
      content_en TEXT NOT NULL,
      content_ge TEXT NOT NULL,
      excerpt_en TEXT,
      excerpt_ge TEXT,
      featured_image TEXT,
      media_files TEXT,
      author_id INTEGER NOT NULL,
      is_published INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id)
    )
  `);

  // Comments table for news posts
  db.exec(`
    CREATE TABLE IF NOT EXISTS news_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES news_posts (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  console.log('Database initialized successfully');
  
  // Create default admin user if it doesn't exist
  seedDefaultAdmin();
}

async function seedDefaultAdmin() {
  if (!db) return;
  
  try {
    // Check if admin user already exists
    const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get('revazdavitashvili@gmail.com');
    
    if (!existingAdmin) {
      console.log('Creating default admin user...');
      
      // Create the admin user
      const userId = await createUser('Surya', 'revazdavitashvili@gmail.com', 'Apolon1989!(*(');
      
      // Update user to be admin and verified
      const updateStmt = db.prepare('UPDATE users SET is_verified = 1, is_admin = 1 WHERE id = ?');
      updateStmt.run(userId);
      
      console.log('Default admin user created successfully');
      console.log('Username: Surya');
      console.log('Email: revazdavitashvili@gmail.com');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Failed to create default admin user:', error);
  }
}

// User management functions
export interface User {
  id: number;
  username: string;
  email: string;
  is_admin?: number;
  password_hash: string;
  is_verified: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  rating: number;
  title: string;
  content: string;
  language: string;
  is_approved: number;
  created_at: string;
  updated_at: string;
  username?: string; // Added when joining with users table
}

export interface NewsPost {
  id: number;
  title_en: string;
  title_ge: string;
  content_en: string;
  content_ge: string;
  excerpt_en?: string;
  excerpt_ge?: string;
  featured_image?: string;
  media_files?: string; // JSON string of media file paths
  author_id: number;
  is_published: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  username?: string; // Added when joining with users table
  comment_count?: number; // Added when counting comments
}

export interface NewsComment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  is_approved: number;
  created_at: string;
  updated_at: string;
  username?: string; // Added when joining with users table
}

export async function createUser(username: string, email: string, password: string): Promise<number> {
  const db = getDatabase();
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, is_verified)
    VALUES (?, ?, ?, 0)
  `);
  
  const result = stmt.run(username, email, hashedPassword);
  return result.lastInsertRowid as number;
}

export function getUserByEmail(email: string): User | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | null;
}

export function getUserById(id: number): User | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | null;
}

export function verifyUser(email: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE users SET is_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE email = ?');
  const result = stmt.run(email);
  return result.changes > 0;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function updateUserPassword(email: string, hashedPassword: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?');
  const result = stmt.run(hashedPassword, email);
  return result.changes > 0;
}

export function makeUserAdmin(email: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE users SET is_admin = 1, updated_at = CURRENT_TIMESTAMP WHERE email = ?');
  const result = stmt.run(email);
  return result.changes > 0;
}

// Review management functions
export function createReview(userId: number, rating: number, title: string, content: string, language: string = 'en'): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO reviews (user_id, rating, title, content, language, is_approved)
    VALUES (?, ?, ?, ?, ?, 0)
  `);
  
  const result = stmt.run(userId, rating, title, content, language);
  return result.lastInsertRowid as number;
}

export function getApprovedReviews(language?: string): Review[] {
  const db = getDatabase();
  let query = `
    SELECT r.*, u.username 
    FROM reviews r 
    JOIN users u ON r.user_id = u.id 
    WHERE r.is_approved = 1
  `;
  
  if (language) {
    query += ` AND r.language = ?`;
    const stmt = db.prepare(query + ` ORDER BY r.created_at DESC`);
    return stmt.all(language) as Review[];
  } else {
    const stmt = db.prepare(query + ` ORDER BY r.created_at DESC`);
    return stmt.all() as Review[];
  }
}

export function getAllReviews(): Review[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT r.*, u.username 
    FROM reviews r 
    JOIN users u ON r.user_id = u.id 
    ORDER BY r.created_at DESC
  `);
  return stmt.all() as Review[];
}

export function approveReview(reviewId: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE reviews SET is_approved = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  const result = stmt.run(reviewId);
  return result.changes > 0;
}

export function deleteReview(reviewId: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM reviews WHERE id = ?');
  const result = stmt.run(reviewId);
  return result.changes > 0;
}

// Session management functions
export function createSession(userId: number, sessionId: string, expiresAt: Date): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(sessionId, userId, expiresAt.toISOString());
  return result.changes > 0;
}

export function getSession(sessionId: string): { user_id: number; expires_at: string } | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT user_id, expires_at FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP');
  return stmt.get(sessionId) as { user_id: number; expires_at: string } | null;
}

export function deleteSession(sessionId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  const result = stmt.run(sessionId);
  return result.changes > 0;
}

export function cleanupExpiredSessions(): number {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP');
  const result = stmt.run();
  return result.changes;
}

// News post management functions
export function createNewsPost(
  titleEn: string,
  titleGe: string,
  contentEn: string,
  contentGe: string,
  excerptEn: string,
  excerptGe: string,
  featuredImage: string | null,
  mediaFiles: string[] | null,
  authorId: number,
  isPublished: boolean = false
): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO news_posts (
      title_en, title_ge, content_en, content_ge, excerpt_en, excerpt_ge,
      featured_image, media_files, author_id, is_published, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    titleEn, titleGe, contentEn, contentGe, excerptEn, excerptGe,
    featuredImage, mediaFiles ? JSON.stringify(mediaFiles) : null,
    authorId, isPublished ? 1 : 0, isPublished ? new Date().toISOString() : null
  );
  return result.lastInsertRowid as number;
}

export function getPublishedNewsPosts(): NewsPost[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT n.*, u.username 
    FROM news_posts n 
    JOIN users u ON n.author_id = u.id 
    WHERE n.is_published = 1
    ORDER BY n.published_at DESC
  `);
  return stmt.all() as NewsPost[];
}

export function getAllNewsPosts(): NewsPost[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT n.*, u.username 
    FROM news_posts n 
    JOIN users u ON n.author_id = u.id 
    ORDER BY n.created_at DESC
  `);
  return stmt.all() as NewsPost[];
}

export function getNewsPostById(id: number): NewsPost | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT n.*, u.username 
    FROM news_posts n 
    JOIN users u ON n.author_id = u.id 
    WHERE n.id = ?
  `);
  return stmt.get(id) as NewsPost | null;
}

export function updateNewsPost(
  id: number,
  titleEn: string,
  titleGe: string,
  contentEn: string,
  contentGe: string,
  excerptEn: string,
  excerptGe: string,
  featuredImage: string | null,
  mediaFiles: string[] | null,
  isPublished: boolean = false
): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE news_posts SET
      title_en = ?, title_ge = ?, content_en = ?, content_ge = ?,
      excerpt_en = ?, excerpt_ge = ?, featured_image = ?, media_files = ?,
      is_published = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  const result = stmt.run(
    titleEn, titleGe, contentEn, contentGe, excerptEn, excerptGe,
    featuredImage, mediaFiles ? JSON.stringify(mediaFiles) : null,
    isPublished ? 1 : 0, isPublished ? new Date().toISOString() : null, id
  );
  return result.changes > 0;
}

export function deleteNewsPost(id: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM news_posts WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function toggleNewsPostPublication(id: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE news_posts SET
      is_published = 1 - is_published,
      published_at = CASE 
        WHEN is_published = 0 THEN CURRENT_TIMESTAMP 
        ELSE published_at 
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const result = stmt.run(id);
  return result.changes > 0;
}

// News comment management functions
export function createNewsComment(postId: number, userId: number, content: string): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO news_comments (post_id, user_id, content, is_approved)
    VALUES (?, ?, ?, 1)
  `);
  
  const result = stmt.run(postId, userId, content);
  return result.lastInsertRowid as number;
}

export function getCommentsByPostId(postId: number): NewsComment[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT c.*, u.username 
    FROM news_comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.post_id = ? AND c.is_approved = 1
    ORDER BY c.created_at ASC
  `);
  return stmt.all(postId) as NewsComment[];
}

export function getAllNewsComments(): NewsComment[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT c.*, u.username 
    FROM news_comments c 
    JOIN users u ON c.user_id = u.id 
    ORDER BY c.created_at DESC
  `);
  return stmt.all() as NewsComment[];
}

export function deleteNewsComment(commentId: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM news_comments WHERE id = ?');
  const result = stmt.run(commentId);
  return result.changes > 0;
}

export function getNewsPostsWithCommentCounts(): NewsPost[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT n.*, u.username,
           COUNT(c.id) as comment_count
    FROM news_posts n 
    JOIN users u ON n.author_id = u.id 
    LEFT JOIN news_comments c ON n.id = c.post_id AND c.is_approved = 1
    WHERE n.is_published = 1
    GROUP BY n.id
    ORDER BY n.published_at DESC
  `);
  return stmt.all() as NewsPost[];
}