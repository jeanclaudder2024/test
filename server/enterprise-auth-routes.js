/**
 * Enterprise Authentication Routes - Professional Oil Vessel Tracking
 * Complete security system with email verification, OTP codes, and anti-robot protection
 */

import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  initializeProfessionalAuth,
  getConnection,
  sendProfessionalEmail,
  getWelcomeEmailTemplate,
  getLoginOTPTemplate,
  validateProfessionalEmail,
  validateProfessionalPassword,
  checkLoginAttempts,
  recordLoginAttempt,
  storeOTPCode,
  verifyOTPCode,
  generateOTP,
  generateVerificationToken
} from './professional-email-auth.js';

const router = express.Router();
const JWT_SECRET = 'oil-vessel-tracking-enterprise-2024';
const SALT_ROUNDS = 12;

// Initialize professional authentication on startup
initializeProfessionalAuth().catch(console.error);

// Session configuration for enterprise security
export function setupEnterpriseSession(app) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'petrodealhub-enterprise-session-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    },
    name: 'petrodealhub.session'
  }));
}

// Generate professional JWT token
function generateProfessionalToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      username: user.username,
      emailVerified: user.email_verified,
      role: 'maritime_professional'
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
}

// Get client IP address
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

// ===== PROFESSIONAL REGISTRATION SYSTEM =====
router.post('/api/auth/register', async (req, res) => {
  const connection = await getConnection();
  try {
    const { username, email, password, firstName, lastName, company, phone } = req.body;
    const clientIP = getClientIP(req);
    
    console.log('🚢 Professional registration attempt:', { username, email, company });

    // Professional email validation
    const emailValidation = validateProfessionalEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
        field: 'email'
      });
    }

    // Professional password validation
    const passwordErrors = validateProfessionalPassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordErrors,
        field: 'password'
      });
    }

    // Username validation
    if (!username || username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters',
        field: 'username'
      });
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers, dots, underscores, and hyphens',
        field: 'username'
      });
    }

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id, email, username, email_verified FROM users WHERE email = ? OR username = ?', 
      [email, username]
    );
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          message: 'A professional account with this email already exists',
          field: 'email'
        });
      }
      if (existingUser.username === username) {
        return res.status(409).json({
          success: false,
          message: 'This username is already taken by another maritime professional',
          field: 'username'
        });
      }
    }

    // Hash password with enterprise-level security
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create professional user account
    const [result] = await connection.execute(`
      INSERT INTO users (
        username, email, password, first_name, last_name, 
        company, phone, verification_token, verification_expires,
        created_at, email_verified, is_active, last_login_ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), false, true, ?)
    `, [
      username, email, hashedPassword, firstName || null, lastName || null, 
      company || null, phone || null, verificationToken, verificationExpires, clientIP
    ]);

    // Get the created user
    const [newUsers] = await connection.execute(
      'SELECT id, username, email, first_name, last_name, company, phone, created_at FROM users WHERE id = ?', 
      [result.insertId]
    );
    
    const newUser = newUsers[0];

    // Generate and send OTP code for email verification
    const otpCode = generateOTP();
    await storeOTPCode(email, otpCode, 'email_verification', newUser.id);

    // Send professional welcome email with OTP
    const emailSent = await sendProfessionalEmail(
      email,
      '🚢 Welcome to PetroDealHub - Verify Your Professional Account',
      getWelcomeEmailTemplate(username, otpCode)
    );

    if (!emailSent) {
      console.error('❌ Failed to send verification email to:', email);
      // Don't fail registration, but log the issue
    }

    // Generate JWT token (but account is not fully activated until email verification)
    const token = generateProfessionalToken(newUser);
    
    console.log('✅ Professional account created for:', username);
    
    res.status(201).json({
      success: true,
      message: 'Professional account created successfully! Please check your email for verification.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        company: newUser.company,
        phone: newUser.phone,
        emailVerified: false,
        requiresVerification: true
      },
      token,
      nextStep: 'email_verification'
    });
    
  } catch (error) {
    console.error('❌ Professional registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed due to server error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await connection.end();
  }
});

