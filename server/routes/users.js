// server/routes/users.js — Admin-only user management
const express  = require('express');
const bcrypt   = require('bcryptjs');
const getDB    = require('../../database/db');
const auth     = require('../middleware/auth');
const router   = express.Router();
const { v4: uuid } = require('uuid');

// GET /api/users — list all users (admin only)
router.get('/', auth('admin'), (req, res) => {
  const db = getDB();
  const users = db.prepare(`
    SELECT id, username, name, email, role, is_active, last_login, created_at
    FROM users ORDER BY created_at DESC
  `).all();
  res.json(users);
});

// GET /api/users/:id
router.get('/:id', auth('admin'), (req, res) => {
  const db = getDB();
  const user = db.prepare(`
    SELECT id, username, name, email, role, is_active, last_login, created_at
    FROM users WHERE id = ?
  `).get(req.params.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
  res.json(user);
});

// POST /api/users — create new user (admin only)
router.post('/', auth('admin'), (req, res) => {
  const db = getDB();
  const { username, password, name, email, role } = req.body;

  if (!username || !password || !name)
    return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور والاسم مطلوبة' });

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(409).json({ error: 'اسم المستخدم مستخدم بالفعل' });

  const VALID_ROLES = ['viewer', 'author', 'reviewer', 'designer', 'coordinator', 'editor', 'admin'];
  const finalRole = VALID_ROLES.includes(role) ? role : 'viewer';

  const id = uuid();
  const hash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, username, password, name, email, role)
    VALUES (?,?,?,?,?,?)
  `).run(id, username, hash, name, email || null, finalRole);

  db.prepare(`INSERT INTO activity (id, text, type, user_id, created_at) VALUES (?,?,?,?,?)`)
    .run(uuid(), `أنشأ <strong>${req.user.name}</strong> مستخدمًا جديدًا: "${name}"`, 'success', req.user.id,
         new Date().toISOString().split('T')[0]);

  const user = db.prepare('SELECT id, username, name, email, role, is_active, created_at FROM users WHERE id = ?').get(id);
  res.status(201).json(user);
});

// PUT /api/users/:id — update user (admin only)
router.put('/:id', auth('admin'), (req, res) => {
  const db = getDB();
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const { name, email, role, is_active, password } = req.body;

  db.prepare(`
    UPDATE users SET
      name       = COALESCE(?, name),
      email      = COALESCE(?, email),
      role       = COALESCE(?, role),
      is_active  = COALESCE(?, is_active),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(name || null, email || null, role || null,
         is_active !== undefined ? (is_active ? 1 : 0) : null, req.params.id);

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(`UPDATE users SET password = ? WHERE id = ?`).run(hash, req.params.id);
  }

  const updated = db.prepare('SELECT id, username, name, email, role, is_active, created_at FROM users WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/users/:id — deactivate (soft delete) user (admin only)
router.delete('/:id', auth('admin'), (req, res) => {
  const db = getDB();
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'المستخدم غير موجود' });

  if (target.id === req.user.id)
    return res.status(400).json({ error: 'لا يمكنك حذف حسابك الخاص' });

  // Soft delete — deactivate instead of hard delete, to preserve FK references in activity/tasks
  db.prepare(`UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?`).run(req.params.id);
  res.json({ message: 'تم إلغاء تفعيل المستخدم' });
});

module.exports = router;
