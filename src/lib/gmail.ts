import { google } from 'googleapis'
import jwt from 'jsonwebtoken'

console.log('Gmail module loading...')

// Helper function to get the correct base URL for emails
function getBaseUrl(): string {
  console.log('Getting base URL for email links:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
  })
  
  // Use NEXT_PUBLIC_BASE_URL if set (this should be https://suryayoga.ge in production)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    console.log('Using NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL)
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  // Fallback to production URL if NODE_ENV is production but NEXT_PUBLIC_BASE_URL is not set
  if (process.env.NODE_ENV === 'production') {
    console.log('Production mode without NEXT_PUBLIC_BASE_URL, using: https://suryayoga.ge')
    return 'https://suryayoga.ge'
  }
  
  // Default fallback for local development
  console.log('Using localhost fallback')
  return 'http://localhost:3000'
}

// Gmail API configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
)

// Set credentials
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
})

// Test function to verify OAuth setup
export async function testGmailAuth(): Promise<boolean> {
  try {
    console.log('Testing Gmail OAuth setup...')
    console.log('Environment check:', {
      clientId: process.env.GMAIL_CLIENT_ID?.substring(0, 20) + '...',
      hasClientSecret: !!process.env.GMAIL_CLIENT_SECRET,
      redirectUri: process.env.GMAIL_REDIRECT_URI,
      hasRefreshToken: !!process.env.GMAIL_REFRESH_TOKEN,
      refreshTokenStart: process.env.GMAIL_REFRESH_TOKEN?.substring(0, 10) + '...'
    })
    
    const { credentials } = await oauth2Client.refreshAccessToken()
    console.log('OAuth test successful, got access token')
    return true
  } catch (error) {
    console.error('OAuth test failed:', error)
    return false
  }
}

const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

// Generate verification token
export function generateVerificationToken(email: string): string {
  const jwtSecret = process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable must be set in production');
    }
    return 'surya-yoga-secret-key';
  })();
  
  const token = jwt.sign(
    { email, purpose: 'email_verification' },
    jwtSecret,
    { expiresIn: '24h' }
  )
  return token
}

// Verify token
export function verifyToken(token: string): { email: string } | null {
  try {
    const jwtSecret = process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable must be set in production');
      }
      return 'surya-yoga-secret-key';
    })();
    
    const decoded = jwt.verify(token, jwtSecret) as any
    if (decoded.purpose === 'email_verification') {
      return { email: decoded.email }
    }
  } catch (error) {
    console.error('Token verification failed:', error)
  }
  return null
}

// Create email content
function createEmailContent(to: string, verificationLink: string, language: 'en' | 'ge'): string {
  const content = {
    en: {
      subject: 'Verify your Surya Yoga account',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; font-size: 28px;">🌟 Welcome to Surya Yoga!</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #fff7ed, #faf5f0); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #451a03; margin-bottom: 15px;">Verify Your Email Address</h2>
            <p style="color: #7c2d12; font-size: 16px; line-height: 1.6;">
              Thank you for registering with Surya Yoga! Please click the button below to verify your email address and complete your registration.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: #f97316; 
                        color: white !important; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 50px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        border: 2px solid #f97316;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #7c2d12; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationLink}" style="color: #f97316;">${verificationLink}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #92744a; font-size: 14px;">
            <p>This verification link will expire in 24 hours.</p>
            <p>
              <strong>Surya Yoga Studio</strong><br>
              Georgia, Tbilisi, Fore Mosulishvili St. 28<br>
              +995 558 60 66 00 | SuryaYogaGeorgia@gmail.com
            </p>
          </div>
        </div>
      `
    },
    ge: {
      subject: 'დაადასტურეთ თქვენი სურია იოგას ანგარიში',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; font-size: 28px;">🌟 მოგესალმებით სურია იოგაში!</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #fff7ed, #faf5f0); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #451a03; margin-bottom: 15px;">დაადასტურეთ თქვენი ელ.ფოსტის მისამართი</h2>
            <p style="color: #7c2d12; font-size: 16px; line-height: 1.6;">
              მადლობას გიხდით სურია იოგაში რეგისტრაციისთვის! გთხოვთ, დაადასტუროთ თქვენი ელ.ფოსტის მისამართი და დაასრულოთ რეგისტრაცია.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: #f97316; 
                        color: white !important; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 50px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        border: 2px solid #f97316;">
                ელ.ფოსტის დადასტურება
              </a>
            </div>
            
            <p style="color: #7c2d12; font-size: 14px;">
              თუ ღილაკი არ მუშაობს, დააკოპირეთ და ჩასვით ეს ლინკი ბრაუზერში:<br>
              <a href="${verificationLink}" style="color: #f97316;">${verificationLink}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #92744a; font-size: 14px;">
            <p>ლინკი აქტიურია 24 საათის განმავლობაში.</p>
            <p>
              <strong>სურია იოგას სტუდია</strong><br>
              საქართველო, თბილისი, ფორე მოსულიშვილის ქუჩა 28<br>
              +995 558 60 66 00 | SuryaYogaGeorgia@gmail.com
            </p>
          </div>
        </div>
      `
    }
  }
  
  return content[language].body
}

