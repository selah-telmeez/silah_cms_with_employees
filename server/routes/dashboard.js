// server/routes/dashboard.js
const express = require('express');
const getDB   = require('../../database/db');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.get('/summary', auth(), (req, res) => {
  const db = getDB();

  const phases   = db.prepare(`SELECT p.*, pp.progress FROM phases p LEFT JOIN phase_progress pp ON pp.phase_id=p.id ORDER BY p.sort_order`).all();
  const tasks    = db.prepare('SELECT * FROM tasks').all();
  const members  = db.prepare('SELECT * FROM members').all();
  const gates    = db.prepare('SELECT * FROM gates').all();
  const activity = db.prepare('SELECT * FROM activity ORDER BY created_at DESC LIMIT 10').all();

  const totalProg = phases.length
    ? Math.round(phases.reduce((a, p) => a + (p.progress || 0), 0) / phases.length)
    : 0;

  const doneTasks    = tasks.filter(t => t.status === 'مكتمل').length;
  const activeTasks  = tasks.filter(t => t.status === 'جارٍ').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'مكتمل') return false;
    return new Date(t.due_date) < new Date();
  }).length;

  res.json({
    totalProgress: totalProg,
    tasks:  { total: tasks.length, done: doneTasks, active: activeTasks, overdue: overdueTasks },
    members: { total: members.length },
    phases,
    gates,
    activity,
    upcomingDeadlines: tasks
      .filter(t => t.status !== 'مكتمل' && t.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5),
  });
});

module.exports = router;
