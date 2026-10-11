# LEGAL THREATs BD


A full-stack legal-services platform for Bangladesh — built with **Next.js
(App Router)**, **JavaScript**, and **MySQL**. Citizens can find verified
lawyers, book online/offline consultations, read simplified legal knowledge,
and download legal documents. A completely separate, credential-protected
**Admin Panel** lets a single admin manage lawyers, appointments, users, and
call-back requests.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, plain CSS (no framework)
- **Backend:** Next.js Route Handlers (API routes), Node.js
- **Database:** MySQL (via `mysql2`)
- **Auth:** JWT sessions in httpOnly cookies (`jose`), passwords hashed with `bcryptjs`

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your MySQL credentials and a long random `JWT_SECRET`.

## 3. Create the database and load the schema

```bash
mysql -u root -p -e "CREATE DATABASE legalthreadbd"
mysql -u root -p legalthreadbd < database/schema.sql
```

This creates all tables (`users`, `admins`, `lawyers`, `appointments`,
`legal_categories`, `legal_documents`, `contact_requests`) and seeds some
sample lawyers, categories, and documents.

> Note: the `admins` table is created **empty on purpose** — there is no
> public sign-up route for admins anywhere in the app.

> **Already have this database from before and don't want to lose data?**
> Run all migration files in order instead of dropping anything:
> ```bash
> mysql -u root -p legalthreadbd < database/migrate_v2.sql
> mysql -u root -p legalthreadbd < database/migrate_v3.sql
> mysql -u root -p legalthreadbd < database/migrate_v4.sql
> mysql -u root -p legalthreadbd < database/migrate_v5.sql
> mysql -u root -p legalthreadbd < database/migrate_v6.sql
> ```
> `migrate_v2.sql` adds the payment columns, `migrate_v3.sql` adds
> `users.district`, `migrate_v4.sql` makes `appointments.user_id` nullable
> and adds guest contact columns (for booking without an account),
> `migrate_v5.sql` adds the `site_settings` table (admin-editable footer
> contact info + payment accounts) and `lawyers.photo_updated_at` (photo
> change cooldown), `migrate_v6.sql` switches payments to the real
> manually-verified flow (transaction ID/screenshot + admin verify/reject)
> and adds the `lawyer_payouts` table. All are safe to re-run.

## 4. Create your admin account

This is the **only** way to create an admin login, and it only works from
the server/terminal — nobody can create one through the website:

```bash
npm run create-admin -- youradminname YourStrongPassword123
```

(Or just run `npm run create-admin` and follow the prompts.)

## 5. Run the app

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login (not linked anywhere on the
  public site — only reachable if you know the URL and the credentials
  created in step 4)

## How authentication works

- **Public users** register/login at `/register` and `/login`, choosing a
  role: **Client** or **Lawyer**.
  - A session cookie (`lt_session`) is issued and the navbar automatically
    switches from **Login / Register** to **Dashboard / Logout**.
  - Clients land on `/dashboard`; lawyers land on `/lawyer-dashboard` —
    `middleware.js` enforces this automatically even if someone tries the
    wrong URL directly.
  - Registering as a lawyer also creates a matching row in the `lawyers`
    table (linked via `lawyers.user_id`), so they immediately appear in the
    public "Find a Lawyer" directory.
- **Admin** logs in separately at `/admin/login` using a totally different
  cookie (`lt_admin_session`) and a totally different database table
  (`admins`). Regular client/lawyer accounts can never access `/admin/*`.
- `middleware.js` protects `/admin/*` (except `/admin/login`), `/dashboard/*`
  (clients), and `/lawyer-dashboard/*` (lawyers).

## Lawyer ↔ Client appointment workflow

1. A client books an appointment from a lawyer's profile page → status
   `pending`.
2. The lawyer sees it on `/lawyer-dashboard` and can:
   - **Accept** → status `confirmed`
   - **Reject** → status `cancelled` (`cancelled_by = 'lawyer'`)
   - **Propose New Time** → status `reschedule_requested`, with
     `proposed_date` / `proposed_time` / an optional note
