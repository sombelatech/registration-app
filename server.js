const express = require('express');
const cors = require('cors');
const path = require('path');
const XLSX = require('xlsx');
const Datastore = require('nedb-promises');

const app = express();
const PORT = 3000;

// ── Database ──────────────────────────────────────────────
const db = Datastore.create({
  filename: path.join(__dirname, 'data', 'registrations.db'),
  autoload: true
});

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Simple admin auth middleware ──────────────────────────
const ADMIN_PASSWORD = 'admin1234'; // ← Change this password

function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.t;
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ── Routes ────────────────────────────────────────────────

// Public: Submit registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, organization, jobTitle, department, country, diet, source, comments } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required.' });
    }

    // Check for duplicate email
    const existing = await db.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'This email address is already registered.' });
    }

    const record = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      organization: organization?.trim() || '',
      jobTitle: jobTitle?.trim() || '',
      department: department?.trim() || '',
      country: country?.trim() || '',
      diet: diet?.trim() || 'None',
      source: source?.trim() || '',
      comments: comments?.trim() || '',
      registeredAt: new Date().toLocaleString('en-TZ', { timeZone: 'Africa/Dar_es_Salaam' }),
      createdAt: new Date()
    };

    const doc = await db.insert(record);
    res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Admin: Get all registrations
app.get('/api/admin/registrations', adminAuth, async (req, res) => {
  try {
    const records = await db.find({}).sort({ createdAt: 1 });
    res.json({ success: true, total: records.length, data: records });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
});

// Admin: Export to Excel
app.get('/api/admin/export', adminAuth, async (req, res) => {
  try {
    const records = await db.find({}).sort({ createdAt: 1 });

    const rows = records.map((r, i) => ({
      '#': i + 1,
      'Full Name': r.name,
      'Email': r.email,
      'Phone': r.phone,
      'Organization': r.organization || '—',
      'Job Title': r.jobTitle || '—',
      'Department': r.department || '—',
      'Country': r.country || '—',
      'Dietary Requirements': r.diet || 'None',
      'Heard From': r.source || '—',
      'Comments': r.comments || '—',
      'Registered At': r.registeredAt
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [4,20,24,16,22,18,20,14,20,18,30,22].map(w => ({ wch: w }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const date = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="registrations_${date}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export.' });
  }
});

// Admin: Delete a single registration
app.delete('/api/admin/registrations/:id', adminAuth, async (req, res) => {
  try {
    await db.remove({ _id: req.params.id }, {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete record.' });
  }
});

// Admin: Login check
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Incorrect password.' });
  }
});

// ── Start ─────────────────────────────────────────────────
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

app.listen(PORT, () => {
  console.log(`\n✅ Registration app running!`);
  console.log(`   Public form  → http://localhost:${PORT}/`);
  console.log(`   Admin panel  → http://localhost:${PORT}/admin.html`);
  console.log(`   Admin pass   → ${ADMIN_PASSWORD}\n`);
});