// Send password reset email
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  language: 'en' | 'ge' = 'en'
): Promise<boolean> {
  try {
    console.log('Sending password reset email to:', to)
    
    // Test OAuth first
    const authTest = await testGmailAuth()
    if (!authTest) {
      console.error('OAuth authentication failed')
      return false
    }
    
    // Use centralized base URL function
    const baseUrl = getBaseUrl()
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`
    console.log('Generated password reset link:', resetLink)
    
    const subject = language === 'ge' 
      ? 'პაროლის აღდგენა - სურია იოგა'
      : 'Password Reset - Surya Yoga'
    
    const htmlBody = language === 'ge' ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f97316; font-size: 28px;">პაროლის აღდგენა</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #fff7ed, #faf5f0); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <p style="color: #7c2d12; font-size: 16px; line-height: 1.6;">
            მივიღეთ თქვენი მოთხოვნა პაროლის აღდგენის შესახებ. დააჭირეთ ქვემოთ მოცემულ ღილაკს, რომ შექმნათ ახალი პაროლი.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #f97316; 
                      color: white !important; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 50px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      border: 2px solid #f97316;">
              პაროლის აღდგენა
            </a>
          </div>
          
          <p style="color: #7c2d12; font-size: 14px;">
            თუ ღილაკი არ მუშაობს, დააკოპირეთ და ჩასვით ეს ლინკი ბრაუზერში:<br>
            <a href="${resetLink}" style="color: #f97316;">${resetLink}</a>
          </p>
          
          <p style="color: #92744a; font-size: 14px; margin-top: 20px;">
            თუ თქვენ არ მოითხოვეთ პაროლის აღდგენა, უგულებელყავით ეს წერილი.
          </p>
        </div>
        
        <div style="text-align: center; color: #92744a; font-size: 14px;">
          <p>ლინკი აქტიურია 24 საათის განმავლობაში.</p>
          <p>
            <strong>სურია იოგას სტუდია</strong><br>
            საქართველო, თბილისი, ფორე მოსულიშვილის ქუჩა 28<br>
            +995 558 60 66 00 | SuryaYogaGeorgia@gmail.com
          </p>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f97316; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #fff7ed, #faf5f0); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <p style="color: #7c2d12; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #f97316; 
                      color: white !important; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 50px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      border: 2px solid #f97316;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #7c2d12; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #f97316;">${resetLink}</a>
          </p>
          
          <p style="color: #92744a; font-size: 14px; margin-top: 20px;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; color: #92744a; font-size: 14px;">
          <p>This link will expire in 24 hours.</p>
          <p>
            <strong>Surya Yoga Studio</strong><br>
            Georgia, Tbilisi, Fore Mosulishvili St. 28<br>
            +995 558 60 66 00 | SuryaYogaGeorgia@gmail.com
          </p>
        </div>
      </div>
    `
    
    // Create raw email with proper UTF-8 encoding
    const rawMessage = [
      `To: ${to}`,
      `From: "Surya Yoga" <${process.env.GMAIL_USER}>`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(htmlBody).toString('base64')
    ].join('\n')

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })

    console.log(`Password reset email sent to ${to}`)
    return true
  } catch (error) {
    console.error('Failed to send password reset email. Full error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return false
  }
}

// Send verification email
export async function sendVerificationEmail(
  to: string, 
  verificationToken: string, 
  language: 'en' | 'ge' = 'en'
): Promise<boolean> {
  try {
    console.log('Sending verification email to:', to)
    console.log('Environment variables check:', {
      hasClientId: !!process.env.GMAIL_CLIENT_ID,
      hasClientSecret: !!process.env.GMAIL_CLIENT_SECRET,
      hasRefreshToken: !!process.env.GMAIL_REFRESH_TOKEN,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL
    })
    
    // Test OAuth first
    const authTest = await testGmailAuth()
    if (!authTest) {
      console.error('OAuth authentication failed')
      return false
    }
    
    // Use centralized base URL function
    const baseUrl = getBaseUrl()
    const verificationLink = `${baseUrl}/api/verify-email?token=${verificationToken}`
    console.log('Generated verification link:', verificationLink)
    
    const subject = language === 'ge' 
      ? 'დაადასტურეთ თქვენი სურია იოგას ანგარიში'
      : 'Verify your Surya Yoga account'
    
    const htmlBody = createEmailContent(to, verificationLink, language)
    
    // Create raw email with proper UTF-8 encoding
    const rawMessage = [
      `To: ${to}`,
      `From: "Surya Yoga" <${process.env.GMAIL_USER}>`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(htmlBody).toString('base64')
    ].join('\n')

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })

    console.log(`Verification email sent to ${to}`)
    return true
  } catch (error) {
    console.error('Failed to send verification email. Full error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return false
  }
}