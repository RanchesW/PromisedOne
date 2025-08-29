// Load environment variables first
require('dotenv').config();

const { emailService } = require('./dist/services/emailService');

async function testEmail() {
  console.log('🧪 Starting email test...\n');
  
  // Test connection first
  console.log('1. Testing email service connection...');
  const connectionTest = await emailService.testConnection();
  
  if (!connectionTest) {
    console.log('❌ Email service connection failed. Please check your email configuration in .env file.');
    console.log('\nRequired environment variables:');
    console.log('- SMTP_USER (your Gmail address)');
    console.log('- SMTP_PASS (your Gmail app password)');
    console.log('- SMTP_HOST (default: smtp.gmail.com)');
    console.log('- SMTP_PORT (default: 587)');
    return;
  }
  
  console.log('✅ Email service connection successful!\n');
  
  // Test sending a verification email
  console.log('2. Testing verification email to studyworkforce@gmail.com...');
  const testCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const verificationResult = await emailService.sendVerificationEmail(
    'studyworkforce@gmail.com',
    testCode,
    'Test User'
  );
  
  if (verificationResult) {
    console.log('✅ Verification email sent successfully!');
    console.log(`📧 Test verification code: ${testCode}`);
  } else {
    console.log('❌ Failed to send verification email');
  }
  
  console.log('\n3. Testing welcome email...');
  const welcomeResult = await emailService.sendWelcomeEmail(
    'studyworkforce@gmail.com',
    'Test User'
  );
  
  if (welcomeResult) {
    console.log('✅ Welcome email sent successfully!');
  } else {
    console.log('❌ Failed to send welcome email');
  }
  
  console.log('\n4. Testing notification email...');
  const notificationResult = await emailService.sendNotificationEmail(
    'studyworkforce@gmail.com',
    'KazRPG Test Notification',
    'This is a test notification from your KazRPG email system. If you received this, your email configuration is working correctly!',
    'Test User'
  );
  
  if (notificationResult) {
    console.log('✅ Notification email sent successfully!');
  } else {
    console.log('❌ Failed to send notification email');
  }
  
  console.log('\n🎯 Email test completed!');
  console.log('Check the studyworkforce@gmail.com inbox for the test emails.');
}

// Run the test
testEmail().catch(console.error);