3. If a new time was proposed, the client sees it on `/dashboard` and can:
   - **Accept New Time** → status becomes `confirmed` and the appointment's
     date/time are updated to the proposed ones
   - **Decline** → status `cancelled` (`cancelled_by = 'client'`)
4. Once a confirmed appointment has happened, the lawyer can mark it
   **Completed** from their dashboard.

Every lawyer's **Accepted** and **Rejected** counts are tracked live and
shown both on their own dashboard and on the admin panel's Lawyers list
(`/admin/lawyers`) — click a lawyer's name there to open a full dashboard
view of their profile, stats, and appointment history.

## Project structure

```
app/
  (site)/            → public pages, wrapped with Nav + Footer
    page.js           → homepage
    login/ register/  → auth pages
    lawyers/           → lawyer directory + [id] detail & booking
    legal-awareness/   → legal knowledge by category
    documents/         → downloadable legal documents
    about/
    dashboard/         → logged-in client's appointments
  lawyer-dashboard/   → logged-in lawyer's profile + appointment requests
  admin/
    login/             → standalone admin login (no sidebar)
    (protected)/        → everything else under /admin, wrapped with sidebar
      page.js           → admin dashboard
      lawyers/          → CRUD
      appointments/     → status management
      users/            → read-only directory
      messages/         → call-back request management
  api/                → all backend route handlers (REST-style JSON)
components/           → Nav, Footer, LawyerCard, BookingForm, CallBackForm, AdminSidebar
lib/                  → db.js (MySQL pool), auth.js (JWT), session.js (cookies)
database/schema.sql   → full schema + seed data
scripts/create-admin.js → CLI to create/reset the admin account
middleware.js          → route protection for /admin and /dashboard
```

## Notes

- Consultation fees are shown in BDT (৳).
- The seed data includes 6 sample lawyers across Criminal, Civil, Corporate
  and Tax law, and 10 sample legal documents — replace/extend these from the
  admin panel once you're logged in.

## New features

### 🌗 Dark mode
A theme toggle (🌙/☀️) sits in the navbar on every public page. The choice
is saved to `localStorage`, so it's remembered on the next visit, and an
inline script in `app/layout.js` applies it before the page paints so there's
no flash of the wrong theme. The admin panel is always dark by design and is
unaffected by this toggle.

### 🌐 Bangla / English toggle
A language toggle (বাং/EN) also sits in the navbar. It translates the navbar,
homepage, and Legal Knowledge page headings via `components/LanguageProvider.js`
and the dictionary in `lib/translations.js`. To translate more text elsewhere
in the site, add a new key to that dictionary and use `t('your_key')` (via
`useLanguage()` in a client component, or the `<T k="your_key" />` helper
inside server components).

### 🤖 AI Legal Assistant
A chat widget (on the homepage and the Legal Knowledge page) lets visitors
ask general legal questions in Bengali or English and get a plain-language
answer, with a disclaimer that it isn't a substitute for a real lawyer.

To enable it:
1. Get an API key from https://console.anthropic.com
2. Add it to `.env` as `ANTHROPIC_API_KEY=sk-ant-...`
3. Restart the dev server

Without a key set, the widget still renders but shows a friendly "not
configured yet" message instead of crashing the page.

### 🖼️ Homepage image slider
An auto-advancing banner (`components/HeroSlider.js`) sits behind the hero
headline/search bar and cycles through a themed slide per practice area
(Criminal, Civil, Corporate, Tax). It's built with CSS gradients and icons
rather than hotlinked external photos, so it always renders correctly with
zero network dependency — swap in real photography any time by replacing
the `background` values with `background: url(/your-image.jpg) center/cover`.

### 🖼️ Lawyer profile photos
Lawyers can upload/replace/remove their own profile photo from
`/lawyer-dashboard`. Files are validated (JPG/PNG/WEBP, max 3MB), stored in
`public/uploads/lawyers/`, and the path is saved on `lawyers.photo_url`
(already part of the original schema). The photo shows up on lawyer cards
and the lawyer detail page; lawyers without a photo still show initials as
before.

