// server/routes/gates.js
const express = require('express');
const getDB   = require('../../database/db');
const auth    = require('../middleware/auth');
const router  = express.Router();
const { v4: uuid } = require('uuid');

router.get('/', auth(), (req, res) => {
  const db = getDB();
  res.json(db.prepare('SELECT * FROM gates ORDER BY rowid').all());
});

router.put('/:id', auth('editor'), (req, res) => {
  const db = getDB();
  const { status, approved_by, approved_date, notes } = req.body;
  db.prepare(`UPDATE gates SET status=COALESCE(?,status), approved_by=COALESCE(?,approved_by),
    approved_date=COALESCE(?,approved_date), notes=COALESCE(?,notes), updated_at=datetime('now') WHERE id=?`)
    .run(status||null, approved_by||null, approved_date||null, notes||null, req.params.id);

  if (status === 'اجتاز') {
    db.prepare(`INSERT INTO activity (id,text,type,user_id,created_at) VALUES (?,?,?,?,?)`)
      .run(uuid(), `اعتمد <strong>${req.user.name}</strong> ${db.prepare('SELECT name FROM gates WHERE id=?').get(req.params.id)?.name}`, 'success', req.user.id, new Date().toISOString().split('T')[0]);
  }

  res.json(db.prepare('SELECT * FROM gates WHERE id = ?').get(req.params.id));
});

module.exports = router;
