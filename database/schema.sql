-- LEGAL THREATs BD
 — MySQL schema
-- Create the database and load this file:
--   mysql -u root -p -e "CREATE DATABASE legalthreadbd"
--   mysql -u root -p legalthreadbd < database/schema.sql

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- USERS  (public site users: clients AND self-registered lawyers share
-- this table, distinguished by `role`. A 'lawyer' role user gets a
-- matching row in the `lawyers` table linked via lawyers.user_id.)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(30) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('client','lawyer') NOT NULL DEFAULT 'client',
  district VARCHAR(100) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ADMINS  (kept completely separate from the users table on purpose —
-- there is NO public sign-up flow for this table. Rows are created only
-- via the `npm run create-admin` CLI script, so only whoever runs that
-- script on the server knows the admin credentials.)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
-- Intentionally no seed row here — run: npm run create-admin -- <username> <password>

-- ---------------------------------------------------------------------
-- LEGAL CATEGORIES  (Criminal, Civil, Corporate, Tax, ...)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS legal_categories;
CREATE TABLE legal_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'scale',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- LAWYERS
-- `user_id` links a self-registered lawyer account (users.role='lawyer')
-- to their public profile row. NULL means the profile was added manually
-- by an admin and has no login of its own.
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS lawyers;
CREATE TABLE lawyers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  expertise VARCHAR(150) NOT NULL,
  category_id INT DEFAULT NULL,
  experience_years INT DEFAULT 0,
  address VARCHAR(255) DEFAULT NULL,
  district VARCHAR(100) DEFAULT NULL,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  bar_council_id VARCHAR(100) DEFAULT NULL,
  bio TEXT,
  photo_url VARCHAR(255) DEFAULT NULL,
  photo_updated_at DATETIME DEFAULT NULL,
  is_verified TINYINT(1) DEFAULT 1,
  rating DECIMAL(2,1) DEFAULT 4.5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES legal_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- APPOINTMENTS