### ✅ Lawyer approval workflow
Self-registered lawyers now start **pending** (`is_verified = 0`) and are
hidden from every public listing (homepage, "Find a Lawyer", lawyer detail
page) until an admin approves them. The admin sidebar shows a red
notification badge with the pending count next to "Lawyers", and the admin
Lawyers page has a dedicated "Pending Lawyer Applications" panel with
**Accept** / **Reject** buttons. Rejecting removes the lawyer profile and
reverts the account back to a normal client account (rather than deleting
it) so the person can still log in. The lawyer's own dashboard shows a
"pending approval" banner until they're approved.

### 💳 Appointment payment step (real, manually-verified payments)
Booking an appointment goes through a payment step before the request is
sent: a consultation booking fee — **৳300 for online, ৳500 for offline** —
plus a flat **৳50 platform charge** added on top, itemized and totaled
(e.g. ৳350 for online, ৳550 for offline). The total is computed
server-side (never trusted from the client).

This is **real money**, sent **off-platform** — there is no payment
gateway API integration (that would need a merchant account with
SSLCommerz, bKash's own merchant API, a card processor, etc.). Instead:

1. The client picks Visa, Bank Transfer, bKash, Nagad, or Rocket, and the
   form shows the actual account number/details for that method (pulled
   live from **Admin → Settings**, see below).
2. The client sends the money themselves, the normal way (their own bKash
   app, bank transfer, etc.), then enters the **transaction ID** (required)
   and optionally uploads a **payment screenshot** as proof.
3. The appointment is created with `payment_status = 'submitted'`.
4. An admin checks the real bKash/Nagad/Rocket/bank account for that
   transaction and clicks **Verify** or **Reject** on the admin
   Appointments page (`payment_status` becomes `verified` or `rejected`;
   a rejected payment also cancels the appointment).
5. A lawyer only sees **Accept / Reject / Propose New Time** on a request
   once its payment is `verified` — until then they just see a "payment
   pending verification" note.

Every appointment's payment status, transaction ID, and screenshot (if
any) are visible on the admin Appointments page, the lawyer's dashboard,
the client's dashboard, and the downloadable PDF. The fee and platform
charge are defined as constants at the top of `components/BookingForm.js`
and `app/api/appointments/route.js` if you need to change the amounts.

### ⚙️ Admin-editable settings (`/admin/settings`)
The footer contact details (phone, email, website, address) **and** the
payment account numbers above (bKash, Nagad, Rocket, bank name/account
name/number/branch) live in the single-row `site_settings` table and are
edited from **Admin Panel → Settings**. Changes appear immediately in the
footer and in the booking payment step. `lib/siteConfig.js` is only a
fallback used if that table is empty or missing (e.g. before running the
migration).

### 💰 Lawyer case tracking & payouts
Each lawyer's accepted/rejected/pending case counts are already tracked
(shown on their own dashboard and on **Admin → Lawyers → [a lawyer's
name]**, which now opens a full detail page with their appointment
history). That same detail page has a **payout ledger**: the admin records
what they've paid the lawyer (amount, date, optional note) for the cases
they've taken — this is a manual record, not an automatic calculation,
since the platform fee is collected by the admin's own accounts and the
lawyer's share is decided and paid out separately. Every payout recorded
shows up immediately on the lawyer's own dashboard too, under "My
Earnings," so both sides can see the same history of what's been paid and
when.

### 🏙️ District selection + homepage auto-filtering
Registration (both client and lawyer) now includes a required District
dropdown (`lib/districts.js`, all 64 districts of Bangladesh), stored on
`users.district`. When a logged-in user visits the homepage, the "Find a
Lawyer" section automatically shows verified lawyers from their district
first — falling back to the site's top-rated lawyers (with a small note)
if none are available yet in that district. Logged-out visitors just see
the general top-rated list as before.

