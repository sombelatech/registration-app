# TANFISH Forum 2026 — Registration System

A **serverless** event-registration app that runs entirely on the **free
Firebase Spark plan** — no backend, no Cloud Functions.

- **Registration form** (`public/index.html`) writes directly to **Firestore**
- **Admin dashboard** (`public/admin.html`) uses **Firebase Authentication**
- **Confirmation emails** are sent client-side via **EmailJS**
- **Excel export** is generated in the browser with SheetJS

## 🚀 Setup & deploy

Full instructions are in **[SETUP-FIREBASE.md](SETUP-FIREBASE.md)**. In short:

1. In the Firebase Console, enable **Firestore** and **Email/Password Auth**,
   and create your one admin user.
2. Paste your keys into **`public/firebase-config.js`**
   (Firebase web config, event details, EmailJS keys).
3. Deploy:
   ```bash
   firebase deploy --only firestore:rules,hosting
   ```

Live at `https://tanfish-forum-2026.web.app` (admin panel at `/admin.html`).

## 📁 Structure

```
public/index.html         registration form
public/admin.html         admin dashboard
public/firebase-config.js YOUR keys + event details   ← edit this
firestore.rules           security rules
firebase.json             hosting + firestore deploy config
SETUP-FIREBASE.md         detailed setup guide
```

## ✏️ Reuse for another event

Edit the `EVENT_CONFIG` block in `public/firebase-config.js`
(event name, dates, location, registration deadline). Update the deadline in
`firestore.rules` to match, then redeploy.
