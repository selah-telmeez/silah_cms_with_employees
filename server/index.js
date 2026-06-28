// server/index.js — Main Express server
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compress   = require('compression');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const fs         = require('fs');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & middleware ────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compress());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', /localhost/],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/auth/login', rateLimit({ windowMs: 15*60*1000, max: 20, message: { error: 'محاولات كثيرة — حاول بعد قليل' } }));
app.use('/api/', rateLimit({ windowMs: 60*1000, max: 200 }));

// Static uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/tasks',     require('./routes/tasks'));
app.use('/api/members',   require('./routes/members'));
app.use('/api/phases',    require('./routes/phases'));
app.use('/api/gates',     require('./routes/gates'));
app.use('/api/activity',  require('./routes/activity'));
app.use('/api/dashboard', require('./routes/dashboard'));

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── Serve React build in production ─────────────────────
const BUILD_PATH = path.join(__dirname, '../client/build');
if (process.env.NODE_ENV === 'production' && fs.existsSync(BUILD_PATH)) {
  app.use(express.static(BUILD_PATH));
  app.get('*', (req, res) => res.sendFile(path.join(BUILD_PATH, 'index.html')));
}

// ── Error handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'خطأ في الخادم' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API ready at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
