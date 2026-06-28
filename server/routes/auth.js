// server/routes/auth.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const getDB   = require('../../database/db');
const auth    = require('../middleware/auth');
const router  = express.Router();

function uid() { return require('uuid').v4(); }

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });

  const db   = getDB();
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
  if (!user) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

  // Update last login
  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Get linked member
  const member = db.prepare('SELECT * FROM members WHERE user_id = ?').get(user.id);

  res.json({
    token,
    user: {
      id:       user.id,
      username: user.username,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      memberId: member?.id || null,
    }
  });
});

// GET /api/auth/me
router.get('/me', auth(), (req, res) => {
  const db     = getDB();
  const member = db.prepare('SELECT * FROM members WHERE user_id = ?').get(req.user.id);
  res.json({
    id:       req.user.id,
    username: req.user.username,
    name:     req.user.name,
    email:    req.user.email,
    role:     req.user.role,
    memberId: member?.id || null,
  });
});

// PUT /api/auth/password
router.put('/password', auth(), (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' });

  const db   = getDB();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.password))
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?")
    .run(hashed, req.user.id);

  res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
});

module.exports = router;
