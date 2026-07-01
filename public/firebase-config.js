// ═══════════════════════════════════════════════════════════
//  TANFISH Forum 2026 — Front-end configuration
//  Fill in the placeholders below, then deploy. No backend needed.
// ═══════════════════════════════════════════════════════════

// ── 1. Firebase web config ────────────────────────────────
//  Firebase Console → Project settings → "Your apps" → Web app → SDK setup.
//  Copy the values from the `firebaseConfig` object it shows you.
window.FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBUtE0VrLLVedvr-Vjj9ShbQX_vZBjr6gc",
  authDomain:        "tanfish-forum2026-reg.firebaseapp.com",
  projectId:         "tanfish-forum2026-reg",
  storageBucket:     "tanfish-forum2026-reg.firebasestorage.app",
  messagingSenderId: "466040426848",
  appId:             "1:466040426848:web:833effdc889cbb86ac4e05"
};

// ── 2. Event details (shown on the form) ──────────────────
window.EVENT_CONFIG = {
  eventName:            'Tanzania Digital Fisheries Trade & Market Linkages Forum 2026',
  eventDate:            '2026-07-22',
  eventDateDisplay:     '22 -23 July 2026',
  eventLocation:        'University of Dar es Salaam',
  eventWebsite:         'https://tanfishmarket.com/',
  registrationDeadline: '2026-07-21'
};

// ── 3. EmailJS (sends confirmation + admin-alert emails) ──
//  Sign up free at https://www.emailjs.com → add a Gmail service,
//  create two templates, then paste the IDs here.
//  Leave the "YOUR_..." placeholders to disable email sending.
window.EMAILJS_CONFIG = {
  publicKey:       'YOUR_EMAILJS_PUBLIC_KEY',
  serviceId:       'YOUR_EMAILJS_SERVICE_ID',
  templateId:      'YOUR_EMAILJS_TEMPLATE_ID',        // confirmation email → registrant
  adminTemplateId: 'YOUR_EMAILJS_ADMIN_TEMPLATE_ID',  // alert email → you (optional)
  adminEmail:      'youremail@gmail.com'               // where admin alerts are sent
};