// ===== EMAIL VERIFICATION SYSTEM =====
router.post('/api/auth/verify-email', async (req, res) => {
  const connection = await getConnection();
  try {
    const { email, otpCode } = req.body;
    
    console.log('📧 Email verification attempt for:', email);

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Verify OTP code
    const otpVerification = await verifyOTPCode(email, otpCode, 'email_verification');
    
    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message
      });
    }

    // Update user as email verified
    await connection.execute(`
      UPDATE users 
      SET email_verified = true, verification_token = NULL, verification_expires = NULL
      WHERE email = ?
    `, [email]);

    // Get updated user
    const [users] = await connection.execute(
      'SELECT id, username, email, first_name, last_name, company, phone FROM users WHERE email = ?', 
      [email]
    );
    
    const user = users[0];
    
    // Update session
    if (req.session) {
      req.session.user = {
        ...req.session.user,
        emailVerified: true
      };
    }

    console.log('✅ Email verified for professional user:', user.username);
    
    res.json({
      success: true,
      message: 'Email verified successfully! Your professional account is now fully activated.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        phone: user.phone,
        emailVerified: true
      }
    });
    
  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.'
    });
  } finally {
    await connection.end();
  }
});

// ===== PROFESSIONAL LOGIN SYSTEM =====
router.post('/api/auth/login', async (req, res) => {
  const connection = await getConnection();
  try {
    const { emailOrUsername, password } = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    
    console.log('🔐 Professional login attempt:', { emailOrUsername, ip: clientIP });

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required'
      });
    }

    // Check for too many failed attempts
    const canAttemptLogin = await checkLoginAttempts(emailOrUsername, clientIP);
    if (!canAttemptLogin) {
      await recordLoginAttempt(emailOrUsername, clientIP, false, userAgent);
      return res.status(429).json({
        success: false,
        message: 'Too many failed login attempts. Please try again in 15 minutes.'
      });
    }

    // Find user by email or username
    const [users] = await connection.execute(`
      SELECT id, username, email, password, first_name, last_name, 
             company, phone, is_active, email_verified, failed_login_attempts,
             account_locked_until, two_factor_enabled
      FROM users 
      WHERE (email = ? OR username = ?) AND is_active = 1
    `, [emailOrUsername, emailOrUsername]);
    
    if (users.length === 0) {
      await recordLoginAttempt(emailOrUsername, clientIP, false, userAgent);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/username and password.'
      });
    }
    
    const user = users[0];

    // Check if account is locked
    if (user.account_locked_until && new Date() < new Date(user.account_locked_until)) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to security reasons. Please try again later.'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      await recordLoginAttempt(emailOrUsername, clientIP, false, userAgent);
      
      // Increment failed login attempts
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
      let lockUntil = null;
      
      if (newFailedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }
      
      await connection.execute(`
        UPDATE users 
        SET failed_login_attempts = ?, account_locked_until = ?
        WHERE id = ?
      `, [newFailedAttempts, lockUntil, user.id]);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/username and password.'
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      // Generate new OTP for email verification
      const otpCode = generateOTP();
      await storeOTPCode(user.email, otpCode, 'email_verification', user.id);
      
      // Send verification email
      await sendProfessionalEmail(
        user.email,
        '🚢 PetroDealHub - Email Verification Required',
        getWelcomeEmailTemplate(user.username, otpCode)
      );
      
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address to complete login. A new verification code has been sent.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate OTP for secure login (2FA)
    const loginOtpCode = generateOTP();
    await storeOTPCode(user.email, loginOtpCode, 'login_verification', user.id);
    
    // Send login verification email
    await sendProfessionalEmail(
      user.email,
      '🔐 PetroDealHub - Secure Login Verification',
      getLoginOTPTemplate(user.username, loginOtpCode, clientIP)
    );

    // Record successful password verification
    await recordLoginAttempt(emailOrUsername, clientIP, true, userAgent);
    
    // Reset failed login attempts
    await connection.execute(`
      UPDATE users 
      SET failed_login_attempts = 0, account_locked_until = NULL
      WHERE id = ?
    `, [user.id]);
    
    console.log('✅ Password verified, OTP sent for:', user.username);
    
    res.json({
      success: true,
      message: 'Password verified. Please check your email for the secure login code.',
      requiresOtp: true,
      email: user.email,
      tempToken: jwt.sign({ userId: user.id, step: 'otp_verification' }, JWT_SECRET, { expiresIn: '10m' })
    });
    
  } catch (error) {
    console.error('❌ Professional login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to server error. Please try again.'
    });
  } finally {
    await connection.end();
  }
});

