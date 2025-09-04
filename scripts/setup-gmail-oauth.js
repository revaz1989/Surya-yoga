const { google } = require('googleapis');
const readline = require('readline');

console.log('Gmail OAuth Setup for suryayoga.ge');
console.log('==================================');

// Configuration - Update these with your Google Cloud Console values
const CLIENT_ID = process.env.GMAIL_CLIENT_ID || 'your-gmail-client-id';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || 'your-gmail-client-secret';
const REDIRECT_URI = 'https://suryayoga.ge/api/auth/google/callback';

// Scopes for Gmail API
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose'
];

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

function getAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  
  console.log('\nStep 1: Visit this URL to authorize the application:');
  console.log(authUrl);
  console.log('\nStep 2: Copy the authorization code from the callback URL');
  
  return authUrl;
}

function getTokenFromCode(code) {
  return new Promise((resolve, reject) => {
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        reject(err);
        return;
      }
      
      oauth2Client.setCredentials(token);
      resolve(token);
    });
  });
}

async function main() {
  try {
    // Check if we already have environment variables
    if (CLIENT_ID === 'your-gmail-client-id' || CLIENT_SECRET === 'your-gmail-client-secret') {
      console.log('❌ Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables first.');
      console.log('\nTo get these credentials:');
      console.log('1. Go to https://console.cloud.google.com/');
      console.log('2. Create a project or select existing one');
      console.log('3. Enable Gmail API');
      console.log('4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs');
      console.log('5. Set authorized redirect URI to: https://suryayoga.ge/api/auth/google/callback');
      console.log('6. Set authorized domain to: suryayoga.ge');
      return;
    }

    console.log('✅ Client ID and Secret found');
    
    // Generate auth URL
    const authUrl = getAuthUrl();
    
    // Get authorization code from user
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\nEnter the authorization code: ', async (code) => {
      try {
        const token = await getTokenFromCode(code);
        
        console.log('\n✅ OAuth setup successful!');
        console.log('\nAdd these to your .env.production file:');
        console.log('==========================================');
        console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
        console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`GMAIL_REFRESH_TOKEN=${token.refresh_token}`);
        console.log(`GMAIL_REDIRECT_URI=${REDIRECT_URI}`);
        console.log(`GMAIL_USER=suryayogageorgia@gmail.com`);
        console.log('==========================================');
        
        // Test the token
        console.log('\n🧪 Testing Gmail API access...');
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const profile = await gmail.users.getProfile({ userId: 'me' });
        console.log(`✅ Gmail API test successful! Email: ${profile.data.emailAddress}`);
        
      } catch (error) {
        console.error('❌ Error getting tokens:', error.message);
      } finally {
        rl.close();
      }
    });
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getAuthUrl,
  getTokenFromCode
};