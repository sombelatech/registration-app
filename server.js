const express = require('express');
const cors = require('cors');
const path = require('path');
const XLSX = require('xlsx');
const Datastore = require('nedb-promises');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════
//  ✏️  EVENT CONFIG — change these for each new event
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  eventName:    'Tanzania Digital Fisheries Trade & Market Linkages Forum 2026',
  eventDate:    '2026-07-22',
  eventDateDisplay: '22 -23July 2026',
  eventLocation: 'University of Dar es Salaam',
  eventWebsite: 'https://tanfishmarket.com/',
  registrationDeadline: '2026-07-21',
  adminPassword: 'Tanfish@2026',          // ← updated admin password
  adminEmail:   'YOUR_EMAIL@gmail.com', // ← your personal email to receive notifications
  // ── Gmail sender (fill after creating Gmail account) ──
  gmailUser:    'YOUR_GMAIL@gmail.com', // ← sender Gmail address
  gmailPass:    'YOUR_APP_PASSWORD',    // ← 16-digit Gmail App Password
};
// ═══════════════════════════════════════════════════════════

// ── Database ──────────────────────────────────────────────
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
const db = Datastore.create({ filename: path.join(__dirname, 'data', 'registrations.db'), autoload: true });

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Email transporter ─────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: CONFIG.gmailUser, pass: CONFIG.gmailPass }
  });
}

// ── Generate QR code as base64 ────────────────────────────
async function generateQR(url) {
  return await QRCode.toDataURL(url, {
    width: 200, margin: 2,
    color: { dark: '#05285f', light: '#ffffff' }
  });
}

// ── Read logo as base64 ───────────────────────────────────
function getLogoBase64() {
  try {
    const buf = fs.readFileSync(path.join(__dirname, 'public', 'logo.png'));
    return 'data:image/png;base64,' + buf.toString('base64');
  } catch { return ''; }
}

