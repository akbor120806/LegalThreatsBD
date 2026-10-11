-- Run this ONLY if you already have an existing legalthreadbd database from
-- before v8 (manual payment verification, lawyer payouts) and don't want
-- to drop your data.
--
--   mysql -u root -p legalthreadbd < database/migrate_v6.sql
--
-- If you're setting up fresh, just use database/schema.sql instead — it
-- already includes everything below.

ALTER TABLE appointments
  MODIFY COLUMN payment_status ENUM('unpaid','submitted','verified','rejected') DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_transaction_id VARCHAR(100) DEFAULT NULL AFTER payment_amount,
  ADD COLUMN IF NOT EXISTS payment_screenshot_url VARCHAR(255) DEFAULT NULL AFTER payment_transaction_id,
  ADD COLUMN IF NOT EXISTS payment_verified_at DATETIME DEFAULT NULL AFTER payment_screenshot_url;

-- Any appointment that was previously auto-marked 'paid' under the old demo
-- flow is treated as 'verified' so existing data still makes sense.
UPDATE appointments SET payment_status = 'verified', payment_verified_at = created_at WHERE payment_status = 'paid';

CREATE TABLE IF NOT EXISTS lawyer_payouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lawyer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_on DATE NOT NULL,
  note VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE
) ENGINE=InnoDB;
