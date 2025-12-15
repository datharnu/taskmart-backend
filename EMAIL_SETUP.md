# Email Service Setup

The TaskMart backend includes email notifications for user signup and signin. This guide will help you configure email sending.

## Email Configuration

Add the following environment variables to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@taskmart.com
```

## Email Providers

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASSWORD`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

### SendGrid Setup

1. Create a SendGrid account
2. Create an API key
3. Use SMTP settings:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### Mailtrap (Development/Testing)

1. Sign up at [Mailtrap.io](https://mailtrap.io)
2. Get SMTP credentials from your inbox:

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM_EMAIL=noreply@taskmart.com
```

### Other SMTP Providers

You can use any SMTP provider. Common ones include:
- **AWS SES**
- **Mailgun**
- **Postmark**
- **SparkPost**

## Email Notifications

The following emails are automatically sent:

### 1. Welcome Email (Signup)
- Sent when a new user signs up
- Includes welcome message and platform information

### 2. Sign-In Notification Email
- Sent when a user signs in
- Includes sign-in time and security information
- Helps users detect unauthorized access

## Testing Email

If email is not configured, the application will:
- Continue to work normally
- Log warnings about missing email configuration
- Skip sending emails without breaking functionality

## Troubleshooting

### Emails not sending?

1. **Check environment variables**: Make sure all SMTP variables are set
2. **Check logs**: Look for email service configuration messages
3. **Test SMTP connection**: Use a tool like `telnet` or online SMTP testers
4. **Check spam folder**: Emails might be filtered as spam

### Common Issues

- **Gmail "Less secure app"**: Use App Passwords instead
- **Port blocked**: Try port 465 with `secure: true` or port 587
- **Authentication failed**: Double-check username and password
- **Connection timeout**: Verify SMTP host and port

## Disabling Email (Development)

To disable email notifications during development, simply don't set `SMTP_USER` and `SMTP_PASSWORD`. The application will skip sending emails but continue to function normally.