// ── Build invitation email HTML ───────────────────────────
async function buildInvitationEmail(record, qrDataUrl) {
  const logoBase64 = getLogoBase64();
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#05285f 0%,#0864AF 100%);padding:36px 32px;text-align:center;border-bottom:5px solid #F6B418;">
            ${logoBase64 ? `<img src="${logoBase64}" alt="TANFISH" style="height:80px;width:auto;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;"/>` : ''}
            <h1 style="color:#F6B418;font-size:22px;font-weight:900;letter-spacing:0.04em;text-transform:uppercase;margin:0 0 8px;line-height:1.3;">${CONFIG.eventName}</h1>
            <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;letter-spacing:0.12em;text-transform:uppercase;">Buy &nbsp;·&nbsp; Sell &nbsp;·&nbsp; Connect &nbsp;·&nbsp; Grow</p>
          </td>
        </tr>

        <!-- Success banner -->
        <tr>
          <td style="background:#edfaed;border-bottom:1px solid #b2e6b2;padding:18px 32px;text-align:center;">
            <p style="margin:0;font-size:17px;font-weight:700;color:#1a6b1a;">✅ &nbsp;Registration Confirmed!</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="font-size:16px;color:#1a1a1a;margin:0 0 6px;">Dear <strong>${record.name}</strong>,</p>
            <p style="font-size:15px;color:#556370;margin:0 0 24px;line-height:1.6;">
              Thank you for registering for the <strong>${CONFIG.eventName}</strong>. 
              We are delighted to confirm your registration and look forward to welcoming you to this prestigious forum.
            </p>

            <!-- Registration ID box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:linear-gradient(135deg,#e8f3ed,#f0f7ff);border:2px solid #38574D;border-radius:10px;padding:18px 24px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8a9aa8;">Your Registration ID</p>
                  <p style="margin:0;font-size:28px;font-weight:900;color:#0864AF;letter-spacing:0.1em;">${record.registrationId}</p>
                  <p style="margin:6px 0 0;font-size:12px;color:#556370;">Please keep this ID for your records</p>
                </td>
              </tr>
            </table>

            <!-- Event details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #dde3ea;border-radius:10px;overflow:hidden;">
              <tr><td colspan="2" style="background:#05285f;padding:12px 18px;"><p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F6B418;">📋 &nbsp;Event Details</p></td></tr>
              <tr style="border-bottom:1px solid #dde3ea;">
                <td style="padding:12px 18px;font-size:13px;font-weight:700;color:#556370;width:130px;">📅 Date</td>
                <td style="padding:12px 18px;font-size:14px;color:#1a1a1a;font-weight:600;">${CONFIG.eventDateDisplay}</td>
              </tr>
              <tr style="border-bottom:1px solid #dde3ea;background:#f8fafc;">
                <td style="padding:12px 18px;font-size:13px;font-weight:700;color:#556370;">📍 Location</td>
                <td style="padding:12px 18px;font-size:14px;color:#1a1a1a;font-weight:600;">${CONFIG.eventLocation}</td>
              </tr>
              <tr>
                <td style="padding:12px 18px;font-size:13px;font-weight:700;color:#556370;">🌐 Website</td>
                <td style="padding:12px 18px;font-size:14px;"><a href="${CONFIG.eventWebsite}" style="color:#0864AF;font-weight:600;">${CONFIG.eventWebsite}</a></td>
              </tr>
            </table>

            <!-- Registrant details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #dde3ea;border-radius:10px;overflow:hidden;">
              <tr><td colspan="2" style="background:#38574D;padding:12px 18px;"><p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F6B418;">👤 &nbsp;Your Registration Details</p></td></tr>
              ${[
                ['Name', record.name],
                ['Email', record.email],
                ['Phone', record.phone],
                ['Organization', record.organization || '—'],
                ['Job Title', record.jobTitle || '—'],
                ['Country', record.country || '—'],
              ].map(([k,v], i) => `
              <tr style="${i%2===1?'background:#f8fafc;':''}border-bottom:1px solid #dde3ea;">
                <td style="padding:10px 18px;font-size:13px;font-weight:700;color:#556370;width:130px;">${k}</td>
                <td style="padding:10px 18px;font-size:14px;color:#1a1a1a;">${v}</td>
              </tr>`).join('')}
            </table>

            <!-- QR Code -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#f8fafc;border:1px solid #dde3ea;border-radius:10px;padding:24px;text-align:center;">
                  <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#556370;text-transform:uppercase;letter-spacing:0.08em;">Scan to Visit TANFISH Market</p>
                  <img src="${qrDataUrl}" alt="QR Code" style="width:160px;height:160px;border-radius:8px;"/>
                  <p style="margin:10px 0 0;font-size:12px;color:#8a9aa8;">${CONFIG.eventWebsite}</p>
                </td>
              </tr>
            </table>

            <p style="font-size:15px;color:#556370;line-height:1.6;margin:0 0 8px;">
              If you have any questions, please do not hesitate to contact us by visiting our website.
            </p>
            <p style="font-size:15px;color:#1a1a1a;font-weight:600;margin:0;">We look forward to seeing you at the Forum!</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#05285f;padding:20px 32px;text-align:center;">
            ${logoBase64 ? `<img src="${logoBase64}" alt="TANFISH" style="height:36px;width:auto;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;opacity:0.85;"/>` : ''}
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.6);">© 2026 TANFISH Market &nbsp;·&nbsp; <a href="${CONFIG.eventWebsite}" style="color:#F6B418;text-decoration:none;">${CONFIG.eventWebsite}</a></p>
            <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.4);">This is an automated confirmation email. Please do not reply.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Build admin notification email ────────────────────────
