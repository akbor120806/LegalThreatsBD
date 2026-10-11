-- Run this ONLY if you already have an existing legalthreadbd database from
-- before v7 (admin-editable settings, photo cooldown, self-delete) and
-- don't want to drop your data.
--
--   mysql -u root -p legalthreadbd < database/migrate_v5.sql
--
-- If you're setting up fresh, just use database/schema.sql instead — it
-- already includes everything below.

ALTER TABLE lawyers
  ADD COLUMN IF NOT EXISTS photo_updated_at DATETIME DEFAULT NULL AFTER photo_url;

CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  phone VARCHAR(30) DEFAULT NULL,
  email VARCHAR(190) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  bkash_number VARCHAR(30) DEFAULT NULL,
  nagad_number VARCHAR(30) DEFAULT NULL,
  rocket_number VARCHAR(30) DEFAULT NULL,
  bank_name VARCHAR(150) DEFAULT NULL,
  bank_account_name VARCHAR(150) DEFAULT NULL,
  bank_account_number VARCHAR(60) DEFAULT NULL,
  bank_branch VARCHAR(150) DEFAULT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
) ENGINE=InnoDB;

INSERT IGNORE INTO site_settings
  (id, phone, email, website, address, bkash_number, nagad_number, rocket_number, bank_name, bank_account_name, bank_account_number, bank_branch)
VALUES
  (1, '+880 1700-000000', 'info@legalthreatsbd.com', 'https://legalthreatsbd.com',
   'House 12, Road 5, Dhanmondi, Dhaka-1209, Bangladesh',
   '01700-000000', '01700-000000', '01700-000000',
   'Dutch-Bangla Bank', 'Legal Threats BD', '1234567890123', 'Dhanmondi Branch');
