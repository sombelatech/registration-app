# Event Registration App

A full-stack registration system with a public form and a private admin dashboard.

---

## 📁 Project structure

```
registration-app/
├── server.js          ← Backend (Node.js + Express)
├── package.json
├── data/              ← Auto-created; stores the database
└── public/
    ├── index.html     ← Public registration form
    └── admin.html     ← Admin dashboard (password protected)
```

---

## 🚀 How to run

### 1. Install Node.js (if not installed)
Download from https://nodejs.org — install the LTS version.

### 2. Open a terminal in this folder
```bash
cd registration-app
```

### 3. Install dependencies (first time only)
```bash
npm install
```

### 4. Start the server
```bash
node server.js
```

You will see:
```
✅ Registration app running!
   Public form  → http://localhost:3000/
   Admin panel  → http://localhost:3000/admin.html
   Admin pass   → admin1234
```

### 5. Open in your browser
- **Public form:** http://localhost:3000/
- **Admin panel:** http://localhost:3000/admin.html

---

## 🔐 Change the admin password

Open `server.js` and change this line near the top:
```js
const ADMIN_PASSWORD = 'admin1234'; // ← Change this!
```

---

## 🌐 Share over your local network (optional)

To let others on the same Wi-Fi submit the form:

1. Find your computer's local IP address:
   - Windows: run `ipconfig` in Command Prompt → look for IPv4 Address
   - Mac/Linux: run `ifconfig` → look for inet address

2. Share this URL with people on the same network:
   `http://YOUR-IP-ADDRESS:3000/`

   Example: `http://192.168.1.10:3000/`

3. Keep your terminal open (server must stay running).

---

## 📊 Export to Excel

Log into the admin panel and click **Export Excel** — downloads all registrations as `.xlsx`.

---

## 🌍 Deploy online (optional free hosting)

To get a public link anyone on the internet can access:

1. **Railway.app** (easiest): https://railway.app
   - Sign up → New Project → Deploy from GitHub
   - Upload this folder and Railway runs it automatically

2. **Render.com**: https://render.com
   - Create a new Web Service → connect your repo → set start command to `node server.js`