function buildAdminEmail(record) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f4f8;margin:0;padding:24px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <tr><td style="background:#05285f;padding:20px 28px;border-bottom:4px solid #F6B418;">
      <p style="margin:0;font-size:18px;font-weight:800;color:#F6B418;">🔔 &nbsp;New Registration Alert</p>
      <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">${CONFIG.eventName}</p>
    </td></tr>
    <tr><td style="padding:24px 28px;">
      <p style="margin:0 0 16px;font-size:15px;color:#1a1a1a;">A new participant has just registered:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dde3ea;border-radius:8px;overflow:hidden;">
        ${[
          ['Registration ID', record.registrationId],
          ['Full Name', record.name],
          ['Email', record.email],
          ['Phone', record.phone],
          ['Organization', record.organization || '—'],
          ['Job Title', record.jobTitle || '—'],
          ['Department', record.department || '—'],
          ['Country', record.country || '—'],
          ['Dietary', record.diet || 'None'],
          ['Heard From', record.source || '—'],
          ['Registered At', record.registeredAt],
        ].map(([k,v],i)=>`
        <tr style="${i%2===1?'background:#f8fafc;':''}">
          <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#556370;width:130px;border-bottom:1px solid #dde3ea;">${k}</td>
          <td style="padding:10px 14px;font-size:14px;color:#1a1a1a;border-bottom:1px solid #dde3ea;">${v}</td>
        </tr>`).join('')}
      </table>
      ${record.comments ? `<p style="margin:16px 0 0;font-size:14px;color:#556370;"><strong>Comments:</strong> ${record.comments}</p>` : ''}
    </td></tr>
    <tr><td style="background:#f8fafc;padding:14px 28px;border-top:1px solid #dde3ea;">
      <p style="margin:0;font-size:12px;color:#8a9aa8;">Sent automatically by TANFISH Registration System</p>
    </td></tr>
  </table>
  </td></tr></table>
