// database/migrate_grade_year.js
// Adds a `grade_year` column to tasks (which educational grade the task's content targets).
// Safe to run multiple times — checks if the column already exists first.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'silah_cms.db');
const db = new Database(DB_PATH);

const cols = db.prepare(`PRAGMA table_info(tasks)`).all().map(c => c.name);

if (!cols.includes('grade_year')) {
  db.exec(`ALTER TABLE tasks ADD COLUMN grade_year TEXT;`);
  console.log('✅ Added grade_year column to tasks');
} else {
  console.log('⏭  grade_year column already exists');
}

db.close();
