# TANFISH Forum 2026 — Firebase (no-backend) Setup

This app now runs **entirely on the free Firebase Spark plan** — no Node server,
no Cloud Functions. The browser talks to **Firestore** directly, the admin
panel uses **Firebase Authentication**, and confirmation emails are sent with
**EmailJS**.

```
public/index.html         → registration form  (writes to Firestore)
public/admin.html         → admin dashboard     (Firebase Auth + Firestore)
public/firebase-config.js → YOUR keys go here   ← edit this
firestore.rules           → security rules
firebase.json             → hosting + firestore deploy config
```

---

## 1. Create / open the Firebase project

1. Go to <https://console.firebase.google.com> → use the existing
   **tanfish-forum-2026** project (or create it with that id).
2. **Build → Firestore Database → Create database** → *Production mode* →
   pick a location (e.g. `eur3` or `nam5`) → Enable.
3. **Build → Authentication → Get started → Sign-in method →** enable
   **Email/Password**.
4. **Authentication → Users → Add user** → create your single admin login
   (e.g. `admin@tanfishmarket.com` + a strong password). This is what you'll
   type on the admin page. ⚠️ Do **not** enable any public sign-up.

## 2. Get your web config

1. **Project settings (gear icon) → General → Your apps → Web app** (`</>`).
   Register an app if you haven't.
2. Copy the `firebaseConfig` values and paste them into
   **`public/firebase-config.js`** (the `FIREBASE_CONFIG` block).

## 3. Set up EmailJS (free email, ~200/month)

1. Sign up at <https://www.emailjs.com>.
2. **Email Services → Add New Service →** connect your Gmail. Note the
   **Service ID**.
3. **Email Templates → Create** two templates (see suggested HTML below):
   - **Confirmation** (to the registrant). In the template's **To** field put
     `{{to_email}}`. Note its **Template ID**.
   - **Admin alert** (to you). **To** field = `{{to_email}}`. Note its
     **Template ID**. *(Optional — skip if you don't want alerts.)*
4. **Account → General →** copy your **Public Key**.
5. Paste all four values + your admin email into the `EMAILJS_CONFIG` block in
   `public/firebase-config.js`.

> Leaving the `YOUR_...` placeholders simply disables emails — the form still
> works and shows the on-screen confirmation.

### Template variables available
`to_email`, `to_name`, `registration_id`, `event_name`, `event_date`,
`event_location`, `event_website`, `email`, `phone`, `organization`,
`job_title`, `country`.

### Suggested confirmation template (paste into EmailJS, "Edit Content → Code")
```html
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
  <div style="background:#05285f;color:#F6B418;padding:24px;text-align:center;border-bottom:4px solid #F6B418">
    <h2 style="margin:0">{{event_name}}</h2>
  </div>
  <div style="padding:24px">
    <p>Dear {{to_name}},</p>
    <p>Your registration is <b>confirmed</b>. Your Registration ID is:</p>
    <p style="font-size:24px;font-weight:bold;color:#0864AF;text-align:center">{{registration_id}}</p>
    <p><b>Date:</b> {{event_date}}<br><b>Location:</b> {{event_location}}<br>
       <b>Website:</b> {{event_website}}</p>
    <p>We look forward to seeing you at the Forum!</p>
  </div>
</div>
```

## 4. Deploy

Install the CLI once (`npm install -g firebase-tools`), then from the
`registration-app` folder:

```bash
firebase login
firebase use tanfish-forum-2026
firebase deploy --only firestore:rules,hosting
```

Your site goes live at `https://tanfish-forum-2026.web.app`.
Admin panel: add `/admin.html`.

## 5. Point your custom domain at Firebase

In **Hosting → Add custom domain**, enter `forum2026.tanfishmarket.com`.
Firebase gives you DNS records (usually an **A record** or a **TXT** for
verification). Add them in **Alibaba Cloud DNS**, the same place you fixed the
Railway CNAME. Once verified, Firebase auto-issues SSL.

> Note: the domain can only point to **one** host at a time. Moving it to
> Firebase means removing/replacing the current Railway CNAME for
> `forum2026`.

---

## What changed from the old backend

| Old (Express + NeDB) | Now (Firebase, free) |
|---|---|
| `server.js` REST API | ❌ no longer used — can be deleted, or kept for Railway |
| NeDB file database | Firestore collection `registrations` |
| Admin password in code | Firebase Authentication (real login) |
| `nodemailer` (Gmail) | EmailJS (client-side) |
| Server-side Excel export | Built in the browser with SheetJS |
| Sequential IDs via DB count | Firestore transaction on `meta/counter` |

`server.js`, `package.json`, and `railway.json` are now optional. They don't
get deployed to Firebase Hosting (only the `public/` folder does), so you can
leave them as a fallback or delete them.
