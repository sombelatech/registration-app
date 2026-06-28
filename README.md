# TANFISH Forum 2026 — Registration System v3.0

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Gmail (for email notifications)

#### Step A — Create Gmail App Password:
1. Go to myaccount.google.com → Security
2. Enable 2-Step Verification
3. Go to Security → App Passwords
4. Select "Mail" → Generate
5. Copy the 16-digit password

#### Step B — Open server.js and fill in:
```js
adminEmail:  'your-personal@email.com',  // where YOU receive alerts
gmailUser:   'tanfishforum2026@gmail.com', // the sending Gmail
gmailPass:   'xxxx xxxx xxxx xxxx',        // 16-digit App Password
adminPassword: 'your-secure-password',
```

### 3. Start the server
```bash
node server.js
```

## 🌐 URLs
- **Public form:** http://localhost:3000/
- **Admin panel:** http://localhost:3000/admin.html

## ✏️ Reuse for another event
Just change the CONFIG block at the top of server.js:
- eventName, eventDate, eventLocation
- registrationDeadline
- adminPassword, adminEmail

## 📧 What emails are sent
- **Registrant** receives: Beautiful HTML invitation with registration ID + QR code
- **Admin** receives: Instant notification with all registrant details
