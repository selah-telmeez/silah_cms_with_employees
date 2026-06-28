// server/routes/phases.js
const express = require('express');
const getDB   = require('../../database/db');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.get('/', auth(), (req, res) => {
  const db   = getDB();
  const rows = db.prepare(`
    SELECT p.*, pp.progress, pp.updated_at as progress_updated
    FROM phases p
    LEFT JOIN phase_progress pp ON pp.phase_id = p.id
    ORDER BY p.sort_order
  `).all();
  res.json(rows);
});

router.put('/:id/progress', auth(), (req, res) => {
  const db = getDB();
  const { progress } = req.body;
  if (progress === undefined) return res.status(400).json({ error: 'التقدم مطلوب' });
  db.prepare(`UPDATE phase_progress SET progress=?, updated_by=?, updated_at=datetime('now') WHERE phase_id=?`)
    .run(progress, req.user.id, req.params.id);
  res.json({ phase_id: req.params.id, progress });
});

module.exports = router;
