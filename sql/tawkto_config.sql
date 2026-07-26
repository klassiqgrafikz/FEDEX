-- Run this SQL in your Supabase dashboard SQL Editor
-- to create the tawkto_config table for Live Chat Settings.

CREATE TABLE IF NOT EXISTS tawkto_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    enabled BOOLEAN DEFAULT FALSE,
    property_id TEXT DEFAULT '',
    widget_id TEXT DEFAULT 'default',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tawkto_config (id, enabled, property_id, widget_id)
VALUES (1, FALSE, '', 'default')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE tawkto_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read tawkto_config"
    ON tawkto_config FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "anon can insert tawkto_config"
    ON tawkto_config FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "anon can update tawkto_config"
    ON tawkto_config FOR UPDATE
    TO anon
    USING (true);
