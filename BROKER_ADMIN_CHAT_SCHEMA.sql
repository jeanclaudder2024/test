-- BROKER-ADMIN CHAT SYSTEM DATABASE SCHEMA
-- Real-time chat system for communication between brokers and admins

-- 1. CREATE CHAT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS chat_conversations (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) DEFAULT 'Support Chat',
    status VARCHAR(50) DEFAULT 'active', -- active, closed, archived
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREATE CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, file, image, system
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE CHAT PARTICIPANTS TABLE (for future group chat support)
CREATE TABLE IF NOT EXISTS chat_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'participant', -- admin, broker, participant
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_message_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(conversation_id, user_id)
);

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_chat_conversations_broker_id ON chat_conversations(broker_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_admin_id ON chat_conversations(admin_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_participants_conversation_id ON chat_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);

-- 5. CREATE TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. INSERT SAMPLE DATA FOR TESTING
INSERT INTO chat_conversations (broker_id, admin_id, title, priority)
VALUES 
(33, 33, 'General Support Chat', 'normal'),
(33, 33, 'Deal Issue - NAVE BUENA SUERTE', 'high')
ON CONFLICT DO NOTHING;

-- Get the conversation IDs for inserting messages
DO $$
DECLARE
    conv_id INTEGER;
BEGIN
    -- Get the first conversation ID
    SELECT id INTO conv_id FROM chat_conversations WHERE broker_id = 33 LIMIT 1;
    
    IF conv_id IS NOT NULL THEN
        -- Insert sample messages
        INSERT INTO chat_messages (conversation_id, sender_id, message_text, message_type)
        VALUES 
        (conv_id, 33, 'Hello! I need help with a deal processing issue.', 'text'),
        (conv_id, 33, 'The vessel documents are not uploading correctly.', 'text');
        
        -- Insert participants
        INSERT INTO chat_participants (conversation_id, user_id, role)
        VALUES 
        (conv_id, 33, 'broker'),
        (conv_id, 33, 'admin')
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END IF;
END $$;

-- Success message
SELECT 'Broker-Admin chat system database schema created successfully!' as message;