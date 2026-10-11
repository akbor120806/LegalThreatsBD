-- Run this ONLY if you already have an existing legalthreadbd database from
-- before v3 (payment columns) and don't want to drop your data.
--
--   mysql -u root -p legalthreadbd < database/migrate_v3.sql
--
-- If you're setting up fresh, just use database/schema.sql instead — it
-- already includes everything below.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS district VARCHAR(100) DEFAULT NULL AFTER role;
