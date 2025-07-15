-- ===================================================
-- STEP 6: Add indexes for better performance
-- ===================================================
-- Only run this AFTER all previous steps are successful
-- ===================================================

CREATE INDEX IF NOT EXISTS idx_broker_deals_broker_id ON broker_deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(status);
CREATE INDEX IF NOT EXISTS idx_broker_deals_created_at ON broker_deals(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_steps_deal_id ON transaction_steps(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_deal_id ON transaction_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_deal_id ON deal_messages(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_progress_tracking_deal_id ON deal_progress_tracking(deal_id);