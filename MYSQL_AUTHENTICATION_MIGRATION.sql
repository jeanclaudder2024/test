-- ===============================================
-- 🚢 PETRODEALHUB PROFESSIONAL AUTHENTICATION
-- Complete MySQL Migration for Authentication System
-- ===============================================

-- Create authentication database
CREATE DATABASE IF NOT EXISTS petrodealhub_auth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petrodealhub_auth;

-- ===============================================
-- 1. USERS TABLE (Enhanced Professional Authentication)
-- ===============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed password',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255) COMMENT 'Professional maritime company',
    phone VARCHAR(20) COMMENT 'International phone number with country code',
    email_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    last_login_ip VARCHAR(45) COMMENT 'IPv4 or IPv6 address',
    
    -- Indexes for performance
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_email_verified (email_verified),
    INDEX idx_account_locked (account_locked_until),
    INDEX idx_last_login (last_login)
) ENGINE=InnoDB;

-- ===============================================
-- 2. OTP CODES TABLE (Email Verification & Login)
-- ===============================================
CREATE TABLE otp_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL COMMENT '6-digit OTP code',
    purpose ENUM('email_verification', 'login_verification', 'password_reset') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_email_otp (email, otp_code),
    INDEX idx_user_purpose (user_id, purpose),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used (used)
) ENGINE=InnoDB;

-- ===============================================
-- 3. LOGIN ATTEMPTS TABLE (Security Monitoring)
-- ===============================================
CREATE TABLE login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    success BOOLEAN NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    
    -- Indexes for security analysis
    INDEX idx_email_attempts (email, attempt_time),
    INDEX idx_ip_attempts (ip_address, attempt_time),
    INDEX idx_success (success),
    INDEX idx_attempt_time (attempt_time)
) ENGINE=InnoDB;

-- ===============================================
-- 4. SESSIONS TABLE (For Express Session Storage)
-- ===============================================
CREATE TABLE sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data MEDIUMTEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
) ENGINE=InnoDB;

-- ===============================================
-- 5. SAMPLE DATA INSERTION
-- ===============================================

-- Insert sample professional maritime user
INSERT INTO users (
    username, 
    email, 
    password, 
    first_name, 
    last_name, 
    company, 
    phone, 
    email_verified
) VALUES (
    'admin_maritime',
    'admin@petrodealhub.com',
    '$2b$12$rQJ8vQ7iY.nY5KGK7LKd8eH6v8QVz1x4K2M3N5P7R9S1T3U5V7W9Y1', -- Sample BCrypt hash
    'Ahmad',
    'Al-Maritime',
    'PetroDealHub Maritime Solutions',
    '+971501234567',
    TRUE
);

-- ===============================================
-- 6. CLEANUP PROCEDURES (Auto-delete expired data)
-- ===============================================

-- Create procedure to clean expired OTP codes
DELIMITER //
CREATE PROCEDURE CleanExpiredOTPs()
BEGIN
    DELETE FROM otp_codes WHERE expires_at < NOW();
END //
DELIMITER ;

-- Create procedure to clean old login attempts (keep 30 days)
DELIMITER //
CREATE PROCEDURE CleanOldLoginAttempts()
BEGIN
    DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
END //
DELIMITER ;

-- ===============================================
-- 7. SCHEDULED EVENTS (Auto-cleanup)
-- ===============================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Schedule OTP cleanup every hour
CREATE EVENT IF NOT EXISTS cleanup_expired_otps
ON SCHEDULE EVERY 1 HOUR
DO CALL CleanExpiredOTPs();

-- Schedule login attempts cleanup daily
CREATE EVENT IF NOT EXISTS cleanup_old_login_attempts
ON SCHEDULE EVERY 1 DAY
DO CALL CleanOldLoginAttempts();

-- ===============================================
-- 8. SECURITY VIEWS (For analytics)
-- ===============================================

-- View for failed login monitoring
CREATE VIEW failed_login_summary AS
SELECT 
    email,
    ip_address,
    COUNT(*) as failed_attempts,
    MAX(attempt_time) as last_attempt,
    DATE(attempt_time) as attempt_date
FROM login_attempts 
WHERE success = FALSE 
GROUP BY email, ip_address, DATE(attempt_time)
HAVING failed_attempts >= 3;

-- View for user activity summary
CREATE VIEW user_activity_summary AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.company,
    u.last_login,
    u.email_verified,
    u.failed_login_attempts,
    COUNT(la.id) as total_login_attempts
FROM users u
LEFT JOIN login_attempts la ON u.email = la.email
GROUP BY u.id, u.username, u.email, u.company, u.last_login, u.email_verified, u.failed_login_attempts;

-- ===============================================
-- 9. PERFORMANCE OPTIMIZATIONS
-- ===============================================

-- Optimize tables for InnoDB
ALTER TABLE users ENGINE=InnoDB;
ALTER TABLE otp_codes ENGINE=InnoDB;
ALTER TABLE login_attempts ENGINE=InnoDB;
ALTER TABLE sessions ENGINE=InnoDB;

-- Set optimal InnoDB settings
SET GLOBAL innodb_buffer_pool_size = 256M;
SET GLOBAL innodb_log_file_size = 64M;

-- ===============================================
-- 10. BACKUP RECOMMENDATIONS
-- ===============================================

/*
BACKUP COMMANDS:

1. Full database backup:
mysqldump -u username -p petrodealhub_auth > petrodealhub_auth_backup.sql

2. Users table only:
mysqldump -u username -p petrodealhub_auth users > users_backup.sql

3. Authentication data only (no sessions):
mysqldump -u username -p petrodealhub_auth users otp_codes login_attempts > auth_data_backup.sql

RESTORE COMMANDS:

1. Restore full database:
mysql -u username -p petrodealhub_auth < petrodealhub_auth_backup.sql

2. Restore specific table:
mysql -u username -p petrodealhub_auth < users_backup.sql
*/

-- ===============================================
-- 11. VERIFICATION QUERIES
-- ===============================================

-- Check table structure
SHOW TABLES;
DESCRIBE users;
DESCRIBE otp_codes;
DESCRIBE login_attempts;
DESCRIBE sessions;

-- Check indexes
SHOW INDEX FROM users;
SHOW INDEX FROM otp_codes;
SHOW INDEX FROM login_attempts;

-- Verify sample data
SELECT * FROM users WHERE email = 'admin@petrodealhub.com';

-- Check views
SELECT * FROM user_activity_summary LIMIT 5;

-- ===============================================
-- ✅ MIGRATION COMPLETE
-- ===============================================

SELECT 
    '🚢 PetroDealHub Professional Authentication System' as message,
    'MySQL Migration Completed Successfully!' as status,
    NOW() as completed_at;