</body></html>`;
}

// ── Send emails ───────────────────────────────────────────
async function sendEmails(record) {
  if (!CONFIG.gmailUser || CONFIG.gmailUser === 'YOUR_GMAIL@gmail.com') {
    console.log('⚠️  Email not configured — skipping email send.');
    return;
  }
  try {
    const transporter = getTransporter();
    const qrDataUrl = await generateQR(CONFIG.eventWebsite);
    const invitationHtml = await buildInvitationEmail(record, qrDataUrl);
    const adminHtml = buildAdminEmail(record);

    // Send invitation to registrant
    await transporter.sendMail({
      from: `"TANFISH Forum 2026" <${CONFIG.gmailUser}>`,
      to: record.email,
      subject: `✅ Registration Confirmed — ${CONFIG.eventName} | ID: ${record.registrationId}`,
      html: invitationHtml
    });

    // Notify admin
    await transporter.sendMail({
      from: `"TANFISH Registration System" <${CONFIG.gmailUser}>`,
      to: CONFIG.adminEmail,
      subject: `🔔 New Registration: ${record.name} — ${record.registrationId}`,
      html: adminHtml
    });

    console.log(`✉️  Emails sent for ${record.name} (${record.email})`);
  } catch (err) {
    console.error('❌ Email error:', err.message);
  }
}

// ── Auth middleware ───────────────────────────────────────
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.t;
  if (token !== CONFIG.adminPassword) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ── Public API ────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({
    eventName: CONFIG.eventName,
    eventDate: CONFIG.eventDate,
    eventDateDisplay: CONFIG.eventDateDisplay,
    eventLocation: CONFIG.eventLocation,
    eventWebsite: CONFIG.eventWebsite,
    registrationDeadline: CONFIG.registrationDeadline,
  });
});

app.get('/api/count', async (req, res) => {
  const count = await db.count({});
  res.json({ count });
});

app.post('/api/register', async (req, res) => {
  try {
    const now = new Date();
    const deadline = new Date(CONFIG.registrationDeadline);
    deadline.setHours(23, 59, 59);
    if (now > deadline) return res.status(403).json({ error: 'Registration is now closed. The deadline has passed.' });

    const { name, email, phone, organization, jobTitle, department, country, participantType, participantTypeOther, paymentPackage, paymentReference, comments } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ error: 'Name, email, and phone are required.' });

    const existing = await db.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'This email address is already registered.' });

    const count = await db.count({});
    const record = {
      registrationId: 'TF2026-' + String(count + 1).padStart(4, '0'),
      name: name.trim(), email: email.toLowerCase().trim(), phone: phone.trim(),
      organization: organization?.trim() || '', jobTitle: jobTitle?.trim() || '',
      department: department?.trim() || '', country: country?.trim() || '',
      participantType: participantType?.trim() || '', participantTypeOther: participantTypeOther?.trim() || '',
      paymentPackage: paymentPackage?.trim() || '', paymentReference: paymentReference?.trim() || '',
      comments: comments?.trim() || '', status: 'Confirmed',
      registeredAt: new Date().toLocaleString('en-TZ', { timeZone: 'Africa/Dar_es_Salaam' }),
      createdAt: new Date()
    };

    const doc = await db.insert(record);

    // Send emails in background (don't block response)
    sendEmails(record).catch(console.error);

    res.status(201).json({ success: true, id: doc.registrationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── Admin API ─────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === CONFIG.adminPassword) res.json({ success: true, token: CONFIG.adminPassword });
  else res.status(401).json({ error: 'Incorrect password.' });
});

app.get('/api/admin/registrations', adminAuth, async (req, res) => {
  const { search, country, status } = req.query;
  let records = await db.find({}).sort({ createdAt: 1 });
  if (search) { const q = search.toLowerCase(); records = records.filter(r => [r.name,r.email,r.phone,r.organization,r.registrationId].some(v=>(v||'').toLowerCase().includes(q))); }
  if (country) records = records.filter(r => r.country === country);
  if (status) records = records.filter(r => r.status === status);
  res.json({ success: true, total: records.length, data: records });
});

app.patch('/api/admin/registrations/:id', adminAuth, async (req, res) => {
  try { await db.update({ _id: req.params.id }, { $set: { status: req.body.status } }, {}); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: 'Failed to update.' }); }
});

app.delete('/api/admin/registrations/:id', adminAuth, async (req, res) => {
  try { await db.remove({ _id: req.params.id }, {}); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: 'Failed to delete.' }); }
});

app.get('/api/admin/export', adminAuth, async (req, res) => {
  try {
    const records = await db.find({}).sort({ createdAt: 1 });
    const rows = records.map((r,i) => ({
      '#': i+1, 'Registration ID': r.registrationId, 'Status': r.status,
      'Full Name': r.name, 'Email': r.email, 'Phone': r.phone,
      'Organization': r.organization||'—', 'Job Title': r.jobTitle||'—',
      'Department': r.department||'—', 'Country': r.country||'—',
      'Registration Type': r.participantType||'—', 'Role Details': r.participantTypeOther||'—',
      'Payment Package': r.paymentPackage||'—', 'Payment Reference': r.paymentReference||'—',
      'Comments': r.comments||'—', 'Registered At': r.registeredAt
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [4,14,12,22,26,16,22,18,20,14,20,16,30,22].map(w=>({wch:w}));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
    const buffer = XLSX.write(wb, { type:'buffer', bookType:'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="tanfish_registrations_${new Date().toISOString().slice(0,10)}.xlsx"`);
    res.send(buffer);
  } catch(e) { res.status(500).json({ error: 'Export failed.' }); }
});

app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const records = await db.find({}).sort({ createdAt: 1 });
    const byCountry={}, byDay={}, byStatus={Confirmed:0,Pending:0,Cancelled:0};
    records.forEach(r => {
      const c = r.country||'Unknown'; byCountry[c]=(byCountry[c]||0)+1;
      const day = r.createdAt ? new Date(r.createdAt).toISOString().slice(0,10) : 'Unknown'; byDay[day]=(byDay[day]||0)+1;
      if(r.status) byStatus[r.status]=(byStatus[r.status]||0)+1;
    });
    res.json({ total: records.length, byCountry, byDay, byStatus });
  } catch(e) { res.status(500).json({ error: 'Stats failed.' }); }
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ TANFISH Registration System v3.0`);
  console.log(`   Public form  → http://localhost:${PORT}/`);
  console.log(`   Admin panel  → http://localhost:${PORT}/admin.html`);
  console.log(`   Admin pass   → ${CONFIG.adminPassword}`);
  const emailReady = CONFIG.gmailUser !== 'YOUR_GMAIL@gmail.com';
  console.log(`   Email        → ${emailReady ? '✅ Configured' : '⚠️  Not configured yet (open server.js to add Gmail)'}\n`);
});
