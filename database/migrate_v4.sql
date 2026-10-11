-- Run this ONLY if you already have an existing legalthreadbd database from
-- before v6 (guest booking) and don't want to drop your data.
--
--   mysql -u root -p legalthreadbd < database/migrate_v4.sql
--
-- If you're setting up fresh, just use database/schema.sql instead — it
-- already includes everything below.

ALTER TABLE appointments
  MODIFY COLUMN user_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guest_name VARCHAR(150) DEFAULT NULL AFTER user_id,
  ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(30) DEFAULT NULL AFTER guest_name,
  ADD COLUMN IF NOT EXISTS guest_email VARCHAR(190) DEFAULT NULL AFTER guest_phone;

-- Drop the old ON DELETE CASCADE foreign key and recreate it as
-- ON DELETE SET NULL, since user_id can now be empty (guest bookings).
-- The constraint name below is MySQL's default; if this line errors with
-- "check that column/key exists" your FK may have a different name — run
-- `SHOW CREATE TABLE appointments;` to find it and adjust the name.
ALTER TABLE appointments DROP FOREIGN KEY appointments_ibfk_1;
ALTER TABLE appointments
  ADD CONSTRAINT appointments_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
