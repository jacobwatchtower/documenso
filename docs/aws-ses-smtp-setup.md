# AWS SES SMTP Configuration

**Status**: TO DO - Next Task

## Overview

We need to configure AWS SES as the SMTP server for Documenso's email sending functionality.

## What Needs to Be Done

### 1. AWS SES Setup
- [ ] Log into AWS SES Console: https://console.aws.amazon.com/ses/
- [ ] Verify sender email address or domain
- [ ] Create SMTP credentials (username + password)
- [ ] Note the SMTP endpoint for your region (e.g., `email-smtp.us-east-1.amazonaws.com`)
- [ ] Request production access if needed (to send to unverified addresses)

### 2. Environment Configuration

Update `.env` file with AWS SES SMTP credentials:

```bash
# [[SMTP]]
NEXT_PRIVATE_SMTP_TRANSPORT="smtp-auth"

# AWS SES SMTP endpoint (update region as needed)
NEXT_PRIVATE_SMTP_HOST="email-smtp.us-east-1.amazonaws.com"

# Use port 587 for TLS (recommended)
NEXT_PRIVATE_SMTP_PORT=587

# Your AWS SES SMTP credentials
NEXT_PRIVATE_SMTP_USERNAME="your-smtp-username-here"
NEXT_PRIVATE_SMTP_PASSWORD="your-smtp-password-here"

# Enable TLS
NEXT_PRIVATE_SMTP_SECURE="true"

# Don't ignore TLS
NEXT_PRIVATE_SMTP_UNSAFE_IGNORE_TLS=

# Use verified email address
NEXT_PRIVATE_SMTP_FROM_NAME="Your Name or App Name"
NEXT_PRIVATE_SMTP_FROM_ADDRESS="verified@yourdomain.com"

# Leave blank
NEXT_PRIVATE_SMTP_SERVICE=
```

### 3. Testing
- [ ] Restart the application after updating `.env`
- [ ] Test email sending (e.g., user signup confirmation)
- [ ] Verify emails are delivered successfully

## Important Notes

### AWS SES Regions
Common regions and their SMTP endpoints:
- US East (N. Virginia): `email-smtp.us-east-1.amazonaws.com`
- US West (Oregon): `email-smtp.us-west-2.amazonaws.com`
- EU (Ireland): `email-smtp.eu-west-1.amazonaws.com`
- Asia Pacific (Singapore): `email-smtp.ap-southeast-1.amazonaws.com`

### SES Sandbox Limitations
If in sandbox mode:
- Maximum 200 emails per 24 hours
- Maximum 1 email per second
- Can only send to verified email addresses
- Must request production access to lift these limits

### SMTP Ports
- **587** - TLS/STARTTLS (recommended)
- **465** - SSL
- **2587** - Alternative if ISP blocks standard ports

### Email Verification Requirements
- **Sender address** (FROM address) must be verified in AWS SES
- If in sandbox: **Recipient addresses** must also be verified
- Production access allows sending to any email address

## Troubleshooting

### Common Issues
1. **Authentication Failed**: Verify SMTP username and password are correct
2. **Connection Timeout**: Check that SMTP host region matches your SES region
3. **Email Rejected**: Ensure FROM address is verified in AWS SES
4. **Emails Not Delivered**: Check if in sandbox mode and verify recipient addresses

## Current Configuration

Current `.env` settings (before AWS SES):
```bash
NEXT_PRIVATE_SMTP_TRANSPORT="smtp-auth"
NEXT_PRIVATE_SMTP_HOST="127.0.0.1"
NEXT_PRIVATE_SMTP_PORT=2500
NEXT_PRIVATE_SMTP_USERNAME="documenso"
NEXT_PRIVATE_SMTP_PASSWORD="password"
```

## References

- AWS SES Console: https://console.aws.amazon.com/ses/
- AWS SES SMTP Documentation: https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html
- Documenso Email Configuration: `packages/email/mailer.ts`
