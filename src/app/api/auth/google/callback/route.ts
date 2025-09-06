import { NextRequest, NextResponse } from 'next/server';
import { getGoogleUserInfo } from '@/lib/google-auth';
import { createUser, getUserByEmail, getDatabase } from '@/lib/database';
import { generateSessionToken, setAuthCookie } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: '${error === 'access_denied' ? 'Access denied' : 'Authentication failed'}'
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  if (!code) {
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'No authorization code received'
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `, {
      status: 400,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  try {
    const googleUser = await getGoogleUserInfo(code);
    
    if (!googleUser || !googleUser.email) {
      return new NextResponse(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'Failed to get user information from Google'
              }, window.location.origin);
              window.close();
            </script>
          </body>
        </html>
      `, {
        status: 400,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    if (!googleUser.email_verified) {
      return new NextResponse(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'Google email not verified'
              }, window.location.origin);
              window.close();
            </script>
          </body>
        </html>
      `, {
        status: 400,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Check if user exists by email or Google ID
    let user = getUserByEmail(googleUser.email);
    const db = getDatabase();
    
    // Also check by Google ID
    if (!user && googleUser.sub) {
      try {
        const stmt = db.prepare('SELECT * FROM users WHERE google_id = ?');
        user = stmt.get(googleUser.sub) as any;
      } catch (error) {
        console.error('Error checking Google ID:', error);
        // Continue without Google ID check
      }
    }
    
    if (!user) {
      // Create new user with Google ID
      const username = googleUser.name || googleUser.email.split('@')[0];
      const randomPassword = crypto.randomBytes(32).toString('hex');
      
      try {
        const userId = await createUser(username, googleUser.email, randomPassword);
        // Mark as verified and store Google ID
        try {
          const updateStmt = db.prepare('UPDATE users SET is_verified = 1, google_id = ? WHERE id = ?');
          updateStmt.run(googleUser.sub, userId);
        } catch (error) {
          console.error('Error updating user with Google ID:', error);
          // Continue without Google ID
        }
        
        user = { 
          id: userId, 
          username, 
          email: googleUser.email,
          password_hash: randomPassword, // Generated password for Google users
          is_verified: 1,
          is_admin: 0,
          google_id: googleUser.sub,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed: users.username')) {
          // Try with a unique username
          const uniqueUsername = `${username}_${Date.now()}`;
          const userId = await createUser(uniqueUsername, googleUser.email, randomPassword);
          try {
            const updateStmt = db.prepare('UPDATE users SET is_verified = 1, google_id = ? WHERE id = ?');
            updateStmt.run(googleUser.sub, userId);
          } catch (error) {
            console.error('Error updating user with Google ID:', error);
            // Continue without Google ID
          }
          
          user = { 
            id: userId, 
            username: uniqueUsername, 
            email: googleUser.email,
            password_hash: randomPassword, // Generated password for Google users
            is_verified: 1,
            is_admin: 0,
            google_id: googleUser.sub,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        } else {
          throw error;
        }
      }
    } else {
      // Update existing user with Google ID and verify
      try {
        const updateStmt = db.prepare('UPDATE users SET is_verified = 1, google_id = ? WHERE id = ?');
        updateStmt.run(googleUser.sub, user.id);
        user.is_verified = 1;
        user.google_id = googleUser.sub;
      } catch (error) {
        console.error('Error updating existing user with Google ID:', error);
        // Just verify the user without Google ID
        const updateStmt = db.prepare('UPDATE users SET is_verified = 1 WHERE id = ?');
        updateStmt.run(user.id);
        user.is_verified = 1;
      }
    }

    // Generate session token
    const { token: sessionToken, expiresAt } = generateSessionToken(
      user.id,
      user.email,
      user.username
    );

    // Return HTML that posts message to parent window and sets cookie
    const response = new NextResponse(`
      <html>
        <body>
          <script>
            // Set the auth cookie
            document.cookie = 'auth-token=${sessionToken}; path=/; expires=${expiresAt.toUTCString()}; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''} SameSite=Lax';
            
            // Notify parent window
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              user: {
                id: ${user.id},
                username: '${user.username}',
                email: '${user.email}'
              }
            }, window.location.origin);
            
            window.close();
          </script>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

    return response;

  } catch (error) {
    console.error('Google callback error:', error);
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'Authentication failed'
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}