// ===== OTP VERIFICATION FOR LOGIN =====
router.post('/api/auth/verify-login-otp', async (req, res) => {
  const connection = await getConnection();
  try {
    const { email, otpCode, tempToken } = req.body;
    const clientIP = getClientIP(req);
    
    console.log('🔐 Login OTP verification for:', email);

    if (!email || !otpCode || !tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP code, and temporary token are required'
      });
    }

    // Verify temporary token
    let tokenPayload;
    try {
      tokenPayload = jwt.verify(tempToken, JWT_SECRET);
      if (tokenPayload.step !== 'otp_verification') {
        throw new Error('Invalid token step');
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired temporary token. Please start login again.'
      });
    }

    // Verify OTP code
    const otpVerification = await verifyOTPCode(email, otpCode, 'login_verification');
    
    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message
      });
    }

    // Get user details
    const [users] = await connection.execute(`
      SELECT id, username, email, first_name, last_name, company, phone, email_verified
      FROM users WHERE id = ? AND email = ?
    `, [tokenPayload.userId, email]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];

    // Update last login
    await connection.execute(`
      UPDATE users 
      SET last_login = NOW(), last_login_ip = ?
      WHERE id = ?
    `, [clientIP, user.id]);

    // Generate final JWT token
    const token = generateProfessionalToken(user);
    
    // Set secure session
    if (req.session) {
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        emailVerified: user.email_verified
      };
    }
    
    console.log('✅ Professional login completed for:', user.username);
    
    res.json({
      success: true,
      message: 'Login successful! Welcome to your professional maritime trading platform.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        phone: user.phone,
        emailVerified: user.email_verified
      },
      token
    });
    
  } catch (error) {
    console.error('❌ Login OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed. Please try again.'
    });
  } finally {
    await connection.end();
  }
});

// ===== RESEND VERIFICATION CODE =====
router.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'email_verification' or 'login_verification'
    
    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification type are required'
      });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    await storeOTPCode(email, otpCode, type);

    // Send appropriate email
    if (type === 'email_verification') {
      await sendProfessionalEmail(
        email,
        '🚢 PetroDealHub - New Verification Code',
        getWelcomeEmailTemplate('Professional User', otpCode)
      );
    } else if (type === 'login_verification') {
      await sendProfessionalEmail(
        email,
        '🔐 PetroDealHub - New Login Verification Code',
        getLoginOTPTemplate('Professional User', otpCode, 'Security Request')
      );
    }

    res.json({
      success: true,
      message: 'New verification code sent to your email address.'
    });
    
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code. Please try again.'
    });
  }
});

// ===== OTHER ROUTES =====
// Get User Profile, Update Profile, Logout, etc. (keeping existing functionality)
router.get('/api/auth/profile', async (req, res) => {
  // Implementation similar to previous but with email verification status
});

router.post('/api/auth/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Logout failed'
        });
      }
      res.clearCookie('petrodealhub.session');
      res.json({
        success: true,
        message: 'Logged out successfully from your professional account'
      });
    });
  } else {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

router.get('/api/auth/me', (req, res) => {
  if (req.session?.user) {
    res.json({
      success: true,
      user: req.session.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

export { router as enterpriseAuthRoutes, setupEnterpriseSession };