### 📱 Mobile lawyer grid fix
The lawyer-card grid on the homepage and "Find a Lawyer" page was
collapsing to a single column on phones, so only one card was visible at a
time. It now stays at 2 columns on mobile (`.lawyer-grid` in
`app/globals.css`) so at least 4 lawyer cards are visible with minimal
scrolling, and the homepage now fetches 8 lawyers instead of 4 for a fuller
grid.

### 🖼️ Logo
The uploaded logo (`public/logo.png`, background made transparent) now
appears in the navbar, footer, admin sidebar, and admin login page, and
`app/icon.png` is used automatically by Next.js as the site favicon/app
icon.

### 🔒 Security hardening
- **SQL injection:** every database query in this codebase already used
  parameterized queries (`?` placeholders with values passed separately,
  via `mysql2`) rather than building SQL strings by concatenating user
  input — that's what actually prevents SQL injection, and it was audited
  again across the whole `app/api` tree with no exceptions found.
- **Input validation:** a new `lib/validate.js` adds a defense-in-depth
  layer on top of that — rejecting malformed IDs, emails, dates, times, and
  oversized strings before they ever reach a query, applied across the
  registration, login, contact, appointment, and admin CRUD routes.
- **Security headers:** `middleware.js` now sets `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, and a restrictive
  `Permissions-Policy` on every response.
- **🚨 Fixed a real vulnerability found during this pass:** the admin login
  route (`/api/admin/login`) had been changed at some point to accept
  **any** admin username with the hardcoded password `"admin123"`,
  completely bypassing the real bcrypt password check. This has been fixed
  to properly verify against `admins.password_hash` again, exactly like
  before. **If your project was ever deployed with that version, treat the
  admin panel as compromised and set a new admin password immediately**
  with `npm run create-admin -- yourname newpassword`.

### 🔎 Searchable district filter
The "Find a Lawyer" page (`/lawyers`) now has a searchable district field
(`components/DistrictFilter.js`) next to the page heading — type any part of
a district name to filter the list of all 64 Bangladesh districts, pick one,
and the lawyer results update to only that district (combinable with the
existing category and text search filters).

### 🙋 Booking without an account
Booking an appointment no longer requires registering or logging in. If
nobody is signed in, the booking form collects a name, phone, and optional
email directly and stores the appointment as a **guest booking**
(`appointments.user_id` is `NULL`, with `guest_name` / `guest_phone` /
`guest_email` used instead). Guests get an immediate on-screen confirmation
with a **Download PDF** button right there (since they have no dashboard to
come back to later). Everywhere appointments are shown — the admin panel,
a lawyer's dashboard, PDF exports — now shows the guest's name/contact
exactly like a registered client's, with a small "Guest" indicator
(`is_guest` field) available if you want to surface it further in the UI.
Logging in still works exactly as before and additionally lets a person
track their bookings from `/dashboard`.

### 🛠️ Registration reliability
If registration or login start failing outright after a database update,
the real cause is now logged server-side (`console.error(...)` in
`app/api/auth/register/route.js` and `.../login/route.js`) instead of being
silently swallowed — check your terminal/server logs. A common cause is a
database that's a version or two behind the code (e.g. missing the
`district` column) — see the migration note in step 3 above.


### 📍 Homepage district picker
A searchable district box sits next to the hero search bar. Picking a
district (e.g. Naogaon) reloads the homepage with `?district=Naogaon` and the
"Find a Lawyer" section lists **every** verified lawyer in that district
(if there are none, it says so). Without a picked district, the existing
behavior remains: logged-in users see their own district's lawyers first.

### 📸 Profile photo rules for lawyers
A lawyer's first photo upload is free. After the first *change* (replace or
remove), the photo is locked for 3 months (`COOLDOWN_DAYS = 90` in
`app/api/lawyer/photo/route.js` and the uploader component); the dashboard
shows the date the next change becomes available. The server enforces this,
not just the UI.

### 🗑️ Lawyer self-delete (only before approval)
While a lawyer's application is pending, they can delete their own profile
from their dashboard (their account continues as a normal client account).
Once an admin approves them, self-deletion is blocked by the API — only an
admin can remove the profile — so an approved lawyer can't collect client
payments and then delete their account to avoid accountability.
