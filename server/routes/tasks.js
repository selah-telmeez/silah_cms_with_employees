// server/routes/tasks.js
const express = require('express');
const getDB   = require('../../database/db');
const auth    = require('../middleware/auth');
const router  = express.Router();
const { v4: uuid } = require('uuid');

function today() { return new Date().toISOString().split('T')[0]; }

// GET /api/tasks — list with filters
router.get('/', auth(), (req, res) => {
  const db = getDB();
  const { phase, status, assignee, priority, search, grade_year, dept } = req.query;

  let sql    = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (phase)      { sql += ' AND phase_id = ?';    params.push(phase); }
  if (status)     { sql += ' AND status = ?';      params.push(status); }
  if (assignee)   { sql += ' AND assignee_id = ?'; params.push(assignee); }
  if (priority)   { sql += ' AND priority = ?';    params.push(priority); }
  if (search)     { sql += ' AND title LIKE ?';    params.push(`%${search}%`); }
  if (grade_year) { sql += ' AND grade_year = ?';  params.push(grade_year); }
  if (dept)       { sql += ' AND assignee_id IN (SELECT id FROM members WHERE dept_en = ?)'; params.push(dept); }

  sql += ' ORDER BY created_at DESC';
  const tasks = db.prepare(sql).all(...params);
  res.json(tasks);
});

// GET /api/tasks/:id
router.get('/:id', auth(), (req, res) => {
  const db   = getDB();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });
  res.json(task);
});

// POST /api/tasks
router.post('/', auth('editor'), (req, res) => {
  const db = getDB();
  const { title, description, phase_id, assignee_id, status, progress, priority, due_date, notes, grade_year } = req.body;

  if (!title || !phase_id)
    return res.status(400).json({ error: 'العنوان والمرحلة مطلوبان' });

  const id = uuid();
  db.prepare(`
    INSERT INTO tasks (id,title,description,phase_id,assignee_id,status,progress,priority,due_date,notes,grade_year,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(id, title, description||'', phase_id, assignee_id||null,
         status||'لم يبدأ', progress||0, priority||'متوسطة',
         due_date||null, notes||'', grade_year||null, req.user.id);

  // Log activity
  db.prepare(`INSERT INTO activity (id,text,type,user_id,task_id,created_at) VALUES (?,?,?,?,?,?)`)
    .run(uuid(), `أضاف <strong>${req.user.name}</strong> مهمة جديدة: "${title}"`, 'info', req.user.id, id, today());

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.status(201).json(task);
});

// PUT /api/tasks/:id
router.put('/:id', auth(), (req, res) => {
  const db   = getDB();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });

  const { title, description, phase_id, assignee_id, status, progress, priority, due_date, notes, grade_year } = req.body;

  db.prepare(`
    UPDATE tasks SET
      title       = COALESCE(?, title),
      description = COALESCE(?, description),
      phase_id    = COALESCE(?, phase_id),
      assignee_id = COALESCE(?, assignee_id),
      status      = COALESCE(?, status),
      progress    = COALESCE(?, progress),
      priority    = COALESCE(?, priority),
      due_date    = COALESCE(?, due_date),
      notes       = COALESCE(?, notes),
      grade_year  = COALESCE(?, grade_year),
      updated_at  = datetime('now')
    WHERE id = ?
  `).run(title||null, description||null, phase_id||null, assignee_id||null,
         status||null, progress!==undefined?progress:null, priority||null,
         due_date||null, notes||null, grade_year||null, req.params.id);

  // If progress updated, log it
  if (progress !== undefined && progress !== task.progress) {
    db.prepare(`INSERT INTO activity (id,text,type,user_id,task_id,created_at) VALUES (?,?,?,?,?,?)`)
      .run(uuid(), `حدّث <strong>${req.user.name}</strong> تقدم "${task.title}" إلى ${progress}%`, 'info', req.user.id, task.id, today());

    // Auto-update phase progress
    const phaseTasks = db.prepare('SELECT progress FROM tasks WHERE phase_id = ?').all(task.phase_id);
    const avg = Math.round(phaseTasks.reduce((a, t) => a + t.progress, 0) / phaseTasks.length);
    db.prepare(`UPDATE phase_progress SET progress = ?, updated_at = datetime('now'), updated_by = ? WHERE phase_id = ?`)
      .run(avg, req.user.id, task.phase_id);
  }

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/tasks/:id
router.delete('/:id', auth('editor'), (req, res) => {
  const db   = getDB();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'المهمة غير موجودة' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'تم حذف المهمة' });
});

module.exports = router;
