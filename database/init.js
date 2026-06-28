// database/init.js
// Auto-generated — 151 employees from SET_Employees_Data.xlsx
const Database = require('better-sqlite3');
const path     = require('path');
const bcrypt   = require('bcryptjs');
const fs       = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'silah_cms.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
function today() { return new Date().toISOString().split('T')[0]; }
function addDays(n) { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split('T')[0]; }

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    name TEXT NOT NULL, email TEXT, role TEXT NOT NULL DEFAULT 'viewer',
    is_active INTEGER DEFAULT 1, last_login TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, name_ar TEXT, role_id TEXT NOT NULL,
    email TEXT, phone TEXT, join_date TEXT, user_id TEXT REFERENCES users(id),
    emp_id TEXT, jc TEXT, company TEXT,
    dept_en TEXT, dept_ar TEXT, section_en TEXT, section_ar TEXT,
    unit_en TEXT, unit_ar TEXT, job_en TEXT, job_ar TEXT,
    unit_code TEXT, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS phases (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, name_en TEXT, weeks TEXT,
    total_weeks INTEGER, color TEXT, icon TEXT, sort_order INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS phase_progress (
    phase_id TEXT PRIMARY KEY REFERENCES phases(id),
    progress INTEGER DEFAULT 0, updated_by TEXT, updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
    phase_id TEXT NOT NULL REFERENCES phases(id), assignee_id TEXT REFERENCES members(id),
    status TEXT DEFAULT 'لم يبدأ', progress INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'متوسطة', due_date TEXT, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS gates (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, phase_id TEXT NOT NULL REFERENCES phases(id),
    status TEXT DEFAULT 'لم يفتح', approved_by TEXT REFERENCES members(id),
    approved_date TEXT, notes TEXT, updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY, text TEXT NOT NULL, type TEXT DEFAULT 'info',
    user_id TEXT REFERENCES users(id), member_id TEXT REFERENCES members(id),
    task_id TEXT REFERENCES tasks(id), created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY, value TEXT, updated_at TEXT DEFAULT (datetime('now'))
  );
`);
console.log('✅ Schema created');

const existing = db.prepare('SELECT COUNT(*) as n FROM users').get();
if (existing.n > 0) { console.log('⏭  Already seeded'); db.close(); process.exit(0); }

const hash = p => bcrypt.hashSync(p, 10);
const seed = db.transaction(() => {

// ── ADMIN USERS ──────────────────────────────────────────────────────────────
const insertUser = db.prepare(`INSERT OR IGNORE INTO users (id,username,password,name,email,role) VALUES (?,?,?,?,?,?)`);
insertUser.run('admin','admin',hash('admin123'),'System Administrator','admin@silah.com','admin');
insertUser.run('manager','manager',hash('manager123'),'Content Sector Director','director@silah.com','admin');

// ── EMPLOYEE USERS & MEMBERS (151) ───────────────────────────────────────────
const insertEmpUser = db.prepare(`INSERT OR IGNORE INTO users (id,username,password,name,email,role) VALUES (?,?,?,?,?,?)`);
const insertMember = db.prepare(`INSERT OR IGNORE INTO members
  (id,name,name_ar,role_id,email,join_date,emp_id,jc,company,
   dept_en,dept_ar,section_en,section_ar,unit_en,unit_ar,job_en,job_ar,unit_code,notes,user_id)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

insertEmpUser.run(
  'u_88','stp131',hash('Pass88@SET'),
  'Hossam Eldin Farghaly Mostafa Ahmed Khalil','stp131@silah.com','editor');
insertMember.run(
  'm_88','Hossam Eldin Farghaly Mostafa Ahmed Khalil','حسام الدين فرغلى مصطفى احمد خليل',
  'r_editor','stp131@silah.com','2019-03-01',
  '88','STP-131','STP',
  'Licenses & Ministerial relations','التراخيص و العلاقات الوزارية',
  'Licenses','التراخيص',
  'Licenses Overhead','التراخيص',
  'Licenses Supervisor','مشرف التراخيص',
  '152040100','','u_88');

insertEmpUser.run(
  'u_201','stp030',hash('Pass201@SET'),
  'Ahmed Shokry Mohamed Tolba Eid','stp030@silah.com','admin');
insertMember.run(
  'm_201','Ahmed Shokry Mohamed Tolba Eid','احمد شكري محمد طلبة عيد',
  'r_admin','stp030@silah.com','2019-10-14',
  '201','STP-030','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Art Direction Overhead','الإخراج الفني',
  'Art Director Head','مدير الأقسام الفنية',
  '152050000','','u_201');

insertEmpUser.run(
  'u_204','stp115',hash('Pass204@SET'),
  'Hanan Baghdadi Sayed Ahmed','stp115@silah.com','editor');
insertMember.run(
  'm_204','Hanan Baghdadi Sayed Ahmed','حنان بغدادى سيد احمد',
  'r_editor','stp115@silah.com','2019-07-14',
  '204','STP-115','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Illustration','الرسم',
  'Senior Illustrator','رسام أول',
  '152050001','','u_204');

insertEmpUser.run(
  'u_210','stp308',hash('Pass210@SET'),
  'Omar Mamdouh Mohamed Abdel Moneim Youssef','stp308@silah.com','editor');
insertMember.run(
  'm_210','Omar Mamdouh Mohamed Abdel Moneim Youssef','عمر ممدوح محمد عبد المنعم يوسف',
  'r_editor','stp308@silah.com','2019-04-01',
  '210','STP-308','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Senior Graphic Designer','مصمم أول جرافيك',
  '152050002','','u_210');

insertEmpUser.run(
  'u_212','stp041',hash('Pass212@SET'),
  'Nadia Omar Abdel Aziz Abdel Hamid','stp041@silah.com','admin');
insertMember.run(
  'm_212','Nadia Omar Abdel Aziz Abdel Hamid','نادية عمر عبد العزيز عبد الحميد',
  'r_admin','stp041@silah.com','2021-01-01',
  '212','STP-041','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'Arabic Section Head (Pri)','مدير قسم اللغة العربية (إبتدائي)',
  '152020300','','u_212');

insertEmpUser.run(
  'u_217','stp179',hash('Pass217@SET'),
  'Omnya Hany Abdel Tawab Abdel Hady','stp179@silah.com','editor');
insertMember.run(
  'm_217','Omnya Hany Abdel Tawab Abdel Hady','امنية هاني عبد التواب عبد الهادي',
  'r_editor','stp179@silah.com','2020-01-01',
  '217','STP-179','STP',
  'Academic Books','المحتوى الأكاديمى',
  'English','اللغة الإنجليزية',
  'English Overhead','اللغة الإنجليزية',
  'Team Leader','قائد فريق',
  '152020700','','u_217');

insertEmpUser.run(
  'u_220','stp201',hash('Pass220@SET'),
  'Heba Abdel Rahman Ali Abdel Moaty','stp201@silah.com','editor');
insertMember.run(
  'm_220','Heba Abdel Rahman Ali Abdel Moaty','هبه عبد الرحمن على عبد المعطى',
  'r_editor','stp201@silah.com','2019-04-01',
  '220','STP-201','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Science','العلوم',
  'Science Overhead','العلوم',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020500','','u_220');

insertEmpUser.run(
  'u_266','stp167',hash('Pass266@SET'),
  'El Sayed Ibrahim El Sayed Abdel Maged Latifa','stp167@silah.com','editor');
insertMember.run(
  'm_266','El Sayed Ibrahim El Sayed Abdel Maged Latifa','السيد ابراهيم السيد عبد المجيد لطيفه',
  'r_editor','stp167@silah.com','2019-04-01',
  '266','STP-167','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Math Layouter Team Leader','قائد فريق تنسيق الصفحات رياضيات',
  '152050003','','u_266');

insertEmpUser.run(
  'u_267','stp405',hash('Pass267@SET'),
  'Mohammed Ibrahim Ahmed Al Husseini','stp405@silah.com','designer');
insertMember.run(
  'm_267','Mohammed Ibrahim Ahmed Al Husseini','محمد ابراهيم احمد الحسينى',
  'r_designer','stp405@silah.com','2019-04-01',
  '267','STP-405','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Math Layouter','منسق صفحات رياضيات',
  '152050003','','u_267');

insertEmpUser.run(
  'u_268','stp260',hash('Pass268@SET'),
  'Ahmed Rajab Ali Osman','stp260@silah.com','editor');
insertMember.run(
  'm_268','Ahmed Rajab Ali Osman','احمد رجب على عثمان',
  'r_editor','stp260@silah.com','2019-04-01',
  '268','STP-260','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Senior Arabic Layouter','منسق أول صفحات لغة عربية',
  '152050003','','u_268');

insertEmpUser.run(
  'u_269','stp431',hash('Pass269@SET'),
  'Mohamed Hamdy Farid Mohamed Ali','stp431@silah.com','designer');
insertMember.run(
  'm_269','Mohamed Hamdy Farid Mohamed Ali','محمد حمدى فريد محمد على',
  'r_designer','stp431@silah.com','2019-04-01',
  '269','STP-431','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Math Layouter','منسق صفحات رياضيات',
  '152050003','','u_269');

insertEmpUser.run(
  'u_273','stp243',hash('Pass273@SET'),
  'Ahmed Sayed Abdel Hakim Mahmoud','stp243@silah.com','designer');
insertMember.run(
  'm_273','Ahmed Sayed Abdel Hakim Mahmoud','احمد سيد عبد الحكيم محمود',
  'r_designer','stp243@silah.com','2019-04-01',
  '273','STP-243','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Math Layouter','منسق صفحات رياضيات',
  '152050003','Handicap','u_273');

insertEmpUser.run(
  'u_297','stp135',hash('Pass297@SET'),
  'Salah Ibrahim Hassan Hussein','stp135@silah.com','editor');
insertMember.run(
  'm_297','Salah Ibrahim Hassan Hussein','صلاح ابراهيـم حسن حسين',
  'r_editor','stp135@silah.com','2019-04-01',
  '297','STP-135','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Social Studies Layouter Team Leader','قائد فريق تنسيق الصفحات دراسات اجتماعية',
  '152050003','','u_297');

insertEmpUser.run(
  'u_298','stp293',hash('Pass298@SET'),
  'Ahmed Mahmoud Ahmed Ibrahim El Desouky','stp293@silah.com','designer');
insertMember.run(
  'm_298','Ahmed Mahmoud Ahmed Ibrahim El Desouky','احمد محمود احمد ابراهيم الدسوقى',
  'r_designer','stp293@silah.com','2019-04-01',
  '298','STP-293','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Graphic Designer','مصمم جرافيك',
  '152050002','','u_298');

insertEmpUser.run(
  'u_299','stp338',hash('Pass299@SET'),
  'Waleed Abdulstar Khalifa Mohammed','stp338@silah.com','designer');
insertMember.run(
  'm_299','Waleed Abdulstar Khalifa Mohammed','وليد عبد الستار خليفة محمد',
  'r_designer','stp338@silah.com','2019-04-01',
  '299','STP-338','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Social Studies Layouter','منسق صفحات دراسات اجتماعية',
  '152050003','','u_299');

insertEmpUser.run(
  'u_301','stp181',hash('Pass301@SET'),
  'Islam Khalil Ibrahim Mohamed','stp181@silah.com','editor');
insertMember.run(
  'm_301','Islam Khalil Ibrahim Mohamed','اسلام خليل ابراهيم محمد',
  'r_editor','stp181@silah.com','2019-04-01',
  '301','STP-181','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Senior Graphic Designer','مصمم أول جرافيك',
  '152050002','','u_301');

insertEmpUser.run(
  'u_302','stp223',hash('Pass302@SET'),
  'Taher Mohammed Taher Faraj','stp223@silah.com','editor');
insertMember.run(
  'm_302','Taher Mohammed Taher Faraj','طاهر محمد طاهر فرج',
  'r_editor','stp223@silah.com','2019-04-01',
  '302','STP-223','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading','التدقيق اللغوي',
  'Senior Arabic Proofreader','مدقق أول لغوي لغة عربية',
  '152050004','','u_302');

insertEmpUser.run(
  'u_303','stp238',hash('Pass303@SET'),
  'Ahmed Hassan Ahmed Khalil','stp238@silah.com','editor');
insertMember.run(
  'm_303','Ahmed Hassan Ahmed Khalil','احمد حسن احمد خليل',
  'r_editor','stp238@silah.com','2019-04-01',
  '303','STP-238','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading','التدقيق اللغوي',
  'Senior Arabic Proofreader','مدقق أول لغوي لغة عربية',
  '152050004','','u_303');

insertEmpUser.run(
  'u_304','stp262',hash('Pass304@SET'),
  'Mahmoud Darwish Abdel Rahim Mohanna','stp262@silah.com','editor');
insertMember.run(
  'm_304','Mahmoud Darwish Abdel Rahim Mohanna','محمود درويش عبد الرحيم مهنى',
  'r_editor','stp262@silah.com','2019-04-01',
  '304','STP-262','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading','التدقيق اللغوي',
  'Senior Arabic Proofreader','مدقق أول لغوي لغة عربية',
  '152050004','','u_304');

insertEmpUser.run(
  'u_305','stp304',hash('Pass305@SET'),
  'Abdul Rahman Al Sayed Abdel Razek Mansour','stp304@silah.com','editor');
insertMember.run(
  'm_305','Abdul Rahman Al Sayed Abdel Razek Mansour','عبد الرحمن السيد عبد الرازق منصور',
  'r_editor','stp304@silah.com','2019-04-01',
  '305','STP-304','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading','التدقيق اللغوي',
  'Senior Arabic Proofreader','مدقق أول لغوي لغة عربية',
  '152050004','','u_305');

insertEmpUser.run(
  'u_307','stp282',hash('Pass307@SET'),
  'Islam Montaser Salah Eddin Ismail','stp282@silah.com','reviewer');
insertMember.run(
  'm_307','Islam Montaser Salah Eddin Ismail','اسلام منتصر صلاح الدين اسماعيل',
  'r_reviewer','stp282@silah.com','2023-09-21',
  '307','STP-282','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading','التدقيق اللغوي',
  'Arabic Proofreader','مدقق لغوي لغة عربية',
  '152050004','','u_307');

insertEmpUser.run(
  'u_313','stp367',hash('Pass313@SET'),
  'Khaled Farouk Hefny Mohamed','stp367@silah.com','designer');
insertMember.run(
  'm_313','Khaled Farouk Hefny Mohamed','خالد فاروق حنفى محمد',
  'r_designer','stp367@silah.com','2019-04-01',
  '313','STP-367','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Science Layouter','منسق صفحات علوم',
  '152050003','Handicap','u_313');

insertEmpUser.run(
  'u_315','stp104',hash('Pass315@SET'),
  'Sherif Abdel Azim Abdel Rahman Mahmoud','stp104@silah.com','editor');
insertMember.run(
  'm_315','Sherif Abdel Azim Abdel Rahman Mahmoud','شريف عبد العظيم عبد الرحمن محمود',
  'r_editor','stp104@silah.com','2019-04-01',
  '315','STP-104','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Science Layouter Team Leader','قائد فريق تنسيق الصفحات علوم',
  '152050003','','u_315');

insertEmpUser.run(
  'u_317','stp339',hash('Pass317@SET'),
  'Amr Ali Hussein Ali Ibrahim','stp339@silah.com','editor');
insertMember.run(
  'm_317','Amr Ali Hussein Ali Ibrahim','عمرو على حسين على ابراهيم',
  'r_editor','stp339@silah.com','2019-04-01',
  '317','STP-339','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Senior Science Layouter','منسق أول صفحات علوم',
  '152050003','','u_317');

insertEmpUser.run(
  'u_323','stp105',hash('Pass323@SET'),
  'Yasser Mohammed Sayed Arab','stp105@silah.com','admin');
insertMember.run(
  'm_323','Yasser Mohammed Sayed Arab','ياسر محمد السيد عرب',
  'r_admin','stp105@silah.com','2019-04-01',
  '323','STP-105','STP',
  'Content Coordination Office','مكتب تنسيق المحتوى',
  'Content Coordination Office','مكتب تنسيق المحتوى',
  'Content Office Overhead','مكتب تنسيق المحتوى',
  'Content Director Assistant','مساعد رئيس قطاع المحتوى',
  '152030000','','u_323');

insertEmpUser.run(
  'u_324','stp377',hash('Pass324@SET'),
  'Mohamed Fadl Mohamed Sayed Deshish','stp377@silah.com','editor');
insertMember.run(
  'm_324','Mohamed Fadl Mohamed Sayed Deshish','محمد فضـــل محمد سيد دشيش',
  'r_editor','stp377@silah.com','2019-04-01',
  '324','STP-377','STP',
  'Licenses & Ministerial relations','التراخيص و العلاقات الوزارية',
  'Licenses','التراخيص',
  'Licenses Overhead','التراخيص',
  'Licenses Coordinator','منسق تراخيص الكتب',
  '152040100','','u_324');

insertEmpUser.run(
  'u_325','stp454',hash('Pass325@SET'),
  'Ahmed Fadl Mohammed Al Sayed Dashish','stp454@silah.com','editor');
insertMember.run(
  'm_325','Ahmed Fadl Mohammed Al Sayed Dashish','احمد فضل محمــد السيد دشيش',
  'r_editor','stp454@silah.com','2019-04-01',
  '325','STP-454','STP',
  'Licenses & Ministerial relations','التراخيص و العلاقات الوزارية',
  'Licenses','التراخيص',
  'Licenses Overhead','التراخيص',
  'Licenses Coordinator','منسق تراخيص الكتب',
  '152040100','','u_325');

insertEmpUser.run(
  'u_862','stp036',hash('Pass862@SET'),
  'Khaled Mohamed Abdel Aziz El Desouky','stp036@silah.com','editor');
insertMember.run(
  'm_862','Khaled Mohamed Abdel Aziz El Desouky','خالد محمد عبد العزيز الدسوقى',
  'r_editor','stp036@silah.com','2023-05-15',
  '862','STP-036','STP',
  'Licenses & Ministerial relations','التراخيص و العلاقات الوزارية',
  'Ministerial relations','العلاقات الوزارية',
  'Ministerial relations Overhead','العلاقات الوزارية',
  'Ministerial Relations Advisor','مستشار العلاقات الوزارية',
  '152040200','+60 Y','u_862');

insertEmpUser.run(
  'u_880','stp048',hash('Pass880@SET'),
  'Ismail Ahmed Ismail Amin','stp048@silah.com','editor');
insertMember.run(
  'm_880','Ismail Ahmed Ismail Amin','اسماعيل احمد اسماعيل امين',
  'r_editor','stp048@silah.com','2020-01-01',
  '880','STP-048','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Illustration','الرسم',
  'Senior Illustrator','رسام أول',
  '152050001','','u_880');

insertEmpUser.run(
  'u_884','stp191',hash('Pass884@SET'),
  'Mohamed Mostafa Mohamed Slim Mostafa','stp191@silah.com','editor');
insertMember.run(
  'm_884','Mohamed Mostafa Mohamed Slim Mostafa','محمد مصطفى محمد سليم مصطفى',
  'r_editor','stp191@silah.com','2020-01-01',
  '884','STP-191','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social Studies Overhead','الدراسات الإجتماعية',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020600','','u_884');

insertEmpUser.run(
  'u_904','stp158',hash('Pass904@SET'),
  'Aya Madkour Abdel Fattah Khalil','stp158@silah.com','editor');
insertMember.run(
  'm_904','Aya Madkour Abdel Fattah Khalil','اية مدكور عبد الفتاح خليل',
  'r_editor','stp158@silah.com','2020-02-09',
  '904','STP-158','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social Studies Overhead','الدراسات الإجتماعية',
  'Team Leader','قائد فريق',
  '152020600','','u_904');

insertEmpUser.run(
  'u_937','stp060',hash('Pass937@SET'),
  'Walaa Karam Esmaiel Esmaiel','stp060@silah.com','editor');
insertMember.run(
  'm_937','Walaa Karam Esmaiel Esmaiel','ولاء كرم اسماعيل اسماعيل',
  'r_editor','stp060@silah.com','2020-03-22',
  '937','STP-060','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'Team Leader','قائد فريق',
  '152020300','','u_937');

insertEmpUser.run(
  'u_939','stp130',hash('Pass939@SET'),
  'Heba Gamal Khalil Srour','stp130@silah.com','editor');
insertMember.run(
  'm_939','Heba Gamal Khalil Srour','هبة جمال خليل سرور',
  'r_editor','stp130@silah.com','2020-03-01',
  '939','STP-130','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Science','العلوم',
  'Science Overhead','العلوم',
  'Team Leader','قائد فريق',
  '152020500','','u_939');

insertEmpUser.run(
  'u_941','stp221',hash('Pass941@SET'),
  'Sara Mohamed Naguib Mohamed Sahl','stp221@silah.com','editor');
insertMember.run(
  'm_941','Sara Mohamed Naguib Mohamed Sahl','سارة محمد نجيب محمد سهل',
  'r_editor','stp221@silah.com','2025-02-10',
  '941','STP-221','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social Studies Overhead','الدراسات الإجتماعية',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020600','','u_941');

insertEmpUser.run(
  'u_946','stp052',hash('Pass946@SET'),
  'Wael Said Mohamed Ahmed Ali','stp052@silah.com','admin');
insertMember.run(
  'm_946','Wael Said Mohamed Ahmed Ali','وائل سعيد محمد احمد علي',
  'r_admin','stp052@silah.com','2020-04-08',
  '946','STP-052','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Art Direction Overhead','الإخراج الفني',
  'Art Director','مخرج فني',
  '152050000','','u_946');

insertEmpUser.run(
  'u_989','stp045',hash('Pass989@SET'),
  'Mohamed Ibrahim Abdel Mohaymen El Basyony','stp045@silah.com','editor');
insertMember.run(
  'm_989','Mohamed Ibrahim Abdel Mohaymen El Basyony','محمد ابراهيم عبد المهيمن البسيوني',
  'r_editor','stp045@silah.com','2020-07-01',
  '989','STP-045','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'Arabic Advisor','إستشاري اللغة العربية',
  '152020300','','u_989');

insertEmpUser.run(
  'u_1047','stp258',hash('Pass1047@SET'),
  'Mai Al Aidi Mukhtar Youssef Ali','stp258@silah.com','editor');
insertMember.run(
  'm_1047','Mai Al Aidi Mukhtar Youssef Ali','مى العايدى مختار يوسف على',
  'r_editor','stp258@silah.com','2020-09-06',
  '1047','STP-258','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Discover','اكتشف',
  'Discover Overhead','اكتشف',
  'Team Leader','قائد فريق',
  '152020900','','u_1047');

insertEmpUser.run(
  'u_1062','stp078',hash('Pass1062@SET'),
  'Mohamed Mohamed ElBadawy Ahmed Al Qurashi','stp078@silah.com','editor');
insertMember.run(
  'm_1062','Mohamed Mohamed ElBadawy Ahmed Al Qurashi','محمد محمد البدوي احمد القرشي',
  'r_editor','stp078@silah.com','2020-09-13',
  '1062','STP-078','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Senior Graphic Designer','مصمم أول جرافيك',
  '152050002','','u_1062');

insertEmpUser.run(
  'u_1067','stp337',hash('Pass1067@SET'),
  'Yasmeen Mohamed Abdel Aziz Hassaneen','stp337@silah.com','editor');
insertMember.run(
  'm_1067','Yasmeen Mohamed Abdel Aziz Hassaneen','ياسمين محمد عبد العزيز حسنين',
  'r_editor','stp337@silah.com','2020-09-20',
  '1067','STP-337','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math Overhead','الرياضيات',
  'Team Leader','قائد فريق',
  '152020400','','u_1067');

insertEmpUser.run(
  'u_1070','stp197',hash('Pass1070@SET'),
  'Ashraf Mohamed Moussa atyat Allah','stp197@silah.com','editor');
insertMember.run(
  'm_1070','Ashraf Mohamed Moussa atyat Allah','اشرف محمد موسى عطية الله',
  'r_editor','stp197@silah.com','2022-07-24',
  '1070','STP-197','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading','التدقيق اللغوي',
  'Arabic Proofreader Team Leader','قائد فريق التدقيق اللغوي لغة عربية',
  '152050004','','u_1070');

insertEmpUser.run(
  'u_1160','stp348',hash('Pass1160@SET'),
  'Amira Salah Mohamed Montaser Esmaiel','stp348@silah.com','editor');
insertMember.run(
  'm_1160','Amira Salah Mohamed Montaser Esmaiel','اميره صلاح محمد منتصر اسماعيل',
  'r_editor','stp348@silah.com','2020-12-27',
  '1160','STP-348','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Senior Graphic Designer','مصمم أول جرافيك',
  '152050002','','u_1160');

insertEmpUser.run(
  'u_1162','stp350',hash('Pass1162@SET'),
  'Nahla Mohamed Mohamed Farag','stp350@silah.com','editor');
insertMember.run(
  'm_1162','Nahla Mohamed Mohamed Farag','نهله محمد محمد فرج',
  'r_editor','stp350@silah.com','2020-12-27',
  '1162','STP-350','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Senior Graphic Designer','مصمم أول جرافيك',
  '152050002','','u_1162');

insertEmpUser.run(
  'u_1184','stp069',hash('Pass1184@SET'),
  'Yasser Abdel Sattar Mahmoud Ibrahim','stp069@silah.com','editor');
insertMember.run(
  'm_1184','Yasser Abdel Sattar Mahmoud Ibrahim','ياسر عبد الستار محمود ابراهيم',
  'r_editor','stp069@silah.com','2021-11-01',
  '1184','STP-069','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'English Layouter Team Leader','قائد فريق تنسيق الصفحات لغة انجليزية',
  '152050003','','u_1184');

insertEmpUser.run(
  'u_1240','stp152',hash('Pass1240@SET'),
  'Ibrahim Ahmed Sayed Kassem','stp152@silah.com','editor');
insertMember.run(
  'm_1240','Ibrahim Ahmed Sayed Kassem','ابراهيم احمد سيد قاسم',
  'r_editor','stp152@silah.com','2021-04-11',
  '1240','STP-152','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Senior Arabic Layouter','منسق أول صفحات لغة عربية',
  '152050003','','u_1240');

insertEmpUser.run(
  'u_1241','stp153',hash('Pass1241@SET'),
  'Mahmoud Sayed Saad Ahmed Abdel Rahman Shoala','stp153@silah.com','editor');
insertMember.run(
  'm_1241','Mahmoud Sayed Saad Ahmed Abdel Rahman Shoala','محمود سيد سعد احمد عبد الرحمن شعلة',
  'r_editor','stp153@silah.com','2021-04-11',
  '1241','STP-153','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Senior Arabic Layouter','منسق أول صفحات لغة عربية',
  '152050003','','u_1241');

insertEmpUser.run(
  'u_1242','stp123',hash('Pass1242@SET'),
  'Ahmed Mostafa Sherif Aly','stp123@silah.com','editor');
insertMember.run(
  'm_1242','Ahmed Mostafa Sherif Aly','احمد مصطفى شريف علي',
  'r_editor','stp123@silah.com','2021-04-11',
  '1242','STP-123','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Arabic Layouter Team Leader','قائد فريق تنسيق الصفحات لغة عربية',
  '152050003','','u_1242');

insertEmpUser.run(
  'u_1269','stp183',hash('Pass1269@SET'),
  'Salma Mahmoud Mohamed Ibrahim','stp183@silah.com','editor');
insertMember.run(
  'm_1269','Salma Mahmoud Mohamed Ibrahim','سلمى محمود محمد ابراهيم',
  'r_editor','stp183@silah.com','2021-04-25',
  '1269','STP-183','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Illustration','الرسم',
  'Senior Illustrator','رسام أول',
  '152050001','','u_1269');

insertEmpUser.run(
  'u_1270','stp272',hash('Pass1270@SET'),
  'Ahmed Fathy Helmy ElSebaay','stp272@silah.com','editor');
insertMember.run(
  'm_1270','Ahmed Fathy Helmy ElSebaay','احمد فتحي حلمي السباعي',
  'r_editor','stp272@silah.com','2021-04-25',
  '1270','STP-272','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math Overhead','الرياضيات',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020400','','u_1270');

insertEmpUser.run(
  'u_1271','stp154',hash('Pass1271@SET'),
  'Hamdy Sayed Mohamed Aly','stp154@silah.com','editor');
insertMember.run(
  'm_1271','Hamdy Sayed Mohamed Aly','حمدي سيد محمد علي',
  'r_editor','stp154@silah.com','2021-04-25',
  '1271','STP-154','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Senior Social Studies Layouter','منسق أول صفحات دراسات اجتماعية',
  '152050003','','u_1271');

insertEmpUser.run(
  'u_1333','stp317',hash('Pass1333@SET'),
  'Adham Abo rwash Sayed Mousa','stp317@silah.com','designer');
insertMember.run(
  'm_1333','Adham Abo rwash Sayed Mousa','ادهم ابو رواش سيد موسى',
  'r_designer','stp317@silah.com','2023-04-01',
  '1333','STP-317','Egybell',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Arabic Layouter','منسق صفحات لغة عربية',
  '152050003','','u_1333');

insertEmpUser.run(
  'u_1334','stp318',hash('Pass1334@SET'),
  'Khaled Mohamed Abdelhamid Mohamed','stp318@silah.com','designer');
insertMember.run(
  'm_1334','Khaled Mohamed Abdelhamid Mohamed','خالد محمد عبد الحميد محمد',
  'r_designer','stp318@silah.com','2023-04-01',
  '1334','STP-318','Egybell',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Social Studies Layouter','منسق صفحات دراسات اجتماعية',
  '152050003','','u_1334');

insertEmpUser.run(
  'u_1384','stp277',hash('Pass1384@SET'),
  'Marwa Ahmed Huessain Ahmed','stp277@silah.com','designer');
insertMember.run(
  'm_1384','Marwa Ahmed Huessain Ahmed','مروى احمد حسين احمد',
  'r_designer','stp277@silah.com','2021-08-29',
  '1384','STP-277','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Arabic Layouter','منسق صفحات لغة عربية',
  '152050003','','u_1384');

insertEmpUser.run(
  'u_1385','stp234',hash('Pass1385@SET'),
  'Alaa Mohamed Mahmoud Mohamed','stp234@silah.com','designer');
insertMember.run(
  'm_1385','Alaa Mohamed Mahmoud Mohamed','علاء محمد محمود محمد',
  'r_designer','stp234@silah.com','2021-08-27',
  '1385','STP-234','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'English Layouter','منسق صفحات لغة انجليزية',
  '152050003','','u_1385');

insertEmpUser.run(
  'u_1386','stp228',hash('Pass1386@SET'),
  'Mostafa Mohamed Mahmoud Mohamed','stp228@silah.com','editor');
insertMember.run(
  'm_1386','Mostafa Mohamed Mahmoud Mohamed','مصطفى محمد محمود محمد',
  'r_editor','stp228@silah.com','2021-08-27',
  '1386','STP-228','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Senior Arabic Layouter','منسق أول صفحات لغة عربية',
  '152050003','','u_1386');

insertEmpUser.run(
  'u_1391','stp247',hash('Pass1391@SET'),
  'Hossam Mohsen Mohamed Khalil','stp247@silah.com','editor');
insertMember.run(
  'm_1391','Hossam Mohsen Mohamed Khalil','حسام محسن محمد خليل سيف الدين',
  'r_editor','stp247@silah.com','2023-03-24',
  '1391','STP-247','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading','التدقيق اللغوي',
  'Senior Arabic Proofreader','مدقق أول لغوي لغة عربية',
  '152050004','','u_1391');

insertEmpUser.run(
  'u_1421','stp311',hash('Pass1421@SET'),
  'Nabil Ahmed Shibl esmail','stp311@silah.com','editor');
insertMember.run(
  'm_1421','Nabil Ahmed Shibl esmail','نبيل احمد شبل اسماعيل',
  'r_editor','stp311@silah.com','2021-10-27',
  '1421','STP-311','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math Overhead','الرياضيات',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020400','','u_1421');

insertEmpUser.run(
  'u_1434','stp174',hash('Pass1434@SET'),
  'Kassim Ali Ali Ahmed','stp174@silah.com','editor');
insertMember.run(
  'm_1434','Kassim Ali Ali Ahmed','قاسم على على احمد',
  'r_editor','stp174@silah.com','2021-11-21',
  '1434','STP-174','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading','التدقيق اللغوي',
  'Senior English Proofreader','مدقق أول لغوي لغة انجليزية',
  '152050004','','u_1434');

insertEmpUser.run(
  'u_1458','stp175',hash('Pass1458@SET'),
  'Said mohamed abdelmonem mohamed abas','stp175@silah.com','editor');
insertMember.run(
  'm_1458','Said mohamed abdelmonem mohamed abas','سعيد محمد عبد المنعم محمد عباس',
  'r_editor','stp175@silah.com','2021-12-27',
  '1458','STP-175','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math Overhead','الرياضيات',
  'Team Leader','قائد فريق',
  '152020400','','u_1458');

insertEmpUser.run(
  'u_1464','stp227',hash('Pass1464@SET'),
  'Bahaa shaban mohamed mohamed','stp227@silah.com','editor');
insertMember.run(
  'm_1464','Bahaa shaban mohamed mohamed','بهاء شعبان محمد محمد',
  'r_editor','stp227@silah.com','2022-01-04',
  '1464','STP-227','STP',
  'Academic Books','المحتوى الأكاديمى',
  'English','اللغة الإنجليزية',
  'English Overhead','اللغة الإنجليزية',
  'Team Leader','قائد فريق',
  '152020700','','u_1464');

insertEmpUser.run(
  'u_1473','stp291',hash('Pass1473@SET'),
  'Mahmod safwat Mahmod Mahmod','stp291@silah.com','editor');
insertMember.run(
  'm_1473','Mahmod safwat Mahmod Mahmod','محمود صفوت محمود محمود',
  'r_editor','stp291@silah.com','2022-01-16',
  '1473','STP-291','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social Studies Overhead','الدراسات الإجتماعية',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020600','','u_1473');

insertEmpUser.run(
  'u_1482','stp253',hash('Pass1482@SET'),
  'Manal ibrahem rashid ibrahem','stp253@silah.com','editor');
insertMember.run(
  'm_1482','Manal ibrahem rashid ibrahem','منال ابراهيم راشد ابراهيم',
  'r_editor','stp253@silah.com','2022-01-23',
  '1482','STP-253','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Science','العلوم',
  'Science Overhead','العلوم',
  'Team Leader','قائد فريق',
  '152020500','','u_1482');

insertEmpUser.run(
  'u_1484','stp143',hash('Pass1484@SET'),
  'Hanan mostafa elsayd ahmed','stp143@silah.com','editor');
insertMember.run(
  'm_1484','Hanan mostafa elsayd ahmed','حنان مصطفى السيد احمد',
  'r_editor','stp143@silah.com','2022-01-23',
  '1484','STP-143','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social Studies Overhead','الدراسات الإجتماعية',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020600','','u_1484');

insertEmpUser.run(
  'u_1492','stp073',hash('Pass1492@SET'),
  'Mohamed gad mohamed agur','stp073@silah.com','editor');
insertMember.run(
  'm_1492','Mohamed gad mohamed agur','محمد جاد محمد عجور',
  'r_editor','stp073@silah.com','2022-02-06',
  '1492','STP-073','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'Team Leader','قائد فريق',
  '152020300','','u_1492');

insertEmpUser.run(
  'u_1511','stp421',hash('Pass1511@SET'),
  'Maryam Ahmed Mohamed  Hanafy Ahmed','stp421@silah.com','editor');
insertMember.run(
  'm_1511','Maryam Ahmed Mohamed  Hanafy Ahmed','مريم احمد محمد حنفى احمد',
  'r_editor','stp421@silah.com','2022-02-27',
  '1511','STP-421','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Senior Graphic Designer','مصمم أول جرافيك',
  '152050002','','u_1511');

insertEmpUser.run(
  'u_1513','stp170',hash('Pass1513@SET'),
  'Sherine Ahmed Youssef Youssef','stp170@silah.com','editor');
insertMember.run(
  'm_1513','Sherine Ahmed Youssef Youssef','شيرين احمد يوسف يوسف',
  'r_editor','stp170@silah.com','2022-05-24',
  '1513','STP-170','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math Overhead','الرياضيات',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020400','','u_1513');

insertEmpUser.run(
  'u_1544','stp177',hash('Pass1544@SET'),
  'Islam Hanafi Mahmoud Ali','stp177@silah.com','designer');
insertMember.run(
  'm_1544','Islam Hanafi Mahmoud Ali','اسلام حنفى محمود على',
  'r_designer','stp177@silah.com','2022-04-10',
  '1544','STP-177','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'English Layouter','منسق صفحات لغة انجليزية',
  '152050003','','u_1544');

insertEmpUser.run(
  'u_1702','stp237',hash('Pass1702@SET'),
  'Hossam Ahmed Mohamed Mohamed Nasr','stp237@silah.com','designer');
insertMember.run(
  'm_1702','Hossam Ahmed Mohamed Mohamed Nasr','حسام احمد محمد محمد نصر',
  'r_designer','stp237@silah.com','2022-09-04',
  '1702','STP-237','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'English Layouter','منسق صفحات لغة انجليزية',
  '152050003','','u_1702');

insertEmpUser.run(
  'u_1762','stp184',hash('Pass1762@SET'),
  'Asmaa Atta Gad Elmawla Ahmed','stp184@silah.com','editor');
insertMember.run(
  'm_1762','Asmaa Atta Gad Elmawla Ahmed','أسماء عطا جاد المولى أحمد',
  'r_editor','stp184@silah.com','2022-12-05',
  '1762','STP-184','STP',
  'Academic Books','المحتوى الأكاديمى',
  'ICT','مهارات تكنولوجية',
  'ICT Overhead','مهارات تكنولوجية',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020800','','u_1762');

insertEmpUser.run(
  'u_1767','stp307',hash('Pass1767@SET'),
  'George Adel Ishak Salib','stp307@silah.com','author');
insertMember.run(
  'm_1767','George Adel Ishak Salib','جورج عادل اسحق صليب',
  'r_author','stp307@silah.com','2022-12-14',
  '1767','STP-307','STP',
  'Academic Books','المحتوى الأكاديمى',
  'ICT','مهارات تكنولوجية',
  'ICT Overhead','مهارات تكنولوجية',
  'SME','أخصائي مادة تعليمية',
  '152020800','','u_1767');

insertEmpUser.run(
  'u_1770','stp245',hash('Pass1770@SET'),
  'Amr Abdel Fattah Abdullah Abadi','stp245@silah.com','reviewer');
insertMember.run(
  'm_1770','Amr Abdel Fattah Abdullah Abadi','عمرو عبدالفتاح عبدالله عبادى',
  'r_reviewer','stp245@silah.com','2022-12-20',
  '1770','STP-245','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading','التدقيق اللغوي',
  'Math Proofreader','مدقق لغوي رياضيات',
  '152050004','','u_1770');

insertEmpUser.run(
  'u_1806','stp002',hash('Pass1806@SET'),
  'Yasser Sayed Hassan Mahdi','stp002@silah.com','admin');
insertMember.run(
  'm_1806','Yasser Sayed Hassan Mahdi','ياسر سيد حسن مهدى',
  'r_admin','stp002@silah.com','2026-04-01',
  '1806','STP-002','STP',
  'Content','المحتوي',
  'Content','المحتوي',
  'Content Overhead','المحتوي',
  'Content Director','رئيس قطاع المحتوى',
  '152000000','','u_1806');

insertEmpUser.run(
  'u_1867','stp1341',hash('Pass1867@SET'),
  'Ahmed Sayed Mohamed Suleiman Mohsen','stp1341@silah.com','editor');
insertMember.run(
  'm_1867','Ahmed Sayed Mohamed Suleiman Mohsen','احمد سيد محمد سليمان  محسن',
  'r_editor','stp1341@silah.com','2023-08-01',
  '1867','STP-1341','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social Studies Overhead','الدراسات الإجتماعية',
  'Senior Team Leader','قائد أول فريق',
  '152020600','','u_1867');

insertEmpUser.run(
  'u_1869','stp139',hash('Pass1869@SET'),
  'Ahmed Mohamed Mohamed Afifi','stp139@silah.com','editor');
insertMember.run(
  'm_1869','Ahmed Mohamed Mohamed Afifi','احمد محمد محمد عفيفى',
  'r_editor','stp139@silah.com','2023-08-02',
  '1869','STP-139','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math Overhead','الرياضيات',
  'Team Leader','قائد فريق',
  '152020400','','u_1869');

insertEmpUser.run(
  'u_1886','stp138',hash('Pass1886@SET'),
  'Sarah Gad Mohamed Metwally Attia','stp138@silah.com','author');
insertMember.run(
  'm_1886','Sarah Gad Mohamed Metwally Attia','ساره جاد محمد متولى عطيه',
  'r_author','stp138@silah.com','2023-10-16',
  '1886','STP-138','STP',
  'Academic Books','المحتوى الأكاديمى',
  'English','اللغة الإنجليزية',
  'English Overhead','اللغة الإنجليزية',
  'SME','أخصائي مادة تعليمية',
  '152020700','','u_1886');

insertEmpUser.run(
  'u_1889','stp840',hash('Pass1889@SET'),
  'Mona Gamal Gad Sayed Ahmed','stp840@silah.com','designer');
insertMember.run(
  'm_1889','Mona Gamal Gad Sayed Ahmed','منى جمال جاد سيد احمد',
  'r_designer','stp840@silah.com','2023-10-22',
  '1889','STP-840','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Social Studies Layouter','منسق صفحات دراسات اجتماعية',
  '152050003','','u_1889');

insertEmpUser.run(
  'u_1909','stp059',hash('Pass1909@SET'),
  'Walaa Sherif Mahmoud Alsayed','stp059@silah.com','editor');
insertMember.run(
  'm_1909','Walaa Sherif Mahmoud Alsayed','ولاء شريف محمود السيد',
  'r_editor','stp059@silah.com','2023-11-21',
  '1909','STP-059','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Senior Arabic Layouter','منسق أول صفحات لغة عربية',
  '152050003','','u_1909');

insertEmpUser.run(
  'u_1920','stp118',hash('Pass1920@SET'),
  'Haitham Sayed Saad Ahmed','stp118@silah.com','editor');
insertMember.run(
  'm_1920','Haitham Sayed Saad Ahmed','هيثم سيد سعد احمد',
  'r_editor','stp118@silah.com','2023-12-03',
  '1920','STP-118','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Senior Science Layouter','منسق أول صفحات علوم',
  '152050003','','u_1920');

insertEmpUser.run(
  'u_1925','stp079',hash('Pass1925@SET'),
  'Suhaila Tariq Abdel Salam Ali','stp079@silah.com','editor');
insertMember.run(
  'm_1925','Suhaila Tariq Abdel Salam Ali','سهيله طارق عبدالسلام  على',
  'r_editor','stp079@silah.com','2023-12-06',
  '1925','STP-079','STP',
  'Academic Books','المحتوى الأكاديمى',
  'English','اللغة الإنجليزية',
  'English Overhead','اللغة الإنجليزية',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020700','','u_1925');

insertEmpUser.run(
  'u_1926','stp993',hash('Pass1926@SET'),
  'Mostafa Ali Mohamed Farghaly','stp993@silah.com','editor');
insertMember.run(
  'm_1926','Mostafa Ali Mohamed Farghaly','مصطفى على محمد فرغلى',
  'r_editor','stp993@silah.com','2023-12-11',
  '1926','STP-993','STP',
  'Academic Books','المحتوى الأكاديمى',
  'English','اللغة الإنجليزية',
  'English Overhead','اللغة الإنجليزية',
  'Team Leader','قائد فريق',
  '152020700','','u_1926');

insertEmpUser.run(
  'u_1951','stp140',hash('Pass1951@SET'),
  'Walaa Fathi Mohamed Alsayed','stp140@silah.com','editor');
insertMember.run(
  'm_1951','Walaa Fathi Mohamed Alsayed','ولاء فتحى محمد السيد',
  'r_editor','stp140@silah.com','2024-01-24',
  '1951','STP-140','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'Associate Team Leader','قائد فريق معاون',
  '152020300','','u_1951');

insertEmpUser.run(
  'u_1976','stp1503',hash('Pass1976@SET'),
  'Ahmed Sayed Suleiman Mohamed Issa','stp1503@silah.com','designer');
insertMember.run(
  'm_1976','Ahmed Sayed Suleiman Mohamed Issa','احمد سيد سليمان محمد عيسى',
  'r_designer','stp1503@silah.com','2024-03-21',
  '1976','STP-1503','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Math Layouter','منسق صفحات رياضيات',
  '152050003','','u_1976');

insertEmpUser.run(
  'u_1977','stp1501',hash('Pass1977@SET'),
  'Ebrahim Noah Ebrahim Noah','stp1501@silah.com','author');
insertMember.run(
  'm_1977','Ebrahim Noah Ebrahim Noah','ابراهيم نوح ابراهيم نوح',
  'r_author','stp1501@silah.com','2024-03-21',
  '1977','STP-1501','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'SME','أخصائي مادة تعليمية',
  '152020300','','u_1977');

insertEmpUser.run(
  'u_1978','stp031',hash('Pass1978@SET'),
  'Sameh Ibrahim Awadallah Abdul Khaleq','stp031@silah.com','admin');
insertMember.run(
  'm_1978','Sameh Ibrahim Awadallah Abdul Khaleq','سامح ابراهيم عوض الله عبدالخالق',
  'r_admin','stp031@silah.com','2024-03-21',
  '1978','STP-031','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social Studies Overhead','الدراسات الإجتماعية',
  'Senior Social Studies Section Head','مدير أول قسم الدراسات الاجتماعية',
  '152020600','','u_1978');

insertEmpUser.run(
  'u_1979','stp1502',hash('Pass1979@SET'),
  'Wala Munir Abdel Salam Rashid','stp1502@silah.com','author');
insertMember.run(
  'm_1979','Wala Munir Abdel Salam Rashid','ولاء منير عبدالسلام راشد',
  'r_author','stp1502@silah.com','2024-03-21',
  '1979','STP-1502','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social Studies Overhead','الدراسات الإجتماعية',
  'SME','أخصائي مادة تعليمية',
  '152020600','','u_1979');

insertEmpUser.run(
  'u_2065','stp067',hash('Pass2065@SET'),
  'Ola Mohamed Saber Ismail','stp067@silah.com','author');
insertMember.run(
  'm_2065','Ola Mohamed Saber Ismail','علا محمد صابر اسماعيل',
  'r_author','stp067@silah.com','2024-06-23',
  '2065','STP-067','STP',
  'Academic Books','المحتوى الأكاديمى',
  'English','اللغة الإنجليزية',
  'English Overhead','اللغة الإنجليزية',
  'SME','أخصائي مادة تعليمية',
  '152020700','','u_2065');

insertEmpUser.run(
  'u_2116','stp1549',hash('Pass2116@SET'),
  'Mohamed Mahmoud Taha Mohamed','stp1549@silah.com','editor');
insertMember.run(
  'm_2116','Mohamed Mahmoud Taha Mohamed','محمد محمود طه محمد',
  'r_editor','stp1549@silah.com','2024-07-21',
  '2116','STP-1549','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social preparatory 1','الدراسات الإجتماعية الصف الأول الإعدادى',
  'Senior Team Leader','قائد أول فريق',
  '152020611','','u_2116');

insertEmpUser.run(
  'u_2123','stp016',hash('Pass2123@SET'),
  'Eman Mohamed Abul Fotouh El Daly','stp016@silah.com','editor');
insertMember.run(
  'm_2123','Eman Mohamed Abul Fotouh El Daly','ايمان محمد ابوالفتوح الدالى',
  'r_editor','stp016@silah.com','2024-08-21',
  '2123','STP-016','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020300','','u_2123');

insertEmpUser.run(
  'u_2124','stp074',hash('Pass2124@SET'),
  'Sohaila Gabriel Anwar Hamida Gabriel','stp074@silah.com','author');
insertMember.run(
  'm_2124','Sohaila Gabriel Anwar Hamida Gabriel','سهيله جبريل انور حميده جبريل',
  'r_author','stp074@silah.com','2024-08-26',
  '2124','STP-074','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Science','العلوم',
  'Science Overhead','العلوم',
  'SME','أخصائي مادة تعليمية',
  '152020500','','u_2124');

insertEmpUser.run(
  'u_2215','stp1514',hash('Pass2215@SET'),
  'Hany Mohamed Mohamed Hassanein','stp1514@silah.com','admin');
insertMember.run(
  'm_2215','Hany Mohamed Mohamed Hassanein','هانى محمد محمد حسنين',
  'r_admin','stp1514@silah.com','2025-01-27',
  '2215','STP-1514','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Science','العلوم',
  'Science Overhead','العلوم',
  'Science Section Head','مدير قسم العلوم',
  '152020500','','u_2215');

insertEmpUser.run(
  'u_2243','stp349',hash('Pass2243@SET'),
  'Yasser Mahmoud Mustafa Ahmed','stp349@silah.com','editor');
insertMember.run(
  'm_2243','Yasser Mahmoud Mustafa Ahmed','ياسر محمود مصطفى احمد',
  'r_editor','stp349@silah.com','2025-04-21',
  '2243','STP-349','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Senior Graphic Designer','مصمم أول جرافيك',
  '152050002','','u_2243');

insertEmpUser.run(
  'u_2244','stp422',hash('Pass2244@SET'),
  'Yara Tawfiq Mohamed Al Badry Tawfiq','stp422@silah.com','designer');
insertMember.run(
  'm_2244','Yara Tawfiq Mohamed Al Badry Tawfiq','يارا توفيق محمد البدرى توفيق',
  'r_designer','stp422@silah.com','2025-04-21',
  '2244','STP-422','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Graphic Designer','مصمم جرافيك',
  '152050002','','u_2244');

insertEmpUser.run(
  'u_2251','stp1553',hash('Pass2251@SET'),
  'Al Sayed Gharib Al Sayed Afifi','stp1553@silah.com','editor');
insertMember.run(
  'm_2251','Al Sayed Gharib Al Sayed Afifi','السيد غريب السيد عفيفى',
  'r_editor','stp1553@silah.com','2025-04-21',
  '2251','STP-1553','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Senior Graphic Designer','مصمم أول جرافيك',
  '152050002','','u_2251');

insertEmpUser.run(
  'u_2252','stp1541',hash('Pass2252@SET'),
  'Taha Mohamed Mahmoud Hassan','stp1541@silah.com','editor');
insertMember.run(
  'm_2252','Taha Mohamed Mahmoud Hassan','طه محمد محمود حسان',
  'r_editor','stp1541@silah.com','2025-04-21',
  '2252','STP-1541','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020300','','u_2252');

insertEmpUser.run(
  'u_2253','stp1542',hash('Pass2253@SET'),
  'Gamal Ahmed Ali Abdullah','stp1542@silah.com','editor');
insertMember.run(
  'm_2253','Gamal Ahmed Ali Abdullah','جمال احمد على عبدالله',
  'r_editor','stp1542@silah.com','2025-04-21',
  '2253','STP-1542','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Religion','الدين',
  'Religion Overhead','الدين',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020200','','u_2253');

insertEmpUser.run(
  'u_2254','stp1544',hash('Pass2254@SET'),
  'Amira Mohamed Ahmed Ahmed Gomaa','stp1544@silah.com','author');
insertMember.run(
  'm_2254','Amira Mohamed Ahmed Ahmed Gomaa','اميره محمد احمد احمد جمعه',
  'r_author','stp1544@silah.com','2025-04-21',
  '2254','STP-1544','STP',
  'Academic Books','المحتوى الأكاديمى',
  'English','اللغة الإنجليزية',
  'English Overhead','اللغة الإنجليزية',
  'SME','أخصائي مادة تعليمية',
  '152020700','','u_2254');

insertEmpUser.run(
  'u_2255','stp1557',hash('Pass2255@SET'),
  'Ahmed Ibrahim Abdel Sattar Ali','stp1557@silah.com','designer');
insertMember.run(
  'm_2255','Ahmed Ibrahim Abdel Sattar Ali','احمد ابراهيم عبدالستار على',
  'r_designer','stp1557@silah.com','2025-04-21',
  '2255','STP-1557','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout','تنسيق الصفحات',
  'Math Layouter','منسق صفحات رياضيات',
  '152050003','','u_2255');

insertEmpUser.run(
  'u_2256','stp1554',hash('Pass2256@SET'),
  'Samaa Nasser Abdel Hafeez Qutb','stp1554@silah.com','designer');
insertMember.run(
  'm_2256','Samaa Nasser Abdel Hafeez Qutb','سماء ناصر عبدالحفيظ قطب',
  'r_designer','stp1554@silah.com','2025-04-21',
  '2256','STP-1554','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic','التصميم',
  'Graphic Designer','مصمم جرافيك',
  '152050002','','u_2256');

insertEmpUser.run(
  'u_2259','stp1547',hash('Pass2259@SET'),
  'Eman Shahat Ahmed Younis','stp1547@silah.com','author');
insertMember.run(
  'm_2259','Eman Shahat Ahmed Younis','ايمان شحات احمد يونس',
  'r_author','stp1547@silah.com','2025-04-22',
  '2259','STP-1547','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math Overhead','الرياضيات',
  'SME','أخصائي مادة تعليمية',
  '152020400','','u_2259');

insertEmpUser.run(
  'u_2272','stp1548',hash('Pass2272@SET'),
  'Shaimaa Hisham Alian Youssef','stp1548@silah.com','author');
insertMember.run(
  'm_2272','Shaimaa Hisham Alian Youssef','شيماء هشام عليان يوسف',
  'r_author','stp1548@silah.com','2025-05-21',
  '2272','STP-1548','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Science','العلوم',
  'Science Overhead','العلوم',
  'SME','أخصائي مادة تعليمية',
  '152020500','','u_2272');

insertEmpUser.run(
  'u_2284','stp1555',hash('Pass2284@SET'),
  'Ibrahim Abdelfadil Ali Mohamed','stp1555@silah.com','reviewer');
insertMember.run(
  'm_2284','Ibrahim Abdelfadil Ali Mohamed','ابراهيم عبدالفضيل على محمد',
  'r_reviewer','stp1555@silah.com','2025-05-21',
  '2284','STP-1555','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading Prep','التدقيق اللغوي اعدادى',
  'Arabic Proofreader','مدقق لغوي لغة عربية',
  '152050014','','u_2284');

insertEmpUser.run(
  'u_2296','stp1504',hash('Pass2296@SET'),
  'Abdulrahman Mustafa Mohamed AbdulAzim Shamrdan','stp1504@silah.com','editor');
insertMember.run(
  'm_2296','Abdulrahman Mustafa Mohamed AbdulAzim Shamrdan','عبدالرحمن مصطفى محمد عبدالعظيم شمردن',
  'r_editor','stp1504@silah.com','2025-06-16',
  '2296','STP-1504','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Illustration','الرسم',
  'Senior Illustrator','رسام أول',
  '152050001','','u_2296');

insertEmpUser.run(
  'u_2314','stp1545',hash('Pass2314@SET'),
  'Ahmed Mohamed Elmahdi Basyouni Asr','stp1545@silah.com','author');
insertMember.run(
  'm_2314','Ahmed Mohamed Elmahdi Basyouni Asr','احمد محمد المهدى بسيونى عصر',
  'r_author','stp1545@silah.com','2025-07-07',
  '2314','STP-1545','STP',
  'Academic Books','المحتوى الأكاديمى',
  'English','اللغة الإنجليزية',
  'English Overhead','اللغة الإنجليزية',
  'SME','أخصائي مادة تعليمية',
  '152020700','','u_2314');

insertEmpUser.run(
  'u_2340','stp1658',hash('Pass2340@SET'),
  'Eman Mamdouh ElSayed Sawaby Sawaby','stp1658@silah.com','author');
insertMember.run(
  'm_2340','Eman Mamdouh ElSayed Sawaby Sawaby','ايمان ممدوح السيد صوابى صوابى',
  'r_author','stp1658@silah.com','2025-08-11',
  '2340','STP-1658','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'SME','أخصائي مادة تعليمية',
  '152020300','','u_2340');

insertEmpUser.run(
  'u_2344','stp085',hash('Pass2344@SET'),
  'Ahmed Mofti Aldin Abdel Latif Ahmed','stp085@silah.com','author');
insertMember.run(
  'm_2344','Ahmed Mofti Aldin Abdel Latif Ahmed','احمد مفتى الدين عبداللطيف احمد',
  'r_author','stp085@silah.com','2025-08-18',
  '2344','STP-085','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'SME','أخصائي مادة تعليمية',
  '152020300','','u_2344');

insertEmpUser.run(
  'u_2347','stp1660',hash('Pass2347@SET'),
  'Hisham Mahmoud Ahmed Mohamed Hussein','stp1660@silah.com','author');
insertMember.run(
  'm_2347','Hisham Mahmoud Ahmed Mohamed Hussein','هشام محمود احمد محمد حسين',
  'r_author','stp1660@silah.com','2025-08-25',
  '2347','STP-1660','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'SME','أخصائي مادة تعليمية',
  '152020300','','u_2347');

insertEmpUser.run(
  'u_2349','stp1661',hash('Pass2349@SET'),
  'Abdelnasser Elshahhat Abdelhamid Desouky','stp1661@silah.com','author');
insertMember.run(
  'm_2349','Abdelnasser Elshahhat Abdelhamid Desouky','عبدالناصر الشحات عبدالحميد دسوقى',
  'r_author','stp1661@silah.com','2025-08-25',
  '2349','STP-1661','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'SME','أخصائي مادة تعليمية',
  '152020300','','u_2349');

insertEmpUser.run(
  'u_2350','stp1662',hash('Pass2350@SET'),
  'Mansour Mohamed Mansour Algahsh','stp1662@silah.com','reviewer');
insertMember.run(
  'm_2350','Mansour Mohamed Mansour Algahsh','منصور محمد منصور الجحش',
  'r_reviewer','stp1662@silah.com','2025-08-25',
  '2350','STP-1662','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading','التدقيق اللغوي',
  'Arabic Proofreader','مدقق لغوي لغة عربية',
  '152050004','','u_2350');

insertEmpUser.run(
  'u_2355','stp1659',hash('Pass2355@SET'),
  'Abdullah Hisham Abdelfadil Abdelhamid Khater','stp1659@silah.com','author');
insertMember.run(
  'm_2355','Abdullah Hisham Abdelfadil Abdelhamid Khater','عبدالله هشام عبدالفضيل عبدالحميد خاطر',
  'r_author','stp1659@silah.com','2025-09-08',
  '2355','STP-1659','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'SME','أخصائي مادة تعليمية',
  '152020300','','u_2355');

insertEmpUser.run(
  'u_2360','stp086',hash('Pass2360@SET'),
  'Mustafa Ahmed Sayed Mohamed','stp086@silah.com','author');
insertMember.run(
  'm_2360','Mustafa Ahmed Sayed Mohamed','مصطفى احمد سيد محمد',
  'r_author','stp086@silah.com','2025-09-17',
  '2360','STP-086','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'SME','أخصائي مادة تعليمية',
  '152020300','','u_2360');

insertEmpUser.run(
  'u_2373','stp126',hash('Pass2373@SET'),
  'Magdy Ibrahim Ahmed Gowily','stp126@silah.com','editor');
insertMember.run(
  'm_2373','Magdy Ibrahim Ahmed Gowily','مجدى ابراهيم احمد جويلى',
  'r_editor','stp126@silah.com','2025-10-06',
  '2373','STP-126','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020300','','u_2373');

insertEmpUser.run(
  'u_2378','stp129',hash('Pass2378@SET'),
  'Mustafa Mohamed Abdelfattah Khodir','stp129@silah.com','author');
insertMember.run(
  'm_2378','Mustafa Mohamed Abdelfattah Khodir','مصطفى محمد عبدالفتاح خضير',
  'r_author','stp129@silah.com','2025-10-13',
  '2378','STP-129','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math Overhead','الرياضيات',
  'SME','أخصائي مادة تعليمية',
  '152020400','','u_2378');

insertEmpUser.run(
  'u_2379','stp056',hash('Pass2379@SET'),
  'Ashraf Mohamed Mohamed Abdelaal','stp056@silah.com','editor');
insertMember.run(
  'm_2379','Ashraf Mohamed Mohamed Abdelaal','اشرف محمد محمد عبدالعال',
  'r_editor','stp056@silah.com','2025-10-13',
  '2379','STP-056','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'Senior SME','أخصائي أول مادة تعليمية',
  '152020300','','u_2379');

insertEmpUser.run(
  'u_2384','stp058',hash('Pass2384@SET'),
  'Haiam Gamal Sayed Morsy','stp058@silah.com','author');
insertMember.run(
  'm_2384','Haiam Gamal Sayed Morsy','هيام جمال سيد مرسى',
  'r_author','stp058@silah.com','2025-10-20',
  '2384','STP-058','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic Overhead','اللغة العربية',
  'SME','أخصائي مادة تعليمية',
  '152020300','','u_2384');

insertEmpUser.run(
  'u_2394','stp068',hash('Pass2394@SET'),
  'Sameh Mahmoud Ahmed Mohamed','stp068@silah.com','editor');
insertMember.run(
  'm_2394','Sameh Mahmoud Ahmed Mohamed','سامح محمود احمد محمد',
  'r_editor','stp068@silah.com','2025-11-02',
  '2394','STP-068','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Illustration','الرسم',
  'Illustration Team Leader','قائد فريق الرسم',
  '152050001','','u_2394');

insertEmpUser.run(
  'u_2400','stp051',hash('Pass2400@SET'),
  'Salah Ahmed Fouad Salah Taama Alzarou','stp051@silah.com','admin');
insertMember.run(
  'm_2400','Salah Ahmed Fouad Salah Taama Alzarou','صلاح احمد فؤاد صلاح طعمه الزرو',
  'r_admin','stp051@silah.com','2025-11-13',
  '2400','STP-051','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math Overhead','الرياضيات',
  'Senior Math Section Head','مدير أول قسم الرياضيات',
  '152020400','','u_2400');

insertEmpUser.run(
  'u_2409','stp5043',hash('Pass2409@SET'),
  'Ahmed Mahmoud Ibrahim Mahmoud Awof','stp5043@silah.com','reviewer');
insertMember.run(
  'm_2409','Ahmed Mahmoud Ibrahim Mahmoud Awof','احمد محمود ابراهيم محمود عوف',
  'r_reviewer','stp5043@silah.com','2025-11-24',
  '2409','STP-5043','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading Prep','التدقيق اللغوي اعدادى',
  'Arabic Proofreader','مدقق لغوي لغة عربية',
  '152050014','','u_2409');

insertEmpUser.run(
  'u_2410','stp5044',hash('Pass2410@SET'),
  'Ahmed Ishak Hafez Mansour','stp5044@silah.com','reviewer');
insertMember.run(
  'm_2410','Ahmed Ishak Hafez Mansour','احمد اسحق حافظ منصور',
  'r_reviewer','stp5044@silah.com','2025-11-25',
  '2410','STP-5044','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading Prep','التدقيق اللغوي اعدادى',
  'Arabic Proofreader','مدقق لغوي لغة عربية',
  '152050014','','u_2410');

insertEmpUser.run(
  'u_2414','stp5025',hash('Pass2414@SET'),
  'Mawdda Mustafa Mohamed Sulaiman Badr','stp5025@silah.com','designer');
insertMember.run(
  'm_2414','Mawdda Mustafa Mohamed Sulaiman Badr','موده مصطفى محمد سليمان بدر',
  'r_designer','stp5025@silah.com','2025-12-01',
  '2414','STP-5025','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic Prep','التصميم اعدادى',
  'Graphic Designer','مصمم جرافيك',
  '152050012','','u_2414');

insertEmpUser.run(
  'u_2423','stp5045',hash('Pass2423@SET'),
  'Mahmoud Abdelsattar Karam Mahmoud Omar','stp5045@silah.com','reviewer');
insertMember.run(
  'm_2423','Mahmoud Abdelsattar Karam Mahmoud Omar','محمود عبد الستار كرم محمود عمر',
  'r_reviewer','stp5045@silah.com','2025-12-01',
  '2423','STP-5045','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading Prep','التدقيق اللغوي اعدادى',
  'Arabic Proofreader','مدقق لغوي لغة عربية',
  '152050014','','u_2423');

insertEmpUser.run(
  'u_2433','stp5033',hash('Pass2433@SET'),
  'Momen Eid Ahmed Hamaya Ahmed','stp5033@silah.com','designer');
insertMember.run(
  'm_2433','Momen Eid Ahmed Hamaya Ahmed','مؤمن عيد احمد حمايه احمد',
  'r_designer','stp5033@silah.com','2025-12-22',
  '2433','STP-5033','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout Prep','تنسيق الصفحات اعدادى',
  'Arabic Layouter','منسق صفحات لغة عربية',
  '152050013','','u_2433');

insertEmpUser.run(
  'u_2434','stp5038',hash('Pass2434@SET'),
  'Shereif Saeed Fahmy Mohamed','stp5038@silah.com','designer');
insertMember.run(
  'm_2434','Shereif Saeed Fahmy Mohamed','شريف سعيد فهمى محمد',
  'r_designer','stp5038@silah.com','2025-12-22',
  '2434','STP-5038','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout Prep','تنسيق الصفحات اعدادى',
  'Science Layouter','منسق صفحات علوم',
  '152050013','','u_2434');

insertEmpUser.run(
  'u_2435','stp5036',hash('Pass2435@SET'),
  'Hussein Mohamed Ahmed Othman','stp5036@silah.com','designer');
insertMember.run(
  'm_2435','Hussein Mohamed Ahmed Othman','حسين محمد احمد عثمان',
  'r_designer','stp5036@silah.com','2025-12-22',
  '2435','STP-5036','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout Prep','تنسيق الصفحات اعدادى',
  'Math Layouter','منسق صفحات رياضيات',
  '152050013','','u_2435');

insertEmpUser.run(
  'u_2436','stp5020',hash('Pass2436@SET'),
  'Mohamed Ramadan Abdullah Ahmed','stp5020@silah.com','author');
insertMember.run(
  'm_2436','Mohamed Ramadan Abdullah Ahmed','محمد رمضان عبدالله احمد',
  'r_author','stp5020@silah.com','2025-12-22',
  '2436','STP-5020','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social preparatory 1','الدراسات الإجتماعية الصف الأول الإعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020611','','u_2436');

insertEmpUser.run(
  'u_2437','stp150',hash('Pass2437@SET'),
  'Ahmed Mohamed Fathi Salaheldin','stp150@silah.com','author');
insertMember.run(
  'm_2437','Ahmed Mohamed Fathi Salaheldin','احمد محمد فتحى صلاح الدين',
  'r_author','stp150@silah.com','2025-12-22',
  '2437','STP-150','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Science','العلوم',
  'Science Overhead','العلوم',
  'SME','أخصائي مادة تعليمية',
  '152020500','','u_2437');

insertEmpUser.run(
  'u_2442','stp5034',hash('Pass2442@SET'),
  'Omar Salaheldin Abdelhalim Elsayed','stp5034@silah.com','designer');
insertMember.run(
  'm_2442','Omar Salaheldin Abdelhalim Elsayed','عمر صلاح الدين عبدالحليم السيد',
  'r_designer','stp5034@silah.com','2025-12-24',
  '2442','STP-5034','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout Prep','تنسيق الصفحات اعدادى',
  'Arabic Layouter','منسق صفحات لغة عربية',
  '152050013','','u_2442');

insertEmpUser.run(
  'u_2443','stp5010',hash('Pass2443@SET'),
  'Eman Ashraf Mahmoud Abdelalim','stp5010@silah.com','author');
insertMember.run(
  'm_2443','Eman Ashraf Mahmoud Abdelalim','ايمان اشرف محمود عبدالعليم',
  'r_author','stp5010@silah.com','2025-12-24',
  '2443','STP-5010','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math preparatory 1','الرياضيات الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020411','','u_2443');

insertEmpUser.run(
  'u_2445','stp5021',hash('Pass2445@SET'),
  'Aya Mohamed Mahmoud Ramzy Othman','stp5021@silah.com','author');
insertMember.run(
  'm_2445','Aya Mohamed Mahmoud Ramzy Othman','ايه محمد محمود رمزى عثمان',
  'r_author','stp5021@silah.com','2025-12-29',
  '2445','STP-5021','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social preparatory 1','الدراسات الإجتماعية الصف الأول الإعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020611','','u_2445');

insertEmpUser.run(
  'u_2447','stp5047',hash('Pass2447@SET'),
  'Khaled Samih Abdelkhalek Youssef','stp5047@silah.com','reviewer');
insertMember.run(
  'm_2447','Khaled Samih Abdelkhalek Youssef','خالد سميح عبدالخالق يوسف',
  'r_reviewer','stp5047@silah.com','2025-12-30',
  '2447','STP-5047','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading Prep','التدقيق اللغوي اعدادى',
  'Arabic Proofreader','مدقق لغوي لغة عربية',
  '152050014','','u_2447');

insertEmpUser.run(
  'u_2448','stp5026',hash('Pass2448@SET'),
  'Ammar Yasser Ismail Abbas','stp5026@silah.com','designer');
insertMember.run(
  'm_2448','Ammar Yasser Ismail Abbas','عمار ياسر اسماعيل عباس',
  'r_designer','stp5026@silah.com','2025-12-30',
  '2448','STP-5026','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic Prep','التصميم اعدادى',
  'Graphic Designer','مصمم جرافيك',
  '152050012','','u_2448');

insertEmpUser.run(
  'u_2449','stp5013',hash('Pass2449@SET'),
  'Marwan Tarik Mohamed Saad','stp5013@silah.com','author');
insertMember.run(
  'm_2449','Marwan Tarik Mohamed Saad','مروان طارق محمد سعد',
  'r_author','stp5013@silah.com','2025-12-30',
  '2449','STP-5013','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math preparatory 1','الرياضيات الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020411','','u_2449');

insertEmpUser.run(
  'u_2460','stp5037',hash('Pass2460@SET'),
  'Yara Khaled Farid Hamed Sharaf','stp5037@silah.com','designer');
insertMember.run(
  'm_2460','Yara Khaled Farid Hamed Sharaf','يارا خالد فريد حامد شرف',
  'r_designer','stp5037@silah.com','2026-01-06',
  '2460','STP-5037','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout Prep','تنسيق الصفحات اعدادى',
  'English Layouter','منسق صفحات لغة انجليزية',
  '152050013','','u_2460');

insertEmpUser.run(
  'u_2461','stp5017',hash('Pass2461@SET'),
  'Ahmed Mohamed Ahmed Abdellatif Abdelrazek','stp5017@silah.com','author');
insertMember.run(
  'm_2461','Ahmed Mohamed Ahmed Abdellatif Abdelrazek','احمد محمد احمد عبداللطيف عبدالرازق',
  'r_author','stp5017@silah.com','2026-01-06',
  '2461','STP-5017','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social preparatory 1','الدراسات الإجتماعية الصف الأول الإعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020611','','u_2461');

insertEmpUser.run(
  'u_2462','stp5046',hash('Pass2462@SET'),
  'Mohamed Ramadan Wafi Bahloul','stp5046@silah.com','reviewer');
insertMember.run(
  'm_2462','Mohamed Ramadan Wafi Bahloul','محمد رمضان وافى بهلول',
  'r_reviewer','stp5046@silah.com','2026-01-06',
  '2462','STP-5046','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Proofreading Prep','التدقيق اللغوي اعدادى',
  'Arabic Proofreader','مدقق لغوي لغة عربية',
  '152050014','','u_2462');

insertEmpUser.run(
  'u_2464','stp5012',hash('Pass2464@SET'),
  'Amira Ahmed Samir Ibrahim Metwally Agag','stp5012@silah.com','author');
insertMember.run(
  'm_2464','Amira Ahmed Samir Ibrahim Metwally Agag','اميره احمد سمير ابراهيم متولى عجاج',
  'r_author','stp5012@silah.com','2026-01-06',
  '2464','STP-5012','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math preparatory 1','الرياضيات الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020411','','u_2464');

insertEmpUser.run(
  'u_2466','stp5018',hash('Pass2466@SET'),
  'Mohamed Saeed Mabrouk Alhamouli','stp5018@silah.com','author');
insertMember.run(
  'm_2466','Mohamed Saeed Mabrouk Alhamouli','محمد سعيد مبروك الحامولى',
  'r_author','stp5018@silah.com','2026-01-06',
  '2466','STP-5018','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Social Studies','الدراسات الإجتماعية',
  'Social preparatory 1','الدراسات الإجتماعية الصف الأول الإعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020611','','u_2466');

insertEmpUser.run(
  'u_2469','stp5014',hash('Pass2469@SET'),
  'Duaa Khalil Gumaa Alafifi Albagouri','stp5014@silah.com','author');
insertMember.run(
  'm_2469','Duaa Khalil Gumaa Alafifi Albagouri','دعاء خليل جمعه العفيفى الباجورى',
  'r_author','stp5014@silah.com','2026-01-21',
  '2469','STP-5014','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math preparatory 1','الرياضيات الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020411','','u_2469');

insertEmpUser.run(
  'u_2470','stp5001',hash('Pass2470@SET'),
  'Kholoud Mohamed Hassan Mohamed Abadi','stp5001@silah.com','author');
insertMember.run(
  'm_2470','Kholoud Mohamed Hassan Mohamed Abadi','خلود محمد حسن محمد عبادى',
  'r_author','stp5001@silah.com','2026-01-21',
  '2470','STP-5001','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic preparatory 1','اللغة العربية الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020311','','u_2470');

insertEmpUser.run(
  'u_2474','stp5039',hash('Pass2474@SET'),
  'Basma Bakr Abdelrahim Bakr','stp5039@silah.com','designer');
insertMember.run(
  'm_2474','Basma Bakr Abdelrahim Bakr','بسمه بكر عبدالرحيم بكر',
  'r_designer','stp5039@silah.com','2026-01-27',
  '2474','STP-5039','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout Prep','تنسيق الصفحات اعدادى',
  'Social Studies Layouter','منسق صفحات دراسات اجتماعية',
  '152050013','','u_2474');

insertEmpUser.run(
  'u_2476','stp5035',hash('Pass2476@SET'),
  'Mohamed Sami Ali Atta','stp5035@silah.com','designer');
insertMember.run(
  'm_2476','Mohamed Sami Ali Atta','محمد سامى على عطا',
  'r_designer','stp5035@silah.com','2026-01-27',
  '2476','STP-5035','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout Prep','تنسيق الصفحات اعدادى',
  'Arabic Layouter','منسق صفحات لغة عربية',
  '152050013','','u_2476');

insertEmpUser.run(
  'u_2477','stp5031',hash('Pass2477@SET'),
  'Eman Adel Abdelrahman Mohamed','stp5031@silah.com','designer');
insertMember.run(
  'm_2477','Eman Adel Abdelrahman Mohamed','ايمان عادل عبدالرحمن محمد',
  'r_designer','stp5031@silah.com','2026-01-27',
  '2477','STP-5031','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Illustration Prep','الرسم اعدادى',
  'Illustrator','رسام',
  '152050011','','u_2477');

insertEmpUser.run(
  'u_2478','stp5028',hash('Pass2478@SET'),
  'Abdelrahman Ali Hussein Mahmoud','stp5028@silah.com','designer');
insertMember.run(
  'm_2478','Abdelrahman Ali Hussein Mahmoud','عبدالرحمن على حسين محمود',
  'r_designer','stp5028@silah.com','2026-01-27',
  '2478','STP-5028','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic Prep','التصميم اعدادى',
  'Graphic Designer','مصمم جرافيك',
  '152050012','','u_2478');

insertEmpUser.run(
  'u_2480','stp5040',hash('Pass2480@SET'),
  'Menna Hassan Ali Elbatra','stp5040@silah.com','designer');
insertMember.run(
  'm_2480','Menna Hassan Ali Elbatra','منه حسن على البطره',
  'r_designer','stp5040@silah.com','2026-02-03',
  '2480','STP-5040','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Layout Prep','تنسيق الصفحات اعدادى',
  'Math Layouter','منسق صفحات رياضيات',
  '152050013','','u_2480');

insertEmpUser.run(
  'u_2482','stp5027',hash('Pass2482@SET'),
  'Sara Hisham Hussein Mohamed Ahmed','stp5027@silah.com','designer');
insertMember.run(
  'm_2482','Sara Hisham Hussein Mohamed Ahmed','ساره هشام حسين محمد احمد',
  'r_designer','stp5027@silah.com','2026-02-03',
  '2482','STP-5027','STP',
  'Art Direction','الإخراج الفني',
  'Art Direction','الإخراج الفني',
  'Graphic Prep','التصميم اعدادى',
  'Graphic Designer','مصمم جرافيك',
  '152050012','','u_2482');

insertEmpUser.run(
  'u_2484','stp180',hash('Pass2484@SET'),
  'Mohamed Abdelnaby Mahmoud Elsayed Radwan','stp180@silah.com','author');
insertMember.run(
  'm_2484','Mohamed Abdelnaby Mahmoud Elsayed Radwan','محمد عبدالنبى محمود السيد رضوان',
  'r_author','stp180@silah.com','2026-02-04',
  '2484','STP-180','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math Overhead','الرياضيات',
  'SME','أخصائي مادة تعليمية',
  '152020400','','u_2484');

insertEmpUser.run(
  'u_2485','stp5016',hash('Pass2485@SET'),
  'Ahmed Nasser Ahmed Othman','stp5016@silah.com','author');
insertMember.run(
  'm_2485','Ahmed Nasser Ahmed Othman','احمد ناصر احمد عثمان',
  'r_author','stp5016@silah.com','2026-02-04',
  '2485','STP-5016','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math preparatory 1','الرياضيات الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020411','','u_2485');

insertEmpUser.run(
  'u_2496','stp5011',hash('Pass2496@SET'),
  'Alaa Mohamed Ahmed Mahmoud','stp5011@silah.com','author');
insertMember.run(
  'm_2496','Alaa Mohamed Ahmed Mahmoud','علاء محمد احمد محمود',
  'r_author','stp5011@silah.com','2026-03-03',
  '2496','STP-5011','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math preparatory 1','الرياضيات الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020411','','u_2496');

insertEmpUser.run(
  'u_2501','stp5002',hash('Pass2501@SET'),
  'Rabee Mohamed Mohamed Aldoha','stp5002@silah.com','author');
insertMember.run(
  'm_2501','Rabee Mohamed Mohamed Aldoha','ربيع محمد محمد الدوحه',
  'r_author','stp5002@silah.com','2026-03-16',
  '2501','STP-5002','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic preparatory 1','اللغة العربية الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020311','','u_2501');

insertEmpUser.run(
  'u_2526','stp5009',hash('Pass2526@SET'),
  'Abdelmaqsoud Magdy Abdelmaqsoud Hassanein Elsisi','stp5009@silah.com','author');
insertMember.run(
  'm_2526','Abdelmaqsoud Magdy Abdelmaqsoud Hassanein Elsisi','عبدالمقصود مجدى عبدالمقصود حسانين السيسى',
  'r_author','stp5009@silah.com','2026-04-14',
  '2526','STP-5009','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Math','الرياضيات',
  'Math preparatory 1','الرياضيات الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020411','','u_2526');

insertEmpUser.run(
  'u_2528','stp5004',hash('Pass2528@SET'),
  'Heba Sayed Saad Hassan','stp5004@silah.com','author');
insertMember.run(
  'm_2528','Heba Sayed Saad Hassan','هبه سيد سعد حسن',
  'r_author','stp5004@silah.com','2026-04-14',
  '2528','STP-5004','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic preparatory 1','اللغة العربية الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020311','','u_2528');

insertEmpUser.run(
  'u_2531','stp994',hash('Pass2531@SET'),
  'Nihad Ahmed Youssef Abdelrahman Allaithy','stp994@silah.com','admin');
insertMember.run(
  'm_2531','Nihad Ahmed Youssef Abdelrahman Allaithy','نهاد احمد يوسف عبدالرحمن الليثى',
  'r_admin','stp994@silah.com','2026-04-16',
  '2531','STP-994','STP',
  'Academic Books','المحتوى الأكاديمى',
  'English','اللغة الإنجليزية',
  'English Overhead','اللغة الإنجليزية',
  'English Section Head','مدير قسم اللغة الإنجليزية',
  '152020700','','u_2531');

insertEmpUser.run(
  'u_2533','stp109',hash('Pass2533@SET'),
  'Salem Mohamed Salem Abdelmaksoud Hammouda','stp109@silah.com','author');
insertMember.run(
  'm_2533','Salem Mohamed Salem Abdelmaksoud Hammouda','سالم محمد سالم عبدالمقصود حموده',
  'r_author','stp109@silah.com','2026-04-28',
  '2533','STP-109','STP',
  'Academic Books','المحتوى الأكاديمى',
  'Arabic','اللغة العربية',
  'Arabic preparatory 1','اللغة العربية الصف الأول الاعدادى',
  'SME','أخصائي مادة تعليمية',
  '152020311','','u_2533');

console.log('✅ 151 employees seeded');

// ── PHASES ───────────────────────────────────────────────────────────────────
const insertPhase = db.prepare(`INSERT INTO phases (id,name,name_en,weeks,total_weeks,color,icon,sort_order) VALUES (?,?,?,?,?,?,?,?)`);
insertPhase.run('p1','التخطيط والتأسيس','Planning','3 أيام',1,'#0A7E8C','🗺️',1);
insertPhase.run('p2','كتابة المحتوى','Content Writing','4 أسابيع',4,'#1A4A7A','✍️',2);
insertPhase.run('p3','التصميم والإخراج','Design & Layout','أسبوع واحد',1,'#6B3FA0','🎨',3);
insertPhase.run('p4','المراجعة والاعتماد','Review & Approval','يوم واحد',1,'#D4700A','🔍',4);
insertPhase.run('p5','تجهيز الطباعة','Print Preparation','يوم واحد',1,'#1A7A4A','🖨️',5);
const insertPP = db.prepare(`INSERT INTO phase_progress (phase_id,progress) VALUES (?,?)`);
insertPP.run('p1',100); insertPP.run('p2',62); insertPP.run('p3',12);
insertPP.run('p4',0);   insertPP.run('p5',0);
console.log('✅ Phases seeded');

// ── TASKS ────────────────────────────────────────────────────────────────────
const insertTask = db.prepare(`INSERT INTO tasks (id,title,phase_id,assignee_id,status,progress,priority,due_date) VALUES (?,?,?,?,?,?,?,?)`);
insertTask.run('t1','ورشة التخطيط الاستراتيجي','p1','m_1806','مكتمل',100,'عالية',addDays(-50));
insertTask.run('t2','تحليل المنهج الرسمي','p1','m_212','مكتمل',100,'عالية',addDays(-45));
insertTask.run('t3','إعداد Outline الكتاب','p1','m_1806','مكتمل',100,'عالية',addDays(-40));
insertTask.run('t4','توقيع عقود الفريق','p1','m_1806','مكتمل',100,'متوسطة',addDays(-35));
insertTask.run('t5','كتابة الوحدة الأولى','p2','m_2123','مكتمل',100,'عالية',addDays(-20));
insertTask.run('t6','كتابة الوحدة الثانية','p2','m_2123','مكتمل',100,'عالية',addDays(-15));
insertTask.run('t7','كتابة الوحدة الثالثة','p2','m_212','جارٍ',72,'عالية',addDays(8));
insertTask.run('t8','تصميم الأنشطة التفاعلية','p2','m_212','جارٍ',45,'متوسطة',addDays(12));
insertTask.run('t9','إعداد نماذج الإجابات','p2','m_212','في المراجعة',90,'عالية',addDays(5));
insertTask.run('t10','المراجعة التبادلية للمحتوى','p2','m_1806','لم يبدأ',0,'متوسطة',addDays(18));
insertTask.run('t11','تصميم غلاف الكتاب','p3','m_201','جارٍ',35,'عالية',addDays(22));
insertTask.run('t12','تصميم قالب الصفحات','p3','m_201','لم يبدأ',0,'عالية',addDays(28));
insertTask.run('t13','رسم الإنفوجرافيك','p3','m_1242','لم يبدأ',0,'متوسطة',addDays(32));
insertTask.run('t14','المراجعة اللغوية الشاملة','p4','m_1070','لم يبدأ',0,'عالية',addDays(45));
insertTask.run('t15','المراجعة العلمية التربوية','p4','m_1806','لم يبدأ',0,'عالية',addDays(48));
insertTask.run('t16','تجهيز ملفات الطباعة','p5','m_201','لم يبدأ',0,'عالية',addDays(56));
console.log('✅ Tasks seeded (16)');

// ── GATES ────────────────────────────────────────────────────────────────────
const insertGate = db.prepare(`INSERT INTO gates (id,name,phase_id,status) VALUES (?,?,?,?)`);
insertGate.run('g1','Gate التخطيط','p1','اجتاز');
insertGate.run('g2','Gate المحتوى','p2','معلق');
insertGate.run('g3','Gate التصميم','p3','لم يفتح');
insertGate.run('g4','Gate الاعتماد','p4','لم يفتح');
console.log('✅ Gates seeded');

// ── ACTIVITY ─────────────────────────────────────────────────────────────────
const insertAct = db.prepare(`INSERT INTO activity (id,text,type,created_at) VALUES (?,?,?,date('now'))`);
insertAct.run('a1','تم تهيئة قاعدة البيانات بـ 151 موظف من بيانات سلاح التلميذ','success');
insertAct.run('a2','النظام جاهز — قطاع المحتوى مُحمَّل بالكامل','info');

// ── SETTINGS ─────────────────────────────────────────────────────────────────
const insertSetting = db.prepare(`INSERT INTO settings (key,value) VALUES (?,?)`);
insertSetting.run('app_name','سلاح التلميذ — نظام إدارة إنتاج الكتب');
insertSetting.run('app_version','1.0.0');
insertSetting.run('total_employees','151');
insertSetting.run('total_weeks','6');

});
seed();
db.close();
console.log('');
console.log('🎉 Database ready — 151 employees loaded!');
console.log('📁 ' + DB_PATH);
console.log('');
console.log('🔑 Admin credentials:');
console.log('   admin / admin123');
console.log('   manager / manager123');
console.log('');
console.log('👥 Employee login format:');
console.log('   Username: stp + number (e.g. STP-131 → stp131)');
console.log('   Password: Pass + EmpID + @SET (e.g. EmpID 88 → Pass88@SET)');