/**
 * 🚢 PetroDealHub Professional MySQL Authentication Configuration
 * Enhanced for international maritime trading platform
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// MySQL Connection Configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'petrodealhub_auth',
  port: process.env.MYSQL_PORT || 3306,
  ssl: false,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

// Create connection pool for better performance
let pool;

async function initializeMySQL() {
  try {
    pool = mysql.createPool(mysqlConfig);
    console.log('🚢 MySQL connection pool initialized for PetroDealHub');
    
    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ MySQL connection verified successfully');
    
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
}

// Professional User Management Functions
class MySQLAuthStorage {
  
  // Create new professional user
  async createUser(userData) {
    try {
      const {
        username,
        email,
        password,
        firstName,
        lastName,
        company,
        phone
      } = userData;

      // Hash password with BCrypt (enterprise security)
      const hashedPassword = await bcrypt.hash(password, 12);

      const query = `
        INSERT INTO users (
          username, email, password, first_name, last_name, 
          company, phone, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await pool.execute(query, [
        username,
        email,
        hashedPassword,
        firstName,
        lastName,
        company,
        phone
      ]);

      console.log(`✅ Created professional user: ${username} (${company})`);
      return { id: result.insertId, ...userData, password: undefined };
      
    } catch (error) {
      console.error('❌ Error creating user:', error.message);
      throw new Error('Failed to create professional user account');
    }
  }

  // Get user by email or username
  async getUserByEmailOrUsername(identifier) {
    try {
      const query = `
        SELECT * FROM users 
        WHERE email = ? OR username = ?
        LIMIT 1
      `;
      
      const [rows] = await pool.execute(query, [identifier, identifier]);
      return rows[0] || null;
      
    } catch (error) {
      console.error('❌ Error fetching user:', error.message);
      return null;
    }
  }

  // Verify user password
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('❌ Password verification error:', error.message);
      return false;
    }
  }

  // Create OTP code for verification
  async createOTPCode(userId, email, purpose = 'email_verification', ipAddress = null) {
    try {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiration (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const query = `
        INSERT INTO otp_codes (
          user_id, email, otp_code, purpose, expires_at, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      await pool.execute(query, [
        userId,
        email,
        otpCode,
        purpose,
        expiresAt,
        ipAddress
      ]);

      console.log(`✅ OTP created for ${email}: ${otpCode} (${purpose})`);
      return otpCode;
      
    } catch (error) {
      console.error('❌ Error creating OTP:', error.message);
      throw new Error('Failed to create verification code');
    }
  }

  // Verify OTP code
  async verifyOTPCode(email, otpCode, purpose) {
    try {
      const query = `
        SELECT * FROM otp_codes 
        WHERE email = ? AND otp_code = ? AND purpose = ? 
        AND expires_at > NOW() AND used = FALSE
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const [rows] = await pool.execute(query, [email, otpCode, purpose]);
      
      if (rows.length === 0) {
        return { valid: false, message: 'Invalid or expired verification code' };
      }

      // Mark OTP as used
      const updateQuery = `UPDATE otp_codes SET used = TRUE WHERE id = ?`;
      await pool.execute(updateQuery, [rows[0].id]);

      console.log(`✅ OTP verified for ${email}: ${otpCode}`);
      return { valid: true, message: 'Verification successful' };
      
    } catch (error) {
      console.error('❌ Error verifying OTP:', error.message);
      return { valid: false, message: 'Verification failed' };
    }
  }

  // Update email verification status
  async markEmailVerified(email) {
    try {
      const query = `UPDATE users SET email_verified = TRUE WHERE email = ?`;
      await pool.execute(query, [email]);
      console.log(`✅ Email verified for: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error marking email verified:', error.message);
      return false;
    }
  }

  // Record login attempt
  async recordLoginAttempt(email, ipAddress, success, userAgent = null) {
    try {
      const query = `
        INSERT INTO login_attempts (
          email, ip_address, success, attempt_time, user_agent
        ) VALUES (?, ?, ?, NOW(), ?)
      `;

      await pool.execute(query, [email, ipAddress, success, userAgent]);
      
    } catch (error) {
      console.error('❌ Error recording login attempt:', error.message);
    }
  }

  // Update user last login
  async updateLastLogin(userId, ipAddress) {
    try {
      const query = `
        UPDATE users 
        SET last_login = NOW(), last_login_ip = ?, failed_login_attempts = 0
        WHERE id = ?
      `;

      await pool.execute(query, [ipAddress, userId]);
      
    } catch (error) {
      console.error('❌ Error updating last login:', error.message);
    }
  }

  // Handle failed login attempts
  async handleFailedLogin(email) {
    try {
      const query = `
        UPDATE users 
        SET failed_login_attempts = failed_login_attempts + 1,
            account_locked_until = CASE 
              WHEN failed_login_attempts >= 4 
              THEN DATE_ADD(NOW(), INTERVAL 30 MINUTE)
              ELSE account_locked_until
            END
        WHERE email = ?
      `;

      await pool.execute(query, [email]);
      
    } catch (error) {
      console.error('❌ Error handling failed login:', error.message);
    }
  }

  // Check if account is locked
  async isAccountLocked(email) {
    try {
      const query = `
        SELECT account_locked_until 
        FROM users 
        WHERE email = ? AND account_locked_until > NOW()
      `;

      const [rows] = await pool.execute(query, [email]);
      return rows.length > 0;
      
    } catch (error) {
      console.error('❌ Error checking account lock:', error.message);
      return false;
    }
  }

  // Get user activity summary
  async getUserActivitySummary(userId) {
    try {
      const query = `
        SELECT 
          u.username,
          u.email,
          u.company,
          u.last_login,
          u.email_verified,
          u.failed_login_attempts,
          COUNT(la.id) as total_login_attempts,
          SUM(CASE WHEN la.success = TRUE THEN 1 ELSE 0 END) as successful_logins
        FROM users u
        LEFT JOIN login_attempts la ON u.email = la.email
        WHERE u.id = ?
        GROUP BY u.id
      `;

      const [rows] = await pool.execute(query, [userId]);
      return rows[0] || null;
      
    } catch (error) {
      console.error('❌ Error getting user activity:', error.message);
      return null;
    }
  }

  // Clean expired OTP codes
  async cleanExpiredOTPs() {
    try {
      const query = `DELETE FROM otp_codes WHERE expires_at < NOW()`;
      const [result] = await pool.execute(query);
      console.log(`🧹 Cleaned ${result.affectedRows} expired OTP codes`);
      return result.affectedRows;
    } catch (error) {
      console.error('❌ Error cleaning expired OTPs:', error.message);
      return 0;
    }
  }

  // Close connection pool
  async close() {
    if (pool) {
      await pool.end();
      console.log('🚢 MySQL connection pool closed');
    }
  }
}

// Export configuration and storage class
module.exports = {
  mysqlConfig,
  initializeMySQL,
  MySQLAuthStorage,
  pool: () => pool
};

/**
 * Environment Variables Required:
 * 
 * MYSQL_HOST=localhost
 * MYSQL_USER=your_mysql_user
 * MYSQL_PASSWORD=your_mysql_password
 * MYSQL_DATABASE=petrodealhub_auth
 * MYSQL_PORT=3306
 */