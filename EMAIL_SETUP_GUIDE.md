# 🚢 PetroDealHub Professional Email Setup Guide

## Professional Email Authentication System

Your maritime trading platform now has enterprise-level authentication with email verification and OTP codes! Here's how to complete the setup:

## Email Configuration (Free Gmail Setup)

### Step 1: Create Gmail App Password
1. Go to your Gmail account settings
2. Enable 2-Factor Authentication
3. Generate an "App Password" for PetroDealHub
4. Copy the 16-character app password

### Step 2: Add Environment Variables

Add these to your `.env` file:

```bash
# Professional Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### Example Configuration:
```bash
EMAIL_USER=petrodealhub@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

## Authentication Features ✅

### ✅ Professional Registration
- Username validation (3-30 characters, alphanumeric)
- Professional email validation (blocks disposable emails)
- Strong password requirements (8+ chars, uppercase, lowercase, numbers, symbols)
- Company and contact information capture
- Real-time validation with clear error messages

### ✅ Email Verification System
- Beautiful professional email templates
- 6-digit OTP codes with 10-minute expiration
- Automatic cleanup of expired codes
- Resend functionality with rate limiting

### ✅ Secure Login Process
- Multi-step authentication (password + email OTP)
- Account lockout after 5 failed attempts (30 minutes)
- IP-based security monitoring
- Professional login verification emails

### ✅ Enterprise Security
- BCrypt password hashing (12 rounds)
- JWT tokens with 7-day expiration
- Session management with secure cookies
- Login attempt tracking and analysis
- Anti-robot protection (professional email requirement)

## Professional Email Templates

### Welcome Email Features:
- 🚢 Maritime-themed design
- Company branding with PetroDealHub logo
- Professional color scheme (Navy Blue #003366, Orange #FF6F00)
- Mobile-responsive design
- Clear verification instructions

### Security Email Features:
- 🔐 Security-focused messaging
- IP address tracking
- Timestamp information
- Professional security warnings

## Database Structure

### Users Table:
```sql
- id (Primary Key)
- username (Unique)
- email (Unique, Professional validation)
- password (BCrypt hashed)
- first_name, last_name
- company, phone
- email_verified (Boolean)
- failed_login_attempts
- account_locked_until
- created_at, updated_at
- last_login, last_login_ip
```

### OTP Codes Table:
```sql
- id (Primary Key)
- user_id (Foreign Key)
- email
- otp_code (6 digits)
- purpose (email_verification, login_verification, password_reset)
- expires_at
- used (Boolean)
- ip_address
```

### Login Attempts Table:
```sql
- id (Primary Key)
- email
- ip_address
- success (Boolean)
- attempt_time
- user_agent
```

## API Endpoints

### Authentication Routes:
- `POST /api/auth/register` - Professional account registration
- `POST /api/auth/verify-email` - Email verification with OTP
- `POST /api/auth/login` - Multi-step login process
- `POST /api/auth/verify-login-otp` - Login OTP verification
- `POST /api/auth/resend-verification` - Resend verification codes
- `POST /api/auth/logout` - Secure logout
- `GET /api/auth/me` - Get current user session

## Frontend Features

### Professional Authentication Interface:
- Beautiful card-based design
- Maritime-themed colors and icons
- Real-time form validation
- Multi-step verification flows
- Professional error messaging
- Responsive design (mobile, tablet, desktop)

### Security Features:
- Automatic token management
- Secure session storage
- Protected route navigation
- Authentication state management
- Professional loading states

## Getting Started

1. **Add your email credentials** to the `.env` file
2. **Restart the application** to load new environment variables
3. **Test registration** with a real email address
4. **Check your email** for the beautiful verification message
5. **Complete the login flow** with OTP verification

## Support

Your professional maritime trading platform is now ready with enterprise-level security! The authentication system provides:

- ✅ Professional user experience
- ✅ Enterprise security standards
- ✅ Beautiful email communications
- ✅ Comprehensive audit trails
- ✅ Maritime industry branding

Ready to welcome your first professional maritime traders! 🚢⚓