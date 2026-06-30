// client/src/components/CMS.jsx
// Full CMS UI — 7 pages, wired to live API data via props from App.jsx
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ── Design tokens ───────────────────────────────────────────────
const C = {
  navy: '#0D2137', navyLight: '#16314F', teal: '#0A7E8C', gold: '#D4A017',
  red: '#8C1A1A', green: '#1A7A4A', blue: '#1A4A7A', purple: '#6B3FA0',
  orange: '#D4700A', bg: '#F0F4F8', card: '#FFFFFF', border: '#E2EBF3',
  textMuted: '#8FA8C0', textDark: '#16314F',
};
const FONT = 'Cairo,sans-serif';
const MONO = 'Space Mono,monospace';

const STATUS_COLOR = {
  'لم يبدأ': C.textMuted, 'جارٍ': C.blue, 'في المراجعة': C.orange, 'مكتمل': C.green,
};
const PRIORITY_COLOR = { 'منخفضة': C.green, 'متوسطة': C.orange, 'عالية': C.red };
const GATE_COLOR = { 'لم يفتح': C.textMuted, 'معلق': C.orange, 'اجتاز': C.green, 'مرفوض': C.red };

const NAV = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
  { id: 'tasks', label: 'المهام', icon: '✅' },
  { id: 'members', label: 'الفريق', icon: '👥' },
  { id: 'phases', label: 'المراحل', icon: '🗂️' },
  { id: 'gates', label: 'بوابات الجودة', icon: '🚦' },
  { id: 'activity', label: 'النشاط', icon: '🕓' },
  { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
];

// ── Small shared UI bits ────────────────────────────────────────
function Badge({ text, color }) {
  return (
    <span style={{
      background: `${color}1A`, color, fontWeight: 700, fontSize: 11,
      padding: '4px 10px', borderRadius: 999, display: 'inline-block', whiteSpace: 'nowrap',
    }}>{text}</span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
      boxShadow: '0 1px 4px rgba(13,33,55,.06)', ...style,
    }}>{children}</div>
  );
}

