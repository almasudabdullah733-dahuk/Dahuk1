# Dahuk — Cyberbullying Awareness Platform

A complete 6-page website for **Dahuk**, Bangladesh's digital platform for
cyberbullying awareness, built with plain HTML, CSS and JavaScript on the
front end, and PHP + MySQL for the two forms (contact + incident report).

## Folder structure

```
Dahuk/
├── index.html          Home
├── about.html           About / Our Story
├── awareness.html       Awareness & Education
├── resources.html       Resources & Support (contact form)
├── faq.html              FAQ (accordion)
├── report.html           Report an Incident (report form)
├── assets/
│   ├── css/style.css     All styles (design tokens + components)
│   ├── js/main.js        Nav, scroll reveal, FAQ accordion, form handling
│   └── images/logo.png   Dahuk logo
├── php/
│   ├── db_config.php     Database connection settings
│   ├── submit_contact.php
│   └── submit_report.php
├── sql/
│   └── dahuk_schema.sql  Creates the database + two tables
└── README.md
```

## 1. Quick preview (no backend required)

You can open `index.html` directly in a browser, or serve the folder with
any static server, to see and click through the entire site — every page,
every link, the FAQ accordion, the mobile menu, and scroll animations all
work with no setup.

The two forms (on **Resources** and **Report an Incident**) will still work
in this mode: if they can't reach the PHP endpoint (because there's no PHP
server running), JavaScript automatically saves the submission in the
browser's local storage and shows a confirmation message, so nothing is
lost and nothing breaks.

## 2. Full setup with the PHP + MySQL backend

To have form submissions actually saved to a database:

1. **Create the database.** Import the schema once:
   ```bash
   mysql -u root -p < sql/dahuk_schema.sql
   ```
   (or open `sql/dahuk_schema.sql` in phpMyAdmin and run it).

2. **Set your credentials.** Open `php/db_config.php` and update
   `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` if they differ from the
   defaults (`localhost` / `dahuk_db` / `root` / empty password).

3. **Run a PHP server from the `Dahuk` folder:**
   ```bash
   php -S localhost:8000
   ```
   Then open `http://localhost:8000/index.html` in your browser.

   (Any standard PHP host — XAMPP, WAMP, MAMP, or a shared host — also
   works; just make sure the whole `Dahuk` folder, including `php/`, is
   uploaded together.)

4. Submit the **Report an Incident** form or the **Resources** contact
   form — rows will appear in the `incident_reports` and
   `contact_messages` tables.

## Notes

- All pages share one stylesheet (`assets/css/style.css`) and one script
  (`assets/js/main.js`), so edits to colors, type, or behavior only need
  to happen in one place.
- The color palette, typography (Baloo 2 for headings, Inter for body),
  wavy section dividers, numbered content blocks, and card styles follow
  the original Dahuk design across every page.
- Replace the placeholder team initials on `about.html` and the
  BTRC / CCID / ASK / BNWLA links on `resources.html` and `report.html`
  with real photos and verified URLs before going live.
- The contact form's `mailto:` fallback is not required — everything is
  handled by `fetch()` to the PHP endpoints with a graceful offline
  fallback, so the site keeps working even without a server.
