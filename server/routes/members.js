// server/routes/members.js — updated to support full employee data
const express = require('express');
const getDB   = require('../../database/db');
const auth    = require('../middleware/auth');
const router  = express.Router();
const { v4: uuid } = require('uuid');

// GET /api/members — full list with optional filters
router.get('/', auth(), (req, res) => {
  const db = getDB();
  const { dept, section, job, search } = req.query;
  let sql = 'SELECT * FROM members WHERE 1=1';
  const params = [];
  if (dept)    { sql += ' AND dept_en = ?';    params.push(dept); }
  if (section) { sql += ' AND section_en = ?'; params.push(section); }
  if (job)     { sql += ' AND job_en LIKE ?';  params.push('%'+job+'%'); }
  if (search)  { sql += ' AND (name LIKE ? OR name_ar LIKE ? OR jc LIKE ?)';
                 params.push('%'+search+'%','%'+search+'%','%'+search+'%'); }
  sql += ' ORDER BY dept_en, section_en, name';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/members/stats — department/section summary
router.get('/stats', auth(), (req, res) => {
  const db = getDB();
  const byDept    = db.prepare(`SELECT dept_en, dept_ar, COUNT(*) as count FROM members GROUP BY dept_en ORDER BY count DESC`).all();
  const bySection = db.prepare(`SELECT section_en, section_ar, dept_en, COUNT(*) as count FROM members GROUP BY section_en ORDER BY count DESC`).all();
  const byJob     = db.prepare(`SELECT job_en, job_ar, COUNT(*) as count FROM members GROUP BY job_en ORDER BY count DESC`).all();
  res.json({ byDept, bySection, byJob, total: db.prepare('SELECT COUNT(*) as n FROM members').get().n });
});

// GET /api/members/:id
router.get('/:id', auth(), (req, res) => {
  const db = getDB();
  const m = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'العضو غير موجود' });
  res.json(m);
});

// POST /api/members
router.post('/', auth('admin'), (req, res) => {
  const db = getDB();
  const { name, name_ar, role_id, email, phone, join_date,
          emp_id, jc, company, dept_en, dept_ar,
          section_en, section_ar, unit_en, unit_ar,
          job_en, job_ar, unit_code, notes } = req.body;
  if (!name || !role_id) return res.status(400).json({ error: 'الاسم والدور مطلوبان' });
  const id = uuid();
  db.prepare(`INSERT INTO members
    (id,name,name_ar,role_id,email,phone,join_date,emp_id,jc,company,
     dept_en,dept_ar,section_en,section_ar,unit_en,unit_ar,job_en,job_ar,unit_code,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id,name,name_ar||null,role_id,email||null,phone||null,join_date||null,
         emp_id||null,jc||null,company||null,
         dept_en||null,dept_ar||null,section_en||null,section_ar||null,
         unit_en||null,unit_ar||null,job_en||null,job_ar||null,
         unit_code||null,notes||null);
  res.status(201).json(db.prepare('SELECT * FROM members WHERE id = ?').get(id));
});

// PUT /api/members/:id
router.put('/:id', auth('admin'), (req, res) => {
  const db = getDB();
  const { name, name_ar, role_id, email, phone, job_en, job_ar, notes } = req.body;
  db.prepare(`UPDATE members SET
    name=COALESCE(?,name), name_ar=COALESCE(?,name_ar), role_id=COALESCE(?,role_id),
    email=COALESCE(?,email), phone=COALESCE(?,phone),
    job_en=COALESCE(?,job_en), job_ar=COALESCE(?,job_ar),
    notes=COALESCE(?,notes), updated_at=datetime('now')
    WHERE id=?`)
    .run(name||null,name_ar||null,role_id||null,email||null,phone||null,
         job_en||null,job_ar||null,notes||null,req.params.id);
  res.json(db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id));
});

// DELETE /api/members/:id
router.delete('/:id', auth('admin'), (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
  res.json({ message: 'تم حذف العضو' });
});

module.exports = router;