function ProgressBar({ value, color = C.teal, h = 8 }) {
  return (
    <div style={{ background: '#E2EBF3', borderRadius: 999, height: h, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, value))}%`, height: '100%',
        background: color, borderRadius: 999, transition: 'width .3s ease',
      }} />
    </div>
  );
}

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(13,33,55,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, borderRadius: 16, width: '100%', maxWidth: width,
        maxHeight: '88vh', overflowY: 'auto', padding: 24, fontFamily: FONT, direction: 'rtl',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.textDark }}>{title}</div>
          <button onClick={onClose} style={{
            background: '#F0F4F8', border: 'none', borderRadius: 8, width: 30, height: 30,
            cursor: 'pointer', fontSize: 14, color: C.textMuted,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 9,
  border: `1px solid ${C.border}`, fontFamily: FONT, fontSize: 13, outline: 'none',
  background: '#FAFCFE', color: C.textDark,
};

function Btn({ children, onClick, variant = 'primary', style, type = 'button', disabled }) {
  const styles = {
    primary: { background: C.teal, color: 'white' },
    danger: { background: C.red, color: 'white' },
    ghost: { background: 'rgba(255,255,255,.1)', color: 'white' },
    outline: { background: 'white', color: C.teal, border: `1px solid ${C.teal}` },
    subtle: { background: '#F0F4F8', color: C.textDark },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      border: 'none', borderRadius: 9, padding: '9px 16px', fontFamily: FONT,
      fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .6 : 1, ...styles[variant], ...style,
    }}>{children}</button>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center', color: C.textMuted }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}

// ── Topbar + sidebar shell ──────────────────────────────────────
function Shell({ page, setPage, totalProg, user, onLogout, onRefresh, children }) {
  return (
    <div style={{ fontFamily: FONT, direction: 'rtl', minHeight: '100vh', background: C.bg, display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: C.navy, minHeight: '100vh', display: 'flex',
        flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ width: 34, height: 34, background: C.gold, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📚</div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>سلاح التلميذ</div>
            <div style={{ color: C.textMuted, fontSize: 10 }}>نظام إدارة الإنتاج</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'right',
              fontFamily: FONT, fontSize: 13, fontWeight: 700,
              background: page === n.id ? 'rgba(255,255,255,.1)' : 'transparent',
              color: page === n.id ? 'white' : C.textMuted,
            }}>
              <span style={{ fontSize: 15 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ background: C.teal, color: 'white', borderRadius: 9, padding: '8px 12px', fontSize: 11, fontWeight: 700, textAlign: 'center', marginBottom: 10 }}>
            الإنجاز الكلي: {totalProg}%
          </div>
          <Btn variant="ghost" onClick={onLogout} style={{ width: '100%' }}>تسجيل الخروج</Btn>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          background: 'white', borderBottom: `1px solid ${C.border}`, padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.textDark }}>
            {NAV.find(n => n.id === page)?.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: C.textMuted, fontSize: 12 }}>مرحبًا، {user?.name}</div>
            <Btn variant="subtle" onClick={onRefresh}>🔄 تحديث</Btn>
          </div>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Dashboard page ───────────────────────────────────────────────
function DashboardPage({ data, totalProg }) {
  const { tasks, members, phases, phaseProgress, gates, activity } = data;
  const doneTasks = tasks.filter(t => t.status === 'مكتمل').length;
  const activeTasks = tasks.filter(t => t.status === 'جارٍ').length;
  const overdue = tasks.filter(t => t.due_date && t.status !== 'مكتمل' && new Date(t.due_date) < new Date()).length;

  const phaseChartData = phases.map(p => ({
    name: p.name, progress: phaseProgress[p.id] ?? p.progress ?? 0, color: p.color || C.teal,
  }));

  const statusPie = ['لم يبدأ', 'جارٍ', 'في المراجعة', 'مكتمل'].map(s => ({
    name: s, value: tasks.filter(t => t.status === s).length, color: STATUS_COLOR[s],
  })).filter(d => d.value > 0);

  const upcoming = tasks
    .filter(t => t.status !== 'مكتمل' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { l: 'الإنجاز الكلي', v: `${totalProg}%`, c: C.teal },
          { l: 'المهام المكتملة', v: `${doneTasks}/${tasks.length}`, c: C.green },
          { l: 'المهام الجارية', v: activeTasks, c: C.blue },
          { l: 'مهام متأخرة', v: overdue, c: overdue > 0 ? C.red : C.textMuted },
          { l: 'أعضاء الفريق', v: members.length, c: C.purple },
        ].map(k => (
          <Card key={k.l} style={{ padding: '18px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>{k.l}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: k.c, fontFamily: MONO }}>{k.v}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark, marginBottom: 14 }}>تقدّم المراحل</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={phaseChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2EBF3" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: FONT }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                {phaseChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark, marginBottom: 14 }}>توزيع حالة المهام</div>
          {statusPie.length === 0 ? <EmptyState icon="📭" text="لا توجد مهام بعد" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={{ fontSize: 11, fontFamily: FONT }}>
                  {statusPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: FONT }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark, marginBottom: 14 }}>مواعيد قريبة</div>
          {upcoming.length === 0 ? <EmptyState icon="🗓️" text="لا توجد مواعيد قادمة" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, color: C.textDark, fontWeight: 600 }}>{t.title}</div>
                  <Badge text={t.due_date} color={new Date(t.due_date) < new Date() ? C.red : C.textMuted} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark, marginBottom: 14 }}>آخر النشاطات</div>
          {activity.length === 0 ? <EmptyState icon="🕓" text="لا يوجد نشاط بعد" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
              {activity.slice(0, 6).map(a => (
                <div key={a.id} style={{ fontSize: 12.5, color: C.textDark, lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: a.text }} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Tasks page ────────────────────────────────────────────────────
function TaskForm({ initial, members, phases, onSave, onCancel }) {
  const [f, setF] = useState(initial || {
    title: '', description: '', phase_id: phases[0]?.id || '', assignee_id: '',
    status: 'لم يبدأ', progress: 0, priority: 'متوسطة', due_date: '', notes: '',
  });
  return (
    <div>
      <Field label="عنوان المهمة">
        <input style={inputStyle} value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
      </Field>
      <Field label="الوصف">
        <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={f.description}
          onChange={e => setF({ ...f, description: e.target.value })} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="المرحلة">
          <select style={inputStyle} value={f.phase_id} onChange={e => setF({ ...f, phase_id: e.target.value })}>
            {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="المسؤول">
          <select style={inputStyle} value={f.assignee_id || ''} onChange={e => setF({ ...f, assignee_id: e.target.value })}>
            <option value="">— غير محدد —</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name_ar || m.name}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="الحالة">
          <select style={inputStyle} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
            {Object.keys(STATUS_COLOR).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="الأولوية">
          <select style={inputStyle} value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })}>
            {Object.keys(PRIORITY_COLOR).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={`التقدم (${f.progress}%)`}>
          <input type="range" min={0} max={100} value={f.progress}
            onChange={e => setF({ ...f, progress: +e.target.value })} style={{ width: '100%' }} />
        </Field>
        <Field label="تاريخ الاستحقاق">
          <input type="date" style={inputStyle} value={f.due_date || ''} onChange={e => setF({ ...f, due_date: e.target.value })} />
        </Field>
      </div>
      <Field label="ملاحظات">
        <textarea style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} value={f.notes}
          onChange={e => setF({ ...f, notes: e.target.value })} />
      </Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <Btn onClick={() => onSave(f)} style={{ flex: 1 }}>حفظ</Btn>
        <Btn variant="subtle" onClick={onCancel} style={{ flex: 1 }}>إلغاء</Btn>
      </div>
    </div>
  );
}

function TasksPage({ data, onAddTask, onUpdateTask, onDeleteTask }) {
  const { tasks, members, phases } = data;
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | task object

  const memberName = id => members.find(m => m.id === id)?.name_ar || members.find(m => m.id === id)?.name || '—';
  const phaseName = id => phases.find(p => p.id === id)?.name || id;

  const filtered = useMemo(() => tasks.filter(t =>
    (!filterStatus || t.status === filterStatus) &&
    (!filterPhase || t.phase_id === filterPhase) &&
    (!search || t.title.toLowerCase().includes(search.toLowerCase()))
  ), [tasks, filterStatus, filterPhase, search]);

  const handleSave = async f => {
    if (f.id) await onUpdateTask(f); else await onAddTask(f);
    setModal(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="بحث في المهام..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 220 }} />
        <select style={{ ...inputStyle, width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">كل الحالات</option>
          {Object.keys(STATUS_COLOR).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select style={{ ...inputStyle, width: 180 }} value={filterPhase} onChange={e => setFilterPhase(e.target.value)}>
          <option value="">كل المراحل</option>
          {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <Btn onClick={() => setModal('new')}>+ مهمة جديدة</Btn>
      </div>

      <Card>
        {filtered.length === 0 ? <EmptyState icon="✅" text="لا توجد مهام مطابقة" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}`, textAlign: 'right' }}>
                  {['المهمة', 'المرحلة', 'المسؤول', 'الحالة', 'الأولوية', 'التقدم', 'الاستحقاق', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', color: C.textMuted, fontSize: 11, fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: C.textDark }}>{t.title}</td>
                    <td style={{ padding: '10px 14px', color: C.textMuted }}>{phaseName(t.phase_id)}</td>
                    <td style={{ padding: '10px 14px', color: C.textMuted }}>{memberName(t.assignee_id)}</td>
                    <td style={{ padding: '10px 14px' }}><Badge text={t.status} color={STATUS_COLOR[t.status]} /></td>
                    <td style={{ padding: '10px 14px' }}><Badge text={t.priority} color={PRIORITY_COLOR[t.priority]} /></td>
                    <td style={{ padding: '10px 14px', minWidth: 110 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ProgressBar value={t.progress} />
                        <span style={{ fontSize: 11, color: C.textMuted, fontFamily: MONO }}>{t.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: t.due_date && new Date(t.due_date) < new Date() && t.status !== 'مكتمل' ? C.red : C.textMuted, fontSize: 12 }}>
                      {t.due_date || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => setModal(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginLeft: 8 }}>✏️</button>
                      <button onClick={() => onDeleteTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <Modal title={modal === 'new' ? 'مهمة جديدة' : 'تعديل المهمة'} onClose={() => setModal(null)}>
          <TaskForm initial={modal === 'new' ? null : modal} members={members} phases={phases}
            onSave={handleSave} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

// ── Members page ─────────────────────────────────────────────────
function MemberForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || {
    name: '', name_ar: '', role_id: '', email: '', phone: '', job_en: '', job_ar: '', notes: '',
  });
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="الاسم (إنجليزي)"><input style={inputStyle} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="الاسم (عربي)"><input style={inputStyle} value={f.name_ar || ''} onChange={e => setF({ ...f, name_ar: e.target.value })} /></Field>
      </div>
      <Field label="الدور (role_id)"><input style={inputStyle} value={f.role_id} onChange={e => setF({ ...f, role_id: e.target.value })} placeholder="مثل: r_editor" /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="البريد الإلكتروني"><input style={inputStyle} value={f.email || ''} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="الهاتف"><input style={inputStyle} value={f.phone || ''} onChange={e => setF({ ...f, phone: e.target.value })} /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="الوظيفة (إنجليزي)"><input style={inputStyle} value={f.job_en || ''} onChange={e => setF({ ...f, job_en: e.target.value })} /></Field>
        <Field label="الوظيفة (عربي)"><input style={inputStyle} value={f.job_ar || ''} onChange={e => setF({ ...f, job_ar: e.target.value })} /></Field>
      </div>
      <Field label="ملاحظات"><textarea style={{ ...inputStyle, minHeight: 50 }} value={f.notes || ''} onChange={e => setF({ ...f, notes: e.target.value })} /></Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <Btn onClick={() => onSave(f)} style={{ flex: 1 }}>حفظ</Btn>
        <Btn variant="subtle" onClick={onCancel} style={{ flex: 1 }}>إلغاء</Btn>
      </div>
    </div>
  );
}

function MembersPage({ data, onAddMember, onUpdateMember }) {
  const { members, tasks } = data;
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modal, setModal] = useState(null);

  const depts = useMemo(() => [...new Set(members.map(m => m.dept_en).filter(Boolean))], [members]);

  const filtered = useMemo(() => members.filter(m =>
    (!deptFilter || m.dept_en === deptFilter) &&
    (!search || (m.name + m.name_ar + (m.jc || '')).toLowerCase().includes(search.toLowerCase()))
  ), [members, search, deptFilter]);

  const handleSave = async f => {
    if (f.id) await onUpdateMember(f); else await onAddMember(f);
    setModal(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="بحث بالاسم..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, width: 220 }} />
        {depts.length > 0 && (
          <select style={{ ...inputStyle, width: 220 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">كل الأقسام</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <div style={{ flex: 1 }} />
        <Btn onClick={() => setModal('new')}>+ عضو جديد</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {filtered.length === 0 ? <EmptyState icon="👥" text="لا يوجد أعضاء مطابقون" /> : filtered.map(m => {
          const taskCount = tasks.filter(t => t.assignee_id === m.id).length;
          const doneCount = tasks.filter(t => t.assignee_id === m.id && t.status === 'مكتمل').length;
          return (
            <Card key={m.id} style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark }}>{m.name_ar || m.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{m.job_ar || m.job_en || '—'}</div>
                </div>
                <button onClick={() => setModal(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✏️</button>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {m.dept_ar && <Badge text={m.dept_ar} color={C.purple} />}
                {m.role_id && <Badge text={m.role_id} color={C.teal} />}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: C.textMuted }}>
                المهام: {doneCount}/{taskCount} مكتملة
              </div>
              {taskCount > 0 && <div style={{ marginTop: 6 }}><ProgressBar value={taskCount ? (doneCount / taskCount) * 100 : 0} color={C.green} h={6} /></div>}
            </Card>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === 'new' ? 'عضو جديد' : 'تعديل العضو'} onClose={() => setModal(null)}>
          <MemberForm initial={modal === 'new' ? null : modal} onSave={handleSave} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

// ── Phases page ───────────────────────────────────────────────────
function PhasesPage({ data, onUpdatePhaseProgress }) {
  const { phases, phaseProgress, tasks } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {phases.map(p => {
        const prog = phaseProgress[p.id] ?? p.progress ?? 0;
        const phaseTasks = tasks.filter(t => t.phase_id === p.id);
        return (
          <Card key={p.id} style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 22 }}>{p.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.textDark }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{p.name_en} · {p.weeks}</div>
                </div>
              </div>
              <div style={{ fontFamily: MONO, fontWeight: 900, fontSize: 22, color: p.color || C.teal }}>{prog}%</div>
            </div>
            <ProgressBar value={prog} color={p.color || C.teal} h={10} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <input type="range" min={0} max={100} value={prog} style={{ flex: 1 }}
                onChange={e => onUpdatePhaseProgress(p.id, +e.target.value)} />
              <div style={{ fontSize: 12, color: C.textMuted }}>{phaseTasks.length} مهمة</div>
            </div>
          </Card>
        );
      })}
      {phases.length === 0 && <EmptyState icon="🗂️" text="لا توجد مراحل" />}
    </div>
  );
}

// ── Gates page ────────────────────────────────────────────────────
function GatesPage({ data, onUpdateGate }) {
  const { gates, phases, members } = data;
  const phaseName = id => phases.find(p => p.id === id)?.name || id;
  const gateList = Object.values(gates);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
      {gateList.length === 0 ? <EmptyState icon="🚦" text="لا توجد بوابات جودة" /> : gateList.map(g => (
        <Card key={g.id} style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark }}>{g.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{phaseName(g.phase_id)}</div>
            </div>
            <Badge text={g.status} color={GATE_COLOR[g.status] || C.textMuted} />
          </div>
          {g.approved_date && <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>اعتُمد بتاريخ: {g.approved_date}</div>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {Object.keys(GATE_COLOR).map(s => (
              <button key={s} onClick={() => onUpdateGate(g.id, {
                status: s,
                approved_date: s === 'اجتاز' ? new Date().toISOString().split('T')[0] : g.approved_date,
              })} style={{
                fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999,
                border: `1px solid ${GATE_COLOR[s]}`, background: g.status === s ? GATE_COLOR[s] : 'white',
                color: g.status === s ? 'white' : GATE_COLOR[s], cursor: 'pointer', fontFamily: FONT,
              }}>{s}</button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Activity page ─────────────────────────────────────────────────
function ActivityPage({ data, onAddActivity, user }) {
  const { activity } = data;
  const [text, setText] = useState('');

  const submit = async () => {
    if (!text.trim()) return;
    await onAddActivity({ text: text.trim(), type: 'info' });
    setText('');
  };

  const typeColor = { info: C.blue, success: C.green, warning: C.orange, error: C.red };

  return (
    <div>
      <Card style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 10 }}>
        <input style={{ ...inputStyle, flex: 1 }} placeholder="أضف ملاحظة أو نشاطًا..." value={text}
          onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        <Btn onClick={submit}>إضافة</Btn>
      </Card>
      <Card style={{ padding: 4 }}>
        {activity.length === 0 ? <EmptyState icon="🕓" text="لا يوجد نشاط مسجل بعد" /> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activity.map(a => (
              <div key={a.id} style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor[a.type] || C.textMuted, marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.textDark, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: a.text }} />
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{a.created_at}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Settings page ─────────────────────────────────────────────────
function SettingsPage({ user }) {
  return (
    <div style={{ maxWidth: 460 }}>
      <Card style={{ padding: 22 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: C.textDark, marginBottom: 16 }}>الملف الشخصي</div>
        <Field label="الاسم"><input style={inputStyle} value={user?.name || ''} disabled /></Field>
        <Field label="اسم المستخدم"><input style={inputStyle} value={user?.username || ''} disabled /></Field>
        <Field label="الدور"><input style={inputStyle} value={user?.role || ''} disabled /></Field>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 10 }}>
          لتغيير كلمة المرور، تواصل مع مسؤول النظام.
        </div>
      </Card>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────
export default function CMS({ data, user, onLogout, onRefresh,
  onUpdateTask, onAddTask, onDeleteTask,
  onAddMember, onUpdateMember,
  onUpdatePhaseProgress, onAddActivity, onUpdateGate }) {

  const [page, setPage] = useState('dashboard');

  const totalProg = useMemo(() => {
    const vals = Object.values(data.phaseProgress);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [data.phaseProgress]);

  return (
    <Shell page={page} setPage={setPage} totalProg={totalProg} user={user} onLogout={onLogout} onRefresh={onRefresh}>
      {page === 'dashboard' && <DashboardPage data={data} totalProg={totalProg} />}
      {page === 'tasks' && (
        <TasksPage data={data} onAddTask={onAddTask} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} />
      )}
      {page === 'members' && (
        <MembersPage data={data} onAddMember={onAddMember} onUpdateMember={onUpdateMember} />
      )}
      {page === 'phases' && <PhasesPage data={data} onUpdatePhaseProgress={onUpdatePhaseProgress} />}
      {page === 'gates' && <GatesPage data={data} onUpdateGate={onUpdateGate} />}
      {page === 'activity' && <ActivityPage data={data} onAddActivity={onAddActivity} user={user} />}
      {page === 'settings' && <SettingsPage user={user} />}
    </Shell>
  );
}
