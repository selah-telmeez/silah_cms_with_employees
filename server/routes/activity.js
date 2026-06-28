// server/routes/activity.js
const express = require('express');
const getDB   = require('../../database/db');
const auth    = require('../middleware/auth');
const router  = express.Router();
const { v4: uuid } = require('uuid');

router.get('/', auth(), (req, res) => {
  const db   = getDB();
  const limit = parseInt(req.query.limit) || 20;
  const rows  = db.prepare('SELECT * FROM activity ORDER BY created_at DESC LIMIT ?').all(limit);
  res.json(rows);
});

router.post('/', auth(), (req, res) => {
  const db = getDB();
  const { text, type, task_id } = req.body;
  if (!text) return res.status(400).json({ error: 'النص مطلوب' });

  const id = uuid();
  db.prepare(`INSERT INTO activity (id,text,type,user_id,task_id,created_at) VALUES (?,?,?,?,?,?)`)
    .run(id, text, type||'info', req.user.id, task_id||null, new Date().toISOString().split('T')[0]);

  res.status(201).json(db.prepare('SELECT * FROM activity WHERE id = ?').get(id));
});

module.exports = router;
