-- This script creates the tables needed for the chat/messaging feature

-- Create Conversation table
CREATE TABLE IF NOT EXISTS "Conversation" (
    conversation_id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure user1_id < user2_id to avoid duplicate conversations
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id),
    CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Create Message table
CREATE TABLE IF NOT EXISTS "Message" (
    message_id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES "Conversation"(conversation_id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT message_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversation_user1 ON "Conversation"(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversation_user2 ON "Conversation"(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversation_updated ON "Conversation"(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_conversation ON "Message"(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_sender ON "Message"(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_created ON "Message"(created_at);
CREATE INDEX IF NOT EXISTS idx_message_read ON "Message"(read) WHERE read = FALSE;

-- Function to update conversation timestamp on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Conversation"
    SET updated_at = CURRENT_TIMESTAMP
    WHERE conversation_id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update conversation timestamp when a message is sent
CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON "Message"
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Comments for documentation
COMMENT ON TABLE "Conversation" IS 'Stores conversations between two users';
COMMENT ON TABLE "Message" IS 'Stores messages within conversations';
COMMENT ON COLUMN "Conversation".user1_id IS 'First participant in the conversation';
COMMENT ON COLUMN "Conversation".user2_id IS 'Second participant in the conversation';
COMMENT ON COLUMN "Message".read IS 'Whether the message has been read by the recipient';
