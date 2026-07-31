-- Run this SQL in your Supabase dashboard SQL Editor
-- to create the email_inbox table for Resend inbound replies.

CREATE TABLE IF NOT EXISTS email_inbox (
    id BIGSERIAL PRIMARY KEY,
    email_id TEXT UNIQUE,
    from_name TEXT DEFAULT '',
    from_email TEXT DEFAULT '',
    to_email TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    body_text TEXT DEFAULT '',
    body_html TEXT DEFAULT '',
    attachments JSONB DEFAULT '[]'::jsonb,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_inbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read email_inbox"
    ON email_inbox FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "anon can insert email_inbox"
    ON email_inbox FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "anon can update email_inbox"
    ON email_inbox FOR UPDATE
    TO anon
    USING (true);

CREATE POLICY "anon can delete email_inbox"
    ON email_inbox FOR DELETE
    TO anon
    USING (true);
