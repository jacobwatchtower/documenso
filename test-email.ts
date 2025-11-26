import { mailer } from './packages/email/mailer';
import { env } from './packages/lib/utils/env';

const testEmail = async () => {
  console.log('Testing AWS SES SMTP Configuration...\n');

  console.log('SMTP Settings:');
  console.log('  Host:', env('NEXT_PRIVATE_SMTP_HOST'));
  console.log('  Port:', env('NEXT_PRIVATE_SMTP_PORT'));
  console.log('  Username:', env('NEXT_PRIVATE_SMTP_USERNAME'));
  console.log('  Password:', env('NEXT_PRIVATE_SMTP_PASSWORD') ? '***' + env('NEXT_PRIVATE_SMTP_PASSWORD')?.slice(-4) : 'NOT SET');
  console.log('  Secure:', env('NEXT_PRIVATE_SMTP_SECURE'));
  console.log('  From Name:', env('NEXT_PRIVATE_SMTP_FROM_NAME'));
  console.log('  From Address:', env('NEXT_PRIVATE_SMTP_FROM_ADDRESS'));
  console.log('\n');

  try {
    console.log('Attempting to send test email...\n');

    const result = await mailer.sendMail({
      to: {
        address: 'jake@firstloop.ai',
        name: 'Test Recipient',
      },
      from: {
        name: 'Matthew Ballard',
        address: 'noreply@ballardpropertytaxprotest.com',
      },
      subject: 'AWS SES Test Email',
      html: '<h1>Test Email</h1><p>If you receive this, AWS SES is working!</p>',
      text: 'Test Email\n\nIf you receive this, AWS SES is working!',
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error);

    if (error instanceof Error) {
      console.error('\nError details:');
      console.error('  Message:', error.message);
      console.error('  Stack:', error.stack);
    }
  }
};

testEmail();
