require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, "data");

app.disable("x-powered-by");
app.set("trust proxy", 1); // correct client IPs behind Render/Railway/Fly
app.use(express.json({ limit: "10kb" }));
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; " +
      "style-src-attr 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'",
  });
  next();
});
app.use(express.static(path.join(__dirname, "public")));

// Projects come from data/projects.json: edit that file, no code changes needed.
app.get("/api/projects", async (req, res) => {
  try {
    res.json(JSON.parse(await fs.readFile(path.join(DATA, "projects.json"), "utf8")));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load projects." });
  }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages. Please try again in an hour." },
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name = "", email = "", message = "", website = "" } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot: bots fill this hidden field
  const n = String(name).trim(), e = String(email).trim(), m = String(message).trim();
  if (n.length < 2 || n.length > 80) return res.status(400).json({ error: "Please enter your name." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 120) return res.status(400).json({ error: "Please enter a valid email address." });
  if (m.length < 10 || m.length > 2000) return res.status(400).json({ error: "Your message should be 10 to 2000 characters." });

  const entry = { name: n, email: e, message: m, at: new Date().toISOString() };
  try {
    // 1) Always keep a copy on disk (note: free hosts may reset the disk on redeploy)
    const file = path.join(DATA, "messages.json");
    let list = [];
    try { list = JSON.parse(await fs.readFile(file, "utf8")); } catch {}
    list.push(entry);
    await fs.writeFile(file, JSON.stringify(list, null, 2));

    // 2) Email you the message if SMTP is configured in .env
    if (process.env.SMTP_HOST) {
      const nodemailer = require("nodemailer");
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.CONTACT_TO || process.env.SMTP_USER,
        replyTo: e,
        subject: `Portfolio message from ${n}`,
        text: `${m}\n\nFrom: ${n} <${e}>`,
      });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please email me directly." });
  }
});

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