-- Lifecycle: pending -> (lawyer) confirmed | cancelled | reschedule_requested
-- reschedule_requested -> (client) confirmed (accepts new time) | cancelled (declines)
-- `cancelled_by` records who cancelled it, so the admin/lawyer dashboards
-- can accurately count "rejected by lawyer" vs "cancelled by client".
-- Payment is collected at booking time: a fixed platform fee (not the
-- lawyer's own consultation_fee) — ৳300 for online, ৳500 for offline.
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS appointments;
-- ---------------------------------------------------------------------
-- APPOINTMENTS
-- Lifecycle: pending -> (lawyer) confirmed | cancelled | reschedule_requested
-- reschedule_requested -> (client) confirmed (accepts new time) | cancelled (declines)
-- `cancelled_by` records who cancelled it, so the admin/lawyer dashboards
-- can accurately count "rejected by lawyer" vs "cancelled by client".
-- Payment is collected at booking time: a fixed platform fee (not the
-- lawyer's own consultation_fee) — ৳300 for online, ৳500 for offline,
-- plus a flat ৳50 platform charge.
-- `user_id` is nullable: a person can book WITHOUT creating an account —
-- in that case guest_name/guest_phone/guest_email store their contact
-- details instead. When user_id is set, those guest_* columns are unused.
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS appointments;
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  lawyer_id INT NOT NULL,
  guest_name VARCHAR(150) DEFAULT NULL,
  guest_phone VARCHAR(30) DEFAULT NULL,
  guest_email VARCHAR(190) DEFAULT NULL,
  mode ENUM('online','offline') DEFAULT 'online',
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20) NOT NULL,
  proposed_date DATE DEFAULT NULL,
  proposed_time VARCHAR(20) DEFAULT NULL,
  lawyer_note TEXT DEFAULT NULL,
  status ENUM('pending','confirmed','completed','cancelled','reschedule_requested') DEFAULT 'pending',
  cancelled_by ENUM('client','lawyer') DEFAULT NULL,
  -- Payment is manual/off-platform: client sends money themselves to the
  -- bKash/Nagad/Rocket/bank account shown (set in site_settings), then
  -- submits a transaction ID and/or screenshot as proof. Admin checks the
  -- real account and marks it verified or rejected.
  payment_status ENUM('unpaid','submitted','verified','rejected') DEFAULT 'unpaid',
  payment_method ENUM('visa','bank','bkash','nagad','rocket') DEFAULT NULL,
  payment_amount DECIMAL(10,2) DEFAULT NULL,
  payment_transaction_id VARCHAR(100) DEFAULT NULL,
  payment_screenshot_url VARCHAR(255) DEFAULT NULL,
  payment_verified_at DATETIME DEFAULT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- LAWYER PAYOUTS  (manual ledger: admin records what they've paid a
-- lawyer for the cases they've taken. Visible on both the admin panel and
-- the lawyer's own dashboard.)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS lawyer_payouts;
CREATE TABLE lawyer_payouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lawyer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_on DATE NOT NULL,
  note VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- LEGAL DOCUMENTS  (downloadable forms / notices / acts)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS legal_documents;
CREATE TABLE legal_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT DEFAULT NULL,
  file_url VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES legal_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- CONTACT / CALL-BACK REQUESTS  (public homepage form)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS contact_requests;
CREATE TABLE contact_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  area VARCHAR(100) DEFAULT NULL,
  message TEXT,
  status ENUM('new','contacted','closed') DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- SITE SETTINGS  (single row, id=1 always — footer contact info and the
-- payment account numbers shown to clients during checkout. Editable from
-- the admin panel at /admin/settings.)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS site_settings;
CREATE TABLE site_settings (
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

INSERT INTO site_settings
  (id, phone, email, website, address, bkash_number, nagad_number, rocket_number, bank_name, bank_account_name, bank_account_number, bank_branch)
VALUES
  (1, '+880 1700-000000', 'info@legalthreatsbd.com', 'https://legalthreatsbd.com',
   'House 12, Road 5, Dhanmondi, Dhaka-1209, Bangladesh',
   '01700-000000', '01700-000000', '01700-000000',
   'Dutch-Bangla Bank', 'Legal Threats BD', '1234567890123', 'Dhanmondi Branch');

-- ---------------------------------------------------------------------
-- SEED DATA
-- ---------------------------------------------------------------------
INSERT INTO legal_categories (name, slug, description, icon) VALUES
('Criminal', 'criminal', 'Protects citizens against violence and ensures justice through criminal law.', 'gavel'),
('Civil', 'civil', 'Covers guardianship, property, and personal rights disputes.', 'balance'),
('Corporate', 'corporate', 'Company formation, governance, and business compliance.', 'building'),
('Tax', 'tax', 'Income tax and VAT compliance for individuals and businesses.', 'receipt');

INSERT INTO lawyers (name, expertise, category_id, experience_years, address, district, consultation_fee, bar_council_id, bio, is_verified, rating) VALUES
('Barrister Farhana Rahman', 'Criminal Defense', 1, 12, 'House 14, Road 7, Dhanmondi', 'Dhaka', 1500.00, 'BC-10245', 'Specializes in criminal defense and women & children protection cases.', 1, 4.8),
('Advocate Shahriar Kabir', 'Civil & Guardianship Law', 2, 9, 'Chittagong Court Road', 'Chittagong', 1200.00, 'BC-10389', 'Experienced in guardianship, inheritance and property disputes.', 1, 4.6),
('Barrister Nadia Islam', 'Corporate Law', 3, 15, 'Gulshan Avenue, Dhaka', 'Dhaka', 2500.00, 'BC-10021', 'Advises startups and enterprises on company formation and compliance.', 1, 4.9),
('Advocate Mahmudul Hasan', 'Tax Law', 4, 7, 'Motijheel C/A', 'Dhaka', 1800.00, 'BC-10877', 'Handles income tax and VAT matters for individuals and SMEs.', 1, 4.5),
('Advocate Rezwana Karim', 'Criminal Law', 1, 6, 'Sylhet Court Area', 'Sylhet', 1000.00, 'BC-11002', 'Focused on criminal procedure and evidence law.', 1, 4.4),
('Barrister Imran Chowdhury', 'Corporate & Contract Law', 3, 11, 'Banani, Dhaka', 'Dhaka', 2200.00, 'BC-10456', 'Contract drafting and partnership act specialist.', 1, 4.7);

INSERT INTO legal_documents (title, description, category_id, file_url) VALUES
('Children Act — Summary', 'Protects women and children from violence and ensures justice.', 1, '#'),
('Penal Code 1860 — Overview', 'Defines criminal offenses and their punishments.', 1, '#'),
('Evidence Act 1872 — Guide', 'Governs the admissibility of evidence in courts.', 1, '#'),
('Code of Criminal Procedure', 'Explains criminal investigation and trial procedures.', 1, '#'),
('Narcotics Control Act', 'Regulates narcotics related crimes and penalties.', 1, '#'),
('Companies Act 1994', 'Legal framework for company formation and governance.', 3, '#'),
('Contract Act 1872', 'Provides the legal framework for valid contracts.', 3, '#'),
('Partnership Act 1932', 'Defines rights, duties and liabilities of partners.', 3, '#'),
('Income Tax Act 2023', 'Governs individual and corporate income tax.', 4, '#'),
('Value Added Tax Act 2012', 'Regulates VAT collection and compliance.', 4, '#');
