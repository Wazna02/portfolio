# Fathima Wazna: Portfolio

A personal portfolio with a plain HTML/CSS/JS frontend and a Node.js + Express backend.

- **Frontend** (`public/`): responsive, light/dark theme, interactive network hero, filterable projects.
- **Backend** (`server.js`): serves the site, a projects API (`GET /api/projects`) and a contact API
  (`POST /api/contact`) with validation, a honeypot, rate limiting (5 per hour per IP) and optional email delivery.

## Run locally
```bash
npm install
cp .env.example .env   # optional: fill in SMTP details to receive messages by email
npm start              # http://localhost:3000
```

## Customise
- **Profile picture:** save it as `public/images/profile.jpg` (square, ~800x800 px).
- **Projects:** edit `data/projects.json` (`tag` is AI, Web, Networking or Data; leave `link` empty to hide the button).
- **Text and styles:** `public/index.html`, `public/css/style.css`.

## Deploy
GitHub Pages only hosts static files, so the contact form and projects API need a Node host.
On [Render](https://render.com) (free tier): New → Web Service → connect this repo →
Build command `npm install`, Start command `npm start`, then add the SMTP variables from `.env.example`.
