import { getDatabase, createUser, createReview, approveReview } from './database';

export async function seedDatabase() {
  console.log('Seeding database with sample data...');
  
  try {
    const db = getDatabase();
    
    // Check if we already have data
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (existingUsers.count > 0) {
      console.log('Database already has users, skipping seed');
      return;
    }
    
    // Create sample users
    const users = [
      { username: 'anna_k', email: 'anna@example.com', password: 'TempPass123!' },
      { username: 'david_m', email: 'david@example.com', password: 'TempPass123!' },
      { username: 'mariam_g', email: 'mariam@example.com', password: 'TempPass123!' },
      { username: 'george_t', email: 'george@example.com', password: 'TempPass123!' }
    ];
    
    const userIds: number[] = [];
    for (const user of users) {
      const userId = await createUser(user.username, user.email, user.password);
      userIds.push(userId);
      
      // Mark users as verified for demo purposes
      db.prepare('UPDATE users SET is_verified = 1 WHERE id = ?').run(userId);
      console.log(`Created user: ${user.username} (ID: ${userId})`);
    }
    
    // Create sample reviews
    const reviews = [
      {
        userId: userIds[0],
        rating: 5,
        title: 'Amazing studio with wonderful instructors!',
        content: 'As a beginner, I felt welcomed and supported throughout my journey. The atmosphere is incredible and the instructors are so knowledgeable.',
        language: 'en'
      },
      {
        userId: userIds[1],
        rating: 5,
        title: 'Perfect for beginners',
        content: 'The Ashtanga practice here is perfectly adapted for beginners. I\'ve seen incredible progress in just a few months.',
        language: 'en'
      },
      {
        userId: userIds[2],
        rating: 5,
        title: 'წარმატებული სტუდია',
        content: 'ენერგია ამ სტუდიაში წარმოუდგენელია. ნამდვილად გრძნობ მზის სითბოს ყოველ პრაქტიკაში.',
        language: 'ge'
      },
      {
        userId: userIds[3],
        rating: 5,
        title: 'Best yoga studio in Tbilisi!',
        content: 'The instructors are knowledgeable and the community is so supportive. Highly recommend to anyone looking to start their yoga journey.',
        language: 'en'
      }
    ];
    
    for (const review of reviews) {
      const reviewId = createReview(
        review.userId,
        review.rating,
        review.title,
        review.content,
        review.language
      );
      
      // Auto-approve sample reviews
      approveReview(reviewId);
      console.log(`Created and approved review: ${review.title} (ID: ${reviewId})`);
    }
    
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}