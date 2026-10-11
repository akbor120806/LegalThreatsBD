-- Run this ONLY if you already have an existing legalthreadbd database from
-- before and don't want to drop your data. If you're setting up fresh, just
-- use database/schema.sql instead — it already includes everything below.
--
--   mysql -u root -p legalthreadbd < database/migrate_v2.sql

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS payment_status ENUM('unpaid','paid') DEFAULT 'unpaid' AFTER cancelled_by,
  ADD COLUMN IF NOT EXISTS payment_method ENUM('visa','bank','bkash','nagad','rocket') DEFAULT NULL AFTER payment_status,
  ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT NULL AFTER payment_method;

-- lawyers.photo_url already existed in the original schema — nothing to